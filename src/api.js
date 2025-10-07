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
  return await api.get("/categories");
};

export const getSubcategories = async () => {
  return await api.get("/subcategories");
};

export default api;

// Transactions
export const createTransaksi = async (payload) => {
  return await api.post("/transaksi", payload);
};

// Use paymentSuccess endpoint to sync and retrieve latest status without changing backend
export const getPaymentStatus = async (orderId) => {
  return await api.get(`/payment/success/${orderId}`);
};
