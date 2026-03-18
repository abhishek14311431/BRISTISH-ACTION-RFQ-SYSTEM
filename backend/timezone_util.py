"""Timezone utility for RFQ system (Indian Standard Time)."""

from datetime import datetime
from pytz import timezone as pytz_timezone, utc as pytz_utc

IST_TZ = pytz_timezone("Asia/Kolkata")


def get_indian_time_naive() -> datetime:
    """Return current IST as naive datetime for DB comparisons."""
    utc_now = datetime.now(pytz_utc)
    return utc_now.astimezone(IST_TZ).replace(tzinfo=None)
