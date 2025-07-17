// --- TOOLTIP LOGIC ---
const tooltip = document.createElement('div');
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
  pointer-events: none;
  line-height: 1.6;
`;
document.body.appendChild(tooltip);

document.addEventListener('mouseup', handleSelection);
document.addEventListener('mousedown', () => {
    tooltip.style.display = 'none';
});

async function handleSelection(event) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim().toLowerCase();

    if (selectedText.length > 2 && /^[a-z\s]+$/.test(selectedText)) {
        // 1. Kiểm tra cache ở Session Storage trước
        const cachedData = sessionStorage.getItem(selectedText);
        if (cachedData) {
            console.log('Fetching from Session Storage...');
            displayTooltip(JSON.parse(cachedData), event);
            return;
        }

        // 2. Nếu không có, gửi yêu cầu đến background để fetch
        console.log(`Looking up: ${selectedText}`);
        chrome.runtime.sendMessage({ type: 'lookup', word: selectedText }, (response) => {
            if (response && response.data) {
                // Lưu vào cache và hiển thị
                sessionStorage.setItem(selectedText, JSON.stringify(response.data));
                displayTooltip(response.data, event);
            }
        });
    }
}

function displayTooltip(data, event) {
    let meaningsHtml = data.meanings.map(m => `<li>${m}</li>`).join('');
    let examplesHtml = data.examples.map(ex => `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #4a5568;">
            <p style="color: #63b3ed;">${ex.sentence}</p>
            <p style="color: #a0aec0; font-style: italic;">${ex.explanation}</p>
        </div>
    `).join('');

    tooltip.innerHTML = `
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 18px; color: #68d391;">${data.word}</strong>
            <em style="margin-left: 12px; color: #fc8181;">${data.ipa}</em>
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


// --- SAVE & HIGHLIGHT LOGIC ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'get_word_data_for_saving') {
        const selectedText = window.getSelection().toString().trim().toLowerCase();
        const dataToSave = sessionStorage.getItem(selectedText);

        if (selectedText && dataToSave) {
            // Gửi dữ liệu về cho background script
            sendResponse({ word: selectedText, data: JSON.parse(dataToSave) });
            // Thực hiện highlight
            highlightOnPage(selectedText);
        }
    }
});

function highlightOnPage(word) {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    document.body.innerHTML = document.body.innerHTML.replace(
        regex,
        '<span style="background-color: #f7a0ff; color: black; padding: 2px; border-radius: 3px;">$1</span>'
    );
}