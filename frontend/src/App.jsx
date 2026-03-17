import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AuctionList from "./pages/AuctionList";
import CreateRFQ from "./pages/CreateRFQ";
import AuctionDetail from "./pages/AuctionDetail";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow">
      <div className="font-bold text-lg">British Auction — RFQ System</div>
      <div className="flex items-center space-x-4">
        <Link to="/" className="hover:underline font-medium">All Auctions</Link>
        <button
          className="bg-white text-blue-700 font-semibold px-4 py-2 rounded hover:bg-blue-100 transition"
          onClick={() => navigate("/create")}
        >
          Create RFQ
        </button>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/create" element={<CreateRFQ />} />
          <Route path="/rfq/:id" element={<AuctionDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
