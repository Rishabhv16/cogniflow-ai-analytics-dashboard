import React, { useState, useEffect, useCallback } from "react";
import { Network, Search, RefreshCw, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// --- Custom Nodes ---

const RegulationNode = ({ data }: any) => (
  <div style={{ background: '#fff', border: '2px solid var(--color-danger)', borderRadius: '8px', padding: '10px', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-danger)', marginBottom: '4px', textTransform: 'uppercase' }}>Regulation</div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{data.label}</div>
    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{data.title}</div>
  </div>
);

const RuleNode = ({ data }: any) => (
  <div style={{ background: '#fff', border: '2px solid var(--color-accent-primary)', borderRadius: '8px', padding: '10px', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-accent-primary)', marginBottom: '4px', textTransform: 'uppercase' }}>Rule</div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', fontFamily: 'var(--font-mono)' }}>{data.label}</div>
    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Status: {data.status}</div>
  </div>
);

const DecisionNode = ({ data }: any) => (
  <div style={{ background: '#fff', border: '2px solid var(--color-info)', borderRadius: '8px', padding: '10px', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-info)', marginBottom: '4px', textTransform: 'uppercase' }}>Decision</div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{data.label}</div>
    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Entity: {data.entity}</div>
  </div>
);

const OutcomeNode = ({ data }: any) => (
  <div style={{ background: '#fff', border: '2px solid var(--color-success)', borderRadius: '8px', padding: '10px', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-success)', marginBottom: '4px', textTransform: 'uppercase' }}>Outcome</div>
    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{data.label}</div>
  </div>
);

const nodeTypes = {
  regulation: RegulationNode,
  rule: RuleNode,
  decision: DecisionNode,
  outcome: OutcomeNode,
};

export default function GraphMemoryView() {
  const [ruleId, setRuleId] = useState("CLM_PRO_005");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleFetchGraph = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/graph-memory/trace/${ruleId}`);
      const graphData = await res.json();
      setData(graphData);

      // Layout algorithm (simple tree-like)
      const newNodes = [];
      const newEdges = [];

      let regY = 50;
      let decY = 50;
      let outY = 50;

      graphData.nodes.forEach((n: any) => {
        let x = 0, y = 0;
        if (n.type === 'regulation') { x = 100; y = regY; regY += 150; }
        else if (n.type === 'rule') { x = 400; y = 150; }
        else if (n.type === 'decision') { x = 700; y = decY; decY += 150; }
        else if (n.type === 'outcome') { x = 1000; y = outY; outY += 150; }

        newNodes.push({
          id: n.id,
          type: n.type,
          data: { label: n.label, ...n.properties },
          position: { x, y }
        });
      });

      graphData.edges.forEach((e: any) => {
        newEdges.push({
          id: `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          label: e.type,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          labelStyle: { fill: '#64748b', fontWeight: 600, fontSize: 10 },
          labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleFetchGraph();
  }, []);

  return (
    <div className="animate-fade-in flex-col gap-8 h-full" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
      <section className="flex-row justify-between items-end border-b pb-6 shrink-0">
        <div>
          <h2 className="text-h1">Decision Graph Memory</h2>
          <p className="text-subtitle mt-2 max-w-2xl">
            Interactive Neo4j knowledge graph tracing rules back to source regulations and forward to actual outcomes.
          </p>
        </div>
        <form onSubmit={handleFetchGraph} className="flex-row gap-2">
          <input 
            value={ruleId} 
            onChange={e => setRuleId(e.target.value)} 
            className="input-glass" 
            placeholder="Enter Rule ID..."
            style={{ width: '200px' }}
          />
          <button type="submit" disabled={isLoading} className="btn-primary">
            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
            Trace Graph
          </button>
        </form>
      </section>

      {/* Graph Area */}
      <div className="glass-card flex-1 p-0 relative overflow-hidden" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        
        {data && (
           <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '12px 16px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', maxWidth: '400px' }}>
              <div className="flex-row items-center gap-2 text-caption mb-2" style={{ color: 'var(--color-accent-primary)' }}>
                <Network size={14} />
                Graph Trace Summary
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--color-text-secondary)' }}>
                {data.path_summary}
              </p>
           </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#e2e8f0" gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.type) {
                case 'regulation': return 'var(--color-danger)';
                case 'rule': return 'var(--color-accent-primary)';
                case 'decision': return 'var(--color-info)';
                case 'outcome': return 'var(--color-success)';
                default: return '#eee';
              }
            }}
            maskColor="rgba(248, 250, 252, 0.7)"
          />
        </ReactFlow>

      </div>
    </div>
  );
}
