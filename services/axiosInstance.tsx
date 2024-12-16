import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://160.187.246.61/api",
});

export default axiosInstance;