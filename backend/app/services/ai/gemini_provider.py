"""
Pyrobot — Google Gemini Provider
Implements the AIProvider interface for Gemini models.

Uses the unified `google-genai` SDK. The older `google.generativeai`
package was deprecated August 31, 2025 — this rewrite migrates off it
entirely, not just bumping a version number.

Design note: the old SDK simulated a stateful "chat session" via
start_chat(history=...). Pyrobot's Stage 3 architecture is intentionally
stateless — the full conversation is resent with every request — so this
version drops the chat-session abstraction and sends the whole message
list as `contents` on every call. This is also Gemini's own documented
multi-turn pattern: resend full history each turn, every time.
"""
from typing import AsyncGenerator

from app.services.ai.base import AIProvider, ChatMessage

# Gemini's content role is "model" where everyone else uses "assistant"
_ROLE_MAP = {"assistant": "model", "user": "user"}


class GeminiProvider(AIProvider):
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self._client = None

    def _get_client(self):
        """Lazy-load the Gemini client so the app starts without an API key."""
        if self._client is None:
            from google import genai
            from app.core.config import settings
            self._client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        return self._client

    def _build_contents(self, messages: list[ChatMessage]):
        """
        Splits the system instruction out (Gemini takes it as a separate
        config field, never as an item in the message list) and converts
        every remaining message into the SDK's typed Content/Part objects.

        Returns (system_instruction: str | None, contents: list[types.Content]).
        """
        from google.genai import types

        system_instruction = None
        contents = []
        for m in messages:
            if m.role == "system":
                system_instruction = m.content
            else:
                contents.append(
                    types.Content(
                        role=_ROLE_MAP.get(m.role, m.role),
                        parts=[types.Part.from_text(text=m.content)],
                    )
                )
        return system_instruction, contents

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns the complete response as a single string."""
        from google.genai import types

        client = self._get_client()
        system_instruction, contents = self._build_contents(messages)

        response = await client.aio.models.generate_content(
            model=self.model,
            contents=contents,
            config=(
                types.GenerateContentConfig(system_instruction=system_instruction)
                if system_instruction else None
            ),
        )
        return response.text or ""

    async def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """Yields response tokens one chunk at a time as they arrive from Gemini."""
        from google.genai import types

        client = self._get_client()
        system_instruction, contents = self._build_contents(messages)

        stream = await client.aio.models.generate_content_stream(
            model=self.model,
            contents=contents,
            config=(
                types.GenerateContentConfig(system_instruction=system_instruction)
                if system_instruction else None
            ),
        )
        async for chunk in stream:
            if chunk.text:
                yield chunk.text