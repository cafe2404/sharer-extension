import React, { useEffect, useState } from "react";
import { useAuth } from "~hooks/useAuth";
import useAxiosPrivate from "~hooks/useAxios";
import LogoSvg from "~assets/logo.svg";
import { CircleUserRound, Cookie, LogOut, Search } from "lucide-react";
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
interface SubscriptionDuration {
  id: number;
  subscription_plan: SubscriptionPlan;
  duration: number;
  price: number;
  pre_price: number;
}
// Interface for Package
interface AccountGroup {
  id: number;
  subscription_duration: SubscriptionDuration;
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
  login_choice: string | null;
}

// Interface for Cookie
interface Cookie {
  id: number;
  cookie: string;
  created_at: string; // ISO 8601 date string
}
// Root Interface for the JSON Data
interface Root {
  user: User;
  account_group: AccountGroup;
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
    <div className="flex flex-col border border-zinc-200 group rounded-lg mb-2">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 max-w-8 min-w-8 aspect-square overflow-hidden rounded-md border">
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
        <div className="flex items-center gap-2">
          {account.cookies.length > 0 && (
            <div className="flex items-center gap-1">
              {account.cookies.map((cookie, index) => (
                <button
                  key={cookie.id}
                  onClick={() => sendCookieToWebsite(cookie.cookie, account.platform.url)}
                  title={`Đăng nhập bằng cookie ${index + 1}`}
                  className="p-2 rounded-md hover:bg-blue-50 text-zinc-900 flex items-center justify-center bg-zinc-100 font-semibold"
                > 
                  Sv {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const axiosInstance = useAxiosPrivate();
  const [data, setData] = useState<Root | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (!axiosInstance) return;
    axiosInstance
      .get("/user-subscription/")
      .then((response) => {
        setData(response.data);
        console.log("Dữ liệu lấy thành công:", response.data);
      })
      .catch((error) => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, [axiosInstance]);

  if (!data) {
    return <div>Loading...</div>;
  }

  const { user: userData, account_group: accountsGroup, accounts: standaloneAccounts } = data;
  const accountsInGroup = accountsGroup.accounts;

  const filterAccounts = (accounts: Account[], query: string) => {
    return accounts.filter((account) =>
      account.name.toLowerCase().includes(query.toLowerCase()) || 
      account.platform.name.toLowerCase().includes(query.toLowerCase())
    );
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
    <div className="w-80">
      <div className="p-2 bg-white flex items-center justify-between">
        <img src={LogoSvg} className="h-6 w-auto" alt="Logo" />
        <button onClick={()=>openUrl(process.env.PLASMO_PUBLIC_SERVER_URL+'/dashboard/')}  className="flex items-center gap-1">
            <CircleUserRound size={16} className="text-blue-500" />
            <span className="text-zinc-500">
              {userData.username} ({data.account_group.subscription_duration.subscription_plan.name})
            </span>
          </button>
      </div>
      <div className="p-2 bg-blue-100 flex">
        <div className="bg-white rounded-lg w-full max-h-96 min-h-44 overflow-y-auto">
          <div className="border-b border-b-zinc-300 relative">
            <span className="text-zinc-500 absolute top-1/2 -translate-y-1/2 left-2.5">
              <Search size={16}></Search>
            </span>
            <input
              type="text"
              className="w-full px-4 py-2 pl-8 outline-none"
              placeholder="Tìm kiếm tài khoản"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Tài khoản trong gói */}
          <div className="p-2 ">
            <h2 className="text-sm font-semibold text-zinc-800 mb-2">Tài khoản trong gói</h2>
            {accountsInGroup.length === 0 ? (
              <div className="flex items-center justify-center">
                <span className="text-zinc-600">Không có tài khoản nào trong gói</span>
              </div>
            ) : (
              filterAccounts(accountsInGroup, searchQuery).map((account) => (
                account.platform.login_choice  === 'cookie' &&<AccountItem isNotInPackage={true} key={account.id} account={account} />
              ))
            )}
          </div>

          {/* Tài khoản lẻ */}
          <div className="px-2 pb-4">
            <h2 className="text-sm font-semibold text-zinc-800 mb-2">Tài khoản lẻ</h2>
            {standaloneAccounts.length === 0 ? (
              <div className="flex items-center justify-center">
                <span className="text-zinc-600">Không có tài khoản lẻ nào</span>
              </div>
            ) : (
              filterAccounts(standaloneAccounts, searchQuery).map((account) => (
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
