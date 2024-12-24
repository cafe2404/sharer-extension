import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.PLASMO_PUBLIC_API_URL,
});

export default axiosInstance;