import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:5000/api/admin",
});

// 🔐 REQUEST INTERCEPTOR
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 RESPONSE INTERCEPTOR (AUTO LOGOUT)
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Admin token expired or invalid");

      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default adminApi;
