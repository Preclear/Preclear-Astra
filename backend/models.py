from typing import Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator


class Lookup(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jurisdiction_id: UUID
    project_type: str = Field(min_length=1, max_length=80, pattern=r"^[a-z_]+$")
    attributes: dict[str, bool | float | str] = Field(
        default_factory=dict, max_length=40
    )

    @field_validator("attributes", mode="before")
    @classmethod
    def valid_attributes(cls, value):
        import math

        if not isinstance(value, dict):
            raise ValueError("Expected attributes object")
        for key, item in value.items():
            if not isinstance(key, str) or len(key) > 80:
                raise ValueError("Invalid attribute name")
            if not isinstance(item, (str, int, float, bool)):
                raise ValueError("Attributes must be scalar")
            if isinstance(item, float) and not math.isfinite(item):
                raise ValueError("Nonfinite attribute")
            if isinstance(item, str) and len(item) > 200:
                raise ValueError("Attribute too long")
        return value


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class Chat(BaseModel):
    model_config = ConfigDict(extra="forbid")
    jurisdiction_id: UUID
    question: str = Field(min_length=1, max_length=4000)
    history: list[Message] = Field(default_factory=list, max_length=12)
