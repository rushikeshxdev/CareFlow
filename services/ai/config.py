import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "CareFlow AI Microservice"
    environment: str = os.getenv("NODE_ENV", "development")
    ai_provider: str = os.getenv("AI_PROVIDER", "mock")
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    port: int = 8000

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
