# file: backend/modules/compliance/agent.py
# purpose: Real Compliance Intelligence Agent — Gemini-powered analysis against GDPR, EU AI Act, SOC2.
# dependencies: langchain-google-genai, pydantic, langgraph

from pydantic import BaseModel
from typing import List, TypedDict, Optional
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END
from core.config import settings
import json, re


# ── Schemas ───────────────────────────────────────────────────────────────────
class ComplianceRequest(BaseModel):
    policy_text: str
    jurisdiction: str = "EU"

class ComplianceAlert(BaseModel):
    severity: str          # HIGH | MEDIUM | LOW
    regulation_name: str
    article: str
    description: str
    recommendation: str

class ComplianceResult(BaseModel):
    compliance_score: int   # 0-100
    overall_status: str     # PASSING | WARNING | CRITICAL
    alerts: List[ComplianceAlert]
    rag_sources_used: List[str]
    summary: str


# ── Regulatory Corpus (inline RAG for demo — no vector DB needed for hackathon) ──
REGULATORY_CORPUS = {
    "GDPR_Art22": {
        "source": "GDPR Article 22 — Automated Individual Decision-Making",
        "rule": "Individuals must not be subject to solely automated decisions that produce legal or similarly significant effects without human oversight.",
        "triggers": ["auto_approve", "auto_reject", "automated decision", "no human", "fully automated"]
    },
    "GDPR_Art5": {
        "source": "GDPR Article 5 — Data Minimisation Principle",
        "rule": "Personal data must be adequate, relevant, and limited to what is necessary for the stated purpose.",
        "triggers": ["pii", "personal data", "customer data", "user profile", "identity"]
    },
    "EU_AI_Act_HighRisk": {
        "source": "EU AI Act Annex III — High-Risk AI Systems",
        "rule": "AI systems used in credit scoring, social benefits, or insurance must meet conformity assessment and maintain human oversight.",
        "triggers": ["credit", "loan", "insurance", "welfare", "benefit", "eligibility", "score"]
    },
    "SOC2_CC6": {
        "source": "SOC 2 Type II CC6 — Logical and Physical Access Controls",
        "rule": "Access to production rule configurations must be logged, time-bounded, and require multi-party approval.",
        "triggers": ["admin", "override", "bypass", "manual", "escalate", "senior"]
    },
    "EU_AI_Act_Transparency": {
        "source": "EU AI Act Article 13 — Transparency and Provision of Information",
        "rule": "High-risk AI systems must be accompanied by instructions for use and provide sufficient transparency to enable oversight.",
        "triggers": ["decision", "rule", "policy", "model", "algorithm", "ai"]
    }
}


# ── LangGraph State ───────────────────────────────────────────────────────────
class ComplianceState(TypedDict):
    policy_text: str
    jurisdiction: str
    matched_regulations: list
    alerts: list
    score: int
    summary: str
    error: Optional[str]


# ── Node: Keyword-based RAG retrieval ─────────────────────────────────────────
def retrieve_relevant_regulations(state: ComplianceState) -> ComplianceState:
    """Simulated RAG retrieval: keyword-match policy text against regulatory corpus."""
    policy_lower = state["policy_text"].lower()
    matched = []
    for key, reg in REGULATORY_CORPUS.items():
        if any(trigger in policy_lower for trigger in reg["triggers"]):
            matched.append({
                "key": key,
                "source": reg["source"],
                "rule": reg["rule"]
            })
    return {**state, "matched_regulations": matched}


# ── Node: LLM Gap Analysis ────────────────────────────────────────────────────
def analyze_compliance_gaps(state: ComplianceState) -> ComplianceState:
    """Uses Gemini to evaluate compliance gaps between policy and retrieved regulations."""
    
    if not settings.GEMINI_API_KEY or not state["matched_regulations"]:
        # Fallback: generate alerts from matched regulations without LLM
        alerts = []
        for reg in state["matched_regulations"]:
            alerts.append({
                "severity": "HIGH" if "GDPR" in reg["source"] or "EU AI Act" in reg["source"] else "MEDIUM",
                "regulation_name": reg["source"].split("—")[0].strip(),
                "article": reg["source"],
                "description": f"Policy potentially conflicts with: {reg['rule']}",
                "recommendation": "Add explicit human oversight and consent mechanism."
            })
        score = max(40, 100 - len(alerts) * 12)
        return {**state, "alerts": alerts, "score": score,
                "summary": f"Found {len(alerts)} compliance considerations. Manual review recommended."}

    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.GEMINI_API_KEY)
        system = SystemMessage(content=(
            "You are an enterprise compliance AI analyst. Given a business policy and relevant regulations, "
            "identify specific compliance gaps or risks. Return JSON with keys: "
            "alerts (list of {severity, regulation_name, article, description, recommendation}), "
            "score (0-100 integer, 100=fully compliant), "
            "summary (1 sentence executive summary). "
            "Be specific and actionable. Return ONLY valid JSON."
        ))
        human = HumanMessage(content=json.dumps({
            "policy_text": state["policy_text"],
            "jurisdiction": state["jurisdiction"],
            "regulations_to_check": state["matched_regulations"]
        }))
        response = llm.invoke([system, human])
        
        text = response.content.strip()
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()

        parsed = json.loads(text)
        return {
            **state,
            "alerts": parsed.get("alerts", []),
            "score": int(parsed.get("score", 75)),
            "summary": parsed.get("summary", "Compliance analysis completed."),
            "error": None
        }
    except Exception as e:
        # Fallback
        alerts = [{"severity": "MEDIUM", "regulation_name": r["source"].split("—")[0].strip(),
                   "article": r["source"], "description": r["rule"],
                   "recommendation": "Review policy against this regulation."} for r in state["matched_regulations"]]
        return {**state, "alerts": alerts, "score": 72,
                "summary": "Compliance analysis completed with fallback mode.", "error": str(e)}


# ── LangGraph Graph ───────────────────────────────────────────────────────────
builder = StateGraph(ComplianceState)
builder.add_node("retrieve", retrieve_relevant_regulations)
builder.add_node("analyze", analyze_compliance_gaps)
builder.add_edge(START, "retrieve")
builder.add_edge("retrieve", "analyze")
builder.add_edge("analyze", END)
compliance_graph = builder.compile()


# ── Public API ────────────────────────────────────────────────────────────────
def check_compliance(request: ComplianceRequest) -> ComplianceResult:
    state: ComplianceState = {
        "policy_text": request.policy_text,
        "jurisdiction": request.jurisdiction,
        "matched_regulations": [],
        "alerts": [],
        "score": 100,
        "summary": "",
        "error": None
    }
    result = compliance_graph.invoke(state)
    
    alerts = [ComplianceAlert(**a) for a in result["alerts"]]
    score = result["score"]
    status = "PASSING" if score >= 85 else "WARNING" if score >= 60 else "CRITICAL"
    sources = [r["source"] for r in result["matched_regulations"]]
    
    return ComplianceResult(
        compliance_score=score,
        overall_status=status,
        alerts=alerts,
        rag_sources_used=sources if sources else ["No specific regulations matched."],
        summary=result["summary"]
    )
