import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRFQDetail, submitBid } from "../api/axios";

function formatDateTime(datetime) {
  if (!datetime) return "N/A";
  return new Date(datetime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function StatusBadge({ status }) {
  const config = {
    active: {
      bg: "rgba(74,222,128,0.15)",
      border: "rgba(74,222,128,0.4)",
      color: "#4ade80",
      label: "● Active",
    },
    closed: {
      bg: "rgba(148,163,184,0.15)",
      border: "rgba(148,163,184,0.4)",
      color: "#94a3b8",
      label: "● Closed",
    },
    force_closed: {
      bg: "rgba(248,113,113,0.15)",
      border: "rgba(248,113,113,0.4)",
      color: "#f87171",
      label: "● Force Closed",
    },
  };
  const s = config[status] || config.closed;
  return (
    <span
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {s.label}
    </span>
  );
}

function RankBadge({ rank }) {
  const config = {
    1: { bg: "linear-gradient(135deg, #f59e0b, #d97706)", label: "\uD83E\uDD47 L1" },
    2: { bg: "linear-gradient(135deg, #94a3b8, #64748b)", label: "\uD83E\uDD48 L2" },
    3: { bg: "linear-gradient(135deg, #cd7c2f, #92400e)", label: "\uD83E\uDD49 L3" },
  };
  const c = config[rank] || { bg: "rgba(255,255,255,0.1)", label: `L${rank}` };
  return (
    <span
      style={{
        background: c.bg,
        color: "white",
        padding: "4px 10px",
        borderRadius: "8px",
        fontSize: "12px",
        fontWeight: "700",
      }}
    >
      {c.label}
    </span>
  );
}

function Countdown({ targetTime }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(targetTime);
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setIsUrgent(diff < 300000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, [targetTime]);

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: "3rem",
          fontWeight: "800",
          letterSpacing: "4px",
          color: isUrgent ? "#f87171" : "white",
          animation: isUrgent ? "pulse 1s infinite" : "none",
        }}
      >
        {timeLeft}
      </div>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "8px" }}>
        Closes at {formatDateTime(targetTime)}
      </div>
    </div>
  );
}

const glassCard = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "20px",
  padding: "24px",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "10px",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  colorScheme: "dark",
};

export default function AuctionDetail() {
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
  const [bidMsg, setBidMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRFQ = async () => {
    try {
      const data = await getRFQDetail(id);
      setRfq(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRFQ();
    const i = setInterval(fetchRFQ, 15000);
    return () => clearInterval(i);
  }, [id]);

  const handleBidSubmit = async () => {
    setSubmitting(true);
    setBidMsg(null);
    try {
      await submitBid(id, {
        ...bidForm,
        freight_charges: parseFloat(bidForm.freight_charges),
        origin_charges: parseFloat(bidForm.origin_charges),
        destination_charges: parseFloat(bidForm.destination_charges),
        transit_time: parseInt(bidForm.transit_time),
      });
      setBidMsg({ type: "success", text: "✅ Bid submitted successfully!" });
      setBidForm({
        carrier_name: "",
        freight_charges: "",
        origin_charges: "",
        destination_charges: "",
        transit_time: "",
        quote_validity: "",
      });
      fetchRFQ();
    } catch (err) {
      setBidMsg({ type: "error", text: `❌ ${err.response?.data?.detail || "Failed to submit bid"}` });
    }
    setSubmitting(false);
  };

  if (loading)
    return (
      <div style={{ paddingTop: "80px", textAlign: "center", color: "white", padding: "120px 24px" }}>
        ⏳ Loading auction details...
      </div>
    );

  if (!rfq)
    return (
      <div style={{ paddingTop: "80px", textAlign: "center", color: "white", padding: "120px 24px" }}>
        ❌ RFQ not found
      </div>
    );

  const triggerLabels = {
    bid_received: "Bid Received in Last X Minutes",
    any_rank_change: "Any Rank Change",
    l1_rank_change: "L1 Rank Change",
  };

  const eventIcons = {
    bid_submitted: { icon: "🔵", border: "#3b82f6" },
    time_extended: { icon: "🟠", border: "#f59e0b" },
    auction_closed: { icon: "⚫", border: "#94a3b8" },
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", overflowX: "hidden" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px", boxSizing: "border-box" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255,255,255,0.7)",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          ← Back to Auctions
        </button>

        {/* RFQ Info Card */}
        <div style={glassCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div>
              <h1 style={{ color: "white", margin: "0 0 4px", fontSize: "1.6rem", fontWeight: "700" }}>{rfq.name}</h1>
              <p style={{ color: "rgba(255,255,255,0.5)", margin: 0, fontSize: "14px" }}>Reference ID: {rfq.reference_id}</p>
            </div>
            <StatusBadge status={rfq.status} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            {[
              { label: "Bid Start", value: formatDateTime(rfq.bid_start_time) },
              { label: "Bid Close", value: formatDateTime(rfq.bid_close_time) },
              { label: "Forced Close", value: formatDateTime(rfq.forced_close_time) },
              { label: "Pickup Date", value: rfq.pickup_date },
              { label: "Trigger Window", value: `${rfq.trigger_window_minutes} min` },
              { label: "Extension", value: `${rfq.extension_duration_minutes} min` },
              { label: "Trigger Type", value: triggerLabels[rfq.extension_trigger_type] || rfq.extension_trigger_type },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "11px",
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginBottom: "4px",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ color: "white", fontSize: "14px", fontWeight: "500" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Countdown Timer */}
        {rfq.status === "active" && (
          <div style={{ ...glassCard, textAlign: "center", borderColor: "rgba(245,158,11,0.3)" }}>
            <div
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "13px",
                marginBottom: "12px",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              ⏱ Time Remaining
            </div>
            <Countdown targetTime={rfq.bid_close_time} />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "8px" }}>
              Forced close: {formatDateTime(rfq.forced_close_time)}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Left: Bid Leaderboard */}
          <div style={glassCard}>
            <h2 style={{ color: "white", margin: "0 0 16px", fontSize: "1rem", fontWeight: "700" }}>🏆 Live Bid Rankings</h2>
            {rfq.bids && rfq.bids.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                      {["Rank", "Carrier", "Freight", "Origin", "Dest", "Total", "Transit"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
                            textAlign: "left",
                            color: "rgba(255,255,255,0.5)",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rfq.bids
                      .sort((a, b) => a.total_charges - b.total_charges)
                      .map((bid, i) => (
                        <tr
                          key={bid.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            background: bid.rank === 1 ? "rgba(74,222,128,0.06)" : "transparent",
                          }}
                        >
                          <td style={{ padding: "10px" }}>
                            <RankBadge rank={bid.rank} />
                          </td>
                          <td style={{ padding: "10px", color: "white", fontWeight: "600" }}>{bid.carrier_name}</td>
                          <td style={{ padding: "10px", color: "rgba(255,255,255,0.7)" }}>${bid.freight_charges}</td>
                          <td style={{ padding: "10px", color: "rgba(255,255,255,0.7)" }}>${bid.origin_charges}</td>
                          <td style={{ padding: "10px", color: "rgba(255,255,255,0.7)" }}>${bid.destination_charges}</td>
                          <td style={{ padding: "10px", color: "#4ade80", fontWeight: "700" }}>${bid.total_charges}</td>
                          <td style={{ padding: "10px", color: "rgba(255,255,255,0.7)" }}>{bid.transit_time}d</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>No bids yet</div>
            )}
          </div>

          {/* Right: Activity Log */}
          <div style={glassCard}>
            <h2 style={{ color: "white", margin: "0 0 16px", fontSize: "1rem", fontWeight: "700" }}>📋 Activity Log</h2>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {rfq.events && rfq.events.length > 0 ? (
                rfq.events.map((event, i) => {
                  const cfg = eventIcons[event.event_type] || { icon: "⚪", border: "#94a3b8" };
                  return (
                    <div
                      key={i}
                      style={{
                        borderLeft: `3px solid ${cfg.border}`,
                        paddingLeft: "12px",
                        marginBottom: "12px",
                        paddingBottom: "12px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ color: "white", fontSize: "13px", fontWeight: "500" }}>
                        {cfg.icon} {event.description}
                      </div>
                      {event.old_close_time && (
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "4px" }}>
                          {formatDateTime(event.old_close_time)} → {formatDateTime(event.new_close_time)}
                        </div>
                      )}
                      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", marginTop: "4px" }}>{formatDateTime(event.triggered_at)}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>No activity yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Bid */}
        {rfq.status === "active" && (
          <div style={glassCard}>
            <h2 style={{ color: "white", margin: "0 0 20px", fontSize: "1rem", fontWeight: "700" }}>💰 Submit Your Bid</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
              {[
                { key: "carrier_name", label: "Carrier Name", type: "text", placeholder: "e.g. DHL" },
                { key: "freight_charges", label: "Freight Charges ($)", type: "number", placeholder: "0.00" },
                { key: "origin_charges", label: "Origin Charges ($)", type: "number", placeholder: "0.00" },
                { key: "destination_charges", label: "Destination Charges ($)", type: "number", placeholder: "0.00" },
                { key: "transit_time", label: "Transit Time (days)", type: "number", placeholder: "5" },
                { key: "quote_validity", label: "Quote Validity", type: "date", placeholder: "" },
              ].map((field) => (
                <div key={field.key}>
                  <label
                    style={{
                      display: "block",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    style={inputStyle}
                    value={bidForm[field.key]}
                    onChange={(e) => setBidForm({ ...bidForm, [field.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            {bidMsg && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  background: bidMsg.type === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                  border: `1px solid ${bidMsg.type === "success" ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
                  color: bidMsg.type === "success" ? "#4ade80" : "#f87171",
                  fontSize: "14px",
                }}
              >
                {bidMsg.text}
              </div>
            )}

            <button
              onClick={handleBidSubmit}
              disabled={submitting}
              style={{
                background: submitting ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "10px",
                fontWeight: "700",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {submitting ? "⏳ Submitting..." : "💰 Submit Bid"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
