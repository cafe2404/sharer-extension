import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import LogoSvg from "../assets/logo.svg";
import { useAuth } from "~hooks/useAuth";
const LoginPage = () => {
    const { login,user } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8000/api/login/", {
                username,
                password,
            });

            // Lấy dữ liệu từ response
            const { access, refresh, user } = response.data;
            console.log(response.data);
            // Gọi hàm login từ AuthContext
            login({user:user, accessToken: access, refreshToken: refresh });
            navigate("/");
        } catch (err) {
            setError("Vui lòng kiểm tra thông tin đăng nhập");
        }
    };
    useEffect(() => {
        setError("");
    }, [username,password]);
    return (
        <div className="w-80 p-4 bg-white">
            <div className="flex flex-col items-center justify-center mt-6">
                <div className="max-w-md w-full">
                    <a href="javascript:void(0)"><img
                        src={LogoSvg} alt="logo" className='w-40 mx-auto block' />
                    </a>
                    <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-gray-800 text-sm mb-2 block font-semibold">Tài khoản</label>
                            <div className="relative flex items-center">
                                <input value={username} onChange={(e)=>setUsername(e.target.value)} name="username" type="text" required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="nguyenvana" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4" viewBox="0 0 24 24">
                                    <circle cx="10" cy="7" r="6" data-original="#000000"></circle>
                                    <path d="M14 15H6a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5zm8-4h-2.59l.3-.29a1 1 0 0 0-1.42-1.42l-2 2a1 1 0 0 0 0 1.42l2 2a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-.3-.29H22a1 1 0 0 0 0-2z" data-original="#000000"></path>
                                </svg>
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-800 text-sm mb-2 block font-semibold">Mật khẩu</label>
                            <div className="relative flex items-center">
                                <input value={password} onChange={(e)=>setPassword(e.target.value)}  name="password" type="password" required className="w-full text-gray-800 text-sm border border-gray-300 px-4 py-3 rounded-md outline-blue-600" placeholder="*****" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" className="w-4 h-4 absolute right-4 cursor-pointer" viewBox="0 0 128 128">
                                    <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" data-original="#000000"></path>
                                </svg>
                            </div>
                            {error.length > 0 && <p className="text-red-500 text-xs mt-1">{error}</p>}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-800">
                                    Ghi nhớ tôi
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="jajvascript:void(0);" className="text-blue-600 hover:underline font-semibold">
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </div>
                        <div className="!mt-8">
                            <button type="submit" className="font-semibold w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                                Đăng nhập
                            </button>
                        </div>
                        {/* <p className="text-gray-800 text-sm !mt-8 text-center">Don't have an account? <a href="javascript:void(0);" className="text-blue-600 hover:underline ml-1 whitespace-nowrap font-semibold">Register here</a></p> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
