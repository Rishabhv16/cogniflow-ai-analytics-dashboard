# file: backend/modules/rules_engine/engine.py
# purpose: Core evaluation logic for business rules using rule-engine.
# dependencies: rule-engine, time

import rule_engine
import time
from .schemas import BusinessRule, RuleExecutionResult, RuleAction

def evaluate_operator(operator: str, field: str, value: any) -> str:
    """Maps custom operators to rule_engine valid syntax."""
    if operator == "==":
        return f"{field} == {repr(value)}"
    elif operator == ">=":
        return f"{field} >= {repr(value)}"
    elif operator == "<=":
        return f"{field} <= {repr(value)}"
    elif operator == ">":
        return f"{field} > {repr(value)}"
    elif operator == "<":
        return f"{field} < {repr(value)}"
    elif operator == "!=":
        return f"{field} != {repr(value)}"
    elif operator.lower() == "contains":
        return f"{repr(value)} in {field}"
    else:
        return f"{field} == {repr(value)}"

class BusinessRuleEngine:
    def __init__(self):
        # In a real scenario, this might pull rules from PostgreSQL/Redis
        # For now, we evaluate against an explicitly passed rule
        pass

    def execute(self, rule: BusinessRule, context: dict) -> RuleExecutionResult:
        start_time = time.perf_counter()
        
        executed_actions = []
        decision_path = []

        for gate in rule.logic_gates:
            cond = gate.condition
            rule_str = evaluate_operator(cond.operator, cond.field, cond.value)
            decision_path.append(f"Evaluating: {rule_str}")
            
            try:
                # Compile and match
                engine_rule = rule_engine.Rule(rule_str)
                if engine_rule.matches(context):
                    decision_path.append(f"MATCHED: {rule_str} -> Triggering {gate.action.type}")
                    executed_actions.append(gate.action)
                else:
                    decision_path.append(f"FAILED: {rule_str}")
            except Exception as e:
                decision_path.append(f"ERROR executing {rule_str}: {str(e)}")

        execution_time_ms = (time.perf_counter() - start_time) * 1000

        return RuleExecutionResult(
            rule_id=rule.rule_id,
            executed_actions=executed_actions,
            execution_time_ms=execution_time_ms,
            decision_path=decision_path
        )
