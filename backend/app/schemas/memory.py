from datetime import datetime

from pydantic import BaseModel


class MemorySet(BaseModel):
    """
    Body for PUT /memory/{key}. `value` must be a JSON object, matching
    the live models/memory.py column type (Mapped[dict]) — this differs
    from the original docs' example, which showed a plain string. Wrap
    scalar values, e.g. {"value": {"text": "Master React and TypeScript"}}.
    """
    value: dict


class MemoryResponse(BaseModel):
    key: str
    value: dict
    updated_at: datetime

    model_config = {"from_attributes": True}