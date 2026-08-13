from providers.base import BaseAIProvider
from providers.mock_provider import MockAIProvider
from providers.gemini_provider import GeminiAIProvider
from config import settings

def get_ai_provider() -> BaseAIProvider:
    provider_type = settings.ai_provider.lower()
    if provider_type == "gemini":
        return GeminiAIProvider(api_key=settings.ai_api_key)
    return MockAIProvider()
