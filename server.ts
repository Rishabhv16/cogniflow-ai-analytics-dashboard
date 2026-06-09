import express from "express";
import path from "path";
import Groq from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Groq client to avoid crashing on startup if key is missing
let aiClient: Groq | null = null;
function getGroqClient(): Groq {
  if (!aiClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key || key === "MY_GROQ_API_KEY") {
      throw new Error("GROQ_API_KEY environment variable is not configured.");
    }
    aiClient = new Groq({ apiKey: key });
  }
  return aiClient;
}

// ─── 1. RULE TRANSLATOR ENDPOINT ─────────────────────────────────────────────
app.post("/api/translate-rule", async (req, res) => {
  try {
    const { policy } = req.body;
    if (!policy || typeof policy !== "string" || !policy.trim()) {
      return res.status(400).json({ error: "Policy input is required" });
    }

    const ai = getGroqClient();

    const prompt = `You are CogniFlow AI RuleGPT, an expert enterprise system translator.
Translate this natural language business policy into a structured rule represented in JSON Logic:
"${policy}"

Construct a JSON response conforming strictly to this format:
{
  "rule_id": "CLM_PRO_XXX" (generate a unique code like CLM_PRO_005, TR_RISK_101, etc.),
  "logic_gates": [
    {
      "condition": {
        "field": "the field being checked (e.g. claimAmount, customerTier, userAge)",
        "operator": "the operator (e.g. >=, ==, <, !=, contains)",
        "value": the target value (e.g. 500000, "VIP", 18, true),
        "currency": "optional string e.g. 'INR', 'USD' if applicable"
      },
      "action": {
        "type": "the action type (e.g. APPROVAL_ROUTING, EXPEDITE, REJECT, VERIFY_PII)",
        "target": "who or what handles the action (e.g. MANAGER_L1, SENIOR_PARTNER, COMPLIANCE_DESK, AUTO_APPROVE)",
        "priority": "optional string (e.g. HIGH, MEDIUM, LOW)"
      }
    }
  ],
  "original_rule": "Summarized human logic here",
  "reviewer_insights": [
    {
      "type": "efficiency" or "commercial" or "safety" or "bias",
      "title": "Title of the insight/recommendation",
      "description": "Short explanation of the optimization or warning",
      "suggested_action": "Apply Fix" or "View Details" or "Approve Rule"
    }
  ],
  "status": "DRAFT"
}

Provide high-quality translations. Answer ONLY with the valid JSON.`;

    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const jsonText = response.choices[0]?.message?.content || "{}";
    const ruleObj = JSON.parse(jsonText.trim());
    return res.json(ruleObj);
  } catch (error: any) {
    console.error("Rule translation error:", error);
    // Return mock fallback data if Groq API Key isn't configured
    if (error.message && error.message.includes("GROQ_API_KEY")) {
      return res.status(200).json({
        rule_id: "CLM_PRO_005",
        logic_gates: [
          {
            condition: { field: "claimAmount", operator: ">=", value: "500000", currency: "INR" },
            action: { type: "APPROVAL_ROUTING", target: "MANAGER_L1", priority: "HIGH" }
          },
          {
            condition: { field: "customerTier", operator: "==", value: "VIP" },
            action: { type: "EXPEDITE", target: "SENIOR_PARTNER" }
          }
        ],
        original_rule: req.body.policy || "Claims above ₹5 lakh require manager approval.",
        reviewer_insights: [
          { type: "efficiency", title: "Efficiency Optimization", description: "Swap logic order: Checking 'VIP' tier first reduces database calls for claims under the threshold. Expected gain: 12ms/req.", suggested_action: "Apply Fix" },
          { type: "bias", title: "Potential Bias Detected", description: "The term 'Manager Approval' without a specified SLA might cause bottlenecks for users in specific geographic regions during off-hours.", suggested_action: "View Details" }
        ],
        status: "DRAFT_API_KEY_MISSING_FALLBACK"
      });
    }
    return res.status(500).json({ error: error.message || "Rule translation failed" });
  }
});

// ─── 2. COPILOT CHAT ENDPOINT ─────────────────────────────────────────────────
app.post("/api/copilot", async (req, res) => {
  try {
    const { messages, agentType } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    const ai = getGroqClient();
    const systemPrompt =
      agentType === "explainability"
        ? "You are CogniFlow Explainability Assistant. Your job is to explain complex machine learning models, trace decision logic (why specific rules are executed or bypassed), audit decisions for bias, and present findings clearly to compliance officers. Keep answers direct, insightful, and enterprise-focused."
        : agentType === "compliance"
        ? "You are Compliance Watchdog, an autonomous agent auditing decisions for regulatory alignment. You analyze rules against GDPR, SOC2 Type II, ISO 27001, and guidelines like the EU AI Act. Answer regulatory questions clearly, highlighting gaps or recommended optimizations."
        : "You are CogniFlow RuleGPT Assistant. Your role is to help write, review, optimize and stress-test autonomous business rules and policy logic gates. Suggest dynamic scores, threshold adjustments, and logic paths for optimal revenue and low risk.";

    const formattedContents: Array<{role: "user" | "assistant" | "system"; content: string}> = messages.map((msg: any) => ({
      role: (msg.role === "assistant" ? "assistant" : "user") as "user" | "assistant",
      content: msg.content
    }));

    formattedContents.unshift({ role: "system", content: systemPrompt });
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: formattedContents as any,
      temperature: 0.7,
    });

    // Return as "content" key to match the frontend expectation
    return res.json({ content: response.choices[0]?.message?.content || "" });
  } catch (error: any) {
    console.error("Copilot AI error:", error);
    if (error.message && error.message.includes("GROQ_API_KEY")) {
      let responseText = "I stand ready to assist you. To enable real-time intelligence, please configure your `GROQ_API_KEY` in the Settings panel.";
      return res.json({ content: responseText });
    }
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
       return res.status(429).json({ error: "⚠️ API Quota Exceeded. Groq's rate limit has been reached for this minute/day. Please wait a bit before trying again." });
    }
    return res.status(500).json({ error: `Model Error: ${error.message || "AI copilot failed"}` });
  }
});

// ─── 3. ANALYTICS ENDPOINTS ────────────────────────────────────────────────────
app.get("/api/analytics/metrics", (req, res) => {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  return res.json({
    totalEvaluations: `${rand(120, 130)}K`,
    approvalRate: `${(Math.random() * 1 + 98.5).toFixed(1)}%`,
    latency: `${rand(40, 50)}ms`,
    activeRules: rand(240, 250)
  });
});

app.get("/api/analytics/stream", (req, res) => {
  const entities = ["Claim", "Tx", "User", "Policy"];
  const actions = ["APPROVED", "REJECTED", "ESCALATED"];
  const reasons: Record<string, string[]> = {
    APPROVED: ["Rule matched threshold", "Identity verified — low risk", "Score above acceptance floor"],
    REJECTED: ["Risk score exceeds limit", "Missing KYC document", "Velocity cap triggered"],
    ESCALATED: ["Manual review required", "Anomaly pattern detected", "High-value claim routed to senior analyst"]
  };

  const now = new Date();
  const stream = Array.from({ length: 12 }).map((_, i) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const offset = new Date(now.getTime() - (i * 3 + Math.floor(Math.random() * 5)) * 1000);
    return {
      timestamp: offset.toTimeString().slice(0, 8) + "." + String(offset.getMilliseconds()).padStart(3, "0").slice(0, 2),
      entityId: `${entities[Math.floor(Math.random() * entities.length)]}-${Math.floor(Math.random() * 9000) + 1000}`,
      action,
      reasoning: reasons[action][Math.floor(Math.random() * reasons[action].length)]
    };
  });
  return res.json(stream);
});

// ─── 4. SIMULATION ENDPOINT ────────────────────────────────────────────────────
app.post("/api/simulation/run", (req, res) => {
  const { approvalAggression = 85, interestSensitivity = 75, riskThreshold = 40 } = req.body;

  const computedApproval = Math.max(0, Math.min(100, 18.4 + (approvalAggression - 85) / 10));
  const computedRevenue = Math.max(0, 1.2 + (interestSensitivity - 75) / 50);
  const computedRisk = Math.max(0, 4.1 + (riskThreshold - 40) / 25);

  // Simulate compute delay
  setTimeout(() => {
    return res.json({
      computedApproval: parseFloat(computedApproval.toFixed(1)),
      computedRevenue: parseFloat(computedRevenue.toFixed(1)),
      computedRisk: parseFloat(computedRisk.toFixed(1))
    });
  }, 1200);
});

// ─── 5. COMPLIANCE ENDPOINTS ────────────────────────────────────────────────────
app.get("/api/compliance/logs", (req, res) => {
  const subjects = ["Rule Execution", "Data Access", "Model Update", "Policy Change"];
  const actors = ["system", "admin_user", "ai_copilot", "compliance_officer"];
  const verbs = ["Viewed", "Modified", "Approved", "Rejected"];
  const now = new Date();

  const logs = Array.from({ length: 14 }).map((_, i) => {
    const offset = new Date(now.getTime() - (i * 15 + Math.floor(Math.random() * 10)) * 60 * 1000);
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    const results = ["PASS", "FAIL", "WARN"];
    const statuses = ["SIGNED_HASHED", "VERIFIED", "PENDING_AUDIT"];
    return {
      id: `log_${1000 + i}`,
      timestamp: offset.toISOString().replace("T", " ").slice(0, 19),
      subject,
      actionAndActor: `${verb} by ${actor}`,
      actorType: actor === "ai_copilot" || actor === "system" ? "ai" : "user",
      simulationResult: results[Math.floor(Math.random() * results.length)],
      simulationPassed: Math.random() > 0.2,
      verificationStatus: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });

  return res.json(logs);
});

app.post("/api/compliance/verify", (req, res) => {
  const { log_id } = req.body;
  setTimeout(() => {
    const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return res.json({
      status: "success",
      log_id,
      hash: `0x${hex}`,
      verified_at: new Date().toISOString()
    });
  }, 1000);
});

// ─── 6. SHADOW AI REVIEWER ────────────────────────────────────────────────────
const PROTECTED_ATTRS = ["gender","age","race","ethnicity","religion","nationality","disability","marital_status","sexual_orientation"];

app.post("/api/shadow-reviewer/audit", (req, res) => {
  const { rule_id, logic_gates = [], policy_text = "" } = req.body;
  const biasFlags: any[] = [];
  const conflictFlags: any[] = [];
  const coverageGaps: any[] = [];
  const seenFields: Record<string, number[]> = {};

  logic_gates.forEach((gate: any, i: number) => {
    const field = (gate.condition?.field || "").toLowerCase();
    PROTECTED_ATTRS.forEach(attr => {
      if (field.includes(attr) || attr.includes(field)) {
        biasFlags.push({ attribute: attr, field_in_rule: gate.condition?.field || field,
          severity: ["race","gender","religion"].includes(attr) ? "HIGH" : "MEDIUM",
          recommendation: `Remove or anonymise '${field}' — use proxy-neutral variables.` });
      }
    });
    if (seenFields[field]) {
      seenFields[field].forEach(j => {
        conflictFlags.push({ gate_a_index: j, gate_b_index: i, conflict_type: "OVERLAPPING_CONDITION",
          description: `Gates ${j} and ${i} both operate on '${field}'.` });
      });
      seenFields[field].push(i);
    } else { seenFields[field] = [i]; }
  });

  const fieldsCovered = new Set(logic_gates.map((g: any) => (g.condition?.field || "").toLowerCase()));
  if (!Array.from(fieldsCovered).some(f => f.includes("fraud") || f.includes("risk"))) {
    coverageGaps.push({ scenario: "No fraud/risk signal evaluated",
      missing_condition: "riskScore < 0.85",
      suggested_fix: "Add risk score check to prevent high-fraud approvals." });
  }

  const biasScore = Math.min(1.0, biasFlags.length * 0.3 + conflictFlags.length * 0.1);
  const coverageScore = Math.max(0.0, 1.0 - coverageGaps.length * 0.25);
  const verdict = biasScore >= 0.6 ? "BLOCKED" : (biasScore > 0 || coverageGaps.length > 0) ? "REVIEW_REQUIRED" : "APPROVED";

  return res.json({ rule_id, bias_flags: biasFlags, conflict_flags: conflictFlags,
    coverage_gaps: coverageGaps, overall_verdict: verdict,
    bias_score: Math.round(biasScore * 100) / 100,
    coverage_score: Math.round(coverageScore * 100) / 100 });
});

// ─── 7. OUTCOME OPTIMISATION A/B TEST ────────────────────────────────────────
app.post("/api/optimisation/ab-test", (req, res) => {
  const { rule_id_a, rule_id_b, metric = "approval_rate", sample_size = 10000 } = req.body;
  const seed = (rule_id_a + rule_id_b).split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
  const baseRate = 0.78 + (seed % 100) / 1000;
  const upliftRaw = ((seed * 7) % 13 - 5) / 100;
  const variantRate = Math.max(0.5, Math.min(0.99, baseRate + upliftRaw));
  const uplift = ((variantRate - baseRate) / baseRate * 100);
  const pValue = Math.max(0.001, 0.5 * Math.exp(-sample_size / 5000));
  const winner = variantRate > baseRate ? rule_id_b : rule_id_a;
  const significant = pValue < 0.05;
  const recommendation = significant && uplift > 0
    ? `Deploy ${winner} — ${Math.abs(uplift).toFixed(1)}% uplift (p=${pValue.toFixed(3)}).`
    : `No significant difference (p=${pValue.toFixed(3)}). Expand sample.`;

  return res.json({ rule_id_a, rule_id_b, winner, metric,
    uplift_pct: Math.round(uplift * 100) / 100, p_value: Math.round(pValue * 10000) / 10000,
    sample_a: sample_size / 2, sample_b: sample_size / 2, recommendation });
});

// ─── 8. EXPLAINABILITY ANALYZE ────────────────────────────────────────────────
app.post("/api/explainability/analyze", async (req, res) => {
  const { rule_id, decision_path = [], context_data = {}, outcome = "UNKNOWN" } = req.body;
  
  // Compute SHAP-style factor weights
  const matchedPath = decision_path.filter((p: string) => p.includes("MATCHED")).join(" ");
  const factors: Record<string, number> = {};
  let total = 0;
  Object.entries(context_data).forEach(([k, v]) => {
    let weight = matchedPath.toLowerCase().includes(k.toLowerCase()) ? 0.6 : 0.15;
    if (typeof v === "number" && v > 100) weight += 0.1;
    factors[k] = weight; total += weight;
  });
  const normalized: Record<string, number> = {};
  Object.entries(factors).forEach(([k, v]) => { normalized[k] = Math.round(v / total * 1000) / 1000; });

  // Counterfactuals from matched conditions
  const counterfactuals: any[] = [];
  decision_path.forEach((step: string) => {
    if (!step.includes("MATCHED")) return;
    Object.keys(context_data).forEach(field => {
      if (!step.includes(field)) return;
      if (step.includes(">=")) {
        const match = step.match(/>=\s*([\d.]+)/);
        if (match) counterfactuals.push({ feature: field, current_value: context_data[field],
          required_change: `Decrease below ${match[1]}`, threshold_value: parseFloat(match[1]), new_outcome: "AUTO_APPROVE" });
      }
    });
  });

  const topDriver = Object.entries(normalized).sort((a, b) => b[1] - a[1])[0]?.[0] || "primary_condition";
  const confidence = Math.round((normalized[topDriver] || 0.5) * 100 * 10) / 10;

  // Generate narrative via Groq if available
  let narrative = `Decision for rule ${rule_id} resulted in ${outcome}. Primary driver: '${topDriver}' exceeded its configured threshold. ${decision_path.filter((p: string) => p.includes("MATCHED")).length} of ${Math.ceil(decision_path.length / 2)} conditions matched.`;
  
  try {
    const ai = getGroqClient();
    const topFactors = Object.entries(normalized).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `You are an enterprise decision explainability AI. Generate a professional 2-3 sentence audit narrative.
Rule: ${rule_id}, Outcome: ${outcome}
Top factors: ${topFactors.map(([k,v]) => `${k}: ${v}`).join(", ")}
Decision path: ${decision_path.slice(0,4).join(" | ")}
Context: ${JSON.stringify(context_data)}
Return ONLY the narrative text, no JSON, no markdown.` }],
    });
    narrative = response.choices[0]?.message?.content || narrative;
  } catch (_) {}

  return res.json({ rule_id, outcome, narrative, shap_factors: normalized,
    counterfactuals, key_driver: topDriver, confidence });
});

// ─── 9. POLICY DRIFT MONITOR ─────────────────────────────────────────────────
app.get("/api/drift-monitor/status", (req, res) => {
  const hour = Math.floor(Date.now() / 3600000);
  const rng = (seed: number) => { let x = Math.sin(seed + hour) * 10000; return x - Math.floor(x); };
  
  const featureConfigs = [
    { name: "claimAmount", baseMean: 250000, drift: rng(1) * 0.35 + 0.85 },
    { name: "creditScore", baseMean: 720, drift: rng(2) * 0.15 + 0.95 },
    { name: "customerTenure", baseMean: 4.2, drift: rng(3) * 0.25 + 0.9 },
    { name: "transactionVelocity", baseMean: 12.3, drift: rng(4) * 0.45 + 0.8 },
  ];

  const features = featureConfigs.map(feat => {
    const psi = Math.abs(feat.drift - 1.0) * (0.8 + rng(feat.baseMean) * 0.5);
    const psiRounded = Math.round(Math.min(psi, 0.4) * 10000) / 10000;
    const ksStatistic = Math.round(Math.abs(feat.drift - 1.0) * 0.8 * 10000) / 10000;
    return {
      feature: feat.name, psi_score: psiRounded,
      ks_statistic: Math.min(ksStatistic, 0.99),
      ks_p_value: Math.round(Math.max(0.001, 1 - ksStatistic * 2) * 1000) / 1000,
      drift_level: psiRounded > 0.2 ? "CRITICAL" : psiRounded > 0.1 ? "MODERATE" : "STABLE",
      baseline_mean: feat.baseMean,
      current_mean: Math.round(feat.baseMean * feat.drift * 100) / 100
    };
  });

  const maxPsi = Math.max(...features.map(f => f.psi_score));
  const overall = maxPsi > 0.2 ? "CRITICAL" : maxPsi > 0.15 ? "HIGH" : maxPsi > 0.1 ? "MEDIUM" : "LOW";
  const alert = maxPsi > 0.15;

  return res.json({
    overall_staleness: overall, staleness_score: Math.round(maxPsi * 10000) / 10000,
    alert, features,
    auto_trigger_recommendation: alert
      ? "Auto-trigger rule retraining — significant distribution shift detected."
      : "Distributions stable. Next check in 24 hours.",
    last_checked: new Date().toISOString()
  });
});

// ─── 11. DECISION GRAPH MEMORY ────────────────────────────────────────────────
app.get("/api/graph-memory/trace/:ruleId", (req, res) => {
  const { ruleId } = req.params;
  const nodes = [
    { id: "REG_GDPR22", label: "GDPR Art.22", type: "regulation", properties: { title: "Automated Decision Making", severity: "HIGH" } },
    { id: "REG_EUAI", label: "EU AI Act III", type: "regulation", properties: { title: "High-Risk AI Systems", severity: "MEDIUM" } },
    { id: ruleId, label: ruleId, type: "rule", properties: { status: "ACTIVE", version: "v2.4.8" } },
    { id: `DEC_${ruleId}_001`, label: "Decision #1", type: "decision", properties: { outcome: "APPROVED", entity: "Claim-7821" } },
    { id: `DEC_${ruleId}_002`, label: "Decision #2", type: "decision", properties: { outcome: "ESCALATED", entity: "Tx-4492" } },
    { id: `OUT_${ruleId}_A`, label: "Approved", type: "outcome", properties: { revenue_impact: "+$4,200", risk_score: 0.12 } },
    { id: `OUT_${ruleId}_B`, label: "Manual Review", type: "outcome", properties: { review_time: "48h", risk_score: 0.67 } },
  ];
  const edges = [
    { source: "REG_GDPR22", target: ruleId, type: "GOVERNED_BY" },
    { source: "REG_EUAI", target: ruleId, type: "GOVERNED_BY" },
    { source: ruleId, target: `DEC_${ruleId}_001`, type: "PRODUCED" },
    { source: ruleId, target: `DEC_${ruleId}_002`, type: "PRODUCED" },
    { source: `DEC_${ruleId}_001`, target: `OUT_${ruleId}_A`, type: "RESULTED_IN" },
    { source: `DEC_${ruleId}_002`, target: `OUT_${ruleId}_B`, type: "RESULTED_IN" },
  ];
  return res.json({ rule_id: ruleId, nodes, edges,
    path_summary: `Rule ${ruleId} governed by 2 regulations, 2 decisions, 100% outcome traced.` });
});

// ─── TIME MACHINE ─────────────────────────────────────────────────────────────
app.post("/api/time-machine/replay", (req, res) => {
  const { rule_id = "RULE_001", scenario = "baseline" } = req.body;
  const noise = scenario === "stress_test" ? 0.15 : scenario === "optimistic" ? 0.02 : 0.05;
  const baseApproval = 75 + (rule_id.length * 3) % 17;
  const sample = Array.from({ length: 20 }, (_, i) => ({
    iteration: i + 1,
    approval_rate: Math.round(Math.max(50, Math.min(99, baseApproval + (Math.random() - 0.5) * noise * 100)) * 100) / 100,
    revenue_impact: Math.round((Math.random() * 10 - 2) * 100) / 100,
    risk_score: Math.round((Math.random() * 10 - 5) * 100) / 100
  }));
  const avgApproval = sample.reduce((s, p) => s + p.approval_rate, 0) / sample.length;
  const avgRevenue = sample.reduce((s, p) => s + p.revenue_impact, 0) / sample.length;
  const avgRisk = sample.reduce((s, p) => s + p.risk_score, 0) / sample.length;
  const rec = avgRevenue > 3 && avgRisk < 3 ? "APPROVE FOR DEPLOYMENT" : avgRevenue > 0 ? "REVIEW REQUIRED" : "DO NOT DEPLOY";
  
  setTimeout(() => res.json({
    rule_id, simulated_outcomes: 12000 + Math.floor(Math.random() * 6000),
    confidence_score: Math.round((100 - noise * 200) * 10) / 10,
    approval_rate_baseline: Math.round(baseApproval * 10) / 10,
    approval_rate_simulated: Math.round(avgApproval * 10) / 10,
    revenue_delta_pct: Math.round(avgRevenue * 100) / 100,
    risk_delta_pct: Math.round(avgRisk * 100) / 100,
    deployment_recommendation: rec,
    monte_carlo_sample: sample
  }), 1500);
});

// ─── COMPLIANCE AUDIT (full Groq-powered) ───────────────────────────────────
app.post("/api/compliance/audit", async (req, res) => {
  const { policy_text, jurisdiction = "EU" } = req.body;
  const CORPUS: Record<string, any> = {
    GDPR_Art22: { source: "GDPR Article 22 — Automated Individual Decision-Making", triggers: ["auto_approve","auto_reject","automated","no human","fully automated"], severity: "HIGH" },
    GDPR_Art5: { source: "GDPR Article 5 — Data Minimisation", triggers: ["pii","personal data","customer data","identity"], severity: "MEDIUM" },
    EU_AI_Act: { source: "EU AI Act Annex III — High-Risk AI", triggers: ["credit","loan","insurance","welfare","eligibility","score"], severity: "HIGH" },
    SOC2_CC6: { source: "SOC 2 Type II CC6 — Access Controls", triggers: ["admin","override","bypass","manual","escalate"], severity: "MEDIUM" },
  };
  
  const policyLower = (policy_text || "").toLowerCase();
  const matched = Object.entries(CORPUS).filter(([_, r]) => r.triggers.some((t: string) => policyLower.includes(t)));
  
  let alerts: any[] = matched.map(([_, r]) => ({
    severity: r.severity, regulation_name: r.source.split("—")[0].trim(),
    article: r.source, description: `Policy may conflict with: ${r.source}`,
    recommendation: "Add explicit human oversight and audit trail."
  }));

  try {
    const ai = getGroqClient();
    const response = await ai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `You are a compliance AI. Analyze this policy for regulatory gaps. Return ONLY JSON:
{"alerts":[{"severity":"HIGH|MEDIUM|LOW","regulation_name":"string","article":"string","description":"string","recommendation":"string"}],"score":0-100,"summary":"string"}
Policy: "${policy_text}"
Regulations to check: ${matched.map(([_, r]) => r.source).join(", ")}` }],
      response_format: { type: "json_object" },
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content || "{}");
    if (parsed.alerts) alerts = parsed.alerts;
    const score = parsed.score || Math.max(40, 100 - alerts.length * 12);
    const status = score >= 85 ? "PASSING" : score >= 60 ? "WARNING" : "CRITICAL";
    return res.json({ compliance_score: score, overall_status: status, alerts,
      rag_sources_used: matched.map(([_, r]) => r.source), summary: parsed.summary || "Analysis complete." });
  } catch (_) {
    const score = Math.max(40, 100 - alerts.length * 12);
    const status = score >= 85 ? "PASSING" : score >= 60 ? "WARNING" : "CRITICAL";
    return res.json({ compliance_score: score, overall_status: status, alerts,
      rag_sources_used: matched.map(([_, r]) => r.source), summary: `Found ${alerts.length} compliance considerations.` });
  }
});

// ─── Set up Vite or serve built files ────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in DEVELOPMENT mode - Mounting Vite...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode - Serving static dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

// Export app for Vercel serverless usage
export { app };

// Only start the server when NOT running on Vercel
if (!process.env.VERCEL) {
  startServer();
}
