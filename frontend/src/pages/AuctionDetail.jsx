import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRFQDetail, submitBid } from "../api/axios";
import BidTable from "../components/BidTable";
import ActivityLog from "../components/ActivityLog";

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

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const diff = Math.max(0, end - now);
      const hours = String(Math.floor(diff / 3600000)).padStart(2, "0");
      const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
      const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  return <span className="font-mono text-lg">{timeLeft}</span>;
};

const AuctionDetail = () => {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({
    carrier_name: "",
    freight_charges: "",
    origin_charges: "",
    destination_charges: "",
    transit_time: "",
    quote_validity: "",
  });
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await getRFQDetail(id);
      setRfq(data);
    } catch (e) {
      setRfq(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    const interval = setInterval(fetchDetail, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleBidChange = (e) => {
    const { name, value } = e.target;
    setBidForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setBidError("");
    setBidSuccess("");
    setSubmitting(true);
    try {
      const payload = {
        ...bidForm,
        freight_charges: Number(bidForm.freight_charges),
        origin_charges: Number(bidForm.origin_charges),
        destination_charges: Number(bidForm.destination_charges),
        transit_time: Number(bidForm.transit_time),
        quote_validity: bidForm.quote_validity,
      };
      await submitBid(id, payload);
      setBidSuccess("Bid submitted successfully!");
      setBidForm({
        carrier_name: "",
        freight_charges: "",
        origin_charges: "",
        destination_charges: "",
        transit_time: "",
        quote_validity: "",
      });
      fetchDetail();
    } catch (error) {
      setBidError(error.response?.data?.detail || "Failed to submit bid.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto mt-10 text-center text-gray-500">Loading...</div>;
  }
  if (!rfq) {
    return <div className="max-w-3xl mx-auto mt-10 text-center text-red-500">RFQ not found.</div>;
  }

  // Section 1: RFQ Info Card
  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded shadow-md">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">{rfq.name}</h2>
          {statusBadge(rfq.status)}
        </div>
        <div className="mb-2 text-gray-600">Reference ID: <span className="font-mono">{rfq.reference_id}</span></div>
        <div className="mb-2">
          <span className="font-medium">Current Bid Close Time: </span>
          {formatDateTime(rfq.bid_close_time)}
          <span className="ml-2"><CountdownTimer endTime={rfq.bid_close_time} /></span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Forced Close Time: </span>{formatDateTime(rfq.forced_close_time)}
        </div>
        <div className="mb-2">
          <span className="font-medium">Auction Config:</span>
          <span className="ml-2">Trigger Window: <span className="font-mono">{rfq.trigger_window_minutes} min</span></span>
          <span className="ml-2">Extension Duration: <span className="font-mono">{rfq.extension_duration_minutes} min</span></span>
          <span className="ml-2">Trigger Type: <span className="font-mono">{rfq.extension_trigger_type}</span></span>
        </div>
      </div>

      {/* Section 2: Bid Leaderboard Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bid Leaderboard</h3>
        <BidTable bids={rfq.bids} />
      </div>

      {/* Section 3: Activity Log */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Activity Log</h3>
        <ActivityLog events={rfq.auction_events} />
      </div>

      {/* Submit Bid Form */}
      {rfq.status === "active" && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Submit Bid</h3>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Carrier Name</label>
              <input
                type="text"
                name="carrier_name"
                value={bidForm.carrier_name}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Freight Charges</label>
              <input
                type="number"
                name="freight_charges"
                value={bidForm.freight_charges}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Origin Charges</label>
              <input
                type="number"
                name="origin_charges"
                value={bidForm.origin_charges}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Destination Charges</label>
              <input
                type="number"
                name="destination_charges"
                value={bidForm.destination_charges}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Transit Time (days)</label>
              <input
                type="number"
                name="transit_time"
                value={bidForm.transit_time}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Quote Validity</label>
              <input
                type="date"
                name="quote_validity"
                value={bidForm.quote_validity}
                onChange={handleBidChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                required
              />
            </div>
            {bidError && <p className="text-red-500 text-sm mt-2 text-center">{bidError}</p>}
            {bidSuccess && <p className="text-green-600 text-sm mt-2 text-center">{bidSuccess}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Bid"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
