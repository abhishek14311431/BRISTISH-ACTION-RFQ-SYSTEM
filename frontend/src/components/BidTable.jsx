import React from "react";

const rankBadge = (rank) => {
  const badges = {
    1: { bg: "from-yellow-400 to-yellow-500", text: "text-white", icon: "🥇" },
    2: { bg: "from-gray-400 to-gray-500", text: "text-white", icon: "🥈" },
    3: { bg: "from-orange-400 to-orange-500", text: "text-white", icon: "🥉" },
  };
  const badge = badges[rank] || { bg: "from-gray-200 to-gray-300", text: "text-gray-700", icon: "🔹" };
  return (
    <span className={`inline-flex items-center space-x-1 bg-gradient-to-r ${badge.bg} ${badge.text} px-3 py-1.5 rounded-full font-bold text-sm`}>
      <span>{badge.icon}</span>
      <span>L{rank}</span>
    </span>
  );
};

const BidTable = ({ bids = [] }) => {
  if (!bids.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m0 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-gray-500 font-medium">No bids submitted yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Carrier</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Freight</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Origin</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Destination</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Transit</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Validity</th>
            <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bids.map((bid) => (
            <tr key={bid.id} className={`hover:bg-blue-50 transition ${
              bid.rank === 1 ? "bg-gradient-to-r from-yellow-50 to-yellow-100" : ""
            }`}>
              <td className="px-4 py-3">{rankBadge(bid.rank)}</td>
              <td className="px-4 py-3">
                <span className="font-semibold text-gray-900">{bid.carrier_name}</span>
              </td>
              <td className="px-4 py-3 text-gray-600">£{bid.freight_charges.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-600">£{bid.origin_charges.toFixed(2)}</td>
              <td className="px-4 py-3 text-gray-600">£{bid.destination_charges.toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className="font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">£{bid.total_charges.toFixed(2)}</span>
              </td>
              <td className="px-4 py-3 text-gray-600">{bid.transit_time}d</td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600">{new Date(bid.quote_validity).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-3 text-xs text-gray-500 font-mono">{new Date(bid.submitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BidTable;
