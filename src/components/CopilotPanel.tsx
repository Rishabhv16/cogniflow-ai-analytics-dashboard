import React, { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle, 
  Trash2, 
  Search,
  MessageSquareOff,
  Minimize2
} from "lucide-react";
import { ChatMessage } from "../types";
import ReactMarkdown from "react-markdown";

interface CopilotPanelProps {
  agentType: "rulegpt" | "explainability" | "compliance";
  onAgentTypeChange: (type: "rulegpt" | "explainability" | "compliance") => void;
  onApplyOptimization?: (optimizationText: string) => void;
  isOpen: boolean;
  onToggleClose: () => void;
}

export default function CopilotPanel({ 
  agentType, 
  onAgentTypeChange, 
  onApplyOptimization,
  isOpen,
  onToggleClose
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: getInitialAssistantMessage(agentType),
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          id: Date.now().toString(),
          role: "assistant",
          content: getInitialAssistantMessage(agentType),
          timestamp: new Date()
        }
      ]);
    }
  }, [agentType]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function getInitialAssistantMessage(type: string): string {
    if (type === "explainability") {
      return "I am ready as your Blackbox Auditor. I can explain complex machine learning weights, trace decision trees, and screen for compliance risks on policy v2.4.8.";
    }
    if (type === "compliance") {
      return "I have analyzed the new GDPR additions and regional policy frameworks. Ask me to audit your current rule parameters or draft compliant safety layers.";
    }
    return "I am active as your RuleGPT logic assistant. Let's draft, translate, or stress-test some decision gates. Type in normal language (e.g. 'claims above ₹5 lakh...') to translate.";
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          agentType
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.content || "Network response was not ok");
      }
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: (err as Error).message || "I encountered an issue connecting to the CogniFlow model. Check your API configuration or network status.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: getInitialAssistantMessage(agentType),
        timestamp: new Date()
      }
    ]);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const currentInsights = [
    {
      text: "System performance within 99.8th percentile. 3 rules are under-simulated.",
      actionLabel: "Start Run",
      promptToApp: "Start Monte Carlo simulation on Vendor Risk Policy"
    }
  ];

  const suggestedActions = [
    { label: "Archive Audit Logs (> 90 days)", prompt: "Draft a policy rule to automatically archive audit logs older than 90 days." },
    { label: "Update P-99 Thresholds", prompt: "Explain how to adjust the P-99 response delay threshold rules to maximize efficiency." }
  ];

  return (
    <aside style={{
      position: 'fixed',
      right: 0,
      top: 'var(--header-height)',
      height: 'calc(100vh - var(--header-height))',
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      width: 'var(--panel-width)',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderLeft: '1px solid rgba(0, 0, 0, 0.05)',
      boxShadow: '-10px 0 25px rgba(0,0,0,0.03)',
      transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div className="flex-row justify-between items-center mb-4">
          <div className="flex-row items-center gap-2">
            <span className="relative flex-row items-center justify-center w-2 h-2">
              <span className="absolute w-full h-full rounded-full bg-indigo-400 opacity-75 animate-pulse"></span>
              <span className="relative rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <div className="flex-col">
              <span className="text-caption" style={{ color: 'var(--color-accent-primary)' }}>AI Copilot</span>
              <span style={{ fontSize: '0.625rem', textTransform: 'uppercase', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Autonomous Assistant</span>
            </div>
          </div>
          <div className="flex-row gap-2">
            <button onClick={clearChat} className="btn-icon" style={{ width: '28px', height: '28px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
              <Trash2 size={14} />
            </button>
            <button onClick={onToggleClose} className="btn-icon" style={{ width: '28px', height: '28px', border: 'none', boxShadow: 'none', background: 'transparent' }}>
              <Minimize2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex-row gap-1 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)' }}>
          {(["rulegpt", "explainability", "compliance"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onAgentTypeChange(type)}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '6px',
                fontSize: '0.625rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease',
                background: agentType === type ? 'white' : 'transparent',
                color: agentType === type ? 'var(--color-accent-primary)' : 'var(--color-text-tertiary)',
                boxShadow: agentType === type ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {type === "rulegpt" ? "RuleGPT" : type === "explainability" ? "Explain" : "Rules"}
            </button>
          ))}
        </div>
      </div>

      <div 
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} className="flex-row gap-3" style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: 'flex-start' }}>
            {msg.role !== "user" && (
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={16} />
              </div>
            )}
            
            <div style={{
              maxWidth: '85%',
              padding: '0.875rem',
              fontSize: '0.8125rem',
              lineHeight: 1.5,
              fontWeight: 500,
              background: msg.role === "user" ? 'var(--gradient-primary)' : 'white',
              color: msg.role === "user" ? 'white' : 'var(--color-text-primary)',
              borderRadius: msg.role === "user" ? '12px 12px 0 12px' : '0 12px 12px 12px',
              boxShadow: 'var(--shadow-sm)',
              border: msg.role === "user" ? 'none' : '1px solid rgba(0,0,0,0.03)'
            }}>
              {msg.role === "user" ? msg.content : (
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p style={{ margin: '0 0 0.5rem 0' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ fontWeight: 700, color: 'var(--color-accent-primary)' }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', listStyleType: 'disc' }} {...props} />,
                    ol: ({node, ...props}) => <ol style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', listStyleType: 'decimal' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ marginBottom: '0.25rem' }} {...props} />
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex-row gap-3" style={{ alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={16} className="animate-pulse-slow" />
            </div>
            <div style={{
              width: '65%',
              height: '40px',
              padding: '0 1rem',
              background: 'white',
              borderRadius: '0 12px 12px 12px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent-primary)' }} className="animate-pulse-slow"></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic', fontWeight: 600 }}>Orchestrator thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {currentInsights.map((ins, i) => (
          <div key={i} style={{ padding: '0.875rem', background: 'white', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '12px', position: 'relative', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--color-bg-primary)', padding: '0 6px', color: 'var(--color-accent-primary)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '4px' }}>
              Insights
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, marginTop: '4px' }}>{ins.text}</p>
            <button 
              onClick={() => handleSuggestedPrompt(ins.promptToApp)}
              style={{ marginTop: '8px', color: 'var(--color-accent-primary)', fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {ins.actionLabel} <ArrowRight size={10} />
            </button>
          </div>
        ))}

        <div className="flex-col gap-2">
          <div className="flex-row items-center gap-2 text-caption">
            <Sparkles size={12} color="var(--color-accent-primary)" />
            Recommended Actions
          </div>
          <div className="flex-col gap-1">
            {suggestedActions.map((action, j) => (
              <button
                key={j}
                onClick={() => handleSuggestedPrompt(action.prompt)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  border: '1px solid transparent'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span>{action.label}</span>
                <ArrowUpRight size={12} style={{ opacity: 0.5 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', background: 'white', display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          placeholder={`Ask ${agentType === "rulegpt" ? "RuleGPT..." : agentType === "explainability" ? "Explain..." : "Compliance..."}`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="input-glass"
          style={{ flex: 1, padding: '0.625rem 1rem' }}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || isLoading}
          style={{
            width: '40px',
            height: '40px',
            background: (!inputText.trim() || isLoading) ? 'var(--color-bg-secondary)' : 'var(--gradient-primary)',
            color: (!inputText.trim() || isLoading) ? 'var(--color-text-tertiary)' : 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            boxShadow: (!inputText.trim() || isLoading) ? 'none' : '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Send size={16} style={{ marginLeft: '-2px' }} />
        </button>
      </form>
    </aside>
  );
}
