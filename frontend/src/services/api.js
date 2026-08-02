import axios from "axios";

const apiHost = window.location.hostname || "localhost";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || `http://${apiHost}:5000/api`,
  withCredentials: true,
  timeout: 15000,
});

const TOKEN_KEY = "stockflow.token";
const USER_KEY = "stockflow.user";

function readStored(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return raw.startsWith('"') ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = readStored(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const isAuthEndpoint = /\/auth\/(login|register|forgot-password)$/.test(url);
    const hadToken = Boolean(readStored(TOKEN_KEY));

    if (status === 401 && hadToken && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export default api;
