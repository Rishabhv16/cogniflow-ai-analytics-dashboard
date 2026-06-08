import React, { useState } from "react";
import { Eye, Brain, Zap, ArrowRight, ChevronDown, CheckCircle, AlertCircle, Info, Play } from "lucide-react";

export default function ExplainabilityView() {
  const [ruleId, setRuleId] = useState("CLM_PRO_005");
  const [outcome, setOutcome] = useState("APPROVED");
  const [contextData, setContextData] = useState(
    JSON.stringify({ claimAmount: 750000, customerTier: "VIP", creditScore: 720, region: "IN" }, null, 2)
  );
  const [decisionPath, setDecisionPath] = useState([
    "Evaluating: claimAmount >= 500000",
    "MATCHED: claimAmount >= 500000 -> Triggering APPROVAL_ROUTING",
    "Evaluating: customerTier == 'VIP'",
    "MATCHED: customerTier == 'VIP' -> Triggering EXPEDITE"
  ].join("\n"));

  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      let parsedContext: any = {};
      try { parsedContext = JSON.parse(contextData); } catch {}
      const res = await fetch("/api/explainability/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_id: ruleId, outcome,
          context_data: parsedContext,
          decision_path: decisionPath.split("\n").filter(Boolean)
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const factorEntries = result ? Object.entries(result.shap_factors as Record<string, number>)
    .sort((a, b) => (b[1] as number) - (a[1] as number)) : [];

  return (
    <div className="animate-fade-in flex-col gap-8">
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Explainability Agent</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Trace decision logic, compute factor importance (SHAP-style), generate counterfactuals, and produce audit-ready AI narratives.
          </p>
        </div>
      </section>

      {/* Input Panel */}
      <div className="glass-card flex-col gap-5">
        <div className="flex-row items-center gap-2 text-caption" style={{ color: 'var(--color-accent-primary)' }}>
          <Brain size={14} />
          Decision Analysis Input
        </div>
        <form onSubmit={handleAnalyze} className="flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="flex-col gap-2">
              <label className="text-caption">Rule ID</label>
              <input type="text" value={ruleId} onChange={e => setRuleId(e.target.value)}
                className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Outcome</label>
              <select value={outcome} onChange={e => setOutcome(e.target.value)}
                className="input-glass" style={{ padding: '0.625rem 1rem', cursor: 'pointer' }}>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="MANUAL_REVIEW">MANUAL_REVIEW</option>
              </select>
            </div>
          </div>
          <div className="flex-col gap-2">
            <label className="text-caption">Context Data (JSON)</label>
            <textarea value={contextData} onChange={e => setContextData(e.target.value)} rows={4}
              className="input-glass" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', resize: 'none' }} />
          </div>
          <div className="flex-col gap-2">
            <label className="text-caption">Decision Path (one step per line)</label>
            <textarea value={decisionPath} onChange={e => setDecisionPath(e.target.value)} rows={4}
              className="input-glass" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', resize: 'none' }} />
          </div>
          <div className="flex-row justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <><div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-pulse-slow" />Analyzing...</>
              ) : (<><Eye size={16} />Analyze Decision</>)}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="flex-col gap-6 animate-fade-in">
          {/* Narrative */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-accent-primary)' }}>
            <div className="flex-row items-center gap-2 text-caption mb-3" style={{ color: 'var(--color-accent-primary)' }}>
              <Brain size={14} />AI Audit Narrative
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {result.narrative}
            </p>
            <div className="flex-row gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <div>
                <span className="text-caption">Key Driver</span>
                <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-accent-primary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {result.key_driver}
                </span>
              </div>
              <div>
                <span className="text-caption">Confidence</span>
                <span style={{ display: 'block', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  {result.confidence}%
                </span>
              </div>
              <div>
                <span className="text-caption">Outcome</span>
                <span className={`badge ${result.outcome === 'APPROVED' ? 'badge-success' : result.outcome === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`} style={{ display: 'block', marginTop: '0.5rem' }}>
                  {result.outcome}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* SHAP Factor Chart */}
            <div className="glass-card flex-col gap-4">
              <h3 className="text-h3 border-b pb-3" style={{ fontSize: '0.9375rem' }}>Factor Importance (SHAP-style)</h3>
              {factorEntries.map(([field, weight], i) => (
                <div key={field} className="flex-col gap-1">
                  <div className="flex-row justify-between items-center">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>{field}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-accent-primary)' }}>
                      {((weight as number) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--color-bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px', transition: 'width 0.8s ease',
                      width: `${(weight as number) * 100}%`,
                      background: i === 0 ? 'var(--color-accent-primary)' : i === 1 ? 'var(--color-accent-secondary)' : 'var(--color-info)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Counterfactuals */}
            <div className="glass-card flex-col gap-4">
              <h3 className="text-h3 border-b pb-3" style={{ fontSize: '0.9375rem' }}>Counterfactuals — "What If?"</h3>
              {result.counterfactuals.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                  No counterfactuals found — all conditions are at exact thresholds.
                </div>
              ) : result.counterfactuals.map((cf: any, i: number) => (
                <div key={i} style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px' }}>
                  <div className="flex-row items-center gap-2 mb-2">
                    <Zap size={14} color="var(--color-warning)" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{cf.feature}</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <strong>Current:</strong> {cf.current_value} → <strong>If:</strong> {cf.required_change}
                  </p>
                  <div className="flex-row items-center gap-2 mt-2">
                    <ArrowRight size={12} color="var(--color-success)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)' }}>New Outcome: {cf.new_outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
