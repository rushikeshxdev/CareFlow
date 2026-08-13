from abc import ABC, abstractmethod
from schemas import IntentAnalysisRequest, IntentAnalysisResponse, ChatRequest, ChatResponse

class BaseAIProvider(ABC):

    @abstractmethod
    async def analyze_intent(self, request: IntentAnalysisRequest) -> IntentAnalysisResponse:
        pass

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        pass
