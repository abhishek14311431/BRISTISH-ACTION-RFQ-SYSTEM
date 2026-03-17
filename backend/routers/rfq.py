
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal
from models import RFQ, Bid, AuctionEvent
from schemas import RFQ as RFQSchema, RFQBase, Bid as BidSchema
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/rfq", tags=["RFQ"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic schemas for request/response
class RFQCreateSchema(BaseModel):
    name: str
    reference_id: str
    bid_start_time: datetime
    bid_close_time: datetime
    forced_close_time: datetime
    pickup_date: datetime
    status: str
    trigger_window_minutes: int
    extension_duration_minutes: int
    extension_trigger_type: str

class RFQListItemSchema(BaseModel):
    id: int
    name: str
    reference_id: str
    status: str
    bid_close_time: datetime
    forced_close_time: datetime
    lowest_bid: Optional[float]

class BidOutSchema(BaseModel):
    id: int
    carrier_name: str
    freight_charges: float
    origin_charges: float
    destination_charges: float
    total_charges: float
    transit_time: int
    quote_validity: datetime
    submitted_at: datetime
    rank: Optional[int]

class AuctionEventOutSchema(BaseModel):
    id: int
    event_type: str
    description: str
    old_close_time: Optional[datetime]
    new_close_time: Optional[datetime]
    triggered_at: datetime

class RFQDetailSchema(BaseModel):
    id: int
    name: str
    reference_id: str
    bid_start_time: datetime
    bid_close_time: datetime
    forced_close_time: datetime
    pickup_date: datetime
    status: str
    trigger_window_minutes: int
    extension_duration_minutes: int
    extension_trigger_type: str
    created_at: datetime
    bids: List[BidOutSchema]
    auction_events: List[AuctionEventOutSchema]

# 1. POST /rfq/ — Create a new RFQ
@router.post("/", response_model=RFQDetailSchema)
def create_rfq(rfq: RFQCreateSchema, db: Session = Depends(get_db)):
    try:
        if rfq.forced_close_time <= rfq.bid_close_time:
            raise HTTPException(status_code=400, detail="Forced close time must be after bid close time.")
        if rfq.bid_start_time >= rfq.bid_close_time:
            raise HTTPException(status_code=400, detail="Bid start time must be before bid close time.")
        db_rfq = RFQ(
            name=rfq.name,
            reference_id=rfq.reference_id,
            bid_start_time=rfq.bid_start_time,
            bid_close_time=rfq.bid_close_time,
            forced_close_time=rfq.forced_close_time,
            pickup_date=rfq.pickup_date,
            status=rfq.status,
            trigger_window_minutes=rfq.trigger_window_minutes,
            extension_duration_minutes=rfq.extension_duration_minutes,
            extension_trigger_type=rfq.extension_trigger_type,
            created_at=datetime.utcnow()
        )
        db.add(db_rfq)
        db.commit()
        db.refresh(db_rfq)
        return rfq_detail_response(db_rfq, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create RFQ: {str(e)}")

# 2. GET /rfq/ — List all RFQs
@router.get("/", response_model=List[RFQListItemSchema])
def list_rfqs(db: Session = Depends(get_db)):
    try:
        rfqs = db.query(RFQ).all()
        result = []
        for rfq in rfqs:
            lowest_bid = db.query(Bid).filter(Bid.rfq_id == rfq.id).order_by(Bid.total_charges.asc()).first()
            result.append(RFQListItemSchema(
                id=rfq.id,
                name=rfq.name,
                reference_id=rfq.reference_id,
                status=rfq.status,
                bid_close_time=rfq.bid_close_time,
                forced_close_time=rfq.forced_close_time,
                lowest_bid=lowest_bid.total_charges if lowest_bid else None
            ))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list RFQs: {str(e)}")

# 3. GET /rfq/{rfq_id} — Get single RFQ details
@router.get("/{rfq_id}", response_model=RFQDetailSchema)
def get_rfq(rfq_id: int, db: Session = Depends(get_db)):
    try:
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        if not rfq:
            raise HTTPException(status_code=404, detail="RFQ not found")
        return rfq_detail_response(rfq, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get RFQ: {str(e)}")

def rfq_detail_response(rfq: RFQ, db: Session):
    # Bids sorted by total_charges ascending
    bids = db.query(Bid).filter(Bid.rfq_id == rfq.id).order_by(Bid.total_charges.asc()).all()
    bid_list = []
    for idx, bid in enumerate(bids):
        bid_list.append(BidOutSchema(
            id=bid.id,
            carrier_name=bid.carrier_name,
            freight_charges=bid.freight_charges,
            origin_charges=bid.origin_charges,
            destination_charges=bid.destination_charges,
            total_charges=bid.total_charges,
            transit_time=bid.transit_time,
            quote_validity=bid.quote_validity,
            submitted_at=bid.submitted_at,
            rank=idx+1
        ))
    # Auction events sorted by triggered_at
    events = db.query(AuctionEvent).filter(AuctionEvent.rfq_id == rfq.id).order_by(AuctionEvent.triggered_at.asc()).all()
    event_list = [AuctionEventOutSchema(
        id=e.id,
        event_type=e.event_type,
        description=e.description,
        old_close_time=e.old_close_time,
        new_close_time=e.new_close_time,
        triggered_at=e.triggered_at
    ) for e in events]
    return RFQDetailSchema(
        id=rfq.id,
        name=rfq.name,
        reference_id=rfq.reference_id,
        bid_start_time=rfq.bid_start_time,
        bid_close_time=rfq.bid_close_time,
        forced_close_time=rfq.forced_close_time,
        pickup_date=rfq.pickup_date,
        status=rfq.status,
        trigger_window_minutes=rfq.trigger_window_minutes,
        extension_duration_minutes=rfq.extension_duration_minutes,
        extension_trigger_type=rfq.extension_trigger_type,
        created_at=rfq.created_at,
        bids=bid_list,
        auction_events=event_list
    )
