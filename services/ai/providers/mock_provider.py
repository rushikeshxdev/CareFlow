from providers.base import BaseAIProvider
from schemas import IntentAnalysisRequest, IntentAnalysisResponse, ChatRequest, ChatResponse

class MockAIProvider(BaseAIProvider):

    async def analyze_intent(self, request: IntentAnalysisRequest) -> IntentAnalysisResponse:
        c = request.concern.lower()

        if "chest" in c or "heart" in c or "palpitation" in c:
            return IntentAnalysisResponse(
                intent="find_doctor",
                recommendedSpecialty="Cardiology",
                recommendedServiceType="CONSULTATION",
                suggestedAction="Schedule an urgent cardiology consultation and ECG cardiac screening.",
                urgency="urgent",
                summary="Patient reports chest discomfort or heart palpitations.",
                keySymptoms=["Chest pain", "Palpitations"],
            )

        if "headache" in c or "migraine" in c or "dizzy" in c:
            return IntentAnalysisResponse(
                intent="find_doctor",
                recommendedSpecialty="Neurology",
                recommendedServiceType="CONSULTATION",
                suggestedAction="Schedule a neurology consultation for persistent headache evaluation.",
                urgency="routine",
                summary="Patient experiences persistent headaches or neurological symptoms.",
                keySymptoms=["Headache", "Dizziness"],
            )

        if "cough" in c or "breath" in c or "asthma" in c:
            return IntentAnalysisResponse(
                intent="find_doctor",
                recommendedSpecialty="Pulmonology",
                recommendedServiceType="CONSULTATION",
                suggestedAction="Consult a pulmonologist for respiratory evaluation.",
                urgency="routine",
                summary="Patient reports respiratory symptoms or difficulty breathing.",
                keySymptoms=["Cough", "Shortness of breath"],
            )

        if "blood" in c or "test" in c or "scan" in c or "lab" in c:
            return IntentAnalysisResponse(
                intent="diagnostic_test",
                recommendedSpecialty="General Medicine",
                recommendedServiceType="DIAGNOSTIC",
                suggestedAction="Book a comprehensive blood panel and diagnostic lab checkup.",
                urgency="routine",
                summary="Patient is seeking diagnostic lab testing or blood work.",
                keySymptoms=["Diagnostic request"],
            )

        if "home" in c or "nurse" in c or "physio" in c:
            return IntentAnalysisResponse(
                intent="home_care",
                recommendedSpecialty="General Medicine",
                recommendedServiceType="HOME_NURSING",
                suggestedAction="Arrange a certified home nursing or physiotherapy visit.",
                urgency="routine",
                summary="Patient requested home care or home nursing support.",
                keySymptoms=["Home care request"],
            )

        # Default general consultation response
        return IntentAnalysisResponse(
            intent="find_doctor",
            recommendedSpecialty="General Medicine",
            recommendedServiceType="CONSULTATION",
            suggestedAction="Schedule a primary care general physician consultation.",
            urgency="routine",
            summary=f"General health query: {request.concern}",
            keySymptoms=["General health concern"],
        )

    async def chat(self, request: ChatRequest) -> ChatResponse:
        return ChatResponse(
            reply="Thank you for sharing your symptoms. Based on your description, I recommend consulting a primary care specialist for a detailed evaluation.",
            suggestedFollowUp=["What specialty should I see?", "How do I book an appointment?", "Are diagnostic tests recommended?"],
        )
