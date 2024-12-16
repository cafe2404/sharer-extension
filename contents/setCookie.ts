console.log("Content script đang chạy...");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "setCookie") {
    console.log("Nhận được thông điệp từ popup:", message);

    // Trực tiếp gửi thông điệp đến background để gán cookie
    chrome.runtime.sendMessage(
      { type: "setCookie", cookie: message.cookie, url: message.url },
      (response) => {
        if (response?.success) {
          console.log("Cookie đã được gán thành công!");
          sendResponse({ success: true });
        } else {
          console.error(response?.error);
          sendResponse({ success: false, error: response?.error });
        }
      }
    );
    return true; // Để hỗ trợ xử lý bất đồng bộ
  }
});
