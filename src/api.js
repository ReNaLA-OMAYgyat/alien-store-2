// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://alienstore.test/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCategories = async () => {
  return await axios.get(`${API_URL}/categories`);
};

export const getSubcategories = async () => {
  return await axios.get(`${API_URL}/subcategories`);
};
export default api;
