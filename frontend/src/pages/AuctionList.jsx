import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRFQs } from "../api/axios";

const statusBadge = (status) => {
  const color =
    status === "active"
      ? "bg-green-100 text-green-700"
      : status === "force_closed"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";
  const label =
    status === "active"
      ? "Active"
      : status === "force_closed"
      ? "Force Closed"
      : "Closed";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{label}</span>;
};

const formatDateTime = (dt) => {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const AuctionList = () => {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRFQs = async () => {
    setLoading(true);
    try {
      const data = await getAllRFQs();
      setRfqs(data);
    } catch (e) {
      setRfqs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
    const interval = setInterval(fetchRFQs, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">RFQ Auctions</h2>
        <button
          className="bg-blue-600 text-white font-semibold px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate("/create-rfq")}
        >
          Create New RFQ
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">RFQ Name</th>
              <th className="px-4 py-2 text-left">Reference ID</th>
              <th className="px-4 py-2 text-left">Current Lowest Bid</th>
              <th className="px-4 py-2 text-left">Current Bid Close Time</th>
              <th className="px-4 py-2 text-left">Forced Close Time</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  <svg className="animate-spin h-6 w-6 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                  <span className="block mt-2 text-gray-500">Loading...</span>
                </td>
              </tr>
            ) : rfqs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">No RFQs found.</td>
              </tr>
            ) : (
              rfqs.map((rfq) => (
                <tr key={rfq.id} className="border-t hover:bg-blue-50 transition">
                  <td className="px-4 py-2 font-medium">{rfq.name}</td>
                  <td className="px-4 py-2">{rfq.reference_id}</td>
                  <td className="px-4 py-2">
                    {rfq.lowest_bid == null ? (
                      <span className="text-gray-400">No bids yet</span>
                    ) : (
                      <span className="text-green-700 font-bold">£{rfq.lowest_bid.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{formatDateTime(rfq.bid_close_time)}</td>
                  <td className="px-4 py-2">{formatDateTime(rfq.forced_close_time)}</td>
                  <td className="px-4 py-2">{statusBadge(rfq.status)}</td>
                  <td className="px-4 py-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition"
                      onClick={() => navigate(`/rfq/${rfq.id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuctionList;
