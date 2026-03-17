import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// API helper functions
export const getAllRFQs = async () => {
  const res = await api.get("/rfq/");
  return res.data;
};

export const getRFQDetail = async (rfq_id) => {
  const res = await api.get(`/rfq/${rfq_id}`);
  return res.data;
};

export const createRFQ = async (data) => {
  const res = await api.post("/rfq/", data);
  return res.data;
};

export const submitBid = async (rfq_id, data) => {
  const res = await api.post(`/rfq/${rfq_id}/bid`, data);
  return res.data;
};

export default api;
