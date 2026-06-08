import React, { useState } from "react";
import { 
  Wand2, 
  Copy, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  ShieldCheck, 
  Sparkles,
  Play,
  ClipboardCheck,
  Brain,
  Terminal,
  Activity
} from "lucide-react";
import { ConstructedRule, RuleLogicGate } from "../types";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function RuleGPTBuilderView() {
  const [inputText, setInputText] = useState(
    "Claims above ₹5 lakh require manager approval. If the claim is from a VIP customer, expedite to senior partner immediately."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [rule, setRule] = useState<ConstructedRule | null>({
    rule_id: "CLM_PRO_005",
    original_rule: "Claims above ₹5 lakh require manager approval. If the claim is from a VIP customer, expedite to senior partner immediately.",
    logic_gates: [
      {
        condition: {
          field: "claimAmount",
          operator: ">=",
          value: "500000",
          currency: "INR"
        },
        action: {
          type: "APPROVAL_ROUTING",
          target: "MANAGER_L1",
          priority: "HIGH"
        }
      },
      {
        condition: {
          field: "customerTier",
          operator: "==",
          value: "VIP"
        },
        action: {
          type: "EXPEDITE",
          target: "SENIOR_PARTNER"
        }
      }
    ],
    reviewer_insights: [
      {
        type: "efficiency",
        title: "Efficiency Optimization",
        description: "Swap logic order: Checking 'VIP' tier first reduces database lookup rounds for claims under the threshold. Expected gain: 12ms/req.",
        suggested_action: "Apply Fix"
      },
      {
        type: "bias",
        title: "Potential Bias Detected",
        description: "The term 'Manager Approval' without a specified SLA might cause workflow bottlenecks for specific localized claim clusters.",
        suggested_action: "View Details"
      }
    ],
    status: "DRAFT"
  });

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setRule(null);

    try {
      const response = await fetch("/api/translate-rule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policy: inputText })
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setRule(data);
    } catch (err) {
      console.error(err);
      setRule({
        rule_id: "ERR_TRANS_404",
        logic_gates: [],
        reviewer_insights: [],
        status: "FAILED_TO_CONNECT"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!rule) return;
    navigator.clipboard.writeText(JSON.stringify(rule.logic_gates, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimizationClick = (index: number) => {
    if (!rule) return;
    
    if (rule.reviewer_insights[index].suggested_action === "Apply Fix") {
      const updatedGates = [...rule.logic_gates];
      if (updatedGates.length >= 2) {
        const temp = updatedGates[0];
        updatedGates[0] = updatedGates[1];
        updatedGates[1] = temp;
      }

      const updatedInsights = [...rule.reviewer_insights];
      updatedInsights[index] = {
        ...updatedInsights[index],
        description: "Optimization Applied! Decision tree order updated inside active cache.",
        suggested_action: "Applied ✓"
      };

      setRule({
        ...rule,
        logic_gates: updatedGates,
        reviewer_insights: updatedInsights
      });
    } else {
      alert(`Details for: "${rule.reviewer_insights[index].title}"\n\nExplanation: ${rule.reviewer_insights[index].description}`);
    }
  };

  const generateFlowElements = (ruleGates: RuleLogicGate[] | undefined) => {
    if (!ruleGates) return { nodes: [], edges: [] };
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    nodes.push({
      id: "start",
      position: { x: 250, y: 0 },
      data: { label: "Incoming Evaluation" },
      style: { background: 'white', color: 'var(--color-text-primary)', border: '1px solid var(--color-accent-primary)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }
    });

    ruleGates.forEach((gate, i) => {
      const condId = `cond_${i}`;
      const actionId = `act_${i}`;
      
      nodes.push({
        id: condId,
        position: { x: 250, y: (i + 1) * 100 },
        data: { label: `${gate.condition.field} ${gate.condition.operator} ${gate.condition.value}` },
        style: { background: 'white', color: 'var(--color-text-secondary)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }
      });

      nodes.push({
        id: actionId,
        position: { x: 500, y: (i + 1) * 100 },
        data: { label: `${gate.action.type}: ${gate.action.target}` },
        style: { background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }
      });

      edges.push({
        id: `e_start_to_${condId}`,
        source: i === 0 ? "start" : `cond_${i-1}`,
        target: condId,
        label: i === 0 ? "" : "next gate",
        style: { stroke: 'var(--color-text-tertiary)' },
        animated: true
      });

      edges.push({
        id: `e_${condId}_to_${actionId}`,
        source: condId,
        target: actionId,
        label: "if match",
        style: { stroke: 'var(--color-success)' },
        animated: true
      });
    });

    return { nodes, edges };
  };

  const flowElements = rule ? generateFlowElements(rule.logic_gates) : { nodes: [], edges: [] };

  return (
    <div className="animate-fade-in flex-col gap-8">
      
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">RuleGPT Builder</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Input plain language rules or business policies; our core translator generates validated decision gates.
          </p>
        </div>
      </section>

      <div className="glass-card flex-col gap-4">
        <label className="text-caption" style={{ color: 'var(--color-accent-primary)' }}>
          Natural Language Policy Input
        </label>
        
        <form onSubmit={handleTranslate} className="flex-col gap-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="E.g. If credit threshold is under 700 units and transactional region is international, flag for compliance V-1 verification immediately."
            className="input-glass"
            style={{ resize: 'none', height: '100px', fontSize: '1rem', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}
          ></textarea>

          <div className="flex-row justify-between items-center mt-2">
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontWeight: 500 }}>
              Powered by Groq Llama 3.3 ML Engine
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? (
                <>
                  <div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-pulse-slow"></div>
                  Generating Decision Gates...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Translate to Logic Gates
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="animate-pulse-slow">
          <div className="glass-card" style={{ height: '384px' }}></div>
          <div className="glass-card" style={{ height: '384px' }}></div>
        </div>
      )}

      {!isLoading && rule && (
        <div className="flex-col gap-6">
          
          <div className="glass-panel p-6 flex-row justify-between items-center border-l" style={{ borderLeft: '4px solid var(--color-accent-primary)' }}>
            <div className="flex-row items-center gap-6">
              <div>
                <span className="text-caption">Rule Identifier</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>{rule.rule_id}</span>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(0,0,0,0.1)' }} className="hidden sm:block"></div>
              <div>
                <span className="text-caption">Hashed Revision</span>
                <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>SHA-256: 8b2a3fa4b6f8...</span>
              </div>
            </div>
            
            <div className="flex-row items-center gap-3">
              <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                {rule.status}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '1.5rem' }}>
            
            <div className="glass-card flex-col" style={{ padding: 0, height: '500px', overflow: 'hidden' }}>
              <div className="flex-row justify-between items-center p-4 border-b" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <span className="text-caption flex-row items-center gap-2">
                  <Terminal size={14} color="var(--color-text-primary)" />
                  Aether Logic Gates (JSON)
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  {copied ? <ClipboardCheck size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Logic"}
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', lineHeight: 1.6, background: '#f8fafc', color: '#334155', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                  <pre>
                    <span style={{ color: '#0f172a' }}>{"{"}</span>{"\n"}
                    {"  "}<span style={{ color: '#0369a1' }}>&quot;rule_id&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{rule.rule_id}&quot;</span>,{"\n"}
                    {"  "}<span style={{ color: '#0369a1' }}>&quot;logic_gates&quot;</span>: <span style={{ color: '#0f172a' }}>{"["}</span>{"\n"}
                    {rule.logic_gates.map((gate, i) => (
                      <React.Fragment key={i}>
                        {"    "}<span style={{ color: '#0f172a' }}>{"{"}</span>{"\n"}
                        {"      "}<span style={{ color: '#0369a1' }}>&quot;condition&quot;</span>: <span style={{ color: '#0f172a' }}>{"{"}</span>{"\n"}
                        {"        "}<span style={{ color: '#0369a1' }}>&quot;field&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.condition.field}&quot;</span>,{"\n"}
                        {"        "}<span style={{ color: '#0369a1' }}>&quot;operator&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.condition.operator}&quot;</span>,{"\n"}
                        {"        "}<span style={{ color: '#0369a1' }}>&quot;value&quot;</span>: <span style={{ color: '#ea580c' }}>{typeof gate.condition.value === "string" ? `"${gate.condition.value}"` : gate.condition.value}</span>
                        {gate.condition.currency ? (
                          <>
                            ,{"\n"}{"        "}<span style={{ color: '#0369a1' }}>&quot;currency&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.condition.currency}&quot;</span>
                          </>
                        ) : ""}
                        {"\n"}
                        {"      "}<span style={{ color: '#0f172a' }}>{"}"}</span>,{"\n"}
                        {"      "}<span style={{ color: '#0369a1' }}>&quot;action&quot;</span>: <span style={{ color: '#0f172a' }}>{"{"}</span>{"\n"}
                        {"        "}<span style={{ color: '#0369a1' }}>&quot;type&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.action.type}&quot;</span>,{"\n"}
                        {"        "}<span style={{ color: '#0369a1' }}>&quot;target&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.action.target}&quot;</span>
                        {gate.action.priority ? (
                          <>
                            ,{"\n"}{"        "}<span style={{ color: '#0369a1' }}>&quot;priority&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{gate.action.priority}&quot;</span>
                          </>
                        ) : ""}
                        {"\n"}
                        {"      "}<span style={{ color: '#0f172a' }}>{"}"}</span>{"\n"}
                        {"    "}<span style={{ color: '#0f172a' }}>{"}"}</span>{i < rule.logic_gates.length - 1 ? "," : ""}{"\n"}
                      </React.Fragment>
                    ))}
                    {"  "}<span style={{ color: '#0f172a' }}>{"]"}</span>,{"\n"}
                    {"  "}<span style={{ color: '#0369a1' }}>&quot;status&quot;</span>: <span style={{ color: '#16a34a' }}>&quot;{rule.status}&quot;</span>{"\n"}
                    <span style={{ color: '#0f172a' }}>{"}"}</span>
                  </pre>
                </div>
                <div style={{ flex: 1.2, background: 'rgba(255,255,255,0.5)', position: 'relative', height: '100%' }}>
                  <ReactFlow nodes={flowElements.nodes} edges={flowElements.edges} fitView>
                    <Background color="#cbd5e1" gap={16} />
                    <Controls style={{ boxShadow: 'var(--shadow-sm)', border: 'none' }} />
                  </ReactFlow>
                </div>
              </div>
            </div>

            <div className="flex-col gap-5">
              
              <div className="glass-panel p-5">
                <div className="flex-row items-center gap-2 text-caption mb-3">
                  <Brain size={14} color="var(--color-accent-primary)" />
                  Original Policy Input Summary
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                  &quot;{rule.original_rule || inputText}&quot;
                </p>
              </div>

              <div className="flex-col gap-4">
                <div className="flex-row items-center gap-2 text-caption" style={{ color: 'var(--color-accent-secondary)' }}>
                  <span className="relative flex-row items-center justify-center w-1.5 h-1.5">
                    <span className="absolute w-full h-full rounded-full bg-violet-400 opacity-75 animate-pulse"></span>
                    <span className="relative rounded-full h-1.5 w-1.5 bg-violet-500"></span>
                  </span>
                  Shadow AI Reviewer Insights
                </div>

                {rule.reviewer_insights.map((insight, idx) => {
                  const isApplied = insight.suggested_action === "Applied ✓";
                  return (
                    <div 
                      key={idx}
                      style={{
                        padding: '1.25rem',
                        border: `1px solid ${insight.type === "bias" ? 'rgba(245, 158, 11, 0.3)' : isApplied ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0,0,0,0.05)'}`,
                        borderRadius: '16px',
                        background: insight.type === "bias" ? 'rgba(245, 158, 11, 0.05)' : isApplied ? 'rgba(16, 185, 129, 0.05)' : 'white',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div>
                        <div className="flex-row justify-between items-start gap-3 mb-2">
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{insight.title}</span>
                          <span className={`badge ${insight.type === "bias" ? "badge-warning" : isApplied ? "badge-success" : ""}`} style={!(insight.type === "bias" || isApplied) ? { background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)' } : {}}>
                            {insight.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                          {insight.description}
                        </p>
                      </div>

                      <div className="mt-4 flex-row justify-end">
                        <button
                          onClick={() => handleOptimizationClick(idx)}
                          disabled={isApplied}
                          className="badge"
                          style={{
                            padding: '0.4rem 0.8rem',
                            cursor: isApplied ? 'default' : 'pointer',
                            background: isApplied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                            color: isApplied ? 'var(--color-success)' : 'var(--color-accent-primary)',
                            border: 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {insight.suggested_action}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {rule.reviewer_insights.length === 0 && (
                  <div style={{ padding: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontWeight: 500, fontStyle: 'italic' }}>
                    All optimization audits cleared. No recommendations.
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
