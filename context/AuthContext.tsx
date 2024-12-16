import React, { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  refreshToken: null,
  login: (data) => {}, // Hàm login nhận cả thông tin người dùng và tokens
  logout: () => {},               // Hàm logout
  updateToken: (newToken) => {},  // Hàm để cập nhật token mới
});

export const AuthProvider = ({ children }) => {
  // Lấy trạng thái ban đầu từ localStorage (nếu có)
  const [user, setUser] = useState(() => localStorage.getItem("user"));
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() =>localStorage.getItem("refreshToken"));

  // Hàm login: lưu thông tin user và tokens vào state và localStorage
  const login = (data) => {
    const { user, accessToken, refreshToken } = data;
    console.log(data)
    setUser(user);
    setToken(accessToken);
    setRefreshToken(refreshToken);

    localStorage.setItem("user", user);
    localStorage.setItem("token", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  // Hàm logout: xóa thông tin user và tokens
  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  // Hàm để cập nhật accessToken mới
  const updateToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        login,
        logout,
        updateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


