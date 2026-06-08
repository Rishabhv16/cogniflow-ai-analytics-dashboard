import React, { useState } from "react";
import { Ghost, ShieldAlert, AlertTriangle, CheckCircle, XCircle, Search, Zap } from "lucide-react";

export default function ShadowReviewerView() {
  const [ruleId, setRuleId] = useState("CLM_PRO_005");
  const [policyText, setPolicyText] = useState(
    "Claims above ₹5 lakh require manager approval. If the claim is from a VIP customer, expedite to senior partner immediately."
  );
  const [logicGates, setLogicGates] = useState(JSON.stringify([
    { condition: { field: "claimAmount", operator: ">=", value: "500000" }, action: { type: "APPROVAL_ROUTING", target: "MANAGER_L1" } },
    { condition: { field: "customerTier", operator: "==", value: "VIP" }, action: { type: "EXPEDITE", target: "SENIOR_PARTNER" } }
  ], null, 2));
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      let gates: any[] = [];
      try { gates = JSON.parse(logicGates); } catch {}
      const res = await fetch("/api/shadow-reviewer/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_id: ruleId, logic_gates: gates, policy_text: policyText })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const verdictConfig: Record<string, { color: string; icon: any; label: string }> = {
    APPROVED: { color: 'var(--color-success)', icon: CheckCircle, label: 'Rule Approved — No Issues Found' },
    REVIEW_REQUIRED: { color: 'var(--color-warning)', icon: AlertTriangle, label: 'Review Required Before Deployment' },
    BLOCKED: { color: 'var(--color-danger)', icon: XCircle, label: 'Rule Blocked — Critical Bias Detected' }
  };

  return (
    <div className="animate-fade-in flex-col gap-8">
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Shadow AI Reviewer</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Autonomous bias detection, rule conflict analysis, and coverage gap scanner. Runs silently in parallel with every rule deployment.
          </p>
        </div>
      </section>

      <div className="glass-card flex-col gap-5">
        <form onSubmit={handleAudit} className="flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <div className="flex-col gap-2">
              <label className="text-caption">Rule ID</label>
              <input value={ruleId} onChange={e => setRuleId(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
              <label className="text-caption mt-2">Policy Text</label>
              <textarea value={policyText} onChange={e => setPolicyText(e.target.value)} rows={4}
                className="input-glass" style={{ resize: 'none', fontSize: '0.875rem', lineHeight: 1.5 }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Logic Gates (JSON)</label>
              <textarea value={logicGates} onChange={e => setLogicGates(e.target.value)} rows={10}
                className="input-glass" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', resize: 'none' }} />
            </div>
          </div>
          <div className="flex-row justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <><div style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} className="animate-pulse-slow" />Scanning...</> : <><Ghost size={16} />Run Shadow Review</>}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="flex-col gap-6 animate-fade-in">
          {/* Verdict Banner */}
          {(() => {
            const cfg = verdictConfig[result.overall_verdict] || verdictConfig.REVIEW_REQUIRED;
            const Icon = cfg.icon;
            return (
              <div className="glass-card flex-row items-center gap-6" style={{ borderLeft: `4px solid ${cfg.color}` }}>
                <Icon size={32} color={cfg.color} />
                <div className="flex-col gap-1 flex-1">
                  <span className="text-caption">Shadow Review Verdict</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="flex-row gap-6">
                  <div className="text-center">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: result.bias_score > 0.3 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                      {(result.bias_score * 100).toFixed(0)}%
                    </div>
                    <span className="text-caption">Bias Score</span>
                  </div>
                  <div className="text-center">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent-primary)' }}>
                      {(result.coverage_score * 100).toFixed(0)}%
                    </div>
                    <span className="text-caption">Coverage</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            {/* Bias Flags */}
            <div className="glass-card flex-col gap-4">
              <h3 className="text-h3 border-b pb-3 flex-row items-center gap-2" style={{ fontSize: '0.9375rem' }}>
                <ShieldAlert size={14} color="var(--color-danger)" />
                Bias Flags ({result.bias_flags.length})
              </h3>
              {result.bias_flags.length === 0 ? (
                <div className="flex-row items-center gap-2" style={{ color: 'var(--color-success)', padding: '1rem 0' }}>
                  <CheckCircle size={16} /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>No protected attributes detected</span>
                </div>
              ) : result.bias_flags.map((flag: any, i: number) => (
                <div key={i} style={{ padding: '0.875rem', background: flag.severity === 'HIGH' ? 'rgba(244,63,94,0.05)' : 'rgba(245,158,11,0.05)',
                  border: `1px solid ${flag.severity === 'HIGH' ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: '10px' }}>
                  <div className="flex-row justify-between items-center mb-2">
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem' }}>{flag.field_in_rule}</span>
                    <span className={`badge ${flag.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>{flag.severity}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{flag.recommendation}</p>
                </div>
              ))}
            </div>

            {/* Conflict Flags */}
            <div className="glass-card flex-col gap-4">
              <h3 className="text-h3 border-b pb-3 flex-row items-center gap-2" style={{ fontSize: '0.9375rem' }}>
                <Zap size={14} color="var(--color-warning)" />
                Conflicts ({result.conflict_flags.length})
              </h3>
              {result.conflict_flags.length === 0 ? (
                <div className="flex-row items-center gap-2" style={{ color: 'var(--color-success)', padding: '1rem 0' }}>
                  <CheckCircle size={16} /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>No overlapping conditions detected</span>
                </div>
              ) : result.conflict_flags.map((cf: any, i: number) => (
                <div key={i} style={{ padding: '0.875rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px' }}>
                  <span className="badge badge-warning" style={{ marginBottom: '0.5rem', display: 'block', width: 'fit-content' }}>{cf.conflict_type}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{cf.description}</p>
                </div>
              ))}
            </div>

            {/* Coverage Gaps */}
            <div className="glass-card flex-col gap-4">
              <h3 className="text-h3 border-b pb-3 flex-row items-center gap-2" style={{ fontSize: '0.9375rem' }}>
                <Search size={14} color="var(--color-info)" />
                Coverage Gaps ({result.coverage_gaps.length})
              </h3>
              {result.coverage_gaps.length === 0 ? (
                <div className="flex-row items-center gap-2" style={{ color: 'var(--color-success)', padding: '1rem 0' }}>
                  <CheckCircle size={16} /><span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Full scenario coverage</span>
                </div>
              ) : result.coverage_gaps.map((gap: any, i: number) => (
                <div key={i} style={{ padding: '0.875rem', background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>{gap.scenario}</div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-accent-primary)', background: 'rgba(99,102,241,0.05)', padding: '0.375rem 0.625rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    + {gap.missing_condition}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{gap.suggested_fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
