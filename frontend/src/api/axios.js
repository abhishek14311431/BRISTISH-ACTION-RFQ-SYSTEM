import axios from "axios";

const resolveApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  if (process.env.NODE_ENV === "development") {
    return "";
  }

  const { protocol, hostname, host } = window.location;
  const isCodespacesHost = hostname.endsWith("github.dev");

  if (isCodespacesHost && host.includes("-3000")) {
    return `${protocol}//${host.replace("-3000", "-8000")}`;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:8000`;
  }

  return `${protocol}//${hostname}:8000`;
};

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
});

// API helper functions
export const getAllRFQs = async () => {
  const res = await api.get("/api/rfq/");
  if (!Array.isArray(res.data)) {
    throw new Error("RFQ list response is not an array");
  }
  return res.data;
};

export const getRFQDetail = async (rfq_id) => {
  const res = await api.get(`/api/rfq/${rfq_id}`);
  return res.data;
};

export const createRFQ = async (data) => {
  const res = await api.post("/api/rfq/", data);
  return res.data;
};

export const submitBid = async (rfq_id, data) => {
  const res = await api.post(`/api/bids/${rfq_id}/`, data);
  return res.data;
};

export default api;
