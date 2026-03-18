import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRFQ } from "../api/axios";

const triggerOptions = [
  { value: "bid_received", label: "Bid Received in Last X Minutes" },
  { value: "any_rank_change", label: "Any Rank Change" },
  { value: "l1_rank_change", label: "L1 Rank Change" },
];

const CreateRFQ = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    reference_id: "",
    bid_start_time: "",
    bid_close_time: "",
    forced_close_time: "",
    pickup_date: "",
    trigger_window_minutes: "",
    extension_duration_minutes: "",
    extension_trigger_type: "bid_received",
    status: "active",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const err = {};
    if (form.forced_close_time && form.bid_close_time && form.forced_close_time <= form.bid_close_time) {
      err.forced_close_time = "Forced close time must be after bid close time.";
    }
    if (form.bid_start_time && form.bid_close_time && form.bid_start_time >= form.bid_close_time) {
      err.bid_start_time = "Bid start time must be before bid close time.";
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);
    if (Object.keys(err).length > 0) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        bid_start_time: new Date(form.bid_start_time).toISOString(),
        bid_close_time: new Date(form.bid_close_time).toISOString(),
        forced_close_time: new Date(form.forced_close_time).toISOString(),
        pickup_date: form.pickup_date,
        trigger_window_minutes: Number(form.trigger_window_minutes),
        extension_duration_minutes: Number(form.extension_duration_minutes),
      };
      await createRFQ(payload);
      navigate("/");
    } catch (error) {
      const detail = error.response?.data?.detail;
      const submitMessage = Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join(" | ")
        : typeof detail === "string"
          ? detail
          : "Failed to create RFQ.";
      setErrors({ submit: submitMessage });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden" style={{ backgroundColor: "transparent", minHeight: "100vh", padding: "3rem 0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1e3a5f", marginBottom: "0.5rem" }}>
            📋 Create New RFQ
          </h1>
          <p style={{ color: "#64748b" }}>Set up and configure a new auction request for quotation</p>
        </div>

        {/* Form Card */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ height: "4px", backgroundColor: "#2563eb" }}></div>
          
          <form onSubmit={handleSubmit} style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Basic Information */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e3a5f", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#dbeafe", color: "#2563eb", fontWeight: "bold" }}>1</span>
                <span>Basic Information</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>RFQ Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
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
                    placeholder="e.g., Transportation Q1 2026"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Reference ID *</label>
                  <input
                    type="text"
                    name="reference_id"
                    value={form.reference_id}
                    onChange={handleChange}
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
                    placeholder="e.g., RFQ-2026-001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderBottom: "2px solid #e2e8f0" }}></div>

            {/* Timeline */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e3a5f", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#dcfce7", color: "#16a34a", fontWeight: "bold" }}>2</span>
                <span>📅 Timeline</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem", lineHeight: 1.3 }}>Bid Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="bid_start_time"
                    value={form.bid_start_time}
                    onChange={handleChange}
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
                  {errors.bid_start_time && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>⚠️ {errors.bid_start_time}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem", lineHeight: 1.3 }}>Bid Close Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="bid_close_time"
                    value={form.bid_close_time}
                    onChange={handleChange}
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
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem", lineHeight: 1.3 }}>Forced Close Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="forced_close_time"
                    value={form.forced_close_time}
                    onChange={handleChange}
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
                  {errors.forced_close_time && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.25rem" }}>⚠️ {errors.forced_close_time}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Pickup / Service Date *</label>
                  <input
                    type="date"
                    name="pickup_date"
                    value={form.pickup_date}
                    onChange={handleChange}
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
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderBottom: "2px solid #e2e8f0" }}></div>

            {/* Extension Settings */}
            <div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e3a5f", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "50%", backgroundColor: "#f3e8ff", color: "#7c3aed", fontWeight: "bold" }}>3</span>
                <span>⚙️ Extension Settings</span>
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Trigger Window (min) *</label>
                  <input
                    type="number"
                    name="trigger_window_minutes"
                    value={form.trigger_window_minutes}
                    onChange={handleChange}
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
                    placeholder="10"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Extension Duration (min) *</label>
                  <input
                    type="number"
                    name="extension_duration_minutes"
                    value={form.extension_duration_minutes}
                    onChange={handleChange}
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
                    placeholder="5"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: "600", color: "#374151", marginBottom: "0.5rem" }}>Trigger Type *</label>
                  <select
                    name="extension_trigger_type"
                    value={form.extension_trigger_type}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.625rem 1rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      color: "#1f2937",
                      backgroundColor: "#ffffff",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                    required
                  >
                    {triggerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div style={{ backgroundColor: "#fee2e2", borderLeft: "4px solid #dc2626", padding: "1rem", borderRadius: "0.375rem" }}>
                <p style={{ color: "#b91c1c", fontWeight: "500" }}>⚠️ {errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "1rem", paddingTop: "1rem", flexWrap: "wrap" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
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
                {submitting ? "⏳ Creating..." : "✅ Create RFQ"}
              </button>
              <button
                type="button"
                style={{
                  flex: 1,
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontWeight: "600",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                onClick={() => navigate("/")}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQ;
