import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRFQs } from "../api/axios";

function formatDateTime(datetime) {
  if (!datetime) return 'N/A';
  const date = new Date(datetime);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function StatusBadge({ status }) {
  const config = {
    active: { bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)', color: '#4ade80', label: 'Active' },
    closed: { bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.4)', color: '#94a3b8', label: 'Closed' },
    force_closed: { bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)', color: '#f87171', label: 'Force Closed' }
  };
  const s = config[status] || config.closed;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
      whiteSpace: 'nowrap'
    }}>● {s.label}</span>
  );
}

export default function AuctionList() {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRFQs = async () => {
    try {
      const data = await getAllRFQs();
      setRfqs(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRFQs();
    const interval = setInterval(fetchRFQs, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = rfqs.length;
  const active = rfqs.filter(r => r.status === 'active').length;
  const closed = rfqs.filter(r => r.status !== 'active').length;

  return (
    <div style={{
      minHeight: '100vh',
      paddingTop: '80px',
      boxSizing: 'border-box',
      overflowX: 'hidden'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', margin: 0 }}>
              🏛️ RFQ Auctions
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '14px' }}>
              Manage and monitor all British Auction RFQs
            </p>
          </div>
          <button onClick={() => navigate('/create')} style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white', border: 'none', padding: '10px 20px',
            borderRadius: '10px', fontWeight: '600', cursor: 'pointer',
            fontSize: '14px', whiteSpace: 'nowrap'
          }}>✏️ Create New RFQ</button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { label: 'Total Auctions', value: total, color: 'white' },
            { label: 'Active Auctions', value: active, color: '#4ade80' },
            { label: 'Closed Auctions', value: closed, color: '#94a3b8' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.5)' }}>
              ⏳ Loading auctions...
            </div>
          ) : rfqs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
              <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: '600' }}>No auctions yet</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: '8px 0 24px' }}>
                Create your first RFQ to get started
              </div>
              <button onClick={() => navigate('/create')} style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', border: 'none', padding: '10px 24px',
                borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
              }}>✏️ Create RFQ</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {['RFQ Name', 'Reference ID', 'Lowest Bid', 'Bid Close Time', 'Forced Close', 'Status', 'Action'].map(h => (
                      <th key={h} style={{
                        padding: '14px 16px', textAlign: 'left',
                        color: 'rgba(255,255,255,0.6)', fontWeight: '600',
                        fontSize: '13px', whiteSpace: 'nowrap',
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map((rfq, index) => (
                    <tr key={rfq.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px', color: 'white', fontWeight: '600' }}>{rfq.name}</td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>{rfq.reference_id}</td>
                      <td style={{ padding: '16px', color: rfq.lowest_bid ? '#4ade80' : 'rgba(255,255,255,0.4)', fontWeight: '700' }}>
                        {rfq.lowest_bid ? `$${rfq.lowest_bid}` : 'No bids yet'}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDateTime(rfq.bid_close_time)}
                      </td>
                      <td style={{ padding: '16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatDateTime(rfq.forced_close_time)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <StatusBadge status={rfq.status} />
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => navigate(`/rfq/${rfq.id}`)} style={{
                          background: 'rgba(245,158,11,0.15)',
                          border: '1px solid rgba(245,158,11,0.4)',
                          color: '#f59e0b', padding: '8px 16px',
                          borderRadius: '8px', cursor: 'pointer',
                          fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap'
                        }}>View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
