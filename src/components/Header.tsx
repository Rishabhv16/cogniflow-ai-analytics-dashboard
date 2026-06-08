import { 
  Search, 
  Bell, 
  Settings2, 
  CloudCheck,
} from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
}

export default function Header({ searchQuery, onSearchChange, activeTab }: HeaderProps) {
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "compliance":
      case "audit-logs":
        return "Search audit logs, rules, or hash certificates...";
      case "rule-management":
        return "Search business policies or keywords...";
      default:
        return "Global decision search...";
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 30,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: 'var(--header-height)',
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      paddingLeft: 'calc(var(--sidebar-width) + 2rem)'
    }}>
      <div className="flex-row gap-8">
        <div className="flex-row items-center input-glass" style={{ width: '320px', padding: '0.6rem 1rem' }}>
          <Search size={16} color="var(--color-text-tertiary)" style={{ marginRight: '0.75rem' }} />
          <input 
            type="text" 
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.875rem',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
      </div>

      <div className="flex-row gap-6 items-center">
        <div className="badge badge-success">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', marginRight: '6px' }} className="animate-pulse-slow"></span>
          Environment: Production
        </div>

        <div className="flex-row gap-2">
          <button className="btn-icon relative">
            <Bell size={18} />
            <span style={{ position: 'absolute', top: '8px', right: '10px', width: '6px', height: '6px', background: 'var(--color-danger)', borderRadius: '50%' }}></span>
          </button>
          
          <button className="btn-icon">
            <Settings2 size={18} />
          </button>

          <button className="btn-icon" style={{ color: 'var(--color-accent-primary)' }}>
            <CloudCheck size={18} />
          </button>
        </div>

        <div style={{ width: '1px', height: '32px', background: 'rgba(0,0,0,0.1)' }}></div>

        <div className="flex-row gap-3 items-center">
          <div className="text-right hidden sm:block">
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>David Vance</div>
            <div className="text-caption">VP Compliance</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
            <img 
              alt="Compliance Director Vance" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=128"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
