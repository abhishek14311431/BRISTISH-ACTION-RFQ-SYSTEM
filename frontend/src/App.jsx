import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import AuctionList from "./pages/AuctionList";
import CreateRFQ from "./pages/CreateRFQ";
import AuctionDetail from "./pages/AuctionDetail";

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav style={{ width: "100%", height: "4rem", backgroundColor: "#1e3a5f", color: "white", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 10px 15px rgba(0,0,0,0.1)" }}>
      <Link to="/" style={{ fontWeight: "bold", fontSize: "1.125rem", letterSpacing: "0.05em", color: "white", textDecoration: "none" }}>
        🏛️ British Auction RFQ System
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
        <Link
          to="/"
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "white",
            textDecoration: "none",
            transition: "background-color 0.2s",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          📋 All Auctions
        </Link>
        <Link
          to="/create-rfq"
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "white",
            textDecoration: "none",
            backgroundColor: "#2563eb",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
        >
          ✏️ Create RFQ
        </Link>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <Router>
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 4rem)", backgroundColor: "#f1f5f9" }}>
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/create-rfq" element={<CreateRFQ />} />
          <Route path="/rfq/:id" element={<AuctionDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
