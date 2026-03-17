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
      navigate("/auction-list");
    } catch (error) {
      setErrors({ submit: error.response?.data?.detail || "Failed to create RFQ." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New RFQ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">RFQ Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Reference ID</label>
          <input
            type="text"
            name="reference_id"
            value={form.reference_id}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Bid Start Date & Time</label>
          <input
            type="datetime-local"
            name="bid_start_time"
            value={form.bid_start_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          {errors.bid_start_time && <p className="text-red-500 text-sm mt-1">{errors.bid_start_time}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Bid Close Date & Time</label>
          <input
            type="datetime-local"
            name="bid_close_time"
            value={form.bid_close_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Forced Bid Close Date & Time</label>
          <input
            type="datetime-local"
            name="forced_close_time"
            value={form.forced_close_time}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          {errors.forced_close_time && <p className="text-red-500 text-sm mt-1">{errors.forced_close_time}</p>}
        </div>
        <div>
          <label className="block font-medium mb-1">Pickup / Service Date</label>
          <input
            type="date"
            name="pickup_date"
            value={form.pickup_date}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Trigger Window X Minutes</label>
          <input
            type="number"
            name="trigger_window_minutes"
            value={form.trigger_window_minutes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Extension Duration Y Minutes</label>
          <input
            type="number"
            name="extension_duration_minutes"
            value={form.extension_duration_minutes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Extension Trigger Type</label>
          <select
            name="extension_trigger_type"
            value={form.extension_trigger_type}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
            required
          >
            {triggerOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {errors.submit && <p className="text-red-500 text-sm mt-2 text-center">{errors.submit}</p>}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create RFQ"}
          </button>
          <button
            type="button"
            className="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded hover:bg-gray-300 transition"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRFQ;
