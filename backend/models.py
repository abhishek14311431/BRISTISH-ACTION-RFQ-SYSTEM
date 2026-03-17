# SQLAlchemy models for Auction, RFQ, Bid

from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class RFQ(Base):
    __tablename__ = "rfqs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    reference_id = Column(String, unique=True, nullable=False)
    bid_start_time = Column(DateTime, nullable=False)
    bid_close_time = Column(DateTime, nullable=False)
    forced_close_time = Column(DateTime, nullable=False)
    pickup_date = Column(Date, nullable=False)
    status = Column(String, nullable=False)  # "active", "closed", "force_closed"
    trigger_window_minutes = Column(Integer, nullable=False)
    extension_duration_minutes = Column(Integer, nullable=False)
    extension_trigger_type = Column(String, nullable=False)  # "bid_received", "any_rank_change", "l1_rank_change"
    created_at = Column(DateTime, default=datetime.utcnow)

    bids = relationship("Bid", back_populates="rfq", cascade="all, delete-orphan")
    events = relationship("AuctionEvent", back_populates="rfq", cascade="all, delete-orphan")

class Bid(Base):
    __tablename__ = "bids"
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    carrier_name = Column(String, nullable=False)
    freight_charges = Column(Float, nullable=False)
    origin_charges = Column(Float, nullable=False)
    destination_charges = Column(Float, nullable=False)
    total_charges = Column(Float, nullable=False)
    transit_time = Column(Integer, nullable=False)  # in days
    quote_validity = Column(Date, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    rank = Column(Integer, nullable=True)

    rfq = relationship("RFQ", back_populates="bids")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.total_charges = (self.freight_charges or 0) + (self.origin_charges or 0) + (self.destination_charges or 0)

class AuctionEvent(Base):
    __tablename__ = "auction_events"
    id = Column(Integer, primary_key=True, index=True)
    rfq_id = Column(Integer, ForeignKey("rfqs.id"), nullable=False)
    event_type = Column(String, nullable=False)  # "bid_submitted", "time_extended", "auction_closed"
    description = Column(String, nullable=False)
    old_close_time = Column(DateTime, nullable=True)
    new_close_time = Column(DateTime, nullable=True)
    triggered_at = Column(DateTime, default=datetime.utcnow)

    rfq = relationship("RFQ", back_populates="events")
