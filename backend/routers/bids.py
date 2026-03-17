from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
from models import RFQ, Bid, AuctionEvent
from services.auction_engine import AuctionEngine
from pydantic import BaseModel

router = APIRouter()

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

@router.post("/rfq/{rfq_id}/bid", response_model=BidOutSchema)
def submit_bid(rfq_id: int, bid: BidCreateSchema, db: Session = Depends(get_db)):
    try:
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        now = datetime.utcnow()
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found")
        if rfq.status != "active":
            raise HTTPException(status_code=400, detail="RFQ is not active")
        if now < rfq.bid_start_time:
            raise HTTPException(status_code=400, detail="Bidding has not started yet")
        if now > rfq.forced_close_time:
            raise HTTPException(status_code=400, detail="RFQ is force closed")
        if now > rfq.bid_close_time:
            raise HTTPException(status_code=400, detail="RFQ bidding is closed")

        db_bid = Bid(
            rfq_id=rfq_id,
            carrier_name=bid.carrier_name,
            freight_charges=bid.freight_charges,
            origin_charges=bid.origin_charges,
            destination_charges=bid.destination_charges,
            transit_time=bid.transit_time,
            quote_validity=bid.quote_validity,
            submitted_at=now
        )
        db.add(db_bid)
        db.commit()
        db.refresh(db_bid)

        # Call auction_engine.process_bid_event
        auction_engine = AuctionEngine()
        if hasattr(auction_engine, "process_bid_event"):
            auction_engine.process_bid_event(rfq_id, db_bid)

        # Re-rank all bids for this RFQ
        bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.total_charges.asc()).all()
        for idx, b in enumerate(bids):
            b.rank = idx + 1
        db.commit()
        db.refresh(db_bid)

        # Log auction_event
        event = AuctionEvent(
            rfq_id=rfq_id,
            event_type="bid_submitted",
            description=f"Bid submitted by {db_bid.carrier_name} (total_charges={db_bid.total_charges})",
            old_close_time=None,
            new_close_time=None,
            triggered_at=now
        )
        db.add(event)
        db.commit()

        return BidOutSchema(
            id=db_bid.id,
            rfq_id=db_bid.rfq_id,
            carrier_name=db_bid.carrier_name,
            freight_charges=db_bid.freight_charges,
            origin_charges=db_bid.origin_charges,
            destination_charges=db_bid.destination_charges,
            total_charges=db_bid.total_charges,
            transit_time=db_bid.transit_time,
            quote_validity=db_bid.quote_validity,
            submitted_at=db_bid.submitted_at,
            rank=db_bid.rank
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to submit bid: {str(e)}")
from fastapi import APIRouter

router = APIRouter(prefix="/bids", tags=["Bids"])

@router.get("/")
def list_bids():
    return ["List of Bids"]
