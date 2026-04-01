import axios from "axios";
import { storage } from "./storage";

export const BASE = "http://localhost:5000/api";

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${storage.getToken()}` },
});

export const api = {
  get:    (url)       => axios.get(`${BASE}${url}`, authHeaders()),
  post:   (url, data) => axios.post(`${BASE}${url}`, data, authHeaders()),
  put:    (url, data) => axios.put(`${BASE}${url}`, data, authHeaders()),
  delete: (url)       => axios.delete(`${BASE}${url}`, authHeaders()),
};

export function timeAgo(d) {
  if (!d) return "Recently";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`;
  return `${Math.floor(s / 2592000)}mo ago`;
}
