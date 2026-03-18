
from datetime import datetime, timedelta
from models import RFQ, Bid, AuctionEvent
from timezone_util import get_british_time_naive

class AuctionEngine:
    def process_bid_event(self, db, rfq_id, new_bid):
        """
        Handles bid event and possible auction extension logic.
        """
        rfq = db.query(RFQ).filter(RFQ.id == rfq_id).first()
        if not rfq:
            return
        now = get_british_time_naive()

        # Step 3: Check if current time is within trigger window
        trigger_start = rfq.bid_close_time - timedelta(minutes=rfq.trigger_window_minutes)
        in_trigger_window = trigger_start <= now <= rfq.bid_close_time

        if not in_trigger_window:
            return  # Not in trigger window, no extension

        extend = False
        reason = None

        # Step 4: Extension trigger logic
        if rfq.extension_trigger_type == "bid_received":
            extend = True
            reason = "Bid received in trigger window"
        elif rfq.extension_trigger_type == "any_rank_change":
            # Get bids before this bid (excluding new_bid)
            prev_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id, Bid.id != new_bid.id).order_by(Bid.total_charges.asc()).all()
            prev_ranks = {b.id: idx+1 for idx, b in enumerate(prev_bids)}
            # Get bids after this bid (including new_bid)
            all_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.total_charges.asc()).all()
            new_ranks = {b.id: idx+1 for idx, b in enumerate(all_bids)}
            # Check if any rank changed
            for bid_id in prev_ranks:
                if bid_id in new_ranks and prev_ranks[bid_id] != new_ranks[bid_id]:
                    extend = True
                    reason = "Rank changed for bid_id {}".format(bid_id)
                    break
        elif rfq.extension_trigger_type == "l1_rank_change":
            # Get previous rank-1 (excluding new_bid)
            prev_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id, Bid.id != new_bid.id).order_by(Bid.total_charges.asc()).all()
            prev_l1 = prev_bids[0].id if prev_bids else None
            # Get new rank-1 (including new_bid)
            all_bids = db.query(Bid).filter(Bid.rfq_id == rfq_id).order_by(Bid.total_charges.asc()).all()
            new_l1 = all_bids[0].id if all_bids else None
            if prev_l1 != new_l1:
                extend = True
                reason = "Rank-1 changed from {} to {}".format(prev_l1, new_l1)

        # Step 5: Extend auction if needed
        if extend:
            old_close_time = rfq.bid_close_time
            new_close_time = old_close_time + timedelta(minutes=rfq.extension_duration_minutes)
            # Cap new_close_time to forced_close_time
            new_close_time = min(new_close_time, rfq.forced_close_time)
            rfq.bid_close_time = new_close_time
            db.commit()
            # Log auction_event
            event = AuctionEvent(
                rfq_id=rfq_id,
                event_type="time_extended",
                description=f"Auction time extended: {reason}",
                old_close_time=old_close_time,
                new_close_time=new_close_time,
                triggered_at=now
            )
            db.add(event)
            db.commit()

    def check_and_close_auctions(self, db):
        """
        Called by background scheduler every 30 seconds.
        Closes auctions based on time.
        """
        now = get_british_time_naive()
        active_rfqs = db.query(RFQ).filter(RFQ.status == "active").all()
        for rfq in active_rfqs:
            if now >= rfq.forced_close_time:
                old_status = rfq.status
                rfq.status = "force_closed"
                db.commit()
                event = AuctionEvent(
                    rfq_id=rfq.id,
                    event_type="auction_closed",
                    description=f"Auction force closed (was {old_status})",
                    old_close_time=rfq.bid_close_time,
                    new_close_time=rfq.forced_close_time,
                    triggered_at=now
                )
                db.add(event)
                db.commit()
            elif now >= rfq.bid_close_time:
                old_status = rfq.status
                rfq.status = "closed"
                db.commit()
                event = AuctionEvent(
                    rfq_id=rfq.id,
                    event_type="auction_closed",
                    description=f"Auction closed (was {old_status})",
                    old_close_time=rfq.bid_close_time,
                    new_close_time=rfq.bid_close_time,
                    triggered_at=now
                )
                db.add(event)
                db.commit()
