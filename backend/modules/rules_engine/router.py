# file: backend/modules/rules_engine/router.py
# purpose: FastAPI router for the Business Rules Engine endpoints.
# dependencies: fastapi

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from .schemas import BusinessRule, RuleExecutionRequest, RuleExecutionResult
from .engine import BusinessRuleEngine

router = APIRouter(prefix="/rules", tags=["Business Rules Engine"])
engine = BusinessRuleEngine()

# In-memory store for demo (should use PostgreSQL)
RULE_STORE: Dict[str, BusinessRule] = {}

@router.post("/", response_model=BusinessRule)
def create_rule(rule: BusinessRule):
    RULE_STORE[rule.rule_id] = rule
    return rule

@router.get("/{rule_id}", response_model=BusinessRule)
def get_rule(rule_id: str):
    if rule_id not in RULE_STORE:
        raise HTTPException(status_code=404, detail="Rule not found")
    return RULE_STORE[rule_id]

@router.post("/execute", response_model=RuleExecutionResult)
def execute_rule(request: RuleExecutionRequest):
    if request.rule_id not in RULE_STORE:
        raise HTTPException(status_code=404, detail="Rule not found in store")
    
    rule = RULE_STORE[request.rule_id]
    result = engine.execute(rule, request.context)
    
    # Ideally: Write the decision path to Neo4j Graph Memory here asynchronously (Celery)
    
    return result
