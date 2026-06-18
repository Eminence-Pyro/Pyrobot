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
        provider = get_provider("gpt-4o")
        response = await provider.generate(messages)
    """
    # Imported inside the function so unused SDKs are never loaded at startup.
    from app.services.ai.openai_provider import OpenAIProvider
    from app.services.ai.claude_provider import ClaudeProvider
    from app.services.ai.gemini_provider import GeminiProvider

    # Typed as dict[str, Any] so Pylance doesn't complain about the `model`
    # constructor argument — each concrete provider adds `model` to __init__,
    # but the abstract base AIProvider doesn't declare it. At runtime this is
    # always a valid call; the Any annotation tells Pylance to trust us here.
    providers: dict[str, Any] = {
        "gpt-4o":                     OpenAIProvider,
        "gpt-4o-mini":                OpenAIProvider,
        "claude-3-5-sonnet-20241022":  ClaudeProvider,
        "claude-3-haiku-20240307":     ClaudeProvider,
        "gemini-1.5-flash":           GeminiProvider,
        "gemini-1.5-pro":             GeminiProvider,
    }

    provider_class = providers.get(model_name)
    if not provider_class:
        raise ValueError(
            f"Unknown model: '{model_name}'. "
            f"Available: {list(providers.keys())}"
        )

    return provider_class(model=model_name)
