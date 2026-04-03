import axios, { type AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_URL || "https://reyu-diamond.onrender.com",
//   withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");
    
    if (token) {
      // Handle potential double quotes from JSON.stringify
      try {
        const parsed = JSON.parse(token);
        token = typeof parsed === 'string' ? parsed : token;
      } catch (e) {
        // Not JSON, use as is
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
