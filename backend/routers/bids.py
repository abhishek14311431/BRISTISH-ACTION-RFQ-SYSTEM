from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from models import RFQ, Bid, AuctionEvent
from pydantic import BaseModel

router = APIRouter(prefix="/bids", tags=["Bids"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BidCreateSchema(BaseModel):
    carrier_name: str
    freight_charges: float
    origin_charges: float
    destination_charges: float
    transit_time: int
    quote_validity: datetime

class BidOutSchema(BaseModel):
    id: int
    rfq_id: int
    carrier_name: str
    freight_charges: float
    origin_charges: float
    destination_charges: float
    total_charges: float
    transit_time: int
    quote_validity: datetime
    submitted_at: datetime
    rank: int

@router.get("/")
def list_bids():
    return {"message": "Bids API is active"}

@router.post("/{rfq_id}/", response_model=BidOutSchema)
def submit_bid(rfq_id: int, bid: BidCreateSchema, db: Session = Depends(get_db)):
    try:
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        now = datetime.utcnow()
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found")
        
        if rfq.status != "active":
            raise HTTPException(status_code=400, detail=f"RFQ is not active (status={rfq.status})")
            
        db_bid = Bid(
            rfq_id=rfq_id,
            carrier_name=bid.carrier_name,
            freight_charges=bid.freight_charges,
            origin_charges=bid.origin_charges,
            destination_charges=bid.destination_charges,
            transit_time=bid.transit_time,
            quote_validity=bid.quote_validity,
            submitted_at=now,
            total_charges=bid.freight_charges + bid.origin_charges + bid.destination_charges,
            rank=0
        )
        db.add(db_bid)
        db.commit()
        db.refresh(db_bid)

        # Call auction_engine process_bid_event
        try:
            from services.auction_engine import AuctionEngine
            engine = AuctionEngine()
            engine.process_bid_event(rfq, db_bid, db)
        except Exception as e:
            print(f"Auction engine error (non-fatal): {e}")

        # Re-rank all bids
        bids_list = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.total_charges.asc()).all()
        for idx, b in enumerate(bids_list):
            b.rank = idx + 1
        db.commit()
        db.refresh(db_bid)

        # Log event
        event = AuctionEvent(
            rfq_id=rfq_id,
            event_type="bid_submitted",
            description=f"Bid submitted by {db_bid.carrier_name}",
            triggered_at=now
        )
        db.add(event)
        db.commit()

        return db_bid
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed: {str(e)}")
