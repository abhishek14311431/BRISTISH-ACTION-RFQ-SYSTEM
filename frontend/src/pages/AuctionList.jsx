import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRFQs } from "../api/axios";

function formatDateTime(datetime) {
  if (!datetime) return "N/A";
  const date = new Date(datetime);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

function getStatusBadge(status) {
  const styles = {
    active: { background:"rgba(74,222,128,0.2)", border:"1px solid rgba(74,222,128,0.5)", color:"#4ade80" },
    closed: { background:"rgba(148,163,184,0.2)", border:"1px solid rgba(148,163,184,0.5)", color:"#94a3b8" },
    force_closed: { background:"rgba(248,113,113,0.2)", border:"1px solid rgba(248,113,113,0.5)", color:"#f87171" }
  };
  const labels = { active:"● Active", closed:"● Closed", force_closed:"● Force Closed" };
  return (
    <span style={{
      ...(styles[status] || styles.closed),
      padding:"4px 12px",
      borderRadius:"20px",
      fontSize:"12px",
      fontWeight:"600"
    }}>{labels[status] || labels.closed}</span>
  );
}

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
    <div style={{paddingTop: "60px", maxWidth: "960px", margin: "0 auto", padding: "64px 20px 20px", width: "90%", overflowX: "hidden"}}>

      {/* Header Row */}
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", gap: "12px", flexWrap: "nowrap"}}>
        <div>
          <h1 style={{fontSize:"1.6rem", fontWeight:"700", color:"white", margin:0}}>🏛️ RFQ Auctions</h1>
          <p style={{fontSize: "0.9rem", color:"rgba(255,255,255,0.6)", marginTop:"6px"}}>Manage and monitor all British Auction RFQs</p>
        </div>
      </div>

      {/* Stats Row - 3 cards side by side */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"24px"}}>
        <div className="glass-card" style={{padding: "16px", textAlign:"center", border: "1px solid rgba(255,255,255,0.1)"}}>
          <div style={{fontSize:"1.6rem", fontWeight:"700", color:"white"}}>{rfqs.length}</div>
          <div style={{fontSize: "0.85rem", color:"rgba(255,255,255,0.6)"}}>Total Auctions</div>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "16px",
            textAlign:"center",
            border: "1px solid rgba(74,222,128,0.3)",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(74, 222, 128, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          <div style={{fontSize:"1.6rem", fontWeight:"700", color:"#4ade80"}}>{rfqs.filter(r=>r.status==="active").length}</div>
          <div style={{fontSize: "0.85rem", color:"rgba(255,255,255,0.6)"}}>Active Auctions</div>
        </div>
        <div
          className="glass-card"
          style={{
            padding: "16px",
            textAlign:"center",
            border: "1px solid rgba(148,163,184,0.3)",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(148, 163, 184, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
          }}
        >
          <div style={{fontSize:"1.6rem", fontWeight:"700", color:"#94a3b8"}}>{rfqs.filter(r=>r.status!=="active").length}</div>
          <div style={{fontSize: "0.85rem", color:"rgba(255,255,255,0.6)"}}>Closed Auctions</div>
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{padding: "16px", textAlign: "center", color: "rgba(255,255,255,0.8)"}}>
          Loading auctions...
        </div>
      ) : (
        <>
          {rfqs.length === 0 ? (
            <div className="glass-card" style={{padding: "16px", textAlign: "center", color: "rgba(255,255,255,0.8)"}}>
              No auctions yet
            </div>
          ) : (
            <div className="glass-card" style={{overflowX: "auto"}}>
              <table style={{width:"100%", borderCollapse:"collapse", minWidth: "980px"}}>
                <thead>
                  <tr style={{borderBottom:"1px solid rgba(255,255,255,0.05)", background:"rgba(255,140,0,0.1)"}}>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>RFQ Name</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Reference ID</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Lowest Bid</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Bid Close Time</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Forced Close</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Status</th>
                    <th style={{padding:"12px 16px", textAlign:"left", color:"rgba(255,255,255,0.7)", fontWeight:"600"}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq) => (
                    <tr key={rfq.id} style={{
                      borderBottom:"1px solid rgba(255,255,255,0.05)",
                      transition:"background 0.2s"
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,140,0,0.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    >
                      <td style={{padding:"16px", color:"white", fontWeight:"500"}}>{rfq.name}</td>
                      <td style={{padding:"16px", color:"rgba(255,255,255,0.7)"}}>{rfq.reference_id}</td>
                      <td style={{padding:"16px", color:"#4ade80", fontWeight:"700"}}>{rfq.lowest_bid ? `$${rfq.lowest_bid}` : "No bids yet"}</td>
                      <td style={{padding:"16px", color:"rgba(255,255,255,0.7)"}}>{formatDateTime(rfq.bid_close_time)}</td>
                      <td style={{padding:"16px", color:"rgba(255,255,255,0.7)"}}>{formatDateTime(rfq.forced_close_time)}</td>
                      <td style={{padding:"16px"}}>{getStatusBadge(rfq.status)}</td>
                      <td style={{padding:"16px"}}>
                        <button onClick={()=>navigate(`/rfq/${rfq.id}`)} style={{
                          background:"linear-gradient(135deg, #f59e0b, #d97706)",
                          border:"1px solid rgba(245,158,11,0.6)",
                          color:"#ffffff",
                          padding:"8px 16px",
                          borderRadius:"8px",
                          cursor:"pointer",
                          fontWeight:"500"
                        }}>View Details →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuctionList;
