from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from schemas import IntentAnalysisRequest, IntentAnalysisResponse, ChatRequest, ChatResponse
from providers import get_ai_provider

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="CareFlow FastAPI AI Service for Healthcare Intent Analysis & Structured Recommendations",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

provider = get_ai_provider()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "provider": settings.ai_provider,
    }

@app.post("/ai/analyze-intent", response_model=IntentAnalysisResponse)
async def analyze_intent(request: IntentAnalysisRequest):
    try:
        return await provider.analyze_intent(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intent analysis error: {str(e)}")

@app.post("/ai/recommend")
async def recommend(request: IntentAnalysisRequest):
    try:
        analysis = await provider.analyze_intent(request)
        return {
            "analysis": analysis,
            "recommendedFilters": {
                "specialty": analysis.recommendedSpecialty,
                "serviceType": analysis.recommendedServiceType,
                "urgency": analysis.urgency,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/ai/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        return await provider.chat(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
