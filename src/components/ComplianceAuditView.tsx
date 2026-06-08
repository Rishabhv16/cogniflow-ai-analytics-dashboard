import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  CheckCircle, 
  Lock, 
  HelpCircle, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Key
} from "lucide-react";
import { AuditLogItem } from "../types";

export default function ComplianceAuditView() {
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogItem | null>(null);

  const legalDirectives = [
    { title: "EU AI Act Compliance (Annex III)", desc: "Traced high-risk automated profiles. Mandatory human-in-the-loop triggers active.", date: "Jun 04, 2026", status: "PASSING" },
    { title: "GDPR Article 22 Audit Log", desc: "Allows customer challenge mechanisms on fully automated eligibility paths.", date: "May 28, 2026", status: "PASSING" },
    { title: "SOC2 Type II Archival Protocol", desc: "Automated continuous sync verifies rule transaction snapshots on decentralized blocks.", date: "May 19, 2026", status: "PASSING" },
  ];

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/compliance/logs");
        const data = await res.json();
        setAuditLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, []);

  const openAuditVerification = async (log: AuditLogItem) => {
    setSelectedAuditLog(log);
    setIsVerifying(true);
    setVerifiedHash(null);
    try {
      const res = await fetch("/api/compliance/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ log_id: log.id || "unknown" })
      });
      const data = await res.json();
      setVerifiedHash(data.hash);
    } catch (err) {
      console.error(err);
      setVerifiedHash("ERROR: Verification Failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const matrixBubbles = [
    { id: "A", name: "High-Risk Anti-Fraud Gate R-1", x: 20, y: 80, size: 28, risk: "Low Compliance Risk", impact: "$12M Annual Impact" },
    { id: "B", name: "Vendor Intake Screening V-2", x: 45, y: 55, size: 20, risk: "Medium Risk Override", impact: "$4.1M Annual Impact" },
    { id: "C", name: "Tax Geo Routing Clause T-4", x: 75, y: 30, size: 16, risk: "Negligible Exposure", impact: "$1.5M Annual Impact" },
    { id: "D", name: "Legacy Rate Override (Override L-7)", x: 85, y: 75, size: 24, risk: "Potential Bias Risk", impact: "$8.5M High Impact" },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (!activeSearch) return true;
    const q = activeSearch.toLowerCase();
    return (
      log.subject.toLowerCase().includes(q) ||
      log.actionAndActor.toLowerCase().includes(q) ||
      log.timestamp.includes(q)
    );
  });

  return (
    <div className="animate-fade-in flex-col gap-8">
      
      <section className="flex-row justify-between items-end border-b pb-6 mb-6">
        <div>
          <h2 className="text-h1">Compliance & Crypto-Audit</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Cryptographic transparency logs. Monitor autonomous agent decisions against legal frameworks including EU AI Act, GDPR, and SOC2.
          </p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        
        <div className="glass-card flex-col items-center justify-between text-center">
          <div style={{ width: '100%', textAlign: 'left' }}>
            <h3 className="text-h3 border-b pb-3 mb-6">Alignment Health</h3>
          </div>

          <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-bg-secondary)" strokeWidth="16"></circle>
              <circle cx="90" cy="90" fill="transparent" r="75" stroke="var(--color-success)" strokeWidth="16" strokeDasharray="471" strokeDashoffset="12" style={{ transition: 'all 1s ease' }}></circle>
            </svg>
            <div className="absolute flex-col items-center">
              <span className="text-h1" style={{ fontSize: '2.5rem', lineHeight: 1 }}>98.4%</span>
              <span className="badge badge-success mt-2">Optimal</span>
            </div>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>654 Controls Passing</div>
            <div className="text-caption">0 critical gaps detected</div>
          </div>
        </div>

        <div className="glass-card flex-col justify-between">
          <h3 className="text-h3 border-b pb-3 mb-4">Regulatory Directives Tracker</h3>
          
          <div className="flex-col gap-4">
            {legalDirectives.map((directive, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '1rem',
                  background: 'rgba(255,255,255,0.5)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.03)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'default'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.2)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="flex-col gap-1">
                  <div className="flex-row items-center gap-2">
                    <span style={{ color: 'var(--color-accent-primary)', fontSize: '0.875rem', fontWeight: 700 }}>{directive.title}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, paddingRight: '1.25rem' }}>{directive.desc}</p>
                </div>
                
                <div className="flex-row items-center gap-4 flex-shrink-0">
                  <div className="text-caption flex-row items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    <Calendar size={12} />
                    {directive.date}
                  </div>
                  <span className="badge badge-success">
                    {directive.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex-row justify-between items-center p-6 border-b" style={{ background: 'rgba(255,255,255,0.4)' }}>
          <h3 className="text-h3" style={{ fontSize: '1rem' }}>Compliance Matrix Mapping</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontWeight: 500 }}>Hover bubbles to audit risk scorecards</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ position: 'relative', height: '300px', background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
            
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', opacity: 0.3, pointerEvents: 'none' }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderLeft: '1px solid rgba(0,0,0,0.1)' }}></div>
              ))}
            </div>

            <div style={{ position: 'absolute', left: '10px', top: '10px', bottom: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <span>High Compliance Risk</span>
              <span>Low Risk Alignment</span>
            </div>

            <div style={{ position: 'absolute', left: '24px', right: '24px', bottom: '10px', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <span>Low Returns</span>
              <span>High Impact Commercial</span>
            </div>

            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', bottom: '1.5rem' }}>
              {matrixBubbles.map((bubble) => (
                <button
                  key={bubble.id}
                  onMouseEnter={() => setHoveredBubble(bubble.id)}
                  style={{
                    position: 'absolute',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'white',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    cursor: 'pointer',
                    zIndex: 10,
                    left: `${bubble.x}%`,
                    bottom: `${bubble.y}%`,
                    width: `${bubble.size * 1.5}px`,
                    height: `${bubble.size * 1.5}px`,
                    background: hoveredBubble === bubble.id 
                      ? 'var(--gradient-primary)' 
                      : 'var(--color-accent-secondary)',
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: hoveredBubble === bubble.id ? '0 0 20px rgba(99, 102, 241, 0.5)' : 'var(--shadow-sm)',
                    transform: hoveredBubble === bubble.id ? 'scale(1.2) translate(-50%, 50%)' : 'translate(-50%, 50%)'
                  }}
                >
                  {bubble.id}
                </button>
              ))}
            </div>

          </div>

          <div className="flex-col justify-center">
            {hoveredBubble ? (
              (() => {
                const bubble = matrixBubbles.find(b => b.id === hoveredBubble)!;
                return (
                  <div className="animate-fade-in flex-col gap-4" style={{ padding: '1.25rem', background: 'white', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                    <div className="flex-row items-center gap-3 border-b pb-3" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '36px', height: '36px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 800 }}>
                        {bubble.id}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{bubble.name}</div>
                        <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--color-accent-primary)', textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.05em' }}>Policy Node Matrix</div>
                      </div>
                    </div>
                    
                    <div className="flex-col gap-2" style={{ fontWeight: 600 }}>
                      <div className="flex-row justify-between items-center">
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Sovereign Compliance Risk:</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-warning)' }}>{bubble.risk}</span>
                      </div>
                      <div className="flex-row justify-between items-center">
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Expected Commercial Lift:</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>{bubble.impact}</span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '0.5rem' }}>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--color-accent-primary)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        Inspect Rule Ledger <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ padding: '1.5rem', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '16px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontWeight: 500, fontSize: '0.875rem' }}>
                Splay cursor over plotting coordinates to overlay live audit matrices.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card flex-col" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="p-5 border-b flex-col md:flex-row justify-between items-center gap-4" style={{ background: 'rgba(255,255,255,0.4)' }}>
          <h3 className="text-h3" style={{ fontSize: '1rem' }}>Cryptographic Audit Ledger</h3>
          
          <div className="input-glass flex-row items-center" style={{ padding: '0.5rem 1rem', width: '100%', maxWidth: '300px' }}>
            <Search size={14} style={{ color: 'var(--color-text-tertiary)', marginRight: '8px' }} />
            <input 
              type="text" 
              placeholder="Search audit transaction ledger..."
              value={activeSearch}
              onChange={(e) => setActiveSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: '0.8125rem', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Timestamp</th>
                <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Subject</th>
                <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Actor Details</th>
                <th style={{ padding: '1rem', textAlign: 'left' }} className="text-caption">Validation Iterations</th>
                <th style={{ padding: '1rem', textAlign: 'right' }} className="text-caption">Block Status Verification</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                  <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                  <td style={{ padding: '1rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{log.subject}</td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <div className="flex-row items-center gap-2">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: log.actorType === "ai" ? 'var(--color-accent-primary)' : 'var(--color-info)' }}></span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{log.actionAndActor}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{log.simulationResult}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => openAuditVerification(log)}
                      className={`badge ${log.verificationStatus === "SIGNED_HASHED" ? "badge-success" : log.verificationStatus === "VERIFIED" ? "badge-info" : "badge-warning"}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      <Lock size={10} style={{ marginRight: '4px' }} />
                      {log.verificationStatus === "SIGNED_HASHED" ? "SIGNED & HASHED" : log.verificationStatus === "VERIFIED" ? "VERIFIED CODE" : "PENDING AUDIT"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAuditLog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card flex-col animate-fade-in" style={{ maxWidth: '450px', width: '100%', padding: '0', overflow: 'hidden', position: 'relative', border: '1px solid rgba(99, 102, 241, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--color-accent-primary)' }}></div>
            
            <div className="flex-col gap-5 p-6">
              <div className="flex-row items-center gap-4 border-b pb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', borderRadius: '12px' }}>
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="text-h3" style={{ fontSize: '1rem', lineHeight: 1 }}>Aether Verification Engine</h4>
                  <p className="text-caption mt-1">Cryptographic Hash Blueprint</p>
                </div>
              </div>

              <div className="flex-col gap-4" style={{ fontWeight: 600 }}>
                <div>
                  <span className="text-caption">Audit Timestamp</span>
                  <span style={{ display: 'block', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{selectedAuditLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-caption">Audited Entity</span>
                  <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{selectedAuditLog.subject}</span>
                </div>
                <div>
                  <span className="text-caption">Authoritative Actor</span>
                  <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{selectedAuditLog.actionAndActor}</span>
                </div>
                <div>
                  <span className="text-caption">Diagnostic Output</span>
                  <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{selectedAuditLog.simulationResult}</span>
                </div>
                <div>
                  <span className="text-caption">Cryptographic Signature Hash (Active Chain)</span>
                  <span style={{ display: 'block', marginTop: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', wordBreak: 'break-all', background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', color: 'var(--color-accent-primary)', userSelect: 'all' }}>
                    {isVerifying ? "Computing cryptographic hash on Aether network..." : (verifiedHash || "Hash unavailable")}
                  </span>
                </div>
              </div>

              <div className="flex-row justify-end pt-3 mt-1 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <button 
                  onClick={() => setSelectedAuditLog(null)}
                  className="btn-primary"
                  style={{ fontSize: '0.625rem', padding: '0.5rem 1rem' }}
                >
                  Close Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
