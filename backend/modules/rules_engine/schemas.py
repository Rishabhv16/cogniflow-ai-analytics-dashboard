# file: backend/modules/rules_engine/schemas.py
# purpose: Pydantic schemas for the Business Rules Engine module.
# dependencies: pydantic

from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class RuleCondition(BaseModel):
    field: str
    operator: str
    value: Any
    currency: Optional[str] = None

class RuleAction(BaseModel):
    type: str
    target: str
    priority: Optional[str] = "MEDIUM"

class LogicGate(BaseModel):
    condition: RuleCondition
    action: RuleAction

class ReviewerInsight(BaseModel):
    type: str
    title: str
    description: str
    suggested_action: str

class BusinessRule(BaseModel):
    rule_id: str
    logic_gates: List[LogicGate]
    original_rule: str
    reviewer_insights: List[ReviewerInsight] = []
    status: str = "DRAFT"

class RuleExecutionRequest(BaseModel):
    rule_id: str
    context: Dict[str, Any] = Field(..., description="The data to evaluate against the rule")

class RuleExecutionResult(BaseModel):
    rule_id: str
    executed_actions: List[RuleAction]
    execution_time_ms: float
    decision_path: List[str]
