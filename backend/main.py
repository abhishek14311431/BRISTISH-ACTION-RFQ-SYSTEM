
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from database import engine, Base, SessionLocal
from routers import rfq, bids
from services.auction_engine import AuctionEngine

app = FastAPI(title="British Auction RFQ System")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "*"]
)

# Include routers
app.include_router(rfq.router)
app.include_router(bids.router)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# Root endpoint for quick API discovery
@app.get("/")
def root():
    return {
        "message": "British Auction RFQ API is running",
        "health": "/health",
        "docs": "/docs",
    }

# On startup: create all tables and start scheduler
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    scheduler = BackgroundScheduler()
    auction_engine = AuctionEngine()
    def scheduled_job():
        db = SessionLocal()
        try:
            auction_engine.check_and_close_auctions(db)
        finally:
            db.close()
    scheduler.add_job(scheduled_job, 'interval', seconds=30)
    scheduler.start()
