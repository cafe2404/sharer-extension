import { useEffect } from "react";
import { useAuth } from "./useAuth";
import axiosInstance from "../services/axiosInstance";

export default function useAxiosPrivate() {
  const { token, updateToken, refreshToken } = useAuth();

  useEffect(() => {
    
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
            updateToken(newAccessToken);
            prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return axiosInstance(prevRequest); 
          } catch (refreshError) {
            console.error("Làm mới token thất bại:", refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestIntercept);
      axiosInstance.interceptors.response.eject(responseIntercept);
    };
  }, [token, refreshToken, updateToken]);

  return axiosInstance;
}
