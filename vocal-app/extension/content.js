// --- SETUP: Khởi tạo các phần tử DOM ---
const tooltip = document.createElement('div');
tooltip.id = 'vocal-app-tooltip'; // Thêm ID để dễ dàng nhận diện và debug
tooltip.style.cssText = `
  position: absolute;
  background-color: #2d3748;
  color: white;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #4a5568;
  width: 400px;
  font-size: 14px;
  z-index: 99999;
  display: none;
  line-height: 1.6;
`;
document.body.appendChild(tooltip);

let pageHighlighted = false;

// --- EVENT LISTENERS: Lắng nghe các sự kiện chính ---

// 1. Lắng nghe sự kiện bôi đen văn bản
document.addEventListener('mouseup', handleSelection);

// 2. Lắng nghe sự kiện nhấn chuột để ẩn tooltip
document.addEventListener('mousedown', (event) => {
    // Chỉ ẩn tooltip nếu người dùng click ra BÊN NGOÀI nó
    if (!tooltip.contains(event.target)) {
        tooltip.style.display = 'none';
    }
});

// 3. Lắng nghe sự kiện click BÊN TRONG tooltip (chỉ cho icon loa)
tooltip.addEventListener('click', (event) => {
    const audioIcon = event.target.closest('#vocal-app-audio-icon');
    if (audioIcon) {
        const audioUrl = audioIcon.dataset.audioUrl;
        if (audioUrl) {
            console.log("Audio URL to be played:", audioUrl);
            const fullAudioUrl = audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl;
            const audio = new Audio(fullAudioUrl);
            audio.play().catch(err => console.error("Error playing audio:", err));
        }
    }
});

// 4. Lắng nghe các tin nhắn từ các phần khác của extension (background, popup)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'get_tags_from_user':
            const tags = prompt("Enter tags for this word, separated by commas (e.g., work, tech, ielts):", "");
            sendResponse(tags);
            break;
        case 'get_word_data_for_saving':
            const selectedText = window.getSelection().toString().trim().toLowerCase();
            const dataToSave = sessionStorage.getItem(selectedText);
            if (selectedText && dataToSave) {
                sendResponse({ word: selectedText, data: JSON.parse(dataToSave) });
                highlightAllWordsOnPage([selectedText]);
            }
            break;

        case 'highlight_all_words':
            if (!pageHighlighted) {
                console.log('Received words to highlight:', message.words);
                highlightAllWordsOnPage(message.words);
                pageHighlighted = true;
            }
            break;
    }
    if (message.type === 'get_tags_from_user') return true;

});


// --- CORE FUNCTIONS: Các hàm xử lý logic chính ---

// Hàm xử lý khi người dùng bôi đen từ
function handleSelection(event) {
    if (tooltip.contains(event.target)) {
        return;
    }
    const selection = window.getSelection();
    const selectedText = selection.toString().trim().toLowerCase();

    if (selectedText.length > 2 && /^[a-z\s]+$/.test(selectedText)) {
        const cachedData = sessionStorage.getItem(selectedText);
        if (cachedData) {
            console.log('Fetching from Session Storage...');
            displayTooltip(JSON.parse(cachedData), event);
            return;
        }

        console.log(`Looking up: ${selectedText}`);

        chrome.runtime.sendMessage({ type: 'lookup', word: selectedText }, (response) => {
            if (chrome.runtime.lastError) {
                console.warn("Could not send message, extension was reloaded. Please refresh the page.");
                return;
            }

            // SỬA LỖI: Kiểm tra response và response.data trước
            if (response && response.data) {
                // Kiểm tra xem bên trong data có lỗi không
                if (response.data.error) {
                    console.error("Received an error from background:", response.data.error);
                    // Có thể hiển thị một tooltip lỗi nhỏ ở đây nếu muốn
                } else {
                    // Nếu không có lỗi, tiến hành lưu và hiển thị
                    sessionStorage.setItem(selectedText, JSON.stringify(response.data));
                    displayTooltip(response.data, event);
                }
            } else {
                // Trường hợp response không hợp lệ
                console.error("Received an invalid or empty response from the background script.");
            }
        });
    }
}

// Hàm hiển thị tooltip với dữ liệu nhận được
function displayTooltip(data, event) {
    let audioIconHtml = '';
    if (data.audioUrl) {
        audioIconHtml = `
            <span id="vocal-app-audio-icon" data-audio-url="${data.audioUrl}" title="Play pronunciation" style="cursor: pointer; margin-left: 12px; vertical-align: middle;">
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#FFFFFF">
                    <path d="M0 0h24v24H0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
            </span>
        `;
    }

    const meaningsHtml = data.meanings.map(m => `<li>${m}</li>`).join('');
    const examplesHtml = data.examples.map(ex => `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #4a5568;">
            <p style="color: #63b3ed;">${ex.sentence}</p>
            <p style="color: #a0aec0; font-style: italic;">${ex.explanation}</p>
        </div>
    `).join('');

    tooltip.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 18px; color: #68d391;">${data.word}</strong>
            <em style="margin-left: 12px; color: #fc8181;">${data.ipa}</em>
            ${audioIconHtml}
        </div>
        <div style="margin-bottom: 12px;">
            <h4 style="font-weight: bold; color: #9f7aea;">Meanings:</h4>
            <ul style="list-style-type: disc; padding-left: 20px;">${meaningsHtml}</ul>
        </div>
        <div>
            <h4 style="font-weight: bold; color: #9f7aea;">Examples:</h4>
            ${examplesHtml}
        </div>
    `;

    tooltip.style.left = `${event.pageX}px`;
    tooltip.style.top = `${event.pageY + 15}px`;
    tooltip.style.display = 'block';
}

// Hàm highlight các từ trên trang
function highlightAllWordsOnPage(words) {
    if (!words || words.length === 0) return;
    const regex = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');

    function walk(node) {
        if (node.matches && node.matches('#vocal-app-tooltip, #vocal-app-tooltip *')) {
            return; // Bỏ qua, không highlight bên trong tooltip
        }
        if (node.nodeType === 3) {
            const text = node.nodeValue;
            if (regex.test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(regex,
                    '<span style="background-color: #f7a0ff; color: black; padding: 1px 2px; border-radius: 3px; font-weight: bold;">$1</span>'
                );
                node.parentNode.replaceChild(span, node);
            }
        } else if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            Array.from(node.childNodes).forEach(walk);
        }
    }
    walk(document.body);
}