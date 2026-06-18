"""
Pyrobot — OpenAI Provider
Implements the AIProvider interface for GPT-4o and GPT-4o-mini.
"""
from typing import TYPE_CHECKING, AsyncGenerator, Any

from app.services.ai.base import AIProvider, ChatMessage

if TYPE_CHECKING:
    from openai import AsyncOpenAI


class OpenAIProvider(AIProvider):
    def __init__(self, model: str = "gpt-4o"):
        self.model = model
        self._client: "AsyncOpenAI | None" = None

    def _get_client(self) -> "AsyncOpenAI":
        """Lazy-load the OpenAI async client so the app starts without an API key."""
        if self._client is None:
            from openai import AsyncOpenAI
            from app.core.config import settings
            self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._client

    def _to_openai_messages(self, messages: list[ChatMessage]) -> list[Any]:
        """
        Convert our internal ChatMessage dataclass to the dict shape
        the OpenAI SDK accepts. Typed as list[Any] to satisfy both the
        SDK's ChatCompletionMessageParam and Pylance's strict checking
        without requiring an openai import at the module level.
        """
        return [{"role": m.role, "content": m.content} for m in messages]

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns the complete response as a single string."""
        client = self._get_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=self._to_openai_messages(messages),
        )
        return response.choices[0].message.content or ""

    async def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """
        Yields response tokens one chunk at a time as they arrive from OpenAI.
        The `async with` pattern ensures the underlying HTTP connection is
        properly closed even if the client disconnects mid-stream.
        """
        client = self._get_client()
        async with await client.chat.completions.create(
            model=self.model,
            messages=self._to_openai_messages(messages),
            stream=True,
        ) as response:
            async for chunk in response:
                delta = chunk.choices[0].delta.content
                if delta is not None:
                    yield delta
