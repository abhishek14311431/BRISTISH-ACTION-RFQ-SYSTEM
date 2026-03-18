import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import AuctionList from "./pages/AuctionList";
import CreateRFQ from "./pages/CreateRFQ";
import AuctionDetail from "./pages/AuctionDetail";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDetailPage = location.pathname.startsWith("/rfq/");

  return (
    <nav className="glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 w-full">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-white font-extrabold text-lg tracking-wide whitespace-nowrap">
              🏛️ British Auction — RFQ System
            </Link>
            {isDetailPage && (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-slate-100 text-sm hover:underline"
              >
                ← Back to Auctions
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/" className="text-white/95 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
              All Auctions
            </Link>
            <Link
              to="/create-rfq"
              className="text-white text-sm font-semibold px-6 py-2 rounded-full gradient-btn"
            >
              Create RFQ
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <main className="app-shell overflow-x-hidden w-full">
        <Routes>
          <Route path="/" element={<AuctionList />} />
          <Route path="/create-rfq" element={<CreateRFQ />} />
          <Route path="/rfq/:id" element={<AuctionDetail />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;
