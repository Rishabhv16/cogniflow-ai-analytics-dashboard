import React, { useState } from "react";
import { 
  RefreshCw, 
  Lightbulb, 
  Rocket, 
  Lock, 
  UserSearch, 
  Globe, 
  Bolt, 
  Sparkles, 
  Star, 
  Plus, 
  Pause, 
  Play,
  RotateCcw,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SimulationLabView() {
  const [dataset, setDataset] = useState("Historical Transactions Q4-2023");
  const [timeHorizon, setTimeHorizon] = useState("90Days");
  const [interestSensitivity, setInterestSensitivity] = useState(75); 
  const [riskThreshold, setRiskThreshold] = useState(40); 
  const [approvalAggression, setApprovalAggression] = useState(85); 

  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(88);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSuccessDeploy, setHasSuccessDeploy] = useState(false);

  const [computedApproval, setComputedApproval] = useState("18.4");
  const [computedRevenue, setComputedRevenue] = useState("1.2");
  const [computedRisk, setComputedRisk] = useState("4.1");

  const startSimulationRun = async () => {
    setIsSimulating(true);
    setProgress(0);
    
    setComputedApproval("--");
    setComputedRevenue("--");
    setComputedRisk("--");

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 15, 95));
    }, 200);

    try {
      const res = await fetch("/api/simulation/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalAggression,
          interestSensitivity,
          riskThreshold
        })
      });
      const data = await res.json();
      
      clearInterval(interval);
      setProgress(100);
      
      setComputedApproval(data.computedApproval.toString());
      setComputedRevenue(data.computedRevenue.toString());
      setComputedRisk(data.computedRisk.toString());
      
      setTimeout(() => setIsSimulating(false), 500);
    } catch (err) {
      clearInterval(interval);
      setIsSimulating(false);
      console.error("Simulation failed", err);
    }
  };

  const resetSimSettings = () => {
    setInterestSensitivity(75);
    setRiskThreshold(40);
    setApprovalAggression(85);
    setProgress(0);
    setIsSimulating(false);
    setComputedApproval("18.4");
    setComputedRevenue("1.2");
    setComputedRisk("4.1");
  };

  const handleStageDeploy = () => {
    setHasSuccessDeploy(true);
    setTimeout(() => {
      setHasSuccessDeploy(false);
    }, 4000);
  };

  return (
    <div className="animate-fade-in flex-col gap-8">
      
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Simulation Lab</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Design, stress-test, and validate autonomous decision policies using synthetic or historical datasets before production deployment.
          </p>
        </div>
        <div className="flex-row gap-3">
          <button 
            onClick={resetSimSettings}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            Reset Simulation
          </button>
          <button 
            onClick={handleStageDeploy}
            className="btn-primary flex-row items-center gap-2"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
          >
            <Rocket size={14} />
            {hasSuccessDeploy ? "Deployed to Staging!" : "Deploy to Staging"}
          </button>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 9fr', gap: '1.5rem' }}>
        
        <div className="flex-col gap-6">
          <div className="glass-card flex-col gap-6" style={{ borderLeft: '4px solid var(--color-accent-primary)' }}>
            <h3 className="flex-row items-center gap-2 text-caption">
              <span style={{ color: 'var(--color-accent-primary)' }}>⚙️</span>
              Simulation Configuration
            </h3>

            <div className="flex-col gap-6">
              <div className="flex-col gap-2">
                <label className="text-caption">Primary Dataset</label>
                <select 
                  value={dataset}
                  onChange={(e) => setDataset(e.target.value)}
                  className="input-glass"
                  style={{ width: '100%', padding: '0.625rem 1rem', cursor: 'pointer' }}
                >
                  <option value="Historical Transactions Q4-2023">Historical Transactions Q4-2023</option>
                  <option value="Synthetic Stress-Test (High Volatility)">Synthetic Stress-Test (High Volatility)</option>
                  <option value="Retail Baseline Beta-1">Retail Baseline Beta-1</option>
                </select>
              </div>

              <div className="flex-col gap-2">
                <label className="text-caption">Time Horizon</label>
                <div className="flex-row gap-2">
                  {[
                    { id: "90Days", label: "90 Days" },
                    { id: "180Days", label: "180 Days" },
                    { id: "1Year", label: "1 Year" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTimeHorizon(item.id)}
                      style={{
                        flex: 1,
                        padding: '0.5rem 0',
                        borderRadius: '6px',
                        fontSize: '0.625rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        transition: 'all 0.2s ease',
                        background: timeHorizon === item.id ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                        color: timeHorizon === item.id ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                        border: timeHorizon === item.id ? '1px solid var(--color-accent-primary)' : '1px solid transparent',
                        cursor: 'pointer'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-col gap-5 pt-4 border-t">
                <label className="text-caption">What-if Analysis</label>
                
                <div className="flex-col gap-2">
                  <div className="flex-row justify-between items-center text-caption" style={{ textTransform: 'none', letterSpacing: 'normal', color: 'var(--color-text-secondary)' }}>
                    <span>Interest Sensitivity</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>+{((interestSensitivity - 50) / 10).toFixed(1)}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={interestSensitivity}
                    onChange={(e) => setInterestSensitivity(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div className="flex-col gap-2">
                  <div className="flex-row justify-between items-center text-caption" style={{ textTransform: 'none', letterSpacing: 'normal', color: 'var(--color-text-secondary)' }}>
                    <span>Risk Threshold (α)</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent-primary)' }}>{(riskThreshold / 330).toFixed(2)}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>

                <div className="flex-col gap-2">
                  <div className="flex-row justify-between items-center text-caption" style={{ textTransform: 'none', letterSpacing: 'normal', color: 'var(--color-text-secondary)' }}>
                    <span>Approval Aggression</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-info)' }}>{approvalAggression > 70 ? "High" : approvalAggression > 40 ? "Medium" : "Low"}</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={approvalAggression}
                    onChange={(e) => setApprovalAggression(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <button 
                onClick={startSimulationRun}
                disabled={isSimulating}
                className="btn-secondary flex-row items-center justify-center gap-2 w-full mt-2"
                style={{ background: 'var(--color-bg-primary)', color: 'var(--color-accent-primary)', border: '1px solid var(--color-accent-primary)' }}
              >
                <RefreshCw size={14} className={isSimulating ? "animate-spin" : ""} />
                Rerun Simulation
              </button>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.08)' }}>
            <div className="flex-row items-center gap-2 mb-2" style={{ color: 'var(--color-accent-secondary)' }}>
              <Lightbulb size={16} />
              <span className="text-caption" style={{ color: 'var(--color-accent-secondary)' }}>Simulation Tip</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, fontStyle: 'italic', fontWeight: 500 }}>
              Increasing 'Risk Threshold' by 5% could unlock $4.2M in annual revenue while maintaining current liquidation ratios.
            </p>
          </div>
        </div>

        <div className="flex-col gap-6">
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-card flex-col">
              <span className="text-caption">Approval Rate</span>
              <div className="flex-row items-end gap-2 mt-2">
                <span className="text-h1" style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>+{computedApproval}%</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Predictive Boost</span>
              </div>
            </div>

            <div className="glass-card flex-col">
              <span className="text-caption">Revenue Delta</span>
              <div className="flex-row items-end gap-2 mt-2">
                <span className="text-h1" style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>+${computedRevenue}M</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Est. Quarterly</span>
              </div>
            </div>

            <div className="glass-card flex-col" style={{ background: 'rgba(244, 63, 94, 0.05)', borderRight: '4px solid var(--color-danger)' }}>
              <span className="text-caption">Default Risk</span>
              <div className="flex-row items-end gap-2 mt-2">
                <span className="text-h1" style={{ fontSize: '1.5rem', color: 'var(--color-danger)' }}>+{computedRisk}%</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Risk Exposure</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            <div className="glass-card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="flex-row justify-between items-center p-4 border-b" style={{ background: 'rgba(255,255,255,0.4)' }}>
                <span className="text-caption">Current Policy: v2.4.8 (Baseline)</span>
                <span className="badge">Stable</span>
              </div>
              
              <div className="flex-col gap-6 p-5">
                <div style={{ position: 'relative', height: '128px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', padding: '1rem', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 400 100" className="animate-pulse-slow">
                    <path d="M0,80 Q50,75 100,78 T200,60 T300,65 T400,55" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.5"></path>
                    <path d="M0,80 Q50,75 100,78 T200,60 T300,65 T400,55 V100 H0 Z" fill="rgba(0,0,0,0.02)"></path>
                  </svg>
                  <span style={{ position: 'absolute', bottom: '8px', left: '16px', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-tertiary)' }}>Performance Stability Matrix</span>
                </div>

                <div className="flex-col gap-3">
                  <h4 className="text-caption border-b pb-2">Rule Stack</h4>
                  <div className="flex-col gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                      <span>IF credit_score &lt; 680 THEN reject</span>
                      <Lock size={14} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                      <span>IF debt_to_income &gt; 40% THEN manual_review</span>
                      <UserSearch size={14} style={{ opacity: 0.5 }} />
                    </div>
                    <div style={{ padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
                      <span>IF country != 'US' THEN risk_flag_high</span>
                      <Globe size={14} style={{ opacity: 0.5 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card flex-col" style={{ padding: 0, overflow: 'hidden', position: 'relative', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--color-accent-primary)' }}></div>
              <div className="flex-row justify-between items-center p-4 border-b" style={{ background: 'rgba(99, 102, 241, 0.05)' }}>
                <span className="text-caption" style={{ color: 'var(--color-accent-primary)' }}>Proposed Policy: AI-CHAMPION-01</span>
                <span className="badge animate-pulse-slow" style={{ background: 'var(--color-bg-primary)', color: 'var(--color-accent-primary)', border: '1px solid var(--color-accent-primary)' }}>Challenger</span>
              </div>

              <div className="flex-col gap-6 p-5">
                <div style={{ position: 'relative', height: '128px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '12px', padding: '1rem', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                  <svg style={{ width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 400 100">
                    <path d="M0,80 Q50,60 100,55 T200,30 T300,45 T400,20" fill="none" stroke="var(--color-success)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))' }}></path>
                    <path d="M0,80 Q50,60 100,55 T200,30 T300,45 T400,20 V100 H0 Z" fill="rgba(16, 185, 129, 0.1)"></path>
                  </svg>
                  <span style={{ position: 'absolute', bottom: '8px', left: '16px', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-success)' }}>Projected Conversion Trajectory</span>
                </div>

                <div className="flex-col gap-3">
                  <h4 className="text-caption border-b pb-2" style={{ color: 'var(--color-accent-primary)' }}>Optimized Rule Stack</h4>
                  <div className="flex-col gap-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                      <span><span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>IF</span> dynamic_score <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>&gt;</span> 0.7 <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>THEN</span> auto_approve</span>
                      <Bolt size={14} color="var(--color-accent-primary)" />
                    </div>
                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                      <span><span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>IF</span> debt_to_income <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>&gt;</span> 45% <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>THEN</span> tiered_offer</span>
                      <Sparkles size={14} color="var(--color-accent-primary)" />
                    </div>
                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                      <span><span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>IF</span> behavior_cluster <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>==</span> 'VIP' <span style={{ color: 'var(--color-accent-primary)', fontWeight: 700 }}>THEN</span> waive_fees</span>
                      <Star size={14} color="var(--color-accent-primary)" />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.5rem' }}>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <Plus size={12} />
                        Insert AI Suggested Rule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="glass-panel p-4 flex-row justify-between items-center gap-6 border" style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
            <div className="flex-row items-center gap-3 shrink-0">
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isSimulating ? 'var(--color-accent-primary)' : isPaused ? 'var(--color-warning)' : 'var(--color-success)' }} className={(!isSimulating && !isPaused) ? "animate-pulse-slow" : ""}></span>
              <span className="text-caption">Active Simulation</span>
            </div>

            <div style={{ flex: 1, height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ height: '100%', background: 'var(--gradient-primary)', width: `${progress}%`, transition: 'width 0.3s ease' }}
              ></div>
            </div>

            <div className="flex-row items-center gap-6 shrink-0 text-right">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{progress}% ((4.2M) Iterations)</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>ETA: {progress === 100 ? "00:00s" : "00:42s"}</span>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
