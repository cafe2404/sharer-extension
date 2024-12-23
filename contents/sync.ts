import { env } from "process";

console.log('Sync is running');

window.addEventListener('message', function(event) {

    // Kiểm tra origin (VÔ CÙNG QUAN TRỌNG)
    if (event.origin !== process.env.PLASMO_PUBLIC_SERVER_URL) { // Thay bằng origin website của bạn
        console.warn("Tin nhắn từ origin không được phép:", event.origin);
        return;
    }
    if (event.data.type ==='AUTHENTICATED_EXTENSION') {
        chrome.runtime.sendMessage(event.data);
    }
    if (event.data.type ==='LOGOUT_EXTENSION') {
        chrome.runtime.sendMessage(event.data);
    }
});