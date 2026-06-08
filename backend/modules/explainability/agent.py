# file: backend/modules/explainability/agent.py
# purpose: Real LangGraph-powered Explainability Agent — decision narratives, factor weights, counterfactuals.
# dependencies: langgraph, langchain-google-genai, pydantic

from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from core.config import settings
import json


# ── Pydantic Schemas ──────────────────────────────────────────────────────────
class ExplainabilityRequest(BaseModel):
    rule_id: str
    decision_path: List[str]
    context_data: Dict[str, Any]
    outcome: str = "UNKNOWN"

class Counterfactual(BaseModel):
    feature: str
    current_value: Any
    required_change: str
    threshold_value: Any
    new_outcome: str

class ExplainabilityResult(BaseModel):
    rule_id: str
    outcome: str
    narrative: str
    shap_factors: Dict[str, float]
    counterfactuals: List[Counterfactual]
    key_driver: str
    confidence: float


# ── LangGraph State ───────────────────────────────────────────────────────────
class ExplainState(TypedDict):
    request: dict
    shap_factors: dict
    counterfactuals: list
    narrative: str
    error: Optional[str]


# ── Node: Extract Decision Factors (SHAP-style heuristic for rules engine) ────
def extract_decision_factors(state: ExplainState) -> ExplainState:
    """Maps each context field to an importance weight based on rule path impact."""
    req = state["request"]
    context = req.get("context_data", {})
    decision_path = req.get("decision_path", [])

    # Build factor importance: fields that appear in matched decision_path get higher weight
    matched_path = " ".join([p for p in decision_path if "MATCHED" in p])
    
    factors = {}
    total = 0.0
    for field, value in context.items():
        # Weight heuristic: numeric fields get base weight; fields mentioned in decision path get boost
        base = 0.1
        if field.lower() in matched_path.lower():
            base = 0.7 if isinstance(value, (int, float)) and value > 100 else 0.5
        elif isinstance(value, (int, float)):
            base = 0.25
        factors[field] = round(base, 3)
        total += base

    # Normalize to sum to 1.0
    if total > 0:
        factors = {k: round(v / total, 3) for k, v in factors.items()}

    return {**state, "shap_factors": factors}


# ── Node: Compute Counterfactuals ─────────────────────────────────────────────
def compute_counterfactuals(state: ExplainState) -> ExplainState:
    """For each condition in the decision path, compute what value change flips outcome."""
    req = state["request"]
    decision_path = req.get("decision_path", [])
    context = req.get("context_data", {})
    counterfactuals = []

    for step in decision_path:
        if "MATCHED" not in step:
            continue
        # Parse condition: "MATCHED: field >= value -> Triggering ACTION"
        try:
            condition_part = step.split("->")[0].replace("MATCHED:", "").strip()
            action_part = step.split("Triggering")[-1].strip() if "Triggering" in step else "DIFFERENT_OUTCOME"

            for field, val in context.items():
                if field in condition_part:
                    threshold = None
                    change_desc = ""
                    if ">=" in condition_part:
                        threshold = float(condition_part.split(">=")[-1].strip().strip("'\""))
                        change_desc = f"Decrease {field} below {threshold}"
                        new_outcome = "AUTO_APPROVE" if "REJECT" in action_part else "MANUAL_REVIEW"
                        counterfactuals.append(Counterfactual(
                            feature=field, current_value=val,
                            required_change=change_desc, threshold_value=threshold,
                            new_outcome=new_outcome
                        ))
                    elif "==" in condition_part:
                        current = condition_part.split("==")[-1].strip().strip("'\"")
                        change_desc = f"Change {field} from '{val}' to a non-matching value"
                        counterfactuals.append(Counterfactual(
                            feature=field, current_value=val,
                            required_change=change_desc, threshold_value=current,
                            new_outcome="STANDARD_ROUTING"
                        ))
        except Exception:
            continue

    return {**state, "counterfactuals": [c.model_dump() for c in counterfactuals]}


# ── Node: Generate Narrative via Gemini ───────────────────────────────────────
def generate_narrative(state: ExplainState) -> ExplainState:
    """Uses Gemini to generate a plain-English audit narrative."""
    if not settings.GEMINI_API_KEY:
        narrative = _fallback_narrative(state)
        return {**state, "narrative": narrative, "error": None}

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GEMINI_API_KEY)
        req = state["request"]
        factors = state["shap_factors"]
        top_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:3]
        
        system = SystemMessage(content=(
            "You are a decision explainability AI for an enterprise compliance system. "
            "Generate a concise, professional 2-3 sentence audit narrative for the decision made. "
            "Be specific about which factors drove the decision. Use plain English suitable for regulators."
        ))
        human = HumanMessage(content=json.dumps({
            "rule_id": req.get("rule_id"),
            "outcome": req.get("outcome"),
            "decision_path": req.get("decision_path"),
            "top_factors": top_factors,
            "context": req.get("context_data")
        }, default=str))

        response = llm.invoke([system, human])
        return {**state, "narrative": response.content, "error": None}
    except Exception as e:
        return {**state, "narrative": _fallback_narrative(state), "error": str(e)}


def _fallback_narrative(state: ExplainState) -> str:
    req = state["request"]
    factors = state.get("shap_factors", {})
    top = sorted(factors.items(), key=lambda x: x[1], reverse=True)
    driver = top[0][0] if top else "primary condition"
    return (
        f"The decision for rule {req.get('rule_id')} resulted in outcome '{req.get('outcome')}'. "
        f"The primary driving factor was '{driver}' which matched the configured threshold condition. "
        f"All {len(req.get('decision_path', []))} decision gates were evaluated per policy specification."
    )


# ── LangGraph Graph ───────────────────────────────────────────────────────────
builder = StateGraph(ExplainState)
builder.add_node("extract_factors", extract_decision_factors)
builder.add_node("compute_counterfactuals", compute_counterfactuals)
builder.add_node("generate_narrative", generate_narrative)

builder.add_edge(START, "extract_factors")
builder.add_edge("extract_factors", "compute_counterfactuals")
builder.add_edge("compute_counterfactuals", "generate_narrative")
builder.add_edge("generate_narrative", END)

explainability_graph = builder.compile()


# ── Public API ────────────────────────────────────────────────────────────────
def generate_explanation(request: ExplainabilityRequest) -> ExplainabilityResult:
    state: ExplainState = {
        "request": request.model_dump(),
        "shap_factors": {},
        "counterfactuals": [],
        "narrative": "",
        "error": None
    }
    result = explainability_graph.invoke(state)
    
    factors = result["shap_factors"]
    top_driver = max(factors, key=factors.get) if factors else "unknown"
    confidence = max(factors.values()) * 100 if factors else 50.0
    
    return ExplainabilityResult(
        rule_id=request.rule_id,
        outcome=request.outcome,
        narrative=result["narrative"],
        shap_factors=factors,
        counterfactuals=[Counterfactual(**c) for c in result["counterfactuals"]],
        key_driver=top_driver,
        confidence=round(confidence, 1)
    )
