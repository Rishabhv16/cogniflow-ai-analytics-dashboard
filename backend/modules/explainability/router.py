# file: backend/modules/explainability/router.py
# purpose: FastAPI router for Explainability Agent.
# dependencies: fastapi

from fastapi import APIRouter
from .agent import ExplainabilityRequest, ExplainabilityResult, generate_explanation

router = APIRouter(prefix="/explainability", tags=["Explainability Agent"])

@router.post("/analyze", response_model=ExplainabilityResult)
def analyze_decision(request: ExplainabilityRequest):
    return generate_explanation(request)
