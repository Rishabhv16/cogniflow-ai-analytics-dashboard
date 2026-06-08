# file: backend/modules/rulegpt/agent.py
# purpose: LangGraph based agent to translate natural language to business rules.
# dependencies: langgraph, langchain, pydantic

import os
from typing import TypedDict, Annotated, Sequence
from langgraph.graph import StateGraph, START, END
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import ValidationError

from modules.rules_engine.schemas import BusinessRule
from core.config import settings

# 1. State definition
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], "The messages in the conversation"]
    policy_text: str
    parsed_rule: dict | None
    error: str | None

# 2. Nodes
def generate_rule_json(state: AgentState):
    """Uses LLM to translate policy to JSON matching BusinessRule schema."""
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return {"error": "GEMINI_API_KEY is not configured.", "parsed_rule": None}

    # In production, use structured output. For now, simulate prompting.
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key)
    
    system_prompt = SystemMessage(content='''
You are CogniFlow AI RuleGPT, an expert enterprise system translator.
Translate the natural language business policy into a structured JSON rule conforming to this exact structure:
{
  "rule_id": "string",
  "logic_gates": [
    {
      "condition": { "field": "string", "operator": "==", "value": "any", "currency": "optional string" },
      "action": { "type": "string", "target": "string", "priority": "MEDIUM" }
    }
  ],
  "original_rule": "string",
  "reviewer_insights": [
    { "type": "string", "title": "string", "description": "string", "suggested_action": "string" }
  ],
  "status": "DRAFT"
}
Return ONLY valid JSON without markdown wrapping.
    ''')
    
    human_prompt = HumanMessage(content=state["policy_text"])
    
    try:
        response = llm.invoke([system_prompt, human_prompt])
        # A simple parsing. In real use, better parser + retry logic is needed.
        import json
        text_content = response.content
        if text_content.startswith("```json"):
            text_content = text_content[7:-3]
        parsed = json.loads(text_content.strip())
        return {"parsed_rule": parsed, "error": None}
    except Exception as e:
        return {"error": str(e), "parsed_rule": None}

def validate_schema(state: AgentState):
    """Validates the generated JSON against the Pydantic BusinessRule schema."""
    if state["error"]:
        return {"error": state["error"]}
    
    try:
        validated_rule = BusinessRule(**state["parsed_rule"])
        return {"parsed_rule": validated_rule.model_dump(), "error": None}
    except ValidationError as e:
        return {"error": f"Validation Error: {str(e)}", "parsed_rule": None}

# 3. Router
def route_validation(state: AgentState):
    if state["error"]:
        return "end" # In a full implementation, we could route back to the LLM to fix it
    return "end"

# 4. Graph construction
builder = StateGraph(AgentState)
builder.add_node("generate", generate_rule_json)
builder.add_node("validate", validate_schema)

builder.add_edge(START, "generate")
builder.add_edge("generate", "validate")
builder.add_conditional_edges("validate", route_validation, {"end": END})

graph = builder.compile()

def translate_policy(policy_text: str) -> BusinessRule | dict:
    state = {"messages": [], "policy_text": policy_text, "parsed_rule": None, "error": None}
    result = graph.invoke(state)
    
    if result["error"]:
        raise ValueError(result["error"])
        
    return BusinessRule(**result["parsed_rule"])

