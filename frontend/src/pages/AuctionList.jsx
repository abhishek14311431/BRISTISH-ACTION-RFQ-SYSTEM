import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRFQs } from "../api/axios";

const statusBadge = (status) => {
  const badges = {
    active: { bg: "#dcfce7", text: "#166534", icon: "🟢" },
    closed: { bg: "#f3f4f6", text: "#374151", icon: "⭕" },
    force_closed: { bg: "#fee2e2", text: "#991b1b", icon: "🔴" },
  };

  const badge = badges[status] || badges.closed;
  const label = status === "active" ? "Active" : status === "force_closed" ? "Force Closed" : "Closed";
  
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", fontSize: "0.75rem", fontWeight: "600", backgroundColor: badge.bg, color: badge.text }}>
      <span>{badge.icon}</span>
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
    <div className="w-full overflow-x-hidden" style={{ backgroundColor: "#f1f5f9", minHeight: "100vh", width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "80rem", margin: "0 auto", width: "100%", paddingTop: "1.5rem", paddingBottom: "2rem" }}>
        {/* Hero */}
        <div style={{ marginBottom: "1.5rem", backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 2px 8px rgba(15,23,42,0.08)", padding: "1.25rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "700", color: "#1e3a5f", margin: 0, overflowWrap: "anywhere" }}>📊 RFQ Auctions</h1>
            <p style={{ margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.95rem" }}>Manage and monitor all British Auction RFQs</p>
          </div>
          <button
            style={{
              padding: "0.625rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: "0.875rem",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(37,99,235,0.2)",
              transition: "background-color 0.2s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
            onClick={() => navigate("/create-rfq")}
          >
            ✏️ Create New RFQ
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ padding: "2.5rem", textAlign: "center", fontSize: "0.875rem", color: "#6b7280", backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 2px 8px rgba(15,23,42,0.08)" }}>
            <svg style={{ animation: "spin 1s linear infinite", margin: "1rem auto", width: "2.5rem", height: "2.5rem", color: "#2563eb" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4"></circle><path style={{ opacity: 0.75 }} fill="#2563eb" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <p>⏳ Loading auctions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && rfqs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "3rem", textAlign: "center", backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 2px 8px rgba(15,23,42,0.08)" }}>
            <svg style={{ width: "2.5rem", height: "2.5rem", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M5 7v11a2 2 0 002 2h10a2 2 0 002-2V7M9 11h6" />
            </svg>
            <p style={{ fontSize: "1rem", fontWeight: "500", color: "#6b7280" }}>No auctions yet</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>Create your first RFQ to get started</p>
            <button
              style={{
                marginTop: "0.5rem",
                padding: "0.625rem 1rem",
                borderRadius: "0.5rem",
                backgroundColor: "#2563eb",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
              onClick={() => navigate("/create-rfq")}
            >
              Create RFQ
            </button>
          </div>
        )}

        {/* Grid of Auction Cards */}
        {!loading && rfqs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem", width: "100%", maxWidth: "100%" }}>
            {rfqs.map((rfq) => (
              <div
                key={rfq.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "0.75rem",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                  maxWidth: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 20px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                }}
              >
                {/* Card Header with Color Stripe */}
                <div style={{ height: "4px", backgroundColor: "#2563eb" }}></div>

                {/* Card Content */}
                <div style={{ padding: "1.5rem" }}>
                  {/* Title and Status */}
                  <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ minWidth: 0, flex: "1 1 200px" }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "0.25rem", overflowWrap: "anywhere" }}>{rfq.name}</h3>
                      <p style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>📌 {rfq.reference_id}</p>
                    </div>
                    {statusBadge(rfq.status)}
                  </div>

                  {/* Divider */}
                  <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}></div>

                  {/* Stats */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>🏆 Lowest Bid</p>
                      {rfq.lowest_bid == null ? (
                        <p style={{ fontSize: "1rem", fontWeight: "bold", color: "#9ca3af" }}>—</p>
                      ) : (
                        <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#16a34a" }}>£{rfq.lowest_bid.toFixed(2)}</p>
                      )}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>💰 Bid Count</p>
                      <p style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#2563eb" }}>{rfq.bid_count || 0}</p>
                    </div>
                  </div>

                  {/* Timeline Info */}
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "0.5rem" }}>📅 Timeline</p>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", flexDirection: "column", gap: "0.25rem", fontFamily: "monospace" }}>
                      <div><strong>Close:</strong> {formatDateTime(rfq.bid_close_time)}</div>
                      <div><strong>Force:</strong> {formatDateTime(rfq.forced_close_time)}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" }}></div>

                  {/* View Button */}
                  <button
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "0.375rem",
                      backgroundColor: "#2563eb",
                      color: "white",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#1d4ed8"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = "#2563eb"}
                    onClick={() => navigate(`/rfq/${rfq.id}`)}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionList;
