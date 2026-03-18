import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRFQ } from "../api/axios";

export default function CreateRFQ() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', reference_id: '', bid_start_time: '',
    bid_close_time: '', forced_close_time: '', pickup_date: '',
    trigger_window_minutes: '', extension_duration_minutes: '',
    extension_trigger_type: 'bid_received'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'RFQ Name is required';
    if (!form.reference_id) e.reference_id = 'Reference ID is required';
    if (!form.bid_start_time) e.bid_start_time = 'Bid Start Time is required';
    if (!form.bid_close_time) e.bid_close_time = 'Bid Close Time is required';
    if (!form.forced_close_time) e.forced_close_time = 'Forced Close Time is required';
    if (!form.pickup_date) e.pickup_date = 'Pickup Date is required';
    if (!form.trigger_window_minutes) e.trigger_window_minutes = 'Trigger Window is required';
    if (!form.extension_duration_minutes) e.extension_duration_minutes = 'Extension Duration is required';
    if (form.bid_start_time && form.bid_close_time && form.bid_start_time >= form.bid_close_time)
      e.bid_close_time = 'Bid Close must be after Bid Start';
    if (form.bid_close_time && form.forced_close_time && form.forced_close_time <= form.bid_close_time)
      e.forced_close_time = 'Forced Close must be after Bid Close';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    try {
      const normalizeDatetimeLocal = (value) => {
        if (!value) return value;
        return value.length === 16 ? `${value}:00` : value;
      };

      const payload = {
        ...form,
        bid_start_time: normalizeDatetimeLocal(form.bid_start_time),
        bid_close_time: normalizeDatetimeLocal(form.bid_close_time),
        forced_close_time: normalizeDatetimeLocal(form.forced_close_time),
        trigger_window_minutes: parseInt(form.trigger_window_minutes) || 0,
        extension_duration_minutes: parseInt(form.extension_duration_minutes) || 0,
        status: 'active'
      };

      console.log('Sending:', payload);
      await createRFQ(payload);
      navigate('/');
    } catch (err) {
      console.error('RFQ Creation Error:', err);
      const detail = err?.response?.data?.detail;
      const submitMessage = Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join(' | ')
        : typeof detail === 'string'
          ? detail
          : (err?.response?.status === 400 || err?.response?.status === 422)
            ? 'Validation Error: Check your inputs.'
            : 'Failed to create RFQ. Server might be unreachable or busy.';
      setErrors({ submit: submitMessage });
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: 'dark'
  };

  const labelStyle = {
    display: 'block',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '6px',
    letterSpacing: '0.3px'
  };

  const fieldStyle = {
    marginBottom: '20px'
  };

  const errorStyle = {
    color: '#f87171',
    fontSize: '12px',
    marginTop: '4px'
  };

  return (
    <div style={{
      paddingTop: '80px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '100px 24px 40px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '620px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}>

        {/* Header */}
        <div style={{marginBottom: '32px'}}>
          <h1 style={{fontSize: '1.8rem', fontWeight: '700', color: 'white', margin: '0 0 8px 0'}}>
            🏷️ Create New RFQ
          </h1>
          <p style={{color: 'rgba(255,255,255,0.5)', margin: 0, fontSize: '14px'}}>
            Set up a new British Auction request for quotation
          </p>
        </div>

        {/* Section: Basic Info */}
        <div style={{
          borderLeft: '3px solid #f59e0b',
          paddingLeft: '12px',
          marginBottom: '24px'
        }}>
          <h3 style={{color: '#f59e0b', margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'}}>
            Basic Information
          </h3>
        </div>

        {/* RFQ Name */}
        <div style={fieldStyle}>
          <label style={labelStyle}>RFQ Name</label>
          <input style={inputStyle} placeholder="Enter RFQ name"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          {errors.name && <div style={errorStyle}>⚠ {errors.name}</div>}
        </div>

        {/* Reference ID */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Reference ID</label>
          <input style={inputStyle} placeholder="e.g. RFQ-0001"
            value={form.reference_id} onChange={e => setForm({...form, reference_id: e.target.value})} />
          {errors.reference_id && <div style={errorStyle}>⚠ {errors.reference_id}</div>}
        </div>

        {/* 2 column grid for dates */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bid Start Time</label>
            <input type="datetime-local" style={inputStyle}
              value={form.bid_start_time} onChange={e => setForm({...form, bid_start_time: e.target.value})} />
            {errors.bid_start_time && <div style={errorStyle}>⚠ {errors.bid_start_time}</div>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Bid Close Time</label>
            <input type="datetime-local" style={inputStyle}
              value={form.bid_close_time} onChange={e => setForm({...form, bid_close_time: e.target.value})} />
            {errors.bid_close_time && <div style={errorStyle}>⚠ {errors.bid_close_time}</div>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Forced Close Time</label>
            <input type="datetime-local" style={inputStyle}
              value={form.forced_close_time} onChange={e => setForm({...form, forced_close_time: e.target.value})} />
            {errors.forced_close_time && <div style={errorStyle}>⚠ {errors.forced_close_time}</div>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Pickup / Service Date</label>
            <input type="date" style={inputStyle}
              value={form.pickup_date} onChange={e => setForm({...form, pickup_date: e.target.value})} />
            {errors.pickup_date && <div style={errorStyle}>⚠ {errors.pickup_date}</div>}
          </div>
        </div>

        {/* Section: Auction Config */}
        <div style={{
          borderLeft: '3px solid #8b5cf6',
          paddingLeft: '12px',
          margin: '8px 0 24px 0'
        }}>
          <h3 style={{color: '#8b5cf6', margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase'}}>
            Auction Configuration
          </h3>
        </div>

        {/* Trigger Window + Extension Duration */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Trigger Window (minutes)</label>
            <input type="number" style={inputStyle} placeholder="e.g. 10"
              value={form.trigger_window_minutes} onChange={e => setForm({...form, trigger_window_minutes: e.target.value})} />
            {errors.trigger_window_minutes && <div style={errorStyle}>⚠ {errors.trigger_window_minutes}</div>}
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Extension Duration (minutes)</label>
            <input type="number" style={inputStyle} placeholder="e.g. 5"
              value={form.extension_duration_minutes} onChange={e => setForm({...form, extension_duration_minutes: e.target.value})} />
            {errors.extension_duration_minutes && <div style={errorStyle}>⚠ {errors.extension_duration_minutes}</div>}
          </div>
        </div>

        {/* Trigger Type */}
        <div style={fieldStyle}>
          <label style={labelStyle}>Extension Trigger Type</label>
          <select style={{...inputStyle, cursor: 'pointer'}}
            value={form.extension_trigger_type} onChange={e => setForm({...form, extension_trigger_type: e.target.value})}>
            <option value="bid_received">Bid Received in Last X Minutes</option>
            <option value="any_rank_change">Any Supplier Rank Change</option>
            <option value="l1_rank_change">L1 (Lowest Bidder) Rank Change</option>
          </select>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div style={{
            background: 'rgba(248,113,113,0.1)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#f87171',
            fontSize: '14px',
            marginBottom: '20px'
          }}>⚠ {errors.submit}</div>
        )}

        {/* Buttons */}
        <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1,
            padding: '14px',
            background: loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}>
            {loading ? '⏳ Creating...' : '🏷️ Create RFQ'}
          </button>
          <button onClick={() => navigate('/')} style={{
            padding: '14px 24px',
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
