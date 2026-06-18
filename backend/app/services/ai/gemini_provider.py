"""
Pyrobot — Google Gemini Provider
Implements the AIProvider interface for Gemini models.
Gemini's SDK uses a different message format ("user"/"model" roles
instead of "user"/"assistant") so we translate at the boundary.
"""
from typing import AsyncGenerator

from app.services.ai.base import AIProvider, ChatMessage

# Gemini role mapping: their SDK uses "model" where everyone else uses "assistant"
_ROLE_MAP = {"assistant": "model", "user": "user"}


class GeminiProvider(AIProvider):
    def __init__(self, model: str = "gemini-1.5-flash"):
        self.model = model
        self._client = None

    def _get_client(self):
        """Lazy-load the Gemini async client."""
        if self._client is None:
            import google.generativeai as genai
            from app.core.config import settings
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            self._client = genai.GenerativeModel(self.model)
        return self._client

    def _build_history(
        self, messages: list[ChatMessage]
    ) -> tuple[str, list[dict]]:
        """
        Gemini separates the system instruction from the conversation history.
        Returns (system_instruction, gemini_formatted_history).
        """
        system_instruction = ""
        history = []
        for m in messages:
            if m.role == "system":
                system_instruction = m.content
            else:
                history.append({
                    "role": _ROLE_MAP.get(m.role, m.role),
                    "parts": [m.content],
                })
        return system_instruction, history

    async def generate(self, messages: list[ChatMessage]) -> str:
        """Returns the complete response as a single string."""
        import google.generativeai as genai
        from app.core.config import settings

        system_instruction, history = self._build_history(messages)

        # Re-initialize with system instruction if present
        model = genai.GenerativeModel(
            self.model,
            system_instruction=system_instruction or None,
        )
        genai.configure(api_key=settings.GOOGLE_API_KEY)

        # Last message is the current user turn; the rest is history
        *prior, last = history
        chat = model.start_chat(history=prior)
        response = await chat.send_message_async(last["parts"][0])
        return response.text or ""

    async def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """Yields response tokens one chunk at a time as they arrive from Gemini."""
        import google.generativeai as genai
        from app.core.config import settings

        system_instruction, history = self._build_history(messages)

        model = genai.GenerativeModel(
            self.model,
            system_instruction=system_instruction or None,
        )
        genai.configure(api_key=settings.GOOGLE_API_KEY)

        *prior, last = history
        chat = model.start_chat(history=prior)
        response = await chat.send_message_async(last["parts"][0], stream=True)
        async for chunk in response:
            if chunk.text:
                yield chunk.text
