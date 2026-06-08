# file: backend/modules/rulegpt/router.py
# purpose: FastAPI router for RuleGPT translations using the LangGraph agent.
# dependencies: fastapi

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from modules.rules_engine.schemas import BusinessRule
from .agent import translate_policy

router = APIRouter(prefix="/rulegpt", tags=["RuleGPT"])

class TranslationRequest(BaseModel):
    policy: str

@router.post("/translate", response_model=BusinessRule)
def translate_rule(request: TranslationRequest):
    if not request.policy.strip():
        raise HTTPException(status_code=400, detail="Policy input is required")
        
    try:
        rule = translate_policy(request.policy)
        return rule
    except ValueError as e:
        # Check if it's the missing API key fallback
        if "GEMINI_API_KEY" in str(e):
            raise HTTPException(status_code=503, detail="AI Service is currently offline due to missing API key.")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
