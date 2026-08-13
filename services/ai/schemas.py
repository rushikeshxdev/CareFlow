from pydantic import BaseModel, Field
from typing import List, Optional

class IntentAnalysisRequest(BaseModel):
    concern: str = Field(..., description="Patient description of health concerns or symptoms")
    location: Optional[str] = Field(None, description="Patient city or region")
    userAge: Optional[int] = Field(None, description="Patient age")
    gender: Optional[str] = Field(None, description="Patient gender")

class IntentAnalysisResponse(BaseModel):
    intent: str = Field(..., description="Categorized intent (find_doctor, find_hospital, diagnostic_test, home_care)")
    recommendedSpecialty: str = Field(..., description="Recommended medical specialty")
    recommendedServiceType: str = Field(..., description="Recommended service type")
    suggestedAction: str = Field(..., description="Actionable patient advice")
    urgency: str = Field(..., description="Urgency assessment: routine | urgent | emergency")
    summary: str = Field(..., description="Clinical summary of patient concern")
    keySymptoms: List[str] = Field(default_factory=list, description="Extracted key symptoms")
    disclaimer: str = Field(
        default="Informational guidance only. CareFlow AI does not diagnose conditions. Consult a licensed healthcare provider for medical advice.",
        description="Clinical safety boundary disclaimer"
    )

class ChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[dict]] = None

class ChatResponse(BaseModel):
    reply: str
    suggestedFollowUp: Optional[List[str]] = None
    disclaimer: str = "Informational guidance only. CareFlow AI does not diagnose conditions."
