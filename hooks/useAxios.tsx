import { useEffect } from "react";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosInstance";

export default function useAxiosPrivate() {
  const { token, updateToken, refreshToken, logout } = useAuth();

  useEffect(() => {
    console.log("Token:", token);
    console.log("Refresh Token:", refreshToken);
    
    const requestIntercept = axiosInstance.interceptors.request.use(
      (config) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `Bearer ${token}`; // Thêm token vào headers
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error.config;
        if (
          (error.response?.status === 403 || error.response?.status === 401) &&
          !prevRequest?.sent
        ) {
          prevRequest.sent = true;
          try {
            const r = await axiosInstance.post("/token/refresh/", {
              refresh: refreshToken,
            });
            const newAccessToken = r.data.access;
            updateToken(newAccessToken); // Cập nhật token mới
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosInstance(prevRequest); // Gửi lại request với token mới
          } catch (refreshError) {
            console.error("Làm mới token thất bại:", refreshError);
            logout(); // Logout nếu không thể làm mới token
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
      axiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, [token, refreshToken, updateToken, logout]);

  return axiosInstance;
}
