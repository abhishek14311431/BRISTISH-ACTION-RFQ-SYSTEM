import React from "react";

const eventIcon = (type) => {
  if (type === "bid_submitted") return "🔵";
  if (type === "time_extended") return "🟠";
  if (type === "auction_closed") return "⚫";
  return "";
};

const eventColor = (type) => {
  if (type === "bid_submitted") return "text-blue-600";
  if (type === "time_extended") return "text-orange-500";
  if (type === "auction_closed") return "text-gray-500";
  return "text-gray-700";
};

const ActivityLog = ({ events = [] }) => {
  if (!events.length) return <div className="text-gray-400">No activity yet.</div>;
  return (
    <ul className="space-y-2">
      {events.slice().sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at)).map((event) => (
        <li key={event.id} className="flex items-center space-x-3">
          <span className={`text-xl ${eventColor(event.event_type)}`}>{eventIcon(event.event_type)}</span>
          <span className="flex-1 text-sm">{event.description}</span>
          <span className="text-xs text-gray-500 font-mono">{new Date(event.triggered_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
        </li>
      ))}
    </ul>
  );
};

export default ActivityLog;
