import axios from "axios";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
const API_BASE_URL = rawUrl.startsWith("http") ? rawUrl.replace(/\/+$/, "") : rawUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json"
  }
});


// Interceptor to attach Auth JWT Token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("skill2pocket_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function parseApiError(err: any, fallbackMessage: string = "An error occurred. Please try again."): string {
  if (!err) return fallbackMessage;
  
  // Handle network disconnection or server cold-start timeouts
  if (err.message === "Network Error" || err.code === "ERR_NETWORK" || (!err.response && err.request)) {
    return "Server connection issue. If the backend service is waking up, please wait a few seconds and try again.";
  }

  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((d: any) => {
        if (typeof d === "string") return d;
        if (d.msg) {
          const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "";
          return field ? `${field}: ${d.msg}` : d.msg;
        }
        return d.message || JSON.stringify(d);
      })
      .join(". ");
  }
  if (detail && typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }
  return err.message || fallbackMessage;
}


