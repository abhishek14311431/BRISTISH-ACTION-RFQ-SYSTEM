# Pydantic schemas for Auction, RFQ, Bid
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class BidBase(BaseModel):
    bidder: str
    amount: float

class BidCreate(BidBase):
    pass

class Bid(BidBase):
    id: int
    auction_id: int
    timestamp: datetime
    class Config:
        orm_mode = True

class AuctionBase(BaseModel):
    status: str

class AuctionCreate(AuctionBase):
    rfq_id: int

class Auction(AuctionBase):
    id: int
    rfq_id: int
    bids: List[Bid] = []
    class Config:
        orm_mode = True

class RFQBase(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime

class RFQCreate(RFQBase):
    pass

class RFQ(RFQBase):
    id: int
    auctions: List[Auction] = []
    class Config:
        orm_mode = True
