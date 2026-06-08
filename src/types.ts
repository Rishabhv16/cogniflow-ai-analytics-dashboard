export interface RuleGateCondition {
  field: string;
  operator: string;
  value: string | number;
  currency?: string;
}

export interface RuleGateAction {
  type: string;
  target: string;
  priority?: string;
}

export interface RuleLogicGate {
  condition: RuleGateCondition;
  action: RuleGateAction;
}

export interface ReviewerInsight {
  type: string; // 'efficiency' | 'bias' | 'regulatory' | 'safety'
  title: string;
  description: string;
  suggested_action: string;
}

export interface ConstructedRule {
  rule_id: string;
  logic_gates: RuleLogicGate[];
  original_rule?: string;
  reviewer_insights: ReviewerInsight[];
  status: string;
}

export interface StreamEvent {
  timestamp: string;
  entityId: string;
  action: "APPROVED" | "REJECTED" | "ESCALATED";
  reasoning: string;
}

export interface AuditLogItem {
  id?: string;
  timestamp: string;
  subject: string;
  actionAndActor: string;
  actorType: "ai" | "user";
  simulationResult: string;
  simulationPassed: boolean;
  verificationStatus: "SIGNED_HASHED" | "VERIFIED" | "PENDING_AUDIT";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
