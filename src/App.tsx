import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CopilotPanel from "./components/CopilotPanel";
import DashboardView from "./components/DashboardView";
import SimulationLabView from "./components/SimulationLabView";
import RuleGPTBuilderView from "./components/RuleGPTBuilderView";
import ComplianceAuditView from "./components/ComplianceAuditView";
import ExplainabilityView from "./components/ExplainabilityView";
import TimeMachineView from "./components/TimeMachineView";
import ShadowReviewerView from "./components/ShadowReviewerView";
import DriftMonitorView from "./components/DriftMonitorView";
import OptimisationView from "./components/OptimisationView";
import GraphMemoryView from "./components/GraphMemoryView";

import { 
  Building, 
  Layers, 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Bolt,
  Key
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [agentType, setAgentType] = useState<"rulegpt" | "explainability" | "compliance">("rulegpt");
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);

  // Deploying modal state
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [deployStatus, setDeployStatus] = useState<string>("");

  // Settings mock toggle switches
  const [autonomousAgentControl, setAutonomousAgentControl] = useState<boolean>(true);
  const [shadowReviewer, setShadowReviewer] = useState<boolean>(true);
  const [piiMasking, setPiiMasking] = useState<boolean>(true);
  const [isApiKeyChecked, setIsApiKeyChecked] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/translate-rule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ policy: "test check" })
    })
    .then(res => res.json())
    .then(data => {
      setIsApiKeyChecked(true);
      if (data.status === "DRAFT_API_KEY_MISSING_FALLBACK") {
        setApiKeyError("No GROQ_API_KEY detected. Dynamic AI operations will run on static local templates. Update in Settings panel.");
      }
    })
    .catch(() => {
      setIsApiKeyChecked(true);
      setApiKeyError("Offline connection error to rule service.");
    });
  }, []);

  const handleDeployModel = () => {
    setIsDeploying(true);
    setDeployStep(1);
    setDeployStatus("Testing regression constraints on 4.2M test vectors...");

    setTimeout(() => {
      setDeployStep(2);
      setDeployStatus("Signing code snapshot with enterprise HSA keys...");
    }, 1500);

    setTimeout(() => {
      setDeployStep(3);
      setDeployStatus("Deploying WASM logic containers to 12 GCP cloud run edge clusters...");
    }, 3000);

    setTimeout(() => {
      setDeployStep(4);
      setDeployStatus("Deployment successful! Model current state is active, live and green.");
    }, 4500);
  };

  const closeDeployModal = () => {
    setIsDeploying(false);
    setDeployStep(0);
    setDeployStatus("");
  };

  const handleApplyOptimizationMessage = (opt: string) => {
    setSearchQuery(opt);
    setActiveTab("rule-management");
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView searchQuery={searchQuery} onNavigateToTab={(tab) => setActiveTab(tab)} />;
      case "rule-management":
        return <RuleGPTBuilderView />;
      case "explainability":
        return <ExplainabilityView />;
      case "simulations":
        return <SimulationLabView />;
      case "time-machine":
        return <TimeMachineView />;
      case "shadow-reviewer":
        return <ShadowReviewerView />;
      case "compliance":
      case "audit-logs":
        return <ComplianceAuditView />;
      case "drift-monitor":
        return <DriftMonitorView />;
      case "optimisation":
        return <OptimisationView />;
      case "graph-memory":
        return <GraphMemoryView />;
      case "settings":
        return (
          <div className="animate-fade-in flex-col gap-8">
            <div className="border-b mb-6 pb-6">
              <h2 className="text-h1">System Settings</h2>
              <p className="text-subtitle mt-4 max-w-2xl">
                Configure orchestration agents, system flags, secure credential endpoints, and operational policies.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
              {/* Credentials card */}
              <div className="glass-card flex-col gap-4" style={{ borderTop: '4px solid var(--color-accent-primary)' }}>
                <div className="flex-row gap-3 items-center">
                  <div className="btn-icon" style={{ color: 'var(--color-accent-primary)' }}>
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-h3">Security Credentials</h3>
                    <p className="text-caption">LLM integrations APIs</p>
                  </div>
                </div>

                <div className="text-body flex-col gap-3 pt-2">
                  <p>
                    Aether AI is fully integrated with Groq Llama 3.3 LLM API vectors. The application proxies all request logic server-side to hide secure keys.
                  </p>
                  
                  {apiKeyError ? (
                    <div className="flex-row gap-2 items-center p-6 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--color-warning)' }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: '0.875rem' }}>{apiKeyError}</span>
                    </div>
                  ) : isApiKeyChecked ? (
                    <div className="flex-row gap-2 items-center p-6 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: '0.875rem' }}>Groq API verified active! All natural-language translations are responsive.</span>
                    </div>
                  ) : (
                    <div className="flex-row gap-2 items-center justify-center p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                      Testing server-side API credentials...
                    </div>
                  )}

                  <div className="flex-col gap-2 mt-4 p-6 rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                    <span className="text-caption">How to configure credentials</span>
                    <span style={{ fontSize: '0.875rem' }}>To update models to live status, modify your backend `.env` file to supply a value for **GROQ_API_KEY**.</span>
                  </div>
                </div>
              </div>

              {/* Toggles switches card */}
              <div className="glass-card flex-col justify-between">
                <div className="flex-col gap-6">
                  <h3 className="text-h3 border-b pb-4">Automation Flags</h3>
                  
                  <div className="flex-col gap-4">
                    {/* Switch 1 */}
                    <div className="flex-row justify-between items-center p-6 rounded-xl input-glass">
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-text-primary)' }}>Autonomous Agents Loop</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>Allow RuleGPT model to make predictive fixes autonomously</span>
                      </div>
                      <button onClick={() => setAutonomousAgentControl(!autonomousAgentControl)} style={{ color: 'var(--color-accent-primary)' }}>
                        {autonomousAgentControl ? <ToggleRight size={36} strokeWidth={1.5} /> : <ToggleLeft size={36} strokeWidth={1.5} color="var(--color-text-tertiary)" />}
                      </button>
                    </div>

                    {/* Switch 2 */}
                    <div className="flex-row justify-between items-center p-6 rounded-xl input-glass">
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-text-primary)' }}>Shadow AI Reviewer Audit</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>Continuous screening against localized bias registers</span>
                      </div>
                      <button onClick={() => setShadowReviewer(!shadowReviewer)} style={{ color: 'var(--color-accent-primary)' }}>
                        {shadowReviewer ? <ToggleRight size={36} strokeWidth={1.5} /> : <ToggleLeft size={36} strokeWidth={1.5} color="var(--color-text-tertiary)" />}
                      </button>
                    </div>

                    {/* Switch 3 */}
                    <div className="flex-row justify-between items-center p-6 rounded-xl input-glass">
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-text-primary)' }}>Automated PII Masking</span>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '0.25rem' }}>Scrub user entities across dynamic translation prompts</span>
                      </div>
                      <button onClick={() => setPiiMasking(!piiMasking)} style={{ color: 'var(--color-accent-primary)' }}>
                        {piiMasking ? <ToggleRight size={36} strokeWidth={1.5} /> : <ToggleLeft size={36} strokeWidth={1.5} color="var(--color-text-tertiary)" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-b" style={{ borderBottom: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                    Changes take effect on current draft revisions in session local memories. To write changes permanently, launch new deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="animate-fade-in flex-col gap-6">
            <h2 className="text-h1">Support Center</h2>
            <p className="text-body text-secondary">
              Welcome to CogniFlow AI Enterprise Support. Please open a ticket or contact your dedicated account manager for assistance with your deployment.
            </p>
            <div className="glass-card mt-4 p-6">
              <h3 className="text-h3 mb-2">Contact Options</h3>
              <ul className="text-body flex-col gap-2 list-disc pl-4">
                <li>Priority Email: support@cogniflow.ai</li>
                <li>Live Chat: Available 24/7 for Enterprise Tier</li>
                <li>Phone: 1-800-COGNIFLOW</li>
              </ul>
            </div>
          </div>
        );
      case "documentation":
        return (
          <div className="animate-fade-in flex-col gap-6">
            <h2 className="text-h1">API Documentation</h2>
            <p className="text-body text-secondary">
              Integrate the CogniFlow AI Decision Engine into your existing enterprise stack.
            </p>
            <div className="glass-card mt-4 p-6">
              <h3 className="text-h3 mb-2">Getting Started</h3>
              <p className="text-body mb-4">
                Our REST API allows you to programmatically manage rules, trace explanations, and execute simulations.
              </p>
              <pre className="p-4 rounded bg-gray-900 text-gray-100 font-mono text-sm">
                GET /api/explainability/analyze{"\n"}
                POST /api/translate-rule
              </pre>
            </div>
          </div>
        );
      default:
        return <DashboardView searchQuery={searchQuery} onNavigateToTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
        }} 
        onDeployClick={handleDeployModel}
      />

      <main className={`main-content ${isCopilotOpen ? 'copilot-open' : ''}`}>
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery} 
          activeTab={activeTab} 
        />

        <div className="page-viewport">
          {renderActiveView()}
        </div>
      </main>

      <CopilotPanel 
        agentType={agentType} 
        onAgentTypeChange={setAgentType}
        onApplyOptimization={handleApplyOptimizationMessage}
        isOpen={isCopilotOpen}
        onToggleClose={() => setIsCopilotOpen(false)}
      />

      {!isCopilotOpen && (
        <button 
          onClick={() => setIsCopilotOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
            zIndex: 50
          }}
          className="animate-pulse-slow"
          title="Open AI Copilot Chat"
        >
          <Cpu size={24} />
        </button>
      )}

      {isDeploying && (
        <div className="overlay">
          <div className="modal-content">
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--gradient-primary)' }}></div>
            
            <div className="p-6 flex-col gap-6">
              <div className="flex-row gap-4 items-center border-b pb-4">
                <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)' }}>
                  <Layers size={20} className="animate-pulse-slow" />
                </div>
                <div>
                  <h4 className="text-h3" style={{ fontSize: '1rem' }}>Decision Deployment Engine</h4>
                  <p className="text-caption mt-1">Zone: GCP-Asia-South-1</p>
                </div>
              </div>

              <div className="flex-col gap-4">
                <div className="flex-row justify-between items-center text-caption">
                  <span>Current Task</span>
                  <span style={{ color: 'var(--color-accent-primary)' }}>Running iteration...</span>
                </div>

                <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1rem', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                  <div className="flex-row gap-2 items-center" style={{ color: '#94a3b8' }}>
                    <span style={{ color: '#38bdf8' }}>&gt;</span>
                    <span>aether_cli compile --id CLM_PRO_005 </span>
                  </div>
                  <div style={{ marginTop: '0.5rem', color: '#64748b', fontStyle: 'italic' }}>
                    {deployStatus}
                  </div>
                </div>

                <div className="flex-row justify-between items-center" style={{ padding: '0 0.5rem' }}>
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: deployStep >= step ? 'var(--color-accent-primary)' : 'var(--color-bg-secondary)',
                        color: deployStep >= step ? 'white' : 'var(--color-text-tertiary)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {deployStep > step ? "✓" : step}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-row justify-end pt-4 border-b" style={{ borderBottom: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <button 
                  onClick={closeDeployModal}
                  disabled={deployStep < 4}
                  className="btn-primary"
                  style={{ opacity: deployStep < 4 ? 0.5 : 1 }}
                >
                  {deployStep < 4 ? "Deploying Code..." : "Dismiss Deploy Log"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
