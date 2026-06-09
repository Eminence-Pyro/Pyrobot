"""
Pyrobot — AI Provider Factory
Returns the correct AIProvider implementation based on model name.
This is the ONLY place in the codebase that knows which provider maps to which model.
"""
from app.services.ai.base import AIProvider


def get_provider(model_name: str) -> AIProvider:
    """
    Returns an instantiated AIProvider for the given model name.
    
    Example:
        provider = get_provider("gpt-4o")
        response = await provider.generate(messages)
    """
    # Import here to avoid loading all SDKs at startup
    from app.services.ai.openai_provider import OpenAIProvider
    # from app.services.ai.claude_provider import ClaudeProvider    # Unlock in Stage 3
    # from app.services.ai.gemini_provider import GeminiProvider    # Unlock in Stage 3

    providers: dict[str, type[AIProvider]] = {
        "gpt-4o":            OpenAIProvider,
        "gpt-4o-mini":       OpenAIProvider,
        # "claude-3-5-sonnet": ClaudeProvider,
        # "gemini-1.5-pro":    GeminiProvider,
    }

    provider_class = providers.get(model_name)
    if not provider_class:
        raise ValueError(
            f"Unknown model: '{model_name}'. "
            f"Available models: {list(providers.keys())}"
        )

    return provider_class(model=model_name)
