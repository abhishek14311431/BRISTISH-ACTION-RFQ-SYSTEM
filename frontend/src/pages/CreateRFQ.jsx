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
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "RFQ name is required.";
    if (!form.reference_id.trim()) err.reference_id = "Reference ID is required.";
    if (!form.bid_start_time) err.bid_start_time = "Bid start date/time is required.";
    if (!form.bid_close_time) err.bid_close_time = "Bid close date/time is required.";
    if (!form.forced_close_time) err.forced_close_time = "Forced close date/time is required.";
    if (!form.pickup_date) err.pickup_date = "Pickup date is required.";
    if (!form.trigger_window_minutes) err.trigger_window_minutes = "Trigger window is required.";
    if (!form.extension_duration_minutes) err.extension_duration_minutes = "Extension duration is required.";

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
        pickup_date: new Date(form.pickup_date).toISOString(),
        trigger_window_minutes: Number(form.trigger_window_minutes),
        extension_duration_minutes: Number(form.extension_duration_minutes),
      };
      await createRFQ(payload);
      setToast({ type: "success", message: "RFQ created successfully." });
      setTimeout(() => navigate("/"), 900);
    } catch (error) {
      const detail = error.response?.data?.detail;
      const submitMessage = Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join(" | ")
        : typeof detail === "string"
          ? detail
          : "Failed to create RFQ.";
      setErrors({ submit: submitMessage });
      setToast({ type: "error", message: submitMessage });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden page-enter">
      {toast && (
        <div className={`toast ${toast.type === "success" ? "toast-success" : "toast-error"}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[650px] mx-auto glass-card p-6 md:p-8 card-enter">
          <h1 className="text-white text-3xl font-extrabold">Create New RFQ</h1>
          <p className="text-slate-300 mt-2">Set up a new request for quotation auction</p>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <section className="space-y-4">
              <h2 className="text-white font-semibold">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-100 text-sm font-medium">RFQ Name</label>
                  <input className="glass-input mt-1" name="name" value={form.name} onChange={handleChange} placeholder="Enter RFQ name" />
                  {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Reference ID</label>
                  <input className="glass-input mt-1" name="reference_id" value={form.reference_id} onChange={handleChange} placeholder="RFQ-0001" />
                  {errors.reference_id && <p className="field-error">{errors.reference_id}</p>}
                </div>
              </div>
            </section>

            <div className="gradient-divider">
              <span>Auction Config</span>
            </div>

            <section className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-100 text-sm font-medium">Bid Start</label>
                  <input className="glass-input mt-1" type="datetime-local" name="bid_start_time" value={form.bid_start_time} onChange={handleChange} />
                  {errors.bid_start_time && <p className="field-error">{errors.bid_start_time}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Bid Close</label>
                  <input className="glass-input mt-1" type="datetime-local" name="bid_close_time" value={form.bid_close_time} onChange={handleChange} />
                  {errors.bid_close_time && <p className="field-error">{errors.bid_close_time}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Forced Close</label>
                  <input className="glass-input mt-1" type="datetime-local" name="forced_close_time" value={form.forced_close_time} onChange={handleChange} />
                  {errors.forced_close_time && <p className="field-error">{errors.forced_close_time}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Pickup Date</label>
                  <input className="glass-input mt-1" type="date" name="pickup_date" value={form.pickup_date} onChange={handleChange} />
                  {errors.pickup_date && <p className="field-error">{errors.pickup_date}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-100 text-sm font-medium">Trigger Window (min)</label>
                  <input className="glass-input mt-1" type="number" min="1" name="trigger_window_minutes" value={form.trigger_window_minutes} onChange={handleChange} />
                  {errors.trigger_window_minutes && <p className="field-error">{errors.trigger_window_minutes}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Extension Duration (min)</label>
                  <input className="glass-input mt-1" type="number" min="1" name="extension_duration_minutes" value={form.extension_duration_minutes} onChange={handleChange} />
                  {errors.extension_duration_minutes && <p className="field-error">{errors.extension_duration_minutes}</p>}
                </div>
                <div>
                  <label className="text-slate-100 text-sm font-medium">Trigger Type</label>
                  <select className="glass-input mt-1" name="extension_trigger_type" value={form.extension_trigger_type} onChange={handleChange}>
                    {triggerOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="text-black">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {errors.submit && <p className="field-error">{errors.submit}</p>}

            <div className="space-y-3 pt-1">
              <button type="submit" className="w-full gradient-btn rounded-xl py-4 font-bold text-white flex items-center justify-center gap-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Creating RFQ...
                  </>
                ) : (
                  "Create RFQ"
                )}
              </button>

              <button
                type="button"
                className="w-full ghost-btn rounded-xl py-3 font-semibold"
                onClick={() => navigate("/")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRFQ;
