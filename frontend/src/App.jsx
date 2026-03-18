import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AuctionList from "./pages/AuctionList";
import CreateRFQ from "./pages/CreateRFQ";
import AuctionDetail from "./pages/AuctionDetail";

const Navbar = () => {
  return (
    <nav
      style={{
        position: "relative",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        background: "rgba(10, 10, 26, 0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255, 140, 0, 0.2)",
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
      <span style={{ fontWeight: "700", fontSize: "18px", whiteSpace: "nowrap" }}>
        <span style={{ color: "#ffffff" }}>🏛️ British Auction </span>
        <span style={{ color: "rgba(255, 140, 0, 0.9)" }}>— RFQ System</span>
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", whiteSpace: "nowrap" }}>
        <Link
          to="/"
          style={{ color: "rgba(255,255,255,0.8)", textDecoration: "none", fontWeight: "500" }}
        >
          All Auctions
        </Link>
        <Link
          to="/create"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "white",
            padding: "8px 20px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
          }}
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
      <main style={{ width: "100%", maxWidth: "100vw", overflowX: "hidden" }}>
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/create" element={<CreateRFQ />} />
          <Route path="/create-rfq" element={<CreateRFQ />} />
          <Route path="/rfq/:id" element={<AuctionDetail />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
