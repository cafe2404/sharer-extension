import React, { useEffect } from "react";
import { useAuth } from "~hooks/useAuth";
import useAxiosPrivate from "~hooks/useAxios";
import LogoSvg from "~assets/logo.svg";
import { Check, CircleUserRound, Cookie, Copy, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

interface Platform {
  id: number;
  name: string;
  description: string;
  url: string;
  logo_url: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  string: string;
}

interface PlatformAccount {
  id: number;
  platform: Platform;
  username: string;
  password: string;
  cookie: string;
  created_at: string; // Hoặc Date nếu bạn muốn xử lý dưới dạng đối tượng Date
  updated_at: string; // Hoặc Date nếu bạn muốn xử lý dưới dạng đối tượng Date
  expired_at: string; // Hoặc Date nếu bạn muốn xử lý dưới dạng đối tượng Date
  user: number;
  time_left: TimeLeft;
  login: string

}


const Item = (item: PlatformAccount) => {
  const [isCopy, setIsCopy] = React.useState(false);
  useEffect(() => {
    if (isCopy) {
      const timeout = setTimeout(() => {
        setIsCopy(false);
      }, 2000); // Đặt lại isCopy sau 2 giây

      return () => clearTimeout(timeout); // Dọn dẹp timeout
    }
  }, [isCopy]);
  const onCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text); // Sao chép văn bản
      setIsCopy(true); // Đặt trạng thái isCopy là true
    } catch (error) {
      console.error("Sao chép thất bại:", error);
    }
  };

  const sendCookieToWebsite = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      // Kiểm tra xem tab hiện tại có phải là Freepik không
      if (currentTab && currentTab.url && currentTab.url.includes(new URL(item.platform.url).hostname)) {
        // Nếu là Freepik, gửi cookie vào tab hiện tại
        chrome.tabs.sendMessage(
          currentTab.id!, // Gửi đến tab hiện tại
          {
            type: "setCookie",
            cookie: item.cookie, // Cookie bạn muốn thêm
            domain: item.platform.url, // URL của domain mà bạn muốn thêm cookie
          },
          (response) => {
            if (response?.success) {
              console.log("Cookie đã được gán thành công!");
            } else {
              console.error("Lỗi khi gán cookie:", response?.error);
            }
          }
        );
      } else {
        // Nếu không phải Freepik, mở tab mới và gửi cookie vào đó
        chrome.tabs.create({ url: item.platform.url }, (tab) => {
          // Tab mới đã được mở, bây giờ gửi cookie vào tab này
          chrome.tabs.sendMessage(
            tab.id!, // Sử dụng id của tab mới mở
            {
              type: "setCookie",
              cookie: item.cookie, // Cookie bạn muốn thêm
              domain: item.platform.url, // URL của domain mà bạn muốn thêm cookie
            },
            (response) => {
              if (response?.success) {
                console.log("Cookie đã được gán thành công!");
              } else {
                console.error("Lỗi khi gán cookie:", response?.error);
              }
            }
          );
        });
      }
    });
  };

  return (
    <div className="flex flex-col border-b border-zinc-200 group">
      <div className="flex items-center justify-between p-2 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <div className="h-14 w-14 overflow-hidden rounded-md">
            <img src={item.platform.logo_url} className="h-full w-full object-cover" alt="" />
          </div>
          <div className="flex flex-col">
            <Link to={item.platform.url} className="text-xs text-zinc-600 hover:text-blue-600 duration-150">{item.platform.name}</Link>
            <span className="text-zinc-900 font-semibold line-clamp-1">{item.username}</span>
            <span className={`text-xs ${item.time_left.string === 'Vĩnh viễn' ? 'text-green-600' : item.time_left.string === 'Hết hạn' ? 'text-red-600' : 'text-blue-600'}`}>{item.time_left.string}</span>
          </div>
        </div>
        {
           item.time_left.string === 'Hết hạn' ? null :  item.login === 'Cookie'?
            <button onClick={() => sendCookieToWebsite()} title="Đăng nhập bằng cookie" className="p-2 rounded-md hover:bg-blue-50 text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-150" >
              <Cookie size={16} />
            </button>
            :
            <button onClick={() => onCopy(item.password)} title="" className="p-2 rounded-md hover:bg-blue-50 text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-150" >
              {
                isCopy ?
                  <Check size={16} />
                  :
                  <Copy size={16} />
              }
            </button>
        }

      </div>


    </div>
  )
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const axiosInstance = useAxiosPrivate()
  const [platforms, setPlatforms] = React.useState<PlatformAccount[]>([]);
  useEffect(() => {
    // Kiểm tra xem axiosInstance có sẵn hay không
    if (!axiosInstance) return;

    axiosInstance
      .get("/platform-accounts/")
      .then((response) => {
        console.log(response.data);
        setPlatforms(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, [axiosInstance]); // Thêm axiosInstance vào dependency array
  return (
    <div className="w-80">
      <div className="p-2 bg-white flex items-center justify-between">
        <img src={LogoSvg} className="h-8 w-auto" alt="" />
        <button className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center gap-2" onClick={logout}>
          Đăng xuất
          <LogOut size={16} />
        </button>
      </div>
      <div className="p-2 bg-blue-100 flex">
        <div className="bg-white rounded-lg w-full max-h-96 min-h-44 overflow-y-auto">
          <div className="flex items-center justify-between p-2 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <CircleUserRound size={16} className="text-blue-500" />
                <span className="text-zinc-500">{user}</span>
              </div>
            </div>
            <Link to={'http://127.0.0.1:8000/settings/'} className="text-blue-500 hover:underline duration-150" >
              Chỉnh sửa thông tin
            </Link>
          </div>
          {
            platforms.length === 0 ? (
              <div className="flex items-center justify-center">
                <span className="text-zinc-800 mt-8">Vui lòng liên hệ admin để được cập tài khoản</span>
              </div>
            ) : platforms.map((item) => (
              <Item key={item.id} {...item} />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
