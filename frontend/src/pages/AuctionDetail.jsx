import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRFQDetail, submitBid } from "../api/axios";
 
const formatDateTime = (dt) => {
  if (!dt) return "";
  return new Date(dt).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const CountUpNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let animationFrame;
    const start = performance.now();
    const duration = 500;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span className="lowest-bid">£{display.toFixed(2)}</span>
  );
};

const StatusBadge = ({ status }) => {
  if (status === "active") {
    return (
      <span className="status-pill status-active">
        <span className="active-dot"></span>
        Active
      </span>
    );
  }

  if (status === "force_closed") {
    return <span className="status-pill status-force">Force Closed</span>;
  }

  return <span className="status-pill status-closed">Closed</span>;
};

const CountdownTimer = ({ endTime }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const endTs = new Date(endTime).getTime();

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((endTs - Date.now()) / 1000));
      setSecondsLeft(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, "0");
  const seconds = String(secondsLeft % 60).padStart(2, "0");
  const warning = secondsLeft > 0 && secondsLeft < 300;

  return (
    <span className={warning ? "warning-countdown text-5xl md:text-6xl font-extrabold tracking-widest" : "text-white text-5xl md:text-6xl font-extrabold tracking-widest"}>
      {hours}:{minutes}:{seconds}
    </span>
  );
};

const getRankClass = (rank) => {
  if (rank === 1) return "rank-l1";
  if (rank === 2) return "rank-l2";
  if (rank === 3) return "rank-l3";
  return "rank-other";
};

const getRankLabel = (rank) => {
  if (rank === 1) return "🥇 L1";
  if (rank === 2) return "🥈 L2";
  if (rank === 3) return "🥉 L3";
  return `#${rank}`;
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
  const [toast, setToast] = useState(null);

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
      setToast({ type: "success", message: "Bid submitted successfully." });
      setTimeout(() => setToast(null), 3000);
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
      const message = error.response?.data?.detail || "Failed to submit bid.";
      setBidError(message);
      setToast({ type: "error", message });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-hidden page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-12 text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-slate-200">Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div className="w-full overflow-x-hidden page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-12 text-center text-slate-200">
            <div className="text-5xl">❌</div>
            <h2 className="text-2xl font-bold mt-3 text-white">RFQ Not Found</h2>
            <button onClick={() => navigate("/")} className="mt-3 text-slate-200 hover:underline">← Back to Auctions</button>
          </div>
        </div>
      </div>
    );
  }

  const events = [...(rfq.auction_events || [])].sort(
    (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
  );

  return (
    <div className="w-full overflow-x-hidden page-enter">
      {toast && <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>{toast.type === "success" ? "✅" : "❌"} {toast.message}</div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        <section className="glass-card p-6 card-enter">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-extrabold break-words">{rfq.name}</h1>
              <p className="text-slate-300 mt-1">Reference ID: {rfq.reference_id}</p>
            </div>
            <StatusBadge status={rfq.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <div className="glass-card p-4">
              <p className="text-slate-300 text-sm">Pickup Date</p>
              <p className="text-white font-semibold mt-1">{formatDateTime(rfq.pickup_date)}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-slate-300 text-sm">Trigger Window</p>
              <p className="text-white font-semibold mt-1">{rfq.trigger_window_minutes} min</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-slate-300 text-sm">Extension Duration</p>
              <p className="text-white font-semibold mt-1">{rfq.extension_duration_minutes} min</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-slate-300 text-sm">Trigger Type</p>
              <p className="text-white font-semibold mt-1 break-words">{rfq.extension_trigger_type}</p>
            </div>
            <div className="glass-card p-4 sm:col-span-2">
              <p className="text-slate-300 text-sm">Bid Start</p>
              <p className="text-white font-semibold mt-1">{formatDateTime(rfq.bid_start_time)}</p>
            </div>
            <div className="glass-card p-4 sm:col-span-2">
              <p className="text-slate-300 text-sm">Force Close</p>
              <p className="text-white font-semibold mt-1">{formatDateTime(rfq.forced_close_time)}</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-8 text-center card-enter">
          <p className="text-slate-300 text-sm">Bid closes at {formatDateTime(rfq.bid_close_time)}</p>
          <div className="mt-3">
            <CountdownTimer endTime={rfq.bid_close_time} />
          </div>
          <p className="text-slate-400 mt-4 text-sm">Forced close: {formatDateTime(rfq.forced_close_time)}</p>
        </section>

        <section className="glass-card p-6 card-enter">
          <h2 className="text-white text-2xl font-bold">🏆 Live Bid Rankings</h2>
          <div className="mt-4 overflow-hidden">
            {rfq.bids?.length ? (
              <table className="w-full text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="text-left px-3 py-2 text-white">Rank</th>
                    <th className="text-left px-3 py-2 text-white">Carrier</th>
                    <th className="text-left px-3 py-2 text-white">Freight</th>
                    <th className="text-left px-3 py-2 text-white">Origin</th>
                    <th className="text-left px-3 py-2 text-white">Destination</th>
                    <th className="text-left px-3 py-2 text-white">Total</th>
                    <th className="text-left px-3 py-2 text-white">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {rfq.bids.map((bid, idx) => (
                    <tr
                      key={bid.id}
                      className={`${idx === 0 ? "l1-row-glow" : "table-row"} row-enter ${idx === 0 ? "row-top-enter" : ""}`}
                      style={{ animationDelay: `${idx * 70}ms` }}
                    >
                      <td className="px-3 py-3">
                        <span className={`rank-badge ${getRankClass(bid.rank)}`}>{getRankLabel(bid.rank)}</span>
                      </td>
                      <td className="px-3 py-3 text-slate-100 font-medium">{bid.carrier_name}</td>
                      <td className="px-3 py-3 text-slate-200">£{Number(bid.freight_charges).toFixed(2)}</td>
                      <td className="px-3 py-3 text-slate-200">£{Number(bid.origin_charges).toFixed(2)}</td>
                      <td className="px-3 py-3 text-slate-200">£{Number(bid.destination_charges).toFixed(2)}</td>
                      <td className="px-3 py-3 font-bold">
                        <CountUpNumber value={Number(bid.total_charges)} />
                      </td>
                      <td className="px-3 py-3 text-slate-300">{formatDateTime(bid.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-slate-300">No bids submitted yet.</p>
            )}
          </div>
        </section>

        {rfq.status === "active" && (
          <section className="glass-card p-6 card-enter">
            <h2 className="text-white text-2xl font-bold">Submit Your Bid</h2>

            <form className="mt-4 space-y-4" onSubmit={handleBidSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-100 text-sm font-medium">Carrier Name</label>
                  <input className="glass-input mt-1" name="carrier_name" value={bidForm.carrier_name} onChange={handleBidChange} required />
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Transit Time (days)</label>
                  <input className="glass-input mt-1" type="number" min="1" name="transit_time" value={bidForm.transit_time} onChange={handleBidChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-100 text-sm font-medium">Freight Charges</label>
                  <input className="glass-input mt-1" type="number" min="0" step="0.01" name="freight_charges" value={bidForm.freight_charges} onChange={handleBidChange} required />
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Origin Charges</label>
                  <input className="glass-input mt-1" type="number" min="0" step="0.01" name="origin_charges" value={bidForm.origin_charges} onChange={handleBidChange} required />
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Destination Charges</label>
                  <input className="glass-input mt-1" type="number" min="0" step="0.01" name="destination_charges" value={bidForm.destination_charges} onChange={handleBidChange} required />
                </div>
              </div>

              <div>
                <label className="text-slate-100 text-sm font-medium">Quote Validity</label>
                <input className="glass-input mt-1" type="date" name="quote_validity" value={bidForm.quote_validity} onChange={handleBidChange} required />
              </div>

              {bidError && <p className="field-error">{bidError}</p>}
              {bidSuccess && <p className="text-emerald-300 font-semibold">✅ {bidSuccess}</p>}

              <button type="submit" className="w-full gradient-btn rounded-xl py-4 font-bold text-white flex items-center justify-center gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Bid"
                )}
              </button>
            </form>
          </section>
        )}

        <section className="glass-card p-6 card-enter">
          <h2 className="text-white text-2xl font-bold">🕒 Activity Log</h2>

          <div className="mt-4 space-y-3">
            {events.length ? (
              events.map((event, idx) => {
                const isBid = event.event_type === "bid_submitted";
                const isExtend = event.event_type === "time_extended";
                const rowClass = isBid ? "activity-bid" : isExtend ? "activity-extend" : "activity-close";

                let message = "Auction closed";
                if (isBid) {
                  message = event.description || "Bid submitted";
                } else if (isExtend) {
                  message = `Auction extended: ${formatDateTime(event.old_close_time)} → ${formatDateTime(event.new_close_time)}`;
                }

                const icon = isBid ? "🔵" : isExtend ? "🟠" : "⚫";

                return (
                  <div key={event.id} className={`activity-row ${rowClass} row-enter`} style={{ animationDelay: `${idx * 70}ms` }}>
                    <p className="text-slate-100">
                      {icon} {message}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">{formatDateTime(event.triggered_at)}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-300">No activity events yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuctionDetail;
