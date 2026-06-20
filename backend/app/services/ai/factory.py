"""
Pyrobot — AI Provider Factory
Returns the correct AIProvider implementation based on model name.
This is the ONLY place in the codebase that knows which model maps to which provider.
To add a new model: add one entry to the `providers` dict below. Nothing else changes.
"""
from typing import Any

from app.services.ai.base import AIProvider


def get_provider(model_name: str) -> AIProvider:
    """
    Returns an instantiated AIProvider for the given model name.

    Example:
        provider = get_provider("llama-3.3-70b-versatile")
        response = await provider.generate(messages)
    """
    # Imported inside the function so unused SDKs are never loaded at startup.
    from app.services.ai.openai_provider import OpenAIProvider
    from app.services.ai.claude_provider import ClaudeProvider
    from app.services.ai.gemini_provider import GeminiProvider
    from app.services.ai.groq_provider import GroqProvider

    providers: dict[str, Any] = {
        # OpenAI — flagship + lightweight (requires billing)
        "gpt-5.5":                     OpenAIProvider,
        "gpt-5.4-mini":                OpenAIProvider,

        # Anthropic Claude — current generation (requires billing)
        "claude-sonnet-4-6":           ClaudeProvider,
        "claude-haiku-4-5-20251001":   ClaudeProvider,

        # Google Gemini — Flash tier is free; Pro moved behind billing April 2026
        "gemini-2.5-flash":            GeminiProvider,
        "gemini-2.5-flash-lite":       GeminiProvider,

        # Groq — free tier, no card required, OpenAI-compatible shape
        "llama-3.3-70b-versatile":     GroqProvider,
        "llama-3.1-8b-instant":        GroqProvider,
    }

    provider_class = providers.get(model_name)
    if not provider_class:
        raise ValueError(
            f"Unknown model: '{model_name}'. "
            f"Available: {list(providers.keys())}"
        )

    return provider_class(model=model_name)