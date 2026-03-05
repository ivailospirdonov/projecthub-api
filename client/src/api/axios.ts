import axios from "axios";
import { refreshToken as apiRefreshToken } from "./auth";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refToken = localStorage.getItem("refreshToken");
    if (error.response?.status === 401 && !originalRequest._retry && refToken) {
      originalRequest._retry = true;
      try {
        const refreshRes = await apiRefreshToken(refToken);

        const { accessToken, refreshToken } = refreshRes.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
