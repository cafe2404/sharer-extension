import React from "react";
import LogoSvg from "~assets/logo.svg";
const LoginRedirect = () => {
    const openLogin = () => {
        chrome.tabs.create(
            {
                url: process.env.PLASMO_PUBLIC_SERVER_URL+"/authentication-extension/",
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
        <div className="w-80 p-2 bg-blue-100">
            <div className="flex flex-col items-center justify-center mt-6">
                <div className="max-w-md w-full">
                    <a href=""><img
                        src={LogoSvg} alt="logo" className='w-40 mx-auto block' />
                    </a>
                    <div className="space-y-4 mt-4 p-4 bg-white rounded-lg">
                        <p>Vui lòng đăng nhập website trước khi sử dụng extension</p>
                        <div className="!mt-4">
                            <button type="button" onClick={openLogin} className="font-semibold w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                                Đồng bộ ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRedirect;
