"""
Pyrobot — AI Provider Abstract Base Class
Strategy Pattern: one interface, many implementations.
To add a new model: create one file + add one line to factory.py.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncGenerator


@dataclass
class ChatMessage:
    role: str   # "user" | "assistant" | "system"
    content: str


class AIProvider(ABC):
    """
    All AI providers implement this interface.
    The rest of the application only ever talks to this interface —
    never directly to OpenAI, Anthropic, or Google.
    """

    @abstractmethod
    async def generate(self, messages: list[ChatMessage]) -> str:
        """
        Send messages and return the complete response as a string.
        Use for short, non-streaming responses.
        """
        pass

    @abstractmethod
    def stream(self, messages: list[ChatMessage]) -> AsyncGenerator[str, None]:
        """
        Send messages and yield response chunks as they arrive.
        Use for the chat interface — gives the streaming typewriter effect.

        Declared as a plain def (not async def) so that subclasses can
        implement it as an async generator function (async def + yield),
        which Python types as AsyncGenerator[str, None] — not as a coroutine.
        Both are compatible: the caller uses `async for token in provider.stream(...)`.
        """
        pass
