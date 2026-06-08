import React, { useState } from "react";
import { Clock, Play, RefreshCw, TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Rocket } from "lucide-react";
import { ReactFlow, Background, Controls, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function TimeMachineView() {
  const [ruleId, setRuleId] = useState("CLM_PRO_005");
  const [scenario, setScenario] = useState("baseline");
  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2024-03-31");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleReplay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/time-machine/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rule_id: ruleId, historical_date_range: [dateFrom, dateTo], scenario })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRecColor = (rec: string) =>
    rec?.includes("APPROVE") ? "var(--color-success)" : rec?.includes("REVIEW") ? "var(--color-warning)" : "var(--color-danger)";

  const chartPoints = result?.monte_carlo_sample || [];
  const maxApproval = Math.max(...chartPoints.map((p: any) => p.approval_rate), 100);
  const svgH = 160;

  return (
    <div className="animate-fade-in flex-col gap-8">
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Decision Time Machine</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Replay historical rule executions and run Monte Carlo simulations to predict deployment confidence before going live.
          </p>
        </div>
      </section>

      {/* Config */}
      <div className="glass-card flex-col gap-5" style={{ borderLeft: '4px solid var(--color-accent-secondary)' }}>
        <div className="text-caption" style={{ color: 'var(--color-accent-secondary)' }}>⏱ Simulation Configuration</div>
        <form onSubmit={handleReplay} className="flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <div className="flex-col gap-2">
              <label className="text-caption">Rule ID</label>
              <input value={ruleId} onChange={e => setRuleId(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Scenario</label>
              <select value={scenario} onChange={e => setScenario(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }}>
                <option value="baseline">Baseline</option>
                <option value="stress_test">Stress Test</option>
                <option value="optimistic">Optimistic</option>
              </select>
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Date From</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
            <div className="flex-col gap-2">
              <label className="text-caption">Date To</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-glass" style={{ padding: '0.625rem 1rem' }} />
            </div>
          </div>
          <div className="flex-row justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? <><RefreshCw size={16} className="animate-spin" />Running Monte Carlo...</> : <><Play size={16} />Run Simulation</>}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="flex-col gap-6 animate-fade-in">
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
            {[
              { label: "Simulated Outcomes", value: result.simulated_outcomes?.toLocaleString(), color: 'var(--color-accent-primary)', trend: null },
              { label: "Confidence Score", value: `${result.confidence_score}%`, color: 'var(--color-success)', trend: null },
              { label: "Baseline Approval", value: `${result.approval_rate_baseline}%`, color: 'var(--color-text-primary)', trend: null },
              { label: "Simulated Approval", value: `${result.approval_rate_simulated}%`, color: 'var(--color-info)', trend: result.approval_rate_simulated > result.approval_rate_baseline ? "up" : "down" },
              { label: "Revenue Delta", value: `${result.revenue_delta_pct > 0 ? '+' : ''}${result.revenue_delta_pct}%`, color: result.revenue_delta_pct > 0 ? 'var(--color-success)' : 'var(--color-danger)', trend: result.revenue_delta_pct > 0 ? "up" : "down" },
            ].map((card, i) => (
              <div key={i} className="glass-card flex-col">
                <span className="text-caption">{card.label}</span>
                <div className="flex-row items-center gap-2 mt-2">
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color }}>{card.value}</span>
                  {card.trend === "up" && <TrendingUp size={16} color="var(--color-success)" />}
                  {card.trend === "down" && <TrendingDown size={16} color="var(--color-danger)" />}
                </div>
              </div>
            ))}
          </div>

          {/* Monte Carlo Chart */}
          <div className="glass-card flex-col gap-4">
            <div className="flex-row justify-between items-center border-b pb-3">
              <h3 className="text-h3" style={{ fontSize: '0.9375rem' }}>Monte Carlo Approval Distribution (20 iterations)</h3>
              <span className="badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--color-accent-primary)' }}>
                {scenario.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <svg style={{ width: '100%', height: svgH }} preserveAspectRatio="none" viewBox={`0 0 400 ${svgH}`}>
              <defs>
                <linearGradient id="mcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {chartPoints.length > 0 && (() => {
                const pts = chartPoints.map((p: any, i: number) => ({
                  x: (i / (chartPoints.length - 1)) * 380 + 10,
                  y: svgH - (p.approval_rate / 100) * (svgH - 20) - 10
                }));
                const lineD = pts.map((p: any, i: number) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(" ");
                const areaD = lineD + ` L${pts[pts.length-1].x},${svgH} L${pts[0].x},${svgH} Z`;
                return <>
                  <path d={areaD} fill="url(#mcGrad)" />
                  <path d={lineD} fill="none" stroke="var(--color-accent-primary)" strokeWidth="2.5" />
                  {pts.map((p: any, i: number) => (
                    <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--color-accent-primary)" />
                  ))}
                </>;
              })()}
            </svg>
          </div>

          {/* Deployment Recommendation */}
          <div className="glass-card flex-row items-center gap-6" style={{
            borderLeft: `4px solid ${getRecColor(result.deployment_recommendation)}`
          }}>
            {result.deployment_recommendation?.includes("APPROVE") ? (
              <CheckCircle size={32} color="var(--color-success)" />
            ) : (
              <AlertTriangle size={32} color={getRecColor(result.deployment_recommendation)} />
            )}
            <div className="flex-col gap-1">
              <span className="text-caption">Deployment Recommendation</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: getRecColor(result.deployment_recommendation) }}>
                {result.deployment_recommendation}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Based on {result.simulated_outcomes?.toLocaleString()} Monte Carlo iterations with {result.confidence_score}% confidence score.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
