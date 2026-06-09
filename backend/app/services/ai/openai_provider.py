"""
Pyrobot — OpenAI Provider
Implements the AIProvider interface for GPT-4o and GPT-4o-mini.
Activated in Stage 3 — AI Integration.
"""
from typing import AsyncIterator
from app.services.ai.base import AIProvider, ChatMessage


class OpenAIProvider(AIProvider):
    def __init__(self, model: str = "gpt-4o"):
        self.model = model
        # Client initialized lazily in Stage 3
        self._client = None

    def _get_client(self):
        """Lazy-load the OpenAI client so the app starts without an API key."""
        if self._client is None:
            from openai import AsyncOpenAI
            from app.core.config import settings
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns complete response — implemented in Stage 3."""
        raise NotImplementedError("OpenAI generate() implemented in Stage 3")

    async def stream(self, messages: list[ChatMessage]) -> AsyncIterator[str]:
        """Streams response tokens — implemented in Stage 3."""
        raise NotImplementedError("OpenAI stream() implemented in Stage 3")
        yield  # Makes this a generator
