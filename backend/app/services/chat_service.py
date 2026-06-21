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

    def _build_messages(
        self, history: list[dict], *, extra_context: str | None = None
    ) -> list[ChatMessage]:
        """
        Prepend the system prompt to whatever conversation history the
        router passed in. `extra_context` (e.g. user memory) is folded into
        this SAME system message rather than added as a second system-role
        entry — Gemini's provider overwrites system_instruction on the LAST
        system message it sees (see gemini_provider.py), so a second system
        message would silently discard either the base personality or the
        injected context depending on order. One message, always.
        """
        system_content = SYSTEM_PROMPT
        if extra_context:
            system_content = f"{SYSTEM_PROMPT}\n\n{extra_context}"

        messages = [ChatMessage(role="system", content=system_content)]
        for turn in history:
            messages.append(ChatMessage(role=turn["role"], content=turn["content"]))
        return messages

    async def generate(
        self, history: list[dict], *, extra_context: str | None = None
    ) -> str:
        messages = self._build_messages(history, extra_context=extra_context)
        return await self.provider.generate(messages)

    async def stream(
        self, history: list[dict], *, extra_context: str | None = None
    ) -> AsyncIterator[str]:
        messages = self._build_messages(history, extra_context=extra_context)
        async for token in self.provider.stream(messages):
            yield token