import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRFQDetail, submitBid } from "../api/axios";
import BidTable from "../components/BidTable";
import ActivityLog from "../components/ActivityLog";

const statusBadge = (status) => {
  const badges = {
    active: { bg: "#dcfce7", text: "#166534", icon: "🟢" },
    force_closed: { bg: "#fee2e2", text: "#8e1919", icon: "🔴" },
    closed: { bg: "#f3f4f6", text: "#374151", icon: "⭕" },
  };
  const badge = badges[status] || badges.closed;
  const label = status === "active" ? "Active" : status === "force_closed" ? "Force Closed" : "Closed";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 1rem", borderRadius: "9999px", fontSize: "0.875rem", fontWeight: "600", backgroundColor: badge.bg, color: badge.text }}>
      <span style={{ fontSize: "1.125rem" }}>{badge.icon}</span>
      <span>{label}</span>
    </span>
  );
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
  return (
    <span style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: "bold", color: "#2563eb" }}>
      {timeLeft}
    </span>
  );
};

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      setBidSuccess("✅ Bid submitted successfully!");
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
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite", margin: "1rem auto" }}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4"></circle><path className="opacity-75" fill="#2563eb" d="M4 12a8 8 0 018-8v8z"></path></svg>
          <p style={{ color: "#6b7280", fontWeight: "500" }}>⏳ Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <svg style={{ width: "4rem", height: "4rem", color: "#dc2626", margin: "0 auto 1rem auto" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "0.5rem" }}>❌ RFQ Not Found</h2>
          <button onClick={() => navigate("/")} style={{ color: "#2563eb", fontWeight: "500", cursor: "pointer" }}>← Back to Auctions</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden" style={{ backgroundColor: "transparent", minHeight: "100vh", padding: "3rem 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "80rem", margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "#2563eb", fontWeight: "500", cursor: "pointer", border: "none", backgroundColor: "transparent" }}
        >
          <svg style={{ width: "1.25rem", height: "1.25rem" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          <span>← Back to Auctions</span>
        </button>

        {/* Header Section */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ height: "8px", background: "linear-gradient(to right, #2563eb, #06b6d4, #2563eb)" }}></div>
          <div style={{ padding: "2rem" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem" }}>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "0.5rem", overflowWrap: "anywhere" }}>{rfq.name}</h1>
                <p style={{ color: "#64748b", fontFamily: "monospace" }}>📌 Reference: {rfq.reference_id}</p>
              </div>
              {statusBadge(rfq.status)}
            </div>

            {/* Key Info Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e5e7eb" }}>
              {/* Lowest Bid */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>🏆 Lowest Bid</p>
                {rfq.bids && rfq.bids.length > 0 ? (
                  <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#16a34a" }}>£{rfq.bids[0]?.total_charges?.toFixed(2) || "N/A"}</p>
                ) : (
                  <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#9ca3af" }}>No bids yet</p>
                )}
              </div>

              {/* Bid Count */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>📈 Total Bids</p>
                <p style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#2563eb" }}>{rfq.bids?.length || 0}</p>
              </div>

              {/* Time Left */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>⏱️ Time Remaining</p>
                <CountdownTimer endTime={rfq.bid_close_time} />
              </div>
            </div>
          </div>
        </div>

        {/* Config & Timeline Card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Configuration */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", padding: "1.5rem", borderLeft: "4px solid #7c3aed" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⚙️ Auction Configuration</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", paddingBottom: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Trigger Window</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#1f2937" }}>{rfq.trigger_window_minutes} minutes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", paddingBottom: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Extension Duration</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#1f2937" }}>{rfq.extension_duration_minutes} minutes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <span style={{ color: "#64748b", fontWeight: "500" }}>Trigger Type</span>
                <span style={{ fontFamily: "monospace", fontWeight: "bold", color: "#2563eb", backgroundColor: "#dbeafe", padding: "0.25rem 0.5rem", borderRadius: "0.25rem" }}>{rfq.extension_trigger_type}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 15px rgba(0,0,0,0.1)", padding: "1.5rem", borderLeft: "4px solid #2563eb" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📅 Timeline</span>
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>Bid Start</p>
                <p style={{ fontFamily: "monospace", color: "#1f2937" }}>{formatDateTime(rfq.bid_start_time)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>Bid Close</p>
                <p style={{ fontFamily: "monospace", color: "#1f2937" }}>{formatDateTime(rfq.bid_close_time)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>Force Close</p>
                <p style={{ fontFamily: "monospace", color: "#dc2626", fontWeight: "bold" }}>{formatDateTime(rfq.forced_close_time)}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", marginBottom: "0.25rem" }}>Pickup Date</p>
                <p style={{ fontFamily: "monospace", color: "#1f2937" }}>{rfq.pickup_date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bids Section */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ height: "4px", background: "linear-gradient(to right, #16a34a, #10b981)" }}></div>
          <div style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>💰 Bid Leaderboard</span>
            </h2>
            <BidTable bids={rfq.bids} />
          </div>
        </div>

        {/* Activity Log Section */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden", marginBottom: "2rem" }}>
          <div style={{ height: "4px", background: "linear-gradient(to right, #f97316, #dc2626)" }}></div>
          <div style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>📜 Activity Log</span>
            </h2>
            <ActivityLog events={rfq.auction_events} />
          </div>
        </div>

        {/* Submit Bid Section */}
        {rfq.status === "active" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden" }}>
            <div style={{ height: "4px", background: "linear-gradient(to right, #06b6d4, #2563eb)" }}></div>
            <div style={{ padding: "2rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>💸 Submit New Bid</span>
              </h2>

              <form onSubmit={handleBidSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Carrier Name *</label>
                    <input
                      type="text"
                      name="carrier_name"
                      value={bidForm.carrier_name}
                      onChange={handleBidChange}
                      style={{
                        width: "100%",
                        padding: "0.625rem 1rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        color: "#1f2937",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      placeholder="Enter carrier name"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Transit Time (days) *</label>
                    <input
                      type="number"
                      name="transit_time"
                      value={bidForm.transit_time}
                      onChange={handleBidChange}
                      style={{
                        width: "100%",
                        padding: "0.625rem 1rem",
                        border: "2px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        color: "#1f2937",
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                      onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                      required
                      min="1"
                      placeholder="Days"
                    />
                  </div>
                </div>

                <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "1rem" }}>
                  <h3 style={{ fontWeight: "600", color: "#1f2937", marginBottom: "1rem" }}>💷 Charges Breakdown</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Freight Charges (£) *</label>
                      <input
                        type="number"
                        name="freight_charges"
                        value={bidForm.freight_charges}
                        onChange={handleBidChange}
                        style={{
                          width: "100%",
                          padding: "0.625rem 1rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                          color: "#1f2937",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Origin Charges (£) *</label>
                      <input
                        type="number"
                        name="origin_charges"
                        value={bidForm.origin_charges}
                        onChange={handleBidChange}
                        style={{
                          width: "100%",
                          padding: "0.625rem 1rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                          color: "#1f2937",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Destination Charges (£) *</label>
                      <input
                        type="number"
                        name="destination_charges"
                        value={bidForm.destination_charges}
                        onChange={handleBidChange}
                        style={{
                          width: "100%",
                          padding: "0.625rem 1rem",
                          border: "2px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                          color: "#1f2937",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                        onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Quote Validity *</label>
                  <input
                    type="date"
                    name="quote_validity"
                    value={bidForm.quote_validity}
                    onChange={handleBidChange}
                    style={{
                      width: "100%",
                      padding: "0.625rem 1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      color: "#1f2937",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    required
                  />
                </div>

                {bidError && (
                  <div style={{ backgroundColor: "#fee2e2", borderLeft: "4px solid #dc2626", padding: "1rem", borderRadius: "0.375rem" }}>
                    <p style={{ color: "#991b1b", fontWeight: "500" }}>⚠️ {bidError}</p>
                  </div>
                )}

                {bidSuccess && (
                  <div style={{ backgroundColor: "#dcfce7", borderLeft: "4px solid #16a34a", padding: "1rem", borderRadius: "0.375rem" }}>
                    <p style={{ color: "#166534", fontWeight: "500" }}>{bidSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#16a34a",
                    color: "white",
                    fontWeight: "600",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "none",
                    cursor: submitting ? "not-allowed" : "pointer",
                    opacity: submitting ? 0.5 : 1,
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = submitting ? "#16a34a" : "#15803d"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#16a34a"}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Submitting..." : "✅ Submit Bid"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
