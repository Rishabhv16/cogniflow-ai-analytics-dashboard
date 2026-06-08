import { 
  LayoutDashboard, 
  ScrollText, 
  LineChart, 
  ShieldAlert, 
  History, 
  Settings as SettingsIcon, 
  HelpCircle, 
  FileText, 
  Sparkles,
  Bolt,
  Eye,
  Clock,
  Ghost,
  TrendingUp,
  GitBranch,
  Network
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDeployClick: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onDeployClick }: SidebarProps) {
  const primaryNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rule-management", label: "Rule Builder", icon: ScrollText },
    { id: "explainability", label: "Explainability", icon: Eye },
    { id: "simulations", label: "Simulations", icon: LineChart },
    { id: "time-machine", label: "Time Machine", icon: Clock },
    { id: "shadow-reviewer", label: "Shadow Reviewer", icon: Ghost },
    { id: "compliance", label: "Compliance", icon: ShieldAlert },
    { id: "drift-monitor", label: "Drift Monitor", icon: TrendingUp },
    { id: "optimisation", label: "Optimisation", icon: GitBranch },
    { id: "graph-memory", label: "Graph Memory", icon: Network },
    { id: "audit-logs", label: "Audit Logs", icon: History },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

  const secondaryNavItems = [
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "documentation", label: "Documentation", icon: FileText },
  ];

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0',
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid rgba(0, 0, 0, 0.05)',
      width: 'var(--sidebar-width)',
      overflowY: 'auto'
    }}>
      <div className="flex-row items-center gap-3 mb-6 px-6">
        <div className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
          <Sparkles size={20} color="var(--color-accent-primary)" />
        </div>
        <div>
          <h1 className="text-h3" style={{ fontSize: '1.125rem', lineHeight: 1 }}>CogniFlow AI</h1>
          <p className="text-caption" style={{ marginTop: '0.25rem' }}>Decision Engine</p>
        </div>
      </div>

      <nav className="flex-col gap-0.5 px-3" style={{ flex: 1 }}>
        <p className="text-caption px-3 mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.6rem' }}>
          Core Modules
        </p>
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '10px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 500,
                borderLeft: isActive ? '3px solid var(--color-accent-primary)' : '3px solid transparent'
              }}
            >
              <Icon size={16} color={isActive ? "var(--color-accent-primary)" : "var(--color-text-tertiary)"} />
              <span style={{ fontSize: '0.8125rem', letterSpacing: '0.01em' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 mb-4 mt-4">
        <button 
          onClick={onDeployClick}
          className="btn-primary"
          style={{ width: '100%' }}
        >
          <Bolt size={16} fill="white" />
          DEPLOY MODEL
        </button>
      </div>

      <div className="px-4 pt-4 border-b" style={{ borderBottom: 'none', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                background: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                color: isActive ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 500
              }}
            >
              <Icon size={16} color="var(--color-text-tertiary)" />
              <span style={{ fontSize: '0.75rem' }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
