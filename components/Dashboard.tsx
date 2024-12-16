import React, { useEffect, useState } from "react";
import { useAuth } from "~hooks/useAuth";
import useAxiosPrivate from "~hooks/useAxios";
import LogoSvg from "~assets/logo.svg";
import { Check, CircleUserRound, Cookie, Copy, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

// Interface for User
interface User {
  id: number;
  username: string;
  email: string;
  subscription_plan: SubscriptionPlan;
}

// Interface for Subscription Plan
interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  level: number;
  platforms: number[];
}

// Interface for Package
interface Package {
  id: number;
  subscription_plan: SubscriptionPlan;
  accounts: Account[];
}

// Interface for Account
interface Account {
  id: number;
  platform: Platform;
  name: string;
  is_active: boolean;
  rented_by: number | null;
  rented_at: string | null; // ISO 8601 date string
  expires_at: string | null; // ISO 8601 date string
  cookies: Cookie[];
}

// Interface for Platform
interface Platform {
  id: number;
  name: string;
  description: string;
  url: string;
  logo_url: string;
}

// Interface for Cookie
interface Cookie {
  id: number;
  cookie: string;
  created_at: string; // ISO 8601 date string
}
// Props for Account Item
interface AccountProps {
  account: Account;
}
// Root Interface for the JSON Data
interface Root {
  user: User;
  package: Package;
  accounts: Account[];
}

const AccountItem = ({ account,isNotInPackage }: { account: Account,isNotInPackage?: boolean }) => {
  const sendCookieToWebsite = (cookie: string, platformUrl: string) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const domain = new URL(platformUrl).hostname;
      const url = platformUrl;
      if (currentTab?.url?.includes(domain)) {
        chrome.tabs.sendMessage(
          currentTab.id!,
          { type: "setCookie", cookie, url },
          (response) => {
            if (response?.success) {
              console.log("Cookie đã được gán thành công!");
            } else {
              console.error("Lỗi khi gán cookie:", response?.error);
            }
          }
        );
      } else {
        chrome.tabs.create({ url: platformUrl }, (tab) => {
          chrome.tabs.sendMessage(
            tab.id!,
            { type: "setCookie", cookie, url },
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
  const openUrl = (url: string) => {
    chrome.tabs.create(
        {
            url: url,
            active: true,
        },
        (tab) => {
            if (tab.id) {
                chrome.tabs.update(tab.id, { active: true });
            }
        }
    )
};
  return (
    <div className="flex flex-col border-b border-zinc-200 group">
      <div className="flex items-center justify-between p-2 ">
        <div className="flex items-center gap-2">
          <div className="h-14 w-14 overflow-hidden rounded-md border">
            <img
              src={account.platform.logo_url}
              className="h-full w-full object-cover"
              alt={account.platform.name}
            />
          </div>
          <div className="flex flex-col">
            <Link
              to={account.platform.url}
              onClick={ () => {
                openUrl(account.platform.url);
              }}
              className="text-md font-semibold text-zinc-600 hover:text-blue-600 duration-150"
            >
              {account.platform.name}
            </Link>
            {/* <span className="text-zinc-900 font-semibold line-clamp-1">
              {account.name}
            </span> */}
            {isNotInPackage &&
              <span
                className={`text-xs ${
                  account.expires_at
                    ? new Date(account.expires_at) > new Date()
                      ? "text-blue-600"
                      : "text-red-600"
                    : "text-green-600"
                }`}
              >
                {account.expires_at
                  ? new Date(account.expires_at) > new Date()
                    ? "Còn hạn"
                    : "Hết hạn"
                  : "Vĩnh viễn"}
              </span>
            }
          </div>
        </div>
        {account.cookies.length > 0 && (
          <div className="flex items-center gap-1">
            {account.cookies.map((cookie, index) => (
              <button
                key={cookie.id}
                onClick={() => sendCookieToWebsite(cookie.cookie, account.platform.url)}
                title={`Đăng nhập bằng cookie ${index + 1}`}
                className="p-2 rounded-md hover:bg-blue-50 text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-150"
              >
                <Cookie size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const axiosInstance = useAxiosPrivate();
  const [data, setData] = useState<Root | null>(null);

  useEffect(() => {
    if (!axiosInstance) return;

    axiosInstance
      .get("/user-subscription/")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, [axiosInstance]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const { user: userData, package: userPackage, accounts: standaloneAccounts } = data;

  // Các tài khoản trong gói
  const packageAccounts = userPackage.accounts;

  return (
    <div className="w-80">
      <div className="p-2 bg-white flex items-center justify-between">
        <img src={LogoSvg} className="h-8 w-auto" alt="Logo" />
        <button
          className="px-4 py-2 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center gap-2"
          onClick={logout}
        >
          Đăng xuất
          <LogOut size={16} />
        </button>
      </div>

      <div className="p-2 bg-blue-100 flex">
        <div className="bg-white rounded-lg w-full max-h-96 min-h-44 overflow-y-auto">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <CircleUserRound size={16} className="text-blue-500" />
              <span className="text-zinc-500">
                {userData.username} ({data.package.subscription_plan.name})
              </span>
            </div>
            <Link
              to="/settings"
              className="text-blue-500 hover:underline duration-150"
            >
              Quản lý tài khoản
            </Link>
          </div>

          {/* Tài khoản trong gói */}
          <div className="p-2 ">
            <h2 className="text-sm font-semibold text-zinc-800">Tài khoản trong gói</h2>
            {packageAccounts.length === 0 ? (
              <div className="flex items-center justify-center mt-2">
                <span className="text-zinc-600">Không có tài khoản nào trong gói</span>
              </div>
            ) : (
              packageAccounts.map((account) => (
                <AccountItem key={account.id} account={account} />
              ))
            )}
          </div>

          {/* Tài khoản lẻ */}
          <div className="p-2">
            <h2 className="text-sm font-semibold text-zinc-800">Tài khoản lẻ</h2>
            {standaloneAccounts.length === 0 ? (
              <div className="flex items-center justify-center mt-2">
                <span className="text-zinc-600">Không có tài khoản lẻ nào</span>
              </div>
            ) : (
              standaloneAccounts.map((account) => (
                <AccountItem isNotInPackage={true} key={account.id} account={account} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;