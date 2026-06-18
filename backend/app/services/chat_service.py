"""
Pyrobot — Chat Service
Business logic layer for chat. Sits between the router and the AI provider.
Responsibilities:
  - Assemble the prompt (system personality + conversation history)
  - Select and call the right AI provider via the factory
  - Return either a complete response or an async generator of tokens

Stage 3: stateless — accepts a message list, returns a response.
Stage 6: will add conversation persistence (save/load from DB).
"""
from typing import AsyncIterator

from app.services.ai.base import ChatMessage
from app.services.ai.factory import get_provider

# Pyrobot's base personality — Layer 1 of the prompt engineering system
# documented in Section 2.6 of the Master Document.
SYSTEM_PROMPT = (
    "You are Pyrobot, a personal AI assistant built to help users learn, "
    "create, code, and organise their work. "
    "Be direct, smart, and friendly. "
    "Format responses clearly; use markdown only when it genuinely helps readability."
)


class ChatService:
    def __init__(self, model: str = "gpt-4o"):
        self.model = model
        self.provider = get_provider(model)

    def _build_messages(self, history: list[dict]) -> list[ChatMessage]:
        """
        Prepend the system prompt to whatever conversation history
        the router passed in. Each item in `history` is a dict with
        "role" and "content" keys — the same shape the API contract specifies.
        """
        messages = [ChatMessage(role="system", content=SYSTEM_PROMPT)]
        for turn in history:
            messages.append(ChatMessage(role=turn["role"], content=turn["content"]))
        return messages

    async def generate(self, history: list[dict]) -> str:
        """Returns the complete AI response as a string. Used for non-streaming calls."""
        messages = self._build_messages(history)
        return await self.provider.generate(messages)

    async def stream(self, history: list[dict]) -> AsyncIterator[str]:
        """Yields AI response tokens as they arrive. Used for the streaming chat endpoint."""
        messages = self._build_messages(history)
        async for token in self.provider.stream(messages):
            yield token
