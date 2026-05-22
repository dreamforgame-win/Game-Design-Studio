'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  BackgroundVariant,
  useReactFlow,
  useViewport
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import CustomNode, { NodeType } from './CustomNode';
import { Lightbulb, CircleHelp, Maximize2, Zap, CheckCircle2, Flag, Download, FileText, Settings, Moon, Sun, Monitor, Hand, Undo2, Redo2, Type, Image as ImageIcon, Link, Upload, Library, Folder, Palette, Eraser, Compass, Focus, X, Minus, Plus, Trash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 100 },
    style: { width: 360, height: 180 },
    data: { nodeType: 'idea', content: '# 核心游戏循环\n\n玩家探索废墟收集神器，然后使用它们来升级基地。' },
  },
];

const initialEdges: Edge[] = [];

// To fix data mutation inside nodes ReactFlow suggests setting data cleanly. We will wrap onChange.

function ViewportControls({ showMiniMap, setShowMiniMap }: { showMiniMap: boolean; setShowMiniMap: (v: boolean) => void }) {
  const { fitView, setViewport } = useReactFlow();
  const { x, y, zoom } = useViewport();
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setViewport({ x, y, zoom: newZoom });
  };

  return (
    <>
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-[6px] px-2 py-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/50 dark:border-white/10 rounded-xl shadow-2xl text-stone-500 dark:text-stone-400">
         <button onClick={() => setShowMiniMap(!showMiniMap)} className={`hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-lg ${showMiniMap ? 'bg-stone-200/50 dark:bg-white/10 text-stone-900 dark:text-white' : 'hover:bg-stone-100 dark:hover:bg-white/10'}`}>
           <Compass size={18} strokeWidth={2} />
         </button>
         <button onClick={() => fitView({ duration: 800 })} className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10">
           <Focus size={18} strokeWidth={2} />
         </button>
         
         <div className="flex items-center gap-1 mx-2">
            <button onClick={() => setViewport({ x, y, zoom: Math.max(0.1, zoom - 0.1) })} className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10">
              <Minus size={14} strokeWidth={2} />
            </button>
            <input 
              type="range" 
              min={0.1} max={2} step={0.01} 
              value={zoom} 
              onChange={handleZoomChange}
              className="w-24 h-[4px] mx-1 bg-stone-200 dark:bg-white/10 rounded-full appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-stone-500 dark:[&::-webkit-slider-thumb]:bg-stone-300 [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <button onClick={() => setViewport({ x, y, zoom: Math.min(2, zoom + 0.1) })} className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10">
              <Plus size={14} strokeWidth={2} />
            </button>
         </div>
         
         <span className="text-[13px] font-medium min-w-[4ch] text-right">
           {Math.round(zoom * 100)}%
         </span>
         
         <button onClick={() => setShowShortcuts(true)} className="hover:text-stone-900 dark:hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 ml-2">
           <CircleHelp size={18} strokeWidth={2} />
         </button>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
           <div className="bg-[#1e1e1e] border border-white/10 rounded-xl p-6 w-[400px] shadow-2xl text-stone-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                 <h3 className="text-sm font-semibold text-white">快捷键</h3>
                 <button onClick={() => setShowShortcuts(false)} className="text-stone-400 hover:text-white">
                   <X size={16} strokeWidth={2} />
                 </button>
              </div>
              
              <div className="space-y-4 text-[13px]">
                 <div className="flex justify-between">
                    <span className="text-stone-300">拖动画布</span>
                    <span className="text-stone-500">平移视图</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-300">滚轮</span>
                    <span className="text-stone-500">缩放画布</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-300">Ctrl / Cmd + 拖动</span>
                    <span className="text-stone-500">框选多个节点</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-300">Shift / Ctrl / Cmd + 点击</span>
                    <span className="text-stone-500">追加选择节点</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-300">Ctrl / Cmd + C / V</span>
                    <span className="text-stone-500">复制 / 粘贴节点</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-stone-300">Delete / Backspace</span>
                    <span className="text-stone-500">删除选中</span>
                 </div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}

interface WorkspaceProps {
  activeCanvasId: string | null;
  onUpdateCanvasStats?: (id: string, nodesCount: number, edgesCount: number) => void;
}

export default function Workspace({ activeCanvasId, onUpdateCanvasStats }: WorkspaceProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [showDoc, setShowDoc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [bgTexture, setBgTexture] = useState<'dots' | 'lines' | 'solid'>('dots');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === 'dark';
  
  const [defaultViewport] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game-design-workspace-viewport');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return { x: 100, y: 100, zoom: 1.0 };
  });

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'node' | 'edge';
    id: string;
  } | null>(null);

  const [dropMenu, setDropMenu] = useState<{
    x: number;
    y: number;
    flowX: number;
    flowY: number;
    sourceNodeId: string;
    sourceHandleId: string | null;
    sourceHandleType: string;
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  
  // React Flow instance for getting the viewport
  const [rfInstance, setRfInstance] = useState<any>(null);
  
  // Track currently loaded canvas ID to avoid saving stale/blank nodes during transition
  const loadedCanvasIdRef = useRef<string | null>(null);

  // Load from canvas-specific local storage
  useEffect(() => {
    if (!activeCanvasId) return;
    let initialN: Node[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 100 },
        style: { width: 360, height: 180 },
        data: { nodeType: 'idea', content: '# 核心游戏循环\n\n玩家探索废墟收集神器，然后使用它们来升级基地。' },
      }
    ];
    let initialE: Edge[] = [];

    const saved = localStorage.getItem(`sandbox-canvas-${activeCanvasId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          if (Array.isArray(parsed.nodes)) initialN = parsed.nodes;
          if (Array.isArray(parsed.edges)) initialE = parsed.edges;
        }
      } catch (e) {
        // ignore
      }
    }
    loadedCanvasIdRef.current = activeCanvasId;
    setNodes(initialN);
    setEdges(initialE);
  }, [activeCanvasId, setNodes, setEdges]);

  // Canvas-specific auto save
  useEffect(() => {
    if (!activeCanvasId || typeof window === 'undefined') return;
    
    // Prevent saving if the state nodes and edges belong to a different canvas (during transition)
    if (loadedCanvasIdRef.current !== activeCanvasId) {
      return;
    }

    localStorage.setItem(`sandbox-canvas-${activeCanvasId}`, JSON.stringify({ nodes, edges }));
    
    if (onUpdateCanvasStats) {
      onUpdateCanvasStats(activeCanvasId, nodes.length, edges.length);
    }
  }, [nodes, edges, activeCanvasId, onUpdateCanvasStats]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        id: node.id
      });
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'edge',
        id: edge.id
      });
    },
    []
  );

  const handleMoveEnd = useCallback((_event: any, viewport?: any) => {
    if (viewport) {
      localStorage.setItem('game-design-workspace-viewport', JSON.stringify(viewport));
    } else if (rfInstance) {
      localStorage.setItem('game-design-workspace-viewport', JSON.stringify(rfInstance.getViewport()));
    }
  }, [rfInstance]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const connectionStartParams = useRef<{ nodeId: string | null; handleId: string | null; handleType: string | null; } | null>(null);

  const onConnectStart = useCallback(
    (_: any, params: { nodeId: string | null; handleId: string | null; handleType: string | null; }) => {
      connectionStartParams.current = params;
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: any) => {
      const startParams = connectionStartParams.current;
      if (!startParams || !startParams.nodeId) return;

      let target = event.target as Element;
      
      if (event.type === 'touchend') {
          const touch = event.changedTouches[0];
          target = document.elementFromPoint(touch.clientX, touch.clientY) as Element;
      }

      if (!target) return;

      const targetNode = target.closest('.react-flow__node');
      if (targetNode) {
        const targetNodeId = targetNode.getAttribute('data-id');
        
        if (targetNodeId && targetNodeId !== startParams.nodeId) {
          let newConnection: Connection;
          
          if (startParams.handleType === 'source') {
            newConnection = {
              source: startParams.nodeId,
              sourceHandle: startParams.handleId,
              target: targetNodeId,
              targetHandle: 'target'
            };
          } else {
            newConnection = {
              source: targetNodeId,
              sourceHandle: 'source',
              target: startParams.nodeId,
              targetHandle: startParams.handleId
            };
          }
          
          onConnect(newConnection);
        }
      } else {
        // dropped on blank space
        const isToolbar = target.closest('.absolute') || target.closest('.fixed');
        if (!isToolbar) {
          let clientX = 0;
          let clientY = 0;

          if (event.type === 'touchend' || event.type === 'touchmove') {
            const touch = event.changedTouches[0] || event.touches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
          } else {
            clientX = event.clientX;
            clientY = event.clientY;
          }

          if (rfInstance && rfInstance.screenToFlowPosition) {
            const flowPos = rfInstance.screenToFlowPosition({ x: clientX, y: clientY });
            setDropMenu({
              x: clientX,
              y: clientY,
              flowX: flowPos.x,
              flowY: flowPos.y,
              sourceNodeId: startParams.nodeId,
              sourceHandleId: startParams.handleId || (startParams.handleType === 'source' ? 'source' : 'target'),
              sourceHandleType: startParams.handleType || 'source',
            });
          }
        }
      }
      
      connectionStartParams.current = null;
    },
    [onConnect, rfInstance]
  );

  const onNodeContentChange = useCallback((id: string, newContent: string, newTitle?: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
           // Create a new data object
          return { ...node, data: { ...node.data, content: newContent, title: newTitle ?? node.data.title } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onNodeDelete = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const handleSelectNodeType = useCallback((type: NodeType) => {
    if (!dropMenu) return;

    const newNodeId = uuidv4();
    // Center the created node around coordinates
    const position = {
      x: dropMenu.flowX - 180,
      y: dropMenu.flowY - 90,
    };

    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position,
      style: { width: 360, height: 180 },
      data: { nodeType: type, content: '' },
    };

    setNodes((nds) => nds.concat(newNode));

    const isSource = dropMenu.sourceHandleType === 'source';
    const newEdge: Edge = {
      id: uuidv4(),
      source: isSource ? dropMenu.sourceNodeId : newNodeId,
      sourceHandle: isSource ? dropMenu.sourceHandleId : 'source',
      target: isSource ? newNodeId : dropMenu.sourceNodeId,
      targetHandle: isSource ? 'target' : dropMenu.sourceHandleId,
      animated: true,
      style: { stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
    };

    setEdges((eds) => eds.concat(newEdge));
    setDropMenu(null);
  }, [dropMenu, setNodes, setEdges, isDark]);

  // Augment nodes with callbacks
  const augNodes = nodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onChange: onNodeContentChange,
      onDelete: onNodeDelete,
    }
  }));

  const addNode = (type: NodeType) => {
    const id = uuidv4();
    const position = rfInstance && rfInstance.screenToFlowPosition
      ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) 
      : { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 };
      
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      style: { width: 360, height: 180 },
      data: { nodeType: type, content: '' },
    };
    
    setNodes((nds) => nds.concat(newNode));
  };

  const generateDocument = () => {
    // Generate a markdown document walking through nodes
    // For MVP: order nodes by Y coordinate to get a top-down reading flow
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    let doc = '# 游戏推演设计文档 - 已导出\n\n';
    
    const getTypeLabel = (type: string) => {
      switch(type) {
        case 'idea': return '🧠 想法';
        case 'question': return '❓ 质疑';
        case 'expansion': return '➕ 发散';
        case 'contradiction': return '⚡ 冲突';
        case 'solution': return '✅ 解决';
        case 'conclusion': return '🎯 结论';
        default: return '节点';
      }
    }

    sortedNodes.forEach((node) => {
      const type = node.data.nodeType as string;
      const content = node.data.content as string;
      if (content.trim()) {
        doc += `## ${getTypeLabel(type)}\n\n`;
        doc += `${content}\n\n`;
        doc += `---\n\n`;
      }
    });

    return doc;
  };

  const downloadDoc = () => {
    const element = document.createElement('a');
    const file = new Blob([generateDocument()], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = 'game-design-doc.md';
    document.body.appendChild(element);
    element.click();
  };

  const handleThemeChange = (newTheme: string, e: React.MouseEvent) => {
    const isSupported = (document as any).startViewTransition;
    if (!isSupported) {
      setTheme(newTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      const root = document.documentElement;
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const willBeDark = newTheme === 'dark' || (newTheme === 'system' && isSystemDark);
      
      root.classList.remove('light', 'dark');
      root.classList.add(willBeDark ? 'dark' : 'light');
      root.style.colorScheme = willBeDark ? 'dark' : 'light';
      
      flushSync(() => {
        setTheme(newTheme);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  const handleBgTextureChange = (newTexture: 'dots' | 'lines' | 'solid', e: React.MouseEvent) => {
    const isSupported = (document as any).startViewTransition;
    if (!isSupported) {
      setBgTexture(newTexture);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setBgTexture(newTexture);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  useEffect(() => {
    setEdges((eds) => eds.map(e => ({
      ...e,
      style: { ...e.style, stroke: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' }
    })));
  }, [isDark, setEdges]);

  return (
    <div className="w-full h-full relative bg-stone-50 dark:bg-[#0c0c0c]">
      <ReactFlow
        nodes={augNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        defaultEdgeOptions={{ animated: true }}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        defaultViewport={defaultViewport}
        onMoveEnd={handleMoveEnd}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        className="bg-transparent"
      >
        {showMiniMap && (
          <MiniMap position="bottom-left" zoomable pannable nodeColor={(n) => {
            if (n.data?.nodeType === 'idea') return '#8fa3b4';
            if (n.data?.nodeType === 'question') return '#b48f8f';
            if (n.data?.nodeType === 'expansion') return '#9d8fb4';
            if (n.data?.nodeType === 'contradiction') return '#d4a373';
            if (n.data?.nodeType === 'solution') return '#8fb49a';
            if (n.data?.nodeType === 'conclusion') return '#b0a18e';
            return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
          }} maskColor={isDark ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)"} style={{ backgroundColor: isDark ? '#1c1c1c' : '#f5f5f4', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} className="!ml-6 !mb-[76px] shadow-2xl" />
        )}
        <ViewportControls showMiniMap={showMiniMap} setShowMiniMap={setShowMiniMap} />
        {bgTexture === 'dots' && <Background variant={BackgroundVariant.Dots} gap={20} size={2} color={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} />}
        {bgTexture === 'lines' && <Background variant={BackgroundVariant.Lines} gap={24} size={1} color={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />}
      </ReactFlow>

      {/* Context Menu Popup */}
      {contextMenu && (
        <div 
          className="fixed inset-0 z-[99999]" 
          onClick={() => setContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu(null);
          }}
        >
          <div 
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="absolute bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/50 dark:border-white/10 p-1.5 shadow-2xl rounded-xl w-48 text-stone-700 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                if (contextMenu.type === 'node') {
                  onNodeDelete(contextMenu.id);
                } else {
                  setEdges((eds) => eds.filter((e) => e.id !== contextMenu.id));
                }
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-left font-medium cursor-pointer"
            >
              <Trash size={14} />
              {contextMenu.type === 'node' ? '删除此创意粒子' : '删除此规则连线'}
            </button>
          </div>
        </div>
      )}

      {/* Drop Target Menu for Connections Released on Empty Canvas */}
      {dropMenu && (
        <div 
          className="fixed inset-0 z-[100000]" 
          onClick={() => setDropMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setDropMenu(null);
          }}
        >
          <div 
            style={{ top: dropMenu.y, left: dropMenu.x }}
            className="absolute bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/50 dark:border-white/10 p-2 shadow-2xl rounded-2xl w-52 text-stone-700 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider border-b border-stone-100 dark:border-white/5 mb-1.5 flex items-center justify-between">
              <span>新建并连接创意粒子</span>
              <button onClick={() => setDropMenu(null)} className="hover:text-stone-600 dark:hover:text-white cursor-pointer">
                <X size={10} />
              </button>
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleSelectNodeType('idea')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#8fa3b4]/10 flex items-center justify-center text-stone-600 dark:text-[#8fa3b4]">
                  <Lightbulb size={13} strokeWidth={2} />
                </div>
                <span>想法 (Idea)</span>
              </button>
              <button
                onClick={() => handleSelectNodeType('question')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#b48f8f]/10 flex items-center justify-center text-stone-600 dark:text-[#b48f8f]">
                  <CircleHelp size={13} strokeWidth={2} />
                </div>
                <span>质疑 (Question)</span>
              </button>
              <button
                onClick={() => handleSelectNodeType('expansion')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#9d8fb4]/10 flex items-center justify-center text-stone-600 dark:text-[#9d8fb4]">
                  <Maximize2 size={13} strokeWidth={2} />
                </div>
                <span>发散 (Expansion)</span>
              </button>
              <button
                onClick={() => handleSelectNodeType('contradiction')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#d4a373]/10 flex items-center justify-center text-stone-600 dark:text-[#d4a373]">
                  <Zap size={13} strokeWidth={2} />
                </div>
                <span>冲突 (Contradiction)</span>
              </button>
              <button
                onClick={() => handleSelectNodeType('solution')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#8fb49a]/10 flex items-center justify-center text-stone-600 dark:text-[#8fb49a]">
                  <CheckCircle2 size={13} strokeWidth={2} />
                </div>
                <span>解决 (Solution)</span>
              </button>
              <button
                onClick={() => handleSelectNodeType('conclusion')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#b0a18e]/10 flex items-center justify-center text-[#b0a18e]">
                  <Flag size={13} strokeWidth={2} />
                </div>
                <span>结论 (Conclusion)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Dock for Tools */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-[6px] p-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border border-stone-200/50 dark:border-white/10 rounded-xl shadow-2xl">
        <ToolbarButton onClick={() => {}} icon={<Hand size={18} strokeWidth={2} />} label="平移" isActive={true} />
        <div className="w-px h-6 bg-stone-200 dark:bg-white/10 mx-1"></div>
        <ToolbarButton onClick={() => addNode('idea')} icon={<Lightbulb size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="想法" />
        <ToolbarButton onClick={() => addNode('question')} icon={<CircleHelp size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="质疑" />
        <ToolbarButton onClick={() => addNode('expansion')} icon={<Maximize2 size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="发散" />
        <ToolbarButton onClick={() => addNode('contradiction')} icon={<Zap size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="冲突" />
        <ToolbarButton onClick={() => addNode('solution')} icon={<CheckCircle2 size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="解决" />
        <ToolbarButton onClick={() => addNode('conclusion')} icon={<Flag size={18} strokeWidth={2} />} color="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white" label="结论" />
        <div className="w-px h-6 bg-stone-200 dark:bg-white/10 mx-1"></div>
        <ToolbarButton onClick={() => setShowSettings(!showSettings)} icon={<Settings size={18} strokeWidth={2} />} label="设置" isActive={showSettings} />
        <ToolbarButton onClick={() => setShowDoc(!showDoc)} icon={<FileText size={18} strokeWidth={2} />} label="文档" isActive={showDoc} />
      </div>

        {showSettings && (
          <div className="absolute bottom-24 left-1/2 ml-[149px] -translate-x-1/2 z-[100] w-[260px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-5 origin-bottom animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
             <div className="mb-5">
                <h3 className="text-[13px] font-medium mb-3 text-stone-500 dark:text-stone-400">主题模式</h3>
                {mounted && (
                  <div className="flex bg-stone-200/50 dark:bg-black/50 p-1 rounded-xl">
                    <button 
                      onClick={(e) => handleThemeChange('light', e)} 
                      className={`flex-1 flex justify-center items-center py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-white dark:bg-[#2a2a2a] text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
                    >
                      <Sun size={14} className="mr-2" strokeWidth={2} /> 浅色
                    </button>
                    <button 
                      onClick={(e) => handleThemeChange('dark', e)} 
                      className={`flex-1 flex justify-center items-center py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
                    >
                      <Moon size={14} className="mr-2" strokeWidth={2} /> 深色
                    </button>
                  </div>
                )}
             </div>

             <div>
                <h3 className="text-[13px] font-medium mb-3 text-stone-500 dark:text-stone-400">网格样式</h3>
                <div className="flex justify-between bg-stone-200/50 dark:bg-black/50 p-1 rounded-xl">
                  <button 
                    onClick={(e) => handleBgTextureChange('dots', e)} 
                    className={`flex-1 flex justify-center items-center py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${bgTexture === 'dots' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
                  >
                    ⊙ 点
                  </button>
                  <button 
                    onClick={(e) => handleBgTextureChange('lines', e)} 
                    className={`flex-1 flex justify-center items-center py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${bgTexture === 'lines' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
                  >
                    田 线
                  </button>
                  <button 
                    onClick={(e) => handleBgTextureChange('solid', e)} 
                    className={`flex-1 flex justify-center items-center py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${bgTexture === 'solid' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm' : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300'}`}
                  >
                    ☐ 空白
                  </button>
                </div>
             </div>
          </div>
        )}

        {showDoc && (
          <div className="absolute top-0 right-0 w-1/3 min-w-[450px] h-full bg-white dark:bg-[#080808] border-l border-stone-200 dark:border-white/10 flex flex-col z-20 overflow-hidden slide-in-from-right-full animate-in duration-300 shadow-2xl pt-14">
             <div className="px-12 py-8 border-b border-stone-200 dark:border-white/10 justify-between items-center text-stone-900 dark:text-white flex shrink-0">
               <h2 className="text-[11px] uppercase tracking-[0.3em] text-stone-500 dark:text-white/70 flex items-center gap-3">
                  <FileText size={14} className="opacity-50" /> 
                  生成的设计文档
               </h2>
               <button onClick={downloadDoc} className="px-6 py-3 border border-stone-300 dark:border-[#b0a18e] text-stone-600 dark:text-[#b0a18e] text-[9px] uppercase tracking-[0.2em] hover:bg-stone-100 hover:text-stone-900 dark:hover:bg-[#b0a18e] dark:hover:text-black transition-colors flex items-center gap-2">
                 <Download size={14} /> 导出
               </button>
             </div>
             <div className="p-12 overflow-y-auto flex-1 prose prose-sm prose-stone dark:prose-invert max-w-none text-stone-700 dark:text-white/70 bg-transparent pb-20 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
               <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 text-sm leading-relaxed border-none text-stone-800 dark:text-[#d4d4d8]" style={{ fontFamily: 'Georgia, serif' }}>
                 {generateDocument()}
               </pre>
             </div>
          </div>
        )}
    </div>
  );
}

function ToolbarButton({ onClick, icon, color, label, isActive }: { onClick: () => void, icon: React.ReactNode, color?: string, label: string, isActive?: boolean }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all group relative cursor-pointer ${
        isActive 
          ? 'bg-stone-200/80 dark:bg-white/15 text-stone-900 dark:text-stone-100 shadow-sm scale-95' 
          : 'bg-transparent hover:bg-stone-100 dark:hover:bg-white/5'
      }`}
      title={label}
    >
      <div className={`${isActive ? 'text-stone-950 dark:text-white' : (color || 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white')} transition-colors flex items-center justify-center`}>
        {icon}
      </div>
    </button>
  );
}
