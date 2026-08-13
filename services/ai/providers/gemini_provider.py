import os
import json
from providers.base import BaseAIProvider
from providers.mock_provider import MockAIProvider
from schemas import IntentAnalysisRequest, IntentAnalysisResponse, ChatRequest, ChatResponse

class GeminiAIProvider(BaseAIProvider):

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = MockAIProvider()
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini AI SDK: {e}. Using fallback mock provider.")
                self.model = None
        else:
            self.model = None

    async def analyze_intent(self, request: IntentAnalysisRequest) -> IntentAnalysisResponse:
        if not self.model:
            return await self.fallback.analyze_intent(request)

        prompt = f"""
        System: You are CareFlow AI, an informational healthcare assistant. Analyze the patient's concern and return ONLY valid JSON matching this exact structure:
        {{
          "intent": "find_doctor" | "find_hospital" | "diagnostic_test" | "home_care",
          "recommendedSpecialty": "Cardiology" | "General Medicine" | "Orthopedics" | "Neurology" | "Pulmonology" | "Gynecology" | "Pediatrics" | "Dermatology",
          "recommendedServiceType": "CONSULTATION" | "DIAGNOSTIC" | "HOME_NURSING" | "PHYSIOTHERAPY" | "HEALTH_CHECKUP" | "SECOND_OPINION",
          "suggestedAction": "brief action advice",
          "urgency": "routine" | "urgent" | "emergency",
          "summary": "brief clinical summary",
          "keySymptoms": ["symptom1", "symptom2"]
        }}

        Do NOT diagnose conditions. Provide informational guidance only.

        Patient Concern: {request.concern}
        Location: {request.location or 'Not specified'}
        """

        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Clean JSON formatting code blocks if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            data = json.loads(text)
            return IntentAnalysisResponse(**data)
        except Exception as e:
            print(f"Gemini API invocation error: {e}. Falling back to mock provider.")
            return await self.fallback.analyze_intent(request)

    async def chat(self, request: ChatRequest) -> ChatResponse:
        if not self.model:
            return await self.fallback.chat(request)
        try:
            response = self.model.generate_content(request.message)
            return ChatResponse(
                reply=response.text,
                suggestedFollowUp=["Book an appointment", "View recommended providers"],
            )
        except Exception:
            return await self.fallback.chat(request)
