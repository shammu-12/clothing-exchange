import axios from "axios";

const configuredApi = import.meta.env.VITE_API_URL?.trim();
const apiOrigin = configuredApi
  ? `${/^https?:\/\//i.test(configuredApi) ? configuredApi : `https://${configuredApi}`}`
      .replace(/\/+$/, "")
      .replace(/\/api$/i, "")
  : "";
const apiBaseUrl = apiOrigin ? `${apiOrigin}/api` : "/api";

const API = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Keep authentication in one place so every protected API call behaves the
// same way. The token is intentionally read at request time: logging in or
// out takes effect without reloading the application.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
