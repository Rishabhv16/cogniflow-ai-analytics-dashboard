import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight,
  TrendingDown, 
  Cpu, 
  ShieldCheck, 
  Activity,
  Bot
} from "lucide-react";
import { StreamEvent } from "../types";

interface DashboardViewProps {
  searchQuery: string;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ searchQuery, onNavigateToTab }: DashboardViewProps) {
  const [stream, setStream] = useState<StreamEvent[]>([]);
  const [metrics, setMetrics] = useState({
    totalEvaluations: "Loading...",
    approvalRate: "...",
    latency: "...",
    activeRules: 0
  });

  const [isLiveFeed, setIsLiveFeed] = useState(true);

  useEffect(() => {
    if (!isLiveFeed) return;

    const fetchData = async () => {
      try {
        const streamRes = await fetch("/api/analytics/stream");
        const streamData = await streamRes.json();
        setStream(streamData);
        
        const metricsRes = await fetch("/api/analytics/metrics");
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
    };
    
    fetchData(); // Initial fetch
    const streamInterval = setInterval(fetchData, 4000);

    return () => clearInterval(streamInterval);
  }, [isLiveFeed]);

  const triggeredRules = [
    { code: "R-1", name: "Global Anti-Fraud Gateway", count: "452k triggers", percent: 85, color: "var(--color-accent-primary)" },
    { code: "L-7", name: "Latency Optimization Protocol", count: "212k triggers", percent: 45, color: "var(--color-info)" },
    { code: "V-2", name: "Vendor Risk Assessment", count: "108k triggers", percent: 30, color: "var(--color-accent-tertiary)" },
  ];

  const agents = [
    { name: "RuleGPT", role: "Generative Logic", icon: Bot, status: "Online" },
    { name: "Explainability", role: "Blackbox Auditor", icon: Cpu, status: "Online" },
    { name: "Compliance", role: "Regulatory Watchdog", icon: ShieldCheck, status: "Online" },
  ];

  const filteredStream = stream.filter(s => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.entityId.toLowerCase().includes(query) ||
      s.action.toLowerCase().includes(query) ||
      s.reasoning.toLowerCase().includes(query)
    );
  });

  return (
    <div className="animate-fade-in flex-col gap-8">
      
      <div className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">CogniFlow Dashboard</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Autonomous intelligence monitoring. Real-time decision flow and rule-based policy execution overview.
          </p>
        </div>
        
        <div className="flex-row gap-4">
          <div className="glass-panel px-4 py-2 flex-row gap-3 items-center">
            <span className="relative flex-row items-center justify-center w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-emerald-400 opacity-75 animate-pulse"></span>
              <span className="relative rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-caption" style={{ color: 'var(--color-text-primary)' }}>System Status: Optimal</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {/* Total Decisions */}
        <div className="glass-card relative overflow-hidden group">
          <div className="flex-row justify-between items-start mb-4">
            <span className="text-caption">Total Decisions</span>
            <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', width: '32px', height: '32px' }}>
              <Activity size={16} />
            </div>
          </div>
          <div className="text-h1" style={{ fontSize: '2rem' }}>{metrics.totalEvaluations}</div>
          <div className="flex-row items-center gap-1 mt-3" style={{ color: 'var(--color-success)' }}>
            <TrendingUp size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>+12.5% vs last month</span>
          </div>
        </div>

        {/* Rule Accuracy */}
        <div className="glass-card">
          <div className="flex-row justify-between items-start mb-4">
            <span className="text-caption">Approval Rate</span>
            <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', width: '32px', height: '32px' }}>
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-h1" style={{ fontSize: '2rem' }}>{metrics.approvalRate}</div>
          <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-secondary)', borderRadius: '2px', marginTop: '1rem' }}>
            <div style={{ height: '100%', background: 'var(--gradient-primary)', width: metrics.approvalRate, borderRadius: '2px' }}></div>
          </div>
        </div>

        {/* Compliance Score */}
        <div className="glass-card">
          <div className="flex-row justify-between items-start mb-4">
            <span className="text-caption">Compliance Score</span>
            <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', width: '32px', height: '32px' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-h1" style={{ fontSize: '2rem' }}>100/100</div>
          <div className="flex-row items-center gap-1.5 mt-3 text-caption" style={{ color: 'var(--color-success)' }}>
            <CheckCircle size={14} strokeWidth={2.5} />
            <span>Fully Audited</span>
          </div>
        </div>

        {/* System Latency */}
        <div className="glass-card">
          <div className="flex-row justify-between items-start mb-4">
            <span className="text-caption">System Latency</span>
            <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', width: '32px', height: '32px' }}>
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-h1" style={{ fontSize: '2rem' }}>{metrics.latency}</div>
          <div className="flex-row items-center gap-1.5 mt-3 text-caption">
            <span>{metrics.activeRules} active rules</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Decision Distribution Chart */}
        <div className="glass-card flex-col justify-between">
          <div>
            <h3 className="text-h3 border-b pb-3 mb-6">Decision Distribution</h3>
            
            <div className="relative mx-auto flex-row items-center justify-center" style={{ width: '180px', height: '180px' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-bg-secondary)" strokeWidth="16"></circle>
                <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-accent-secondary)" strokeWidth="16" strokeDasharray="471" strokeDashoffset="117" style={{ transition: 'all 1s ease' }}></circle>
                <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-success)" strokeWidth="16" strokeDasharray="471" strokeDashoffset="330" style={{ transition: 'all 1s ease' }}></circle>
                <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-danger)" strokeWidth="16" strokeDasharray="471" strokeDashoffset="423" style={{ transition: 'all 1s ease' }}></circle>
              </svg>
              <div className="absolute flex-col items-center">
                <span className="text-h1" style={{ fontSize: '2.5rem', lineHeight: 1 }}>82%</span>
                <span className="text-caption mt-1">Approved</span>
              </div>
            </div>
          </div>

          <div className="flex-col gap-3 mt-6 pt-6 border-b" style={{ borderBottom: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <div className="flex-row justify-between items-center">
              <div className="flex-row gap-2 items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Approved</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700 }}>1,053,365</span>
            </div>
            <div className="flex-row justify-between items-center">
              <div className="flex-row gap-2 items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-accent-secondary)' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Rejected</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700 }}>210,671</span>
            </div>
            <div className="flex-row justify-between items-center">
              <div className="flex-row gap-2 items-center">
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-danger)' }}></div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Escalated</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700 }}>20,556</span>
            </div>
          </div>
        </div>

        {/* Real-time Stream */}
        <div className="glass-card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="flex-row justify-between items-center p-6 border-b" style={{ background: 'rgba(255,255,255,0.4)' }}>
            <h3 className="text-h3" style={{ fontSize: '1rem' }}>Real-time Decision Stream</h3>
            
            <button 
              onClick={() => setIsLiveFeed(!isLiveFeed)}
              className="badge"
              style={{
                background: isLiveFeed ? 'rgba(99, 102, 241, 0.1)' : 'var(--color-bg-secondary)',
                color: isLiveFeed ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                border: `1px solid ${isLiveFeed ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              {isLiveFeed && (
                <span className="relative flex-row items-center justify-center w-1.5 h-1.5" style={{ marginRight: '6px' }}>
                  <span className="absolute w-full h-full rounded-full bg-indigo-400 opacity-75 animate-pulse"></span>
                  <span className="relative rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                </span>
              )}
              {isLiveFeed ? "Live Feed Active" : "Stream Suspended"}
            </button>
          </div>

          <div style={{ flex: 1, overflowX: 'auto', padding: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Timestamp</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Entity ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Action</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Reasoning (Explainability)</th>
                </tr>
              </thead>
              <tbody>
                {filteredStream.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{item.timestamp}</td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{item.entityId}</td>
                    <td style={{ padding: '1rem' }}>
                      {item.action === "APPROVED" && (
                        <span className="badge badge-success">Approved</span>
                      )}
                      {item.action === "REJECTED" && (
                        <span className="badge badge-danger">Rejected</span>
                      )}
                      {item.action === "ESCALATED" && (
                        <span className="badge badge-warning">Escalated</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.reasoning}</td>
                  </tr>
                ))}
                {filteredStream.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      No matching events found in active buffer viewport.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        {/* Top Triggered Rules */}
        <div className="glass-card flex-col justify-between">
          <div className="flex-row justify-between items-center border-b pb-3 mb-5">
            <h3 className="text-h3" style={{ fontSize: '1rem' }}>Top Triggered Rules</h3>
            <button 
              onClick={() => onNavigateToTab("rule-management")}
              style={{ color: 'var(--color-accent-primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              View All Policy Clusters
            </button>
          </div>

          <div className="flex-col gap-4">
            {triggeredRules.map((rule, idx) => (
              <div 
                key={idx}
                onClick={() => onNavigateToTab("rule-management")}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: rule.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}>
                  {rule.code}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex-row justify-between items-end mb-2">
                    <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{rule.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>{rule.count}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: rule.color, width: `${rule.percent}%` }}></div>
                  </div>
                </div>
                <ArrowRight size={16} color="var(--color-text-tertiary)" />
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous Agents Status Widget */}
        <div className="glass-card flex-col justify-between">
          <div>
            <h3 className="text-h3 border-b pb-3 mb-6" style={{ fontSize: '1rem' }}>Autonomous Agents</h3>
            
            <div className="flex-col gap-5">
              {agents.map((agent, index) => {
                const Icon = agent.icon;
                return (
                  <div key={index} className="flex-row justify-between items-center">
                    <div className="flex-row items-center gap-4">
                      <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)' }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{agent.name}</div>
                        <div className="text-caption mt-1">{agent.role}</div>
                      </div>
                    </div>
                    <div className="flex-row items-center gap-2 text-caption" style={{ color: 'var(--color-success)' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)' }} className="animate-pulse-slow"></span>
                      <span>{agent.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onNavigateToTab("settings")}
            className="btn-secondary mt-6"
            style={{ width: '100%' }}
          >
            Manage Agents
          </button>
        </div>
      </div>
    </div>
  );
}
