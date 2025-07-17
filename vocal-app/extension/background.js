const API_BASE_URL = 'http://localhost:3001/api';

// 1. Lắng nghe yêu cầu tra cứu từ content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'lookup') {
        // Sử dụng async/await để xử lý bất đồng bộ
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/lookup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ word: message.word })
                });
                const data = await response.json();
                if (!data.error) {
                    data.word = message.word; // Thêm lại từ gốc để hiển thị
                }
                sendResponse({ data });
            } catch (error) {
                console.error('Error during lookup fetch:', error);
                sendResponse({ error: error.message });
            }
        })();
        return true; // Quan trọng: Giữ kênh message mở cho phản hồi bất đồng bộ
    }
});

// 2. Lắng nghe lệnh Ctrl+Q
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "save-and-highlight") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { type: 'get_word_data_for_saving' });
                if (response && response.data) {
                    await saveWordToDatabase(response);
                }
            } catch (e) {
                console.error("Could not communicate with content script:", e);
            }
        }
    }
});

// 3. Hàm lưu từ vào DB
async function saveWordToDatabase({ word, data }) {
    console.log(`Saving to DB: ${word}`);
    const payload = {
        word: word,
        ipa: data.ipa,
        meanings: data.meanings.map(m => ({ meaning: m })),
        examples: data.examples
    };

    try {
        const response = await fetch(`${API_BASE_URL}/words`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const savedData = await response.json();
        console.log('Successfully saved to DB:', savedData);
    } catch (err) {
        console.error('Error saving to DB:', err);
    }
}