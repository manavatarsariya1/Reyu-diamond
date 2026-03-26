import axios, { type AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
//   withCredentials: true
});

// optional interceptor
// api.interceptors.response.use(
//   (res) => res,
//   (err) => Promise.reject(err.response?.data || err)
// );

export default api;
