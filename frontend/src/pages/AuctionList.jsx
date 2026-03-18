import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRFQs } from "../api/axios";

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

  const totalAuctions = rfqs.length;
  const activeAuctions = rfqs.filter((item) => item.status === "active").length;
  const closedAuctions = rfqs.filter((item) => item.status !== "active").length;

  return (
    <div className="w-full overflow-x-hidden page-enter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <section className="glass-card card-enter p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-white text-3xl md:text-4xl font-extrabold">RFQ Auctions</h1>
              <p className="text-slate-300 mt-2">Manage and monitor all British Auction RFQs</p>
            </div>

            <button
              type="button"
              className="gradient-btn text-white px-5 py-2.5 rounded-xl font-semibold"
              onClick={() => navigate("/create-rfq")}
            >
              Create New RFQ
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-card p-5 card-enter">
            <p className="text-slate-300 text-sm">📦 Total Auctions</p>
            <p className="text-white text-3xl font-bold mt-2">{totalAuctions}</p>
          </div>
          <div className="glass-card p-5 card-enter" style={{ animationDelay: "60ms" }}>
            <p className="text-slate-300 text-sm">🟢 Active Auctions</p>
            <p className="text-white text-3xl font-bold mt-2">{activeAuctions}</p>
          </div>
          <div className="glass-card p-5 card-enter" style={{ animationDelay: "120ms" }}>
            <p className="text-slate-300 text-sm">⚫ Closed Auctions</p>
            <p className="text-white text-3xl font-bold mt-2">{closedAuctions}</p>
          </div>
        </section>

        {loading && (
          <div className="glass-card p-12 text-center text-slate-200 card-enter">
            <div className="spinner mx-auto"></div>
            <p className="mt-4">Loading auctions...</p>
          </div>
        )}

        {!loading && rfqs.length === 0 && (
          <div className="glass-card p-12 text-center card-enter">
            <div className="floating-icon text-5xl">📭</div>
            <p className="text-white text-xl font-semibold mt-3">No auctions yet</p>
            <p className="text-slate-300 mt-1">Create your first RFQ to get started</p>
            <button
              type="button"
              className="gradient-btn mt-5 px-5 py-2.5 rounded-xl font-semibold"
              onClick={() => navigate("/create-rfq")}
            >
              Create RFQ
            </button>
          </div>
        )}

        {!loading && rfqs.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="hidden md:block overflow-hidden">
              <table className="w-full text-sm">
                <thead className="table-head text-white">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">RFQ Name</th>
                    <th className="text-left px-4 py-3 font-semibold">Reference</th>
                    <th className="text-left px-4 py-3 font-semibold">Lowest Bid</th>
                    <th className="text-left px-4 py-3 font-semibold">Bid Close</th>
                    <th className="text-left px-4 py-3 font-semibold">Force Close</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq, index) => (
                    <tr key={rfq.id} className="table-row row-enter" style={{ animationDelay: `${index * 70}ms` }}>
                      <td className="px-4 py-3 text-slate-100 font-medium">{rfq.name}</td>
                      <td className="px-4 py-3 text-slate-300">{rfq.reference_id}</td>
                      <td className="px-4 py-3">
                        {rfq.lowest_bid == null ? (
                          <span className="text-slate-400">No bids</span>
                        ) : (
                          <span className="lowest-bid">£{rfq.lowest_bid.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{formatDateTime(rfq.bid_close_time)}</td>
                      <td className="px-4 py-3 text-slate-200">{formatDateTime(rfq.forced_close_time)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="view-btn px-4 py-2 font-medium"
                          onClick={() => navigate(`/rfq/${rfq.id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden p-4 space-y-3">
              {rfqs.map((rfq, index) => (
                <div key={rfq.id} className="glass-card p-4 row-enter" style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold break-words">{rfq.name}</p>
                      <p className="text-slate-300 text-xs mt-1">{rfq.reference_id}</p>
                    </div>
                    <StatusBadge status={rfq.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-slate-300">
                    <p>Lowest: {rfq.lowest_bid == null ? "No bids" : `£${rfq.lowest_bid.toFixed(2)}`}</p>
                    <p>Close: {formatDateTime(rfq.bid_close_time)}</p>
                    <p className="col-span-2">Force Close: {formatDateTime(rfq.forced_close_time)}</p>
                  </div>

                  <button
                    type="button"
                    className="view-btn w-full mt-3 px-4 py-2 font-medium"
                    onClick={() => navigate(`/rfq/${rfq.id}`)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionList;
