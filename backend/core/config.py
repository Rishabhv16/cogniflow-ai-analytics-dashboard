# file: src/modules/core/config.py
# purpose: Manage environment variables and configuration for the backend system.
# dependencies: pydantic-settings

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "CogniFlow AI"
    VERSION: str = "1.0.0"
    
    # Database Configuration (PostgreSQL)
    POSTGRES_USER: str = "cogniflow"
    POSTGRES_PASSWORD: str = "cogniflow_password"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "cogniflow_db"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return "sqlite:///./cogniflow.db"

    # Graph Database Configuration (Neo4j)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "cogniflow_graph"
    
    # Cache    # For local easy checking, using sqlite by default instead of postgres
    DATABASE_URL: str = "sqlite:///./cogniflow.db"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # AI Providers
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    AGORA_APP_ID: str = ""
    SERPER_API_KEY: str = ""
    ML_URL: str = ""
    UNSPLASH_ACCESS_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
