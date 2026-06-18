"""
Pyrobot — Anthropic Claude Provider
Implements the AIProvider interface for Claude models.
Claude's API separates the system prompt from the messages array,
so we extract any system role message before building the request.
"""
from typing import AsyncGenerator

from app.services.ai.base import AIProvider, ChatMessage


class ClaudeProvider(AIProvider):
    def __init__(self, model: str = "claude-3-5-sonnet-20241022"):
        self.model = model
        self._client = None

    def _get_client(self):
        """Lazy-load the Anthropic async client."""
        if self._client is None:
            import anthropic
            from app.core.config import settings
            self._client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
        return self._client

    def _split_messages(self, messages: list[ChatMessage]) -> tuple[str, list[dict]]:
        """
        Claude's API has a dedicated `system` parameter — system messages
        cannot appear in the messages array itself. This helper extracts
        any system message and returns it separately.
        """
        system_prompt = ""
        conversation = []
        for m in messages:
            if m.role == "system":
                system_prompt = m.content
            else:
                conversation.append({"role": m.role, "content": m.content})
        return system_prompt, conversation

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns the complete response as a single string."""
        client = self._get_client()
        system, conversation = self._split_messages(messages)
        response = await client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=system,
            messages=conversation,
        )
        return response.content[0].text if response.content else ""

    async def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """Yields response tokens one chunk at a time as they arrive from Anthropic."""
        client = self._get_client()
        system, conversation = self._split_messages(messages)
        async with client.messages.stream(
            model=self.model,
            max_tokens=1024,
            system=system,
            messages=conversation,
        ) as stream:
            async for text in stream.text_stream:
                yield text
