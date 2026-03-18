# Pydantic schemas for RFQ creation
from pydantic import BaseModel, validator
from datetime import datetime, date


class RFQCreateRequest(BaseModel):
    name: str
    reference_id: str
    bid_start_time: datetime
    bid_close_time: datetime
    forced_close_time: datetime
    pickup_date: date
    status: str = "active"
    trigger_window_minutes: int
    extension_duration_minutes: int
    extension_trigger_type: str

    @validator("bid_start_time", "bid_close_time", "forced_close_time", pre=True)
    def parse_datetime_local(cls, value):
        if isinstance(value, datetime):
            return value
        if isinstance(value, str):
            raw = value.strip()
            for fmt in ("%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"):
                try:
                    return datetime.strptime(raw, fmt)
                except ValueError:
                    continue
            try:
                return datetime.fromisoformat(raw.replace("Z", "+00:00"))
            except ValueError as exc:
                raise ValueError(
                    "Invalid datetime format. Use YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS"
                ) from exc
        raise ValueError("Datetime must be a string")

    @validator("pickup_date", pre=True)
    def parse_pickup_date(cls, value):
        if isinstance(value, date) and not isinstance(value, datetime):
            return value
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, str):
            raw = value.strip()
            for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M", "%Y-%m-%dT%H:%M:%S"):
                try:
                    parsed = datetime.strptime(raw, fmt)
                    return parsed.date()
                except ValueError:
                    continue
            try:
                return datetime.fromisoformat(raw.replace("Z", "+00:00")).date()
            except ValueError as exc:
                raise ValueError("Invalid pickup_date format. Use YYYY-MM-DD") from exc
        raise ValueError("pickup_date must be a string")
