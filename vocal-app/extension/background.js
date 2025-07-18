const API_BASE_URL = 'https://vocabextension.onrender.com/api';

// 1. Lắng nghe yêu cầu tra cứu từ content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'lookup') {
        (async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/lookup`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ word: message.word })
                });

                // Kiểm tra nếu response không thành công (vd: 404, 500)
                if (!response.ok) {
                    // Cố gắng đọc lỗi từ server, nếu không được thì dùng statusText
                    const errorData = await response.json().catch(() => ({ error: response.statusText }));
                    throw new Error(errorData.error || `Server responded with status ${response.status}`);
                }

                const data = await response.json();
                if (!data.error) {
                    data.word = message.word;
                }
                // Gửi về dữ liệu thành công
                sendResponse({ data: data });

            } catch (error) {
                console.error('Error during lookup fetch:', error.message);
                // SỬA LỖI: Gói lỗi vào trong thuộc tính 'data'
                sendResponse({ data: { error: error.message } });
            }
        })();
        return true;
    }
});
// 2. Lắng nghe lệnh Ctrl+Q
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "save-and-highlight") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            try {
                // Yêu cầu content script mở prompt nhập tag
                const tagsString = await chrome.tabs.sendMessage(tab.id, { type: 'get_tags_from_user' });
                // Nếu người dùng không hủy prompt
                if (tagsString !== null) {
                    const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
                    // Sau đó mới lấy dữ liệu từ và gửi đi lưu
                    const response = await chrome.tabs.sendMessage(tab.id, { type: 'get_word_data_for_saving' });
                    if (response && response.data) {
                        await saveWordToDatabase({ ...response, tags });
                    }
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
        examples: data.examples,
        tags: tags
    };

    try {
        const response = await fetch(`${API_BASE_URL}/words`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });
        const savedData = await response.json();
        console.log('Successfully saved to DB:', savedData);
    } catch (err) {
        console.error('Error saving to DB:', err);
    }
}
async function getAuthHeaders() {
    return new Promise((resolve, reject) => {
        chrome.identity.getProfileUserInfo({ 'accountStatus': 'ANY' }, (userInfo) => {
            if (chrome.runtime.lastError || !userInfo || !userInfo.id) {
                reject('Could not get user info. Please make sure you are signed in to Chrome.');
                return;
            }
            resolve({
                'Content-Type': 'application/json',
                'x-user-google-id': userInfo.id,
                'x-user-email': userInfo.email,
            });
        });
    });
}
