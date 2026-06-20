"""
Pyrobot — Groq Provider
Implements the AIProvider interface for Groq-hosted open models
(Llama 3.x family, running on Groq's custom LPU hardware).

Groq's message format is shaped identically to OpenAI's, but we use
Groq's own `groq` SDK directly rather than pointing the OpenAI SDK at a
custom base_url — keeps error types and streaming behavior native.
"""
from typing import TYPE_CHECKING, AsyncGenerator, Any

from app.services.ai.base import AIProvider, ChatMessage

if TYPE_CHECKING:
    from groq import AsyncGroq


class GroqProvider(AIProvider):
    def __init__(self, model: str = "llama-3.3-70b-versatile"):
        self.model = model
        self._client: "AsyncGroq | None" = None

    def _get_client(self) -> "AsyncGroq":
        """Lazy-load the Groq async client so the app starts without an API key."""
        if self._client is None:
            from groq import AsyncGroq
            from app.core.config import settings
            self._client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        return self._client

    def _to_groq_messages(self, messages: list[ChatMessage]) -> list[Any]:
        """
        Convert our internal ChatMessage dataclass to the dict shape the
        Groq SDK accepts — identical shape to OpenAI's, including the
        "system" role staying inline in the messages list (unlike Gemini,
        Groq does NOT need the system message split out separately).
        """
        return [{"role": m.role, "content": m.content} for m in messages]

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns the complete response as a single string."""
        client = self._get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=self._to_groq_messages(messages),
        )
        return response.choices[0].message.content or ""

    async def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """
        Yields response tokens one chunk at a time as they arrive from Groq.
        Groq's LPU hardware streams extremely fast — useful later for
        visually stress-testing the SSE pipeline in Stage 5's chat UI.
        """
        client = self._get_client()
        stream = await client.chat.completions.create(
            model=self.model,
            messages=self._to_groq_messages(messages),
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta is not None:
                yield delta