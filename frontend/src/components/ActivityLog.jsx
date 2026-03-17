import React from "react";

const eventIcon = (type) => {
  const icons = {
    bid_submitted: { icon: "📝", color: "bg-blue-100 text-blue-600" },
    time_extended: { icon: "⏱️", color: "bg-orange-100 text-orange-600" },
    auction_closed: { icon: "🏁", color: "bg-gray-100 text-gray-600" },
  };
  return icons[type] || { icon: "📌", color: "bg-gray-100 text-gray-600" };
};

const ActivityLog = ({ events = [] }) => {
  if (!events.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m7-4a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-gray-500 font-medium">No activity yet</p>
      </div>
    );
  }

  const sortedEvents = events.slice().sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));

  return (
    <div className="space-y-3">
      {sortedEvents.map((event, idx) => {
        const { icon, color } = eventIcon(event.event_type);
        return (
          <div key={event.id} className="flex items-start space-x-4 pb-3 border-b border-gray-100 last:border-b-0">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${color} flex items-center justify-center text-lg`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.description}</p>
              <p className="text-xs text-gray-500 font-mono mt-1">
                {new Date(event.triggered_at).toLocaleString("en-GB", { 
                  day: "2-digit", 
                  month: "short", 
                  year: "numeric", 
                  hour: "2-digit", 
                  minute: "2-digit", 
                  hour12: false 
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityLog;
