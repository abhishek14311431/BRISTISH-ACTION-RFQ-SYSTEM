import React from "react";

const rankBadge = (rank) => {
  if (rank === 1) return <span className="bg-yellow-400 text-white px-2 py-1 rounded font-bold">L1</span>;
  if (rank === 2) return <span className="bg-gray-300 text-gray-800 px-2 py-1 rounded font-bold">L2</span>;
  if (rank === 3) return <span className="bg-orange-300 text-white px-2 py-1 rounded font-bold">L3</span>;
  return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-bold">L{rank}</span>;
};

const BidTable = ({ bids = [] }) => {
  if (!bids.length) return <div className="text-gray-400">No bids yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Carrier Name</th>
            <th className="px-4 py-2 text-left">Freight</th>
            <th className="px-4 py-2 text-left">Origin</th>
            <th className="px-4 py-2 text-left">Destination</th>
            <th className="px-4 py-2 text-left">Total Charges</th>
            <th className="px-4 py-2 text-left">Transit Time</th>
            <th className="px-4 py-2 text-left">Quote Validity</th>
            <th className="px-4 py-2 text-left">Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, idx) => (
            <tr key={bid.id} className={bid.rank === 1 ? "bg-green-50" : ""}>
              <td className="px-4 py-2">{rankBadge(bid.rank)}</td>
              <td className="px-4 py-2">{bid.carrier_name}</td>
              <td className="px-4 py-2">£{bid.freight_charges.toFixed(2)}</td>
              <td className="px-4 py-2">£{bid.origin_charges.toFixed(2)}</td>
              <td className="px-4 py-2">£{bid.destination_charges.toFixed(2)}</td>
              <td className="px-4 py-2 font-bold text-green-700">£{bid.total_charges.toFixed(2)}</td>
              <td className="px-4 py-2">{bid.transit_time} days</td>
              <td className="px-4 py-2">{new Date(bid.quote_validity).toLocaleDateString("en-GB")}</td>
              <td className="px-4 py-2 text-xs text-gray-500 font-mono">{new Date(bid.submitted_at).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BidTable;
