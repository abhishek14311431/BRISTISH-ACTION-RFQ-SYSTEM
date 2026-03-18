"""
Timezone utility for British Auction RFQ System
Uses British Summer Time (BST) / Greenwich Mean Time (GMT)
"""

from datetime import datetime, timezone, timedelta
from pytz import timezone as pytz_timezone, utc as pytz_utc

# British timezone
BRITISH_TZ = pytz_timezone('Europe/London')

def get_british_time():
    """Get current time in British timezone (BST/GMT)"""
    return datetime.now(BRITISH_TZ)

def get_british_time_naive():
    """Get current time in British timezone as naive datetime (no timezone info)"""
    # Get UTC time and convert to British timezone
    utc_now = datetime.now(pytz_utc)
    return utc_now.astimezone(BRITISH_TZ).replace(tzinfo=None)

def get_british_time_from_utc():
    """Get current British time from UTC"""
    utc_now = datetime.now(pytz_utc)
    return utc_now.astimezone(BRITISH_TZ).replace(tzinfo=None)

def format_british_time(dt):
    """Format datetime in British format (e.g., 'Mar 18, 2026, 03:55 PM')"""
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    return dt.strftime("%b %d, %Y, %I:%M %p")
