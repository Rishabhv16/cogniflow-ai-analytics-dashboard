import React, { useState } from "react";
import { GitBranch, Play, CheckCircle, TrendingUp, AlertCircle, Info, RefreshCw } from "lucide-react";

export default function OptimisationView() {
  const [ruleIdA, setRuleIdA] = useState("CLM_PRO_005_V1");
  const [ruleIdB, setRuleIdB] = useState("CLM_PRO_005_V2");
  const [metric, setMetric] = useState("approval_rate");
  const [sampleSize, setSampleSize] = useState("10000");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunABTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/optimisation/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule_id_a: ruleIdA,
          rule_id_b: ruleIdB,
          metric: metric,
          sample_size: parseInt(sampleSize)
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

  const isSignificant = result?.p_value < 0.05;

  return (
    <div className="animate-fade-in flex-col gap-8">
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Outcome Optimisation Agent</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Run automated A/B tests between rule variants to optimise for approval rates, revenue, or risk reduction.
          </p>
        </div>
      </section>

      {/* Config Panel */}
      <div className="glass-card flex-col gap-5">
        <div className="text-caption" style={{ color: 'var(--color-accent-primary)' }}>
          <GitBranch size={14} style={{ display: 'inline', marginRight: '8px' }} />
          A/B Test Configuration
        </div>
        <form onSubmit={handleRunABTest} className="flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="flex-col gap-2">
              <label className="text-caption">Control Rule (A)</label>
              <input value={ruleIdA} onChange={e => setRuleIdA(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Variant Rule (B)</label>
              <input value={ruleIdB} onChange={e => setRuleIdB(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Target Metric</label>
              <select value={metric} onChange={e => setMetric(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }}>
                <option value="approval_rate">Approval Rate</option>
                <option value="revenue">Revenue Impact</option>
                <option value="risk">Risk Score (Minimise)</option>
              </select>
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Sample Size</label>
              <input type="number" value={sampleSize} onChange={e => setSampleSize(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
          </div>
          <div className="flex-row justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <><RefreshCw size={16} className="animate-spin" />Running Experiment...</> : <><Play size={16} />Start A/B Test</>}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="flex-col gap-6 animate-fade-in">
          {/* Winner Banner */}
          <div className="glass-card flex-row items-center gap-6" style={{
            borderLeft: `4px solid ${isSignificant ? 'var(--color-success)' : 'var(--color-warning)'}`
          }}>
            {isSignificant ? <CheckCircle size={32} color="var(--color-success)" /> : <Info size={32} color="var(--color-warning)" />}
            <div className="flex-col gap-1 flex-1">
              <span className="text-caption">Experiment Result</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: isSignificant ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {result.recommendation}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Winning Variant: <strong style={{ color: 'var(--color-text-primary)' }}>{result.winner}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Stats Card A */}
            <div className={`glass-card flex-col gap-4 ${result.winner === result.rule_id_a ? 'border-accent' : ''}`}
                 style={result.winner === result.rule_id_a ? { borderColor: 'var(--color-accent-primary)', borderWidth: '2px' } : {}}>
              <div className="flex-row justify-between items-center border-b pb-3">
                <h3 className="text-h3" style={{ fontSize: '0.9375rem' }}>Variant A (Control)</h3>
                {result.winner === result.rule_id_a && <span className="badge badge-success">WINNER</span>}
              </div>
              <div className="flex-col gap-1">
                <span className="text-caption">Rule ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{result.rule_id_a}</span>
              </div>
              <div className="flex-row justify-between mt-2">
                <div className="flex-col gap-1">
                  <span className="text-caption">Sample Size</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.sample_a.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stats Card B */}
            <div className={`glass-card flex-col gap-4 ${result.winner === result.rule_id_b ? 'border-accent' : ''}`}
                 style={result.winner === result.rule_id_b ? { borderColor: 'var(--color-accent-primary)', borderWidth: '2px' } : {}}>
              <div className="flex-row justify-between items-center border-b pb-3">
                <h3 className="text-h3" style={{ fontSize: '0.9375rem' }}>Variant B (Test)</h3>
                {result.winner === result.rule_id_b && <span className="badge badge-success">WINNER</span>}
              </div>
              <div className="flex-col gap-1">
                <span className="text-caption">Rule ID</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{result.rule_id_b}</span>
              </div>
              <div className="flex-row justify-between mt-2">
                <div className="flex-col gap-1">
                  <span className="text-caption">Sample Size</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{result.sample_b.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="glass-card flex-col text-center">
              <span className="text-caption">Target Metric</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginTop: '0.5rem', textTransform: 'capitalize' }}>
                {result.metric.replace("_", " ")}
              </span>
            </div>
            <div className="glass-card flex-col text-center">
              <span className="text-caption">Uplift vs Control</span>
              <div className="flex-row items-center justify-center gap-2 mt-2">
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: result.uplift_pct > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {result.uplift_pct > 0 ? '+' : ''}{result.uplift_pct}%
                </span>
                {result.uplift_pct > 0 ? <TrendingUp size={20} color="var(--color-success)" /> : <TrendingUp size={20} color="var(--color-danger)" style={{ transform: 'rotate(180deg)' }}/>}
              </div>
            </div>
            <div className="glass-card flex-col text-center">
              <span className="text-caption">Statistical Significance (p-value)</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isSignificant ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '0.5rem' }}>
                {result.p_value}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                {isSignificant ? '< 0.05 (Significant)' : '>= 0.05 (Not Significant)'}
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
