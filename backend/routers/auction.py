# Auction router
from fastapi import APIRouter

router = APIRouter(prefix="/auction", tags=["Auction"])

@router.get("/")
def list_auctions():
    return ["List of Auctions"]
