"""
Pyrobot — Chat Schemas
Pydantic models for the chat endpoint request and response shapes.
"""
from pydantic import BaseModel, Field


class MessageIn(BaseModel):
    """A single turn in the conversation history."""
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1)


class ChatRequest(BaseModel):
    """
    The full request body for POST /chat/stream.
    `messages` is the conversation history including the current user message
    as the final entry — the same shape used by OpenAI, Claude, and Gemini.
    `model` is optional; omitting it uses the server default (gpt-4o).
    """
    messages: list[MessageIn] = Field(min_length=1)
    model: str = "gpt-4o"


class ChatResponse(BaseModel):
    """Used only by the non-streaming POST /chat/generate endpoint."""
    content: str
    model: str
