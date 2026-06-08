import React, { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, RefreshCw, Zap } from "lucide-react";

interface FeatureDrift {
  feature: string; psi_score: number; ks_statistic: number; ks_p_value: number;
  drift_level: string; baseline_mean: number; current_mean: number;
}

export default function DriftMonitorView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDrift = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/drift-monitor/status");
      const d = await res.json();
      setData(d);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchDrift(); }, []);

  const driftColors: Record<string, string> = {
    STABLE: 'var(--color-success)', MODERATE: 'var(--color-warning)', CRITICAL: 'var(--color-danger)'
  };
  const overallColors: Record<string, string> = {
    LOW: 'var(--color-success)', MEDIUM: 'var(--color-info)', HIGH: 'var(--color-warning)', CRITICAL: 'var(--color-danger)'
  };

  const PSI_MAX = 0.3;

  return (
    <div className="animate-fade-in flex-col gap-8">
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Policy Drift Monitor</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Real-time PSI and KS-test distribution shift detection across key decision features. Automatically flags stale policies for retraining.
          </p>
        </div>
        <button onClick={fetchDrift} disabled={isLoading}
          className="btn-secondary flex-row items-center gap-2">
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh Analysis
        </button>
      </section>

      {isLoading && !data && (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
          Running PSI / KS-test analysis...
        </div>
      )}

      {data && (
        <div className="flex-col gap-6">
          {/* Overall Status Banner */}
          <div className="glass-card flex-row items-center gap-6" style={{
            borderLeft: `4px solid ${overallColors[data.overall_staleness] || 'var(--color-info)'}`
          }}>
            {data.alert ? <AlertTriangle size={32} color={overallColors[data.overall_staleness]} /> : <CheckCircle size={32} color="var(--color-success)" />}
            <div className="flex-col gap-1 flex-1">
              <span className="text-caption">Policy Drift Status</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: overallColors[data.overall_staleness] }}>
                {data.overall_staleness} DRIFT — {data.auto_trigger_recommendation}
              </span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Last checked: {new Date(data.last_checked).toLocaleTimeString()} · Staleness index: {data.staleness_score}
              </span>
            </div>
            <div className="text-center px-6">
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: overallColors[data.overall_staleness] }}>
                {(data.staleness_score * 100).toFixed(1)}%
              </div>
              <span className="text-caption">Max PSI</span>
            </div>
          </div>

          {/* PSI Gauge Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {(data.features as FeatureDrift[]).map((feat) => {
              const psiPct = Math.min(100, (feat.psi_score / PSI_MAX) * 100);
              const driftColor = driftColors[feat.drift_level] || 'var(--color-info)';
              const changePct = ((feat.current_mean - feat.baseline_mean) / feat.baseline_mean * 100).toFixed(1);
              return (
                <div key={feat.feature} className="glass-card flex-col gap-4">
                  <div className="flex-row justify-between items-center">
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem' }}>{feat.feature}</span>
                      <span className={`badge ml-3 ${feat.drift_level === 'STABLE' ? 'badge-success' : feat.drift_level === 'MODERATE' ? 'badge-warning' : 'badge-danger'}`}>
                        {feat.drift_level}
                      </span>
                    </div>
                    {feat.drift_level !== 'STABLE' && <Zap size={16} color={driftColor} />}
                  </div>

                  {/* PSI Bar */}
                  <div>
                    <div className="flex-row justify-between items-center mb-2">
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>PSI Score</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: driftColor, fontSize: '0.875rem' }}>
                        {feat.psi_score.toFixed(4)}
                      </span>
                    </div>
                    <div style={{ position: 'relative', height: '10px', background: 'var(--color-bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                      {/* threshold markers */}
                      <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: '1px', background: 'rgba(245,158,11,0.4)' }} />
                      <div style={{ position: 'absolute', left: '67%', top: 0, bottom: 0, width: '1px', background: 'rgba(244,63,94,0.4)' }} />
                      <div style={{ height: '100%', width: `${psiPct}%`, background: driftColor, borderRadius: '5px', transition: 'width 0.8s ease' }} />
                    </div>
                    <div className="flex-row justify-between mt-1">
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary)' }}>0.0</span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-warning)' }}>0.1 moderate</span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-danger)' }}>0.2 critical</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    {[
                      { label: 'Baseline μ', value: feat.baseline_mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                      { label: 'Current μ', value: feat.current_mean.toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                      { label: 'Δ Change', value: `${Number(changePct) > 0 ? '+' : ''}${changePct}%`, color: Number(changePct) > 5 ? driftColor : 'var(--color-text-primary)' },
                    ].map(item => (
                      <div key={item.label} className="text-center">
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 800, color: item.color || 'var(--color-text-primary)' }}>{item.value}</div>
                        <div className="text-caption mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex-row justify-between text-caption" style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.04)' }}>
                    <span>KS Statistic: <strong style={{ color: 'var(--color-text-primary)' }}>{feat.ks_statistic}</strong></span>
                    <span>KS p-value: <strong style={{ color: feat.ks_p_value < 0.05 ? 'var(--color-danger)' : 'var(--color-success)' }}>{feat.ks_p_value}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Auto-Trigger Panel */}
          {data.alert && (
            <div className="glass-card animate-fade-in" style={{ background: 'rgba(244,63,94,0.03)', borderColor: 'rgba(244,63,94,0.2)' }}>
              <div className="flex-row items-center gap-4">
                <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', borderRadius: '12px' }}>
                  <AlertTriangle size={24} color="var(--color-danger)" />
                </div>
                <div className="flex-col gap-1 flex-1">
                  <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>Auto-Trigger Recommended</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{data.auto_trigger_recommendation}</span>
                </div>
                <button className="btn-primary" style={{ background: 'var(--color-danger)', boxShadow: '0 4px 12px rgba(244,63,94,0.3)' }}>
                  Trigger Retraining
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
