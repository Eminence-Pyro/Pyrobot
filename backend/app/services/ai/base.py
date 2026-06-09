"""
Pyrobot — AI Provider Abstract Base Class
Strategy Pattern: one interface, many implementations.
To add a new model: create one file + add one line to factory.py.
"""
from abc import ABC, abstractmethod
from typing import AsyncIterator
from dataclasses import dataclass


@dataclass
class ChatMessage:
    role: str   # "user" | "assistant" | "system"
    content: str


class AIProvider(ABC):
    """
    All AI providers implement this interface.
    The rest of the application only talks to this interface —
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
    async def stream(self, messages: list[ChatMessage]) -> AsyncIterator[str]:
        """
        Send messages and yield response chunks as they arrive.
        Use for the chat interface — gives the streaming typewriter effect.
        """
        pass
