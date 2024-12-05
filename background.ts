// Xóa cookie cũ trước khi thêm cookie mới
const removeCookie = async (name: string, domain: string) => {
  try {
    const removedCookie = await chrome.cookies.remove({
      url: domain.startsWith("http") ? domain : `https://${domain}`,  // Đảm bảo có URL hợp lệ
      name: name
    });
    if (removedCookie) {
      console.log(`Cookie ${name} đã bị xóa.`);
    } else {
      console.log(`Không tìm thấy cookie ${name} để xóa.`);
    }
  } catch (error) {
    console.error("Lỗi khi xóa cookie:", error);
  }
};

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "setCookie") {
    try {
      const { cookie, domain } = message;

      // Kiểm tra giá trị cookie và domain
      if (!cookie) {
        throw new Error("cookie is undefined or empty");
      }
      if (!domain) {
        throw new Error("domain is undefined or empty");
      }

      // Tách các cookie từ chuỗi và gán chúng
      const cookies = cookie.split(";"); // Tách các cookie từ chuỗi
      for (const cookie of cookies) {
        const [name, ...valueParts] = cookie.trim().split("=");

        // Kiểm tra xem cookie có chứa dấu '=' và có giá trị hợp lệ không
        if (name && valueParts.length > 0) {
          const value = valueParts.join("=");

          // Xóa cookie cũ trước khi thêm cookie mới
          await removeCookie(name.trim(), domain);

          // Thêm cookie mới
          const cookie_res = await chrome.cookies.set({
            url: domain.startsWith("http") ? domain : `https://${domain}`,
            name: name.trim(),
            value: value.trim(),
            domain: new URL(domain).hostname, // Trích xuất miền từ URL
            path: "/",
            secure: true,
            sameSite: "lax", // Hoặc "None" nếu cần
            expirationDate: (new Date().getTime() / 1000) + 3600,  // Tạo ngày hết hạn là 1 giờ sau
          });

          console.log("Cookie đã được gán thành công:", cookie_res);
        } else {
          console.error("Cookie không hợp lệ:", cookie);
        }
      }

      console.log("Tất cả cookie đã được gán xong!");

      // Reload tab sau khi đã set cookie
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        if (currentTab?.id) {
          chrome.tabs.reload(currentTab.id);
        }
      });

      sendResponse({ success: true });
    } catch (error) {
      console.error("Lỗi khi gán cookie:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  return true; // Để hỗ trợ xử lý bất đồng bộ
});
