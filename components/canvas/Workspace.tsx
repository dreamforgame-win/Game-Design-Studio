'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
import { Lightbulb, CircleHelp, Maximize2, Zap, CheckCircle2, Flag, Download, FileText, Settings, Moon, Sun, Monitor, Hand, Undo2, Redo2, Type, Image as ImageIcon, Link, Upload, Library, Folder, Palette, Eraser, Compass, Focus, X, Minus, Plus, Trash, Lock, Unlock, ExternalLink, Globe, Eye, Code, PanelLeft, PanelRight, Move, Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { flushSync } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

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
                    <span className="text-stone-300">Delete</span>
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
  const [docSnap, setDocSnap] = useState<'left' | 'right' | 'float'>('right');
  const [docWidth, setDocWidth] = useState(460);
  const [docHeight, setDocHeight] = useState(600);
  const [docPos, setDocPos] = useState({ x: 200, y: 100 });
  const [docMode, setDocMode] = useState<'preview' | 'code'>('preview');
  const [copiedDoc, setCopiedDoc] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);

  const onBeforeDelete = useCallback(async ({ nodes: nodesToDelete, edges: edgesToDelete }: { nodes: Node[]; edges: Edge[] }) => {
    setPendingDelete({
      nodes: nodesToDelete,
      edges: edgesToDelete
    });
    setShowDeleteConfirm(true);
    return false; // Tells React Flow NOT to delete them automatically
  }, []);

  // Dragging event reference
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const isDraggingRef = useRef(false);

  // Resizing event reference
  const resizeStartRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; startXPos: number; startYPos: number; direction: string } | null>(null);
  const isResizingRef = useRef(false);

  // Mouse Move / Up handlers dynamically registered using hoisted function syntax
  function handleDragMove(e: MouseEvent) {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    let newX = dragStartRef.current.posX + dx;
    let newY = dragStartRef.current.posY + dy;
    const maxW = window.innerWidth - 100;
    const maxH = window.innerHeight - 100;
    newX = Math.max(10, Math.min(maxW, newX));
    newY = Math.max(10, Math.min(maxH, newY));
    setDocPos({ x: newX, y: newY });
  }

  function handleDragEnd() {
    isDraggingRef.current = false;
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    e.preventDefault();
    let initialX = docPos.x;
    let initialY = docPos.y;
    
    if (docSnap !== 'float') {
      const docElement = document.getElementById('design-doc-popup');
      if (docElement) {
        const rect = docElement.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
      }
      setDocSnap('float');
    }
    
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: initialX,
      posY: initialY
    };
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  function handleResizeMove(e: MouseEvent) {
    if (!isResizingRef.current || !resizeStartRef.current) return;
    const { startX, startY, startWidth, startHeight, startXPos, startYPos, direction } = resizeStartRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startXPos;
    let newY = startYPos;
    
    if (direction.includes('e')) {
      newWidth = startWidth + dx;
    }
    if (direction.includes('w')) {
      newWidth = startWidth - dx;
      newX = startXPos + dx;
    }
    if (direction.includes('s')) {
      newHeight = startHeight + dy;
    }
    if (direction.includes('n')) {
      newHeight = startHeight - dy;
      newY = startYPos + dy;
    }
    
    newWidth = Math.max(300, Math.min(window.innerWidth - 48, newWidth));
    newHeight = Math.max(250, Math.min(window.innerHeight - 48, newHeight));
    
    setDocWidth(newWidth);
    
    if (docSnap === 'float') {
      setDocHeight(newHeight);
      if (direction.includes('w')) {
        setDocPos(prev => ({ ...prev, x: newX }));
      }
      if (direction.includes('n')) {
        setDocPos(prev => ({ ...prev, y: newY }));
      }
    }
  }

  function handleResizeEnd() {
    isResizingRef.current = false;
    resizeStartRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    let initialX = docPos.x;
    let initialY = docPos.y;
    let initialWidth = docWidth;
    let initialHeight = docHeight;
    
    const docElement = document.getElementById('design-doc-popup');
    if (docElement) {
      const rect = docElement.getBoundingClientRect();
      initialWidth = rect.width;
      initialHeight = rect.height;
      initialX = rect.left;
      initialY = rect.top;
    }
    
    resizeStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: initialWidth,
      startHeight: initialHeight,
      startXPos: initialX,
      startYPos: initialY,
      direction
    };
    isResizingRef.current = true;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const [bgTexture, setBgTexture] = useState<'dots' | 'lines' | 'solid'>('dots');
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted && resolvedTheme === 'dark';
  
  // Multimedia tool states and refs
  const [showMediaMenu, setShowMediaMenu] = useState(false);
  const [replacingNodeId, setReplacingNodeId] = useState<string | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  
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

  const contextTargetNode = contextMenu && contextMenu.type === 'node'
    ? nodes.find((n) => n.id === contextMenu.id)
    : null;
  const isContextMenuImage = contextTargetNode?.data?.nodeType === 'image';
  const isContextMenuWeb = contextTargetNode?.data?.nodeType === 'webpage';
  const hasImageUrl = !!(contextTargetNode?.data?.imageUrl as string);
  const hasUrl = !!(contextTargetNode?.data?.url as string);

  const [dropMenu, setDropMenu] = useState<{
    x: number;
    y: number;
    flowX: number;
    flowY: number;
    sourceNodeId: string;
    sourceHandleId: string | null;
    sourceHandleType: string;
  } | null>(null);

  const [paneContextMenu, setPaneContextMenu] = useState<{
    x: number;
    y: number;
    flowX: number;
    flowY: number;
  } | null>(null);

  const [pendingMediaFlowPos, setPendingMediaFlowPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  
  // React Flow instance for getting the viewport
  const [rfInstance, setRfInstance] = useState<any>(null);
  
  // Track currently loaded canvas ID to avoid saving stale/blank nodes during transition
  const loadedCanvasIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prevActiveCanvasId, setPrevActiveCanvasId] = useState<string | null>(null);

  if (activeCanvasId !== prevActiveCanvasId) {
    setPrevActiveCanvasId(activeCanvasId);
    setIsLoaded(false);
  }

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
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  }, [activeCanvasId, setNodes, setEdges]);

  // Canvas-specific auto save
  useEffect(() => {
    if (!activeCanvasId || typeof window === 'undefined') return;
    
    // Prevent saving if the state nodes and edges belong to a different canvas (during transition) or not loaded yet
    if (loadedCanvasIdRef.current !== activeCanvasId || !isLoaded) {
      return;
    }

    localStorage.setItem(`sandbox-canvas-${activeCanvasId}`, JSON.stringify({ nodes, edges }));
    
    if (onUpdateCanvasStats) {
      onUpdateCanvasStats(activeCanvasId, nodes.length, edges.length);
    }
  }, [nodes, edges, activeCanvasId, onUpdateCanvasStats, isLoaded]);

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

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      if (rfInstance && rfInstance.screenToFlowPosition) {
        const flowPos = rfInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
        setPaneContextMenu({
          x: event.clientX,
          y: event.clientY,
          flowX: flowPos.x,
          flowY: flowPos.y,
        });
      }
    },
    [rfInstance]
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

  const onNodeContentChange = useCallback((id: string, newContent: string, newTitle?: string, extraData?: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { 
            ...node, 
            data: { 
              ...node.data, 
              content: newContent, 
              title: newTitle ?? node.data.title,
              ...extraData
            } 
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const createImageNode = useCallback((base64: string, customPos?: { x: number; y: number }) => {
    const id = uuidv4();
    const position = customPos
      ? { x: customPos.x - 180, y: customPos.y - 140 }
      : (rfInstance && rfInstance.screenToFlowPosition
        ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) 
        : { x: window.innerWidth / 2 - 180, y: window.innerHeight / 2 - 140 });
      
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      style: { width: 360, height: 280 },
      data: { 
        nodeType: 'image', 
        imageUrl: base64, 
        title: '图片' 
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, setNodes]);

  const addWebpageNode = useCallback((customPos?: { x: number; y: number }) => {
    const id = uuidv4();
    const position = customPos
      ? { x: customPos.x - 225, y: customPos.y - 160 }
      : (rfInstance && rfInstance.screenToFlowPosition
        ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) 
        : { x: window.innerWidth / 2 - 225, y: window.innerHeight / 2 - 160 });
      
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      style: { width: 450, height: 320 },
      data: { 
        nodeType: 'webpage', 
        url: '', 
        title: '网页',
        isInteractive: true
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, setNodes]);

  const addFileNode = useCallback((customPos?: { x: number; y: number }) => {
    const id = uuidv4();
    const position = customPos
      ? { x: customPos.x - 200, y: customPos.y - 175 }
      : (rfInstance && rfInstance.screenToFlowPosition
        ? rfInstance.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) 
        : { x: window.innerWidth / 2 - 200, y: window.innerHeight / 2 - 175 });
      
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      style: { width: 400, height: 350 },
      data: { 
        nodeType: 'file', 
        title: '文件',
        content: '',
        fileType: '',
        fileName: '',
        fileSize: '',
        tableRows: null,
      },
    };
    
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance, setNodes]);

  const addNodeAtPosition = useCallback((type: NodeType | 'image' | 'webpage' | 'file', flowX: number, flowY: number) => {
    if (type === 'image') {
      return;
    }
    if (type === 'webpage') {
      addWebpageNode({ x: flowX, y: flowY });
      return;
    }
    if (type === 'file') {
      addFileNode({ x: flowX, y: flowY });
      return;
    }

    const id = uuidv4();
    const position = {
      x: flowX - 180,
      y: flowY - 90,
    };
    const newNode: Node = {
      id,
      type: 'custom',
      position,
      style: { width: 360, height: 180 },
      data: { nodeType: type, content: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [addWebpageNode, addFileNode, setNodes]);

  const handleMediaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
         const base64 = event.target?.result as string;
         if (base64) {
           if (replacingNodeId) {
             setNodes((nds) =>
               nds.map((node) => {
                 if (node.id === replacingNodeId) {
                   return {
                     ...node,
                     data: {
                       ...node.data,
                       imageUrl: base64,
                     },
                   };
                 }
                 return node;
               })
             );
           } else {
             if (pendingMediaFlowPos) {
               createImageNode(base64, pendingMediaFlowPos);
               setPendingMediaFlowPos(null);
             } else {
               createImageNode(base64);
             }
           }
         }
         setReplacingNodeId(null);
      };
      reader.readAsDataURL(file);
    } else {
      setReplacingNodeId(null);
    }
    // Reset file input target value so the same file selection triggers change again
    e.target.value = '';
  };

  // Global paste handler to automatically create image nodes from clipboard
  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              if (base64) {
                createImageNode(base64);
              }
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [createImageNode]);

  const onNodeDelete = useCallback((id: string) => {
    const nodeToDelete = nodes.find((n) => n.id === id);
    if (nodeToDelete) {
      setPendingDelete({
        nodes: [nodeToDelete],
        edges: edges.filter((e) => e.source === id || e.target === id),
      });
      setShowDeleteConfirm(true);
    }
  }, [nodes, edges]);

  const handleSelectNodeType = useCallback((type: NodeType) => {
    if (!dropMenu) return;

    const newNodeId = uuidv4();
    let style = { width: 360, height: 180 };
    let nodeData: any = { nodeType: type, content: '' };

    if (type === 'file') {
      style = { width: 400, height: 350 };
      nodeData = {
        nodeType: 'file',
        title: '文件',
        content: '',
        fileType: '',
        fileName: '',
        fileSize: '',
        tableRows: null,
      };
    }

    // Center the created node around coordinates
    const position = {
      x: dropMenu.flowX - (style.width / 2),
      y: dropMenu.flowY - (style.height / 2),
    };

    const newNode: Node = {
      id: newNodeId,
      type: 'custom',
      position,
      style,
      data: nodeData,
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
  const augNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onChange: onNodeContentChange,
        onDelete: onNodeDelete,
      }
    }));
  }, [nodes, onNodeContentChange, onNodeDelete]);

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
        case 'image': return '🖼️ 图片';
        case 'webpage': return '🌐 网页';
        case 'file': return '📁 文件';
        default: return '节点';
      }
    }

    sortedNodes.forEach((node) => {
      const type = node.data.nodeType as string;
      const title = node.data.title as string || '';
      const content = node.data.content as string;
      
      if (type === 'file') {
        const fileName = node.data.fileName as string || '';
        const fileType = node.data.fileType as string || '';
        const tableRows = node.data.tableRows as any[][] || null;

        doc += `## 📁 文件: ${title || fileName || '未命名文件'}\n\n`;
        doc += `* **文件名:** ${fileName || '未知'}\n`;
        doc += `* **文件包含格式:** ${fileType || '未知'}\n\n`;
        
        if (fileType === 'spreadsheet' && tableRows && tableRows.length > 0) {
          doc += `### 表格数据:\n\n`;
          tableRows.forEach((row, rIdx) => {
            doc += `| ` + row.map(cell => String(cell || '').replace(/\|/g, '\\|')).join(' | ') + ` |\n`;
            if (rIdx === 0) {
              doc += `| ` + row.map(() => '---').join(' | ') + ` |\n`;
            }
          });
          doc += `\n`;
        } else if (content && content.trim()) {
          doc += `### 文件内容:\n\n${content}\n\n`;
        }
        doc += `---\n\n`;
      } else if (content && typeof content === 'string' && content.trim()) {
        doc += `## ${getTypeLabel(type)}${title ? ': ' + title : ''}\n\n`;
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
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={() => {
          setPaneContextMenu(null);
          setContextMenu(null);
        }}
        deleteKeyCode={['Delete']}
        onBeforeDelete={onBeforeDelete}
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

      {/* Custom Delete Confirmation Dialog Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#151514] border border-stone-200/60 dark:border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4.5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">确认删除此内容？</h3>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans">
                  此删除操作将同步清除所有关联关系，且操作无法被撤销。
                </p>
              </div>
            </div>

            {/* Selected Elements Detail Spec */}
            <div className="bg-stone-50 dark:bg-black/20 rounded-xl p-3 text-xs border border-stone-100 dark:border-white/5 space-y-2 max-h-[140px] overflow-y-auto scrollbar-thin">
              {pendingDelete?.nodes && pendingDelete.nodes.length > 0 && (
                <div className="flex flex-col gap-1.5 font-sans">
                  <span className="font-semibold text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">创意粒子 ({pendingDelete.nodes.length})</span>
                  <div className="space-y-1">
                    {pendingDelete.nodes.map(n => {
                      const typeLabel = (n.data as any)?.nodeType === 'idea' ? '核心粒子' : (n.data as any)?.nodeType === 'question' ? '障碍/问题' : (n.data as any)?.nodeType === 'solution' ? '突破口/解法' : (n.data as any)?.nodeType === 'contradiction' ? '冲突/困难' : (n.data as any)?.nodeType === 'conclusion' ? '机制/定论' : (n.data as any)?.nodeType === 'expansion' ? '脑暴/衍生' : '粒子';
                      return (
                        <div key={n.id} className="flex justify-between items-center text-stone-700 dark:text-stone-300 gap-3 text-[11px]">
                          <span className="truncate max-w-[150px] font-medium">• {(n.data as any)?.title || '未命名粒子'}</span>
                          <span className="text-[9px] bg-stone-200/50 dark:bg-stone-800 px-1.5 py-0.5 rounded text-stone-500 dark:text-stone-400 shrink-0">{typeLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {pendingDelete?.edges && pendingDelete.edges.length > 0 && (
                <div className="flex flex-col gap-1 font-sans">
                  <span className="font-semibold text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider">规则连线 ({pendingDelete.edges.length})</span>
                  <p className="text-stone-500 dark:text-stone-400 text-[10px] leading-relaxed">
                    将被移除 {pendingDelete.edges.length} 条粒子间的连接线
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-1 font-sans">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPendingDelete(null);
                }}
                className="px-4.5 py-2 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 border border-stone-200/80 dark:border-white/10 rounded-full font-semibold text-xs transition-all cursor-pointer shadow-sm select-none"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (pendingDelete) {
                    const nodeIds = pendingDelete.nodes.map(n => n.id);
                    const edgeIds = pendingDelete.edges.map(e => e.id);
                    
                    setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
                    setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id) && !nodeIds.includes(e.source) && !nodeIds.includes(e.target)));
                  }
                  setShowDeleteConfirm(false);
                  setPendingDelete(null);
                }}
                className="px-4.5 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-full font-semibold text-xs transition-all cursor-pointer shadow-sm select-none"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

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
            className="absolute bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/50 dark:border-white/10 p-1.5 shadow-2xl rounded-xl w-48 text-stone-700 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image node specific actions */}
            {isContextMenuImage && hasImageUrl && (
              <>
                <button
                  onClick={() => {
                    setReplacingNodeId(contextMenu.id);
                    setContextMenu(null);
                    mediaInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <Upload size={14} className="text-stone-500" />
                  <span>更换图片</span>
                </button>
                <div className="h-px bg-stone-105 dark:bg-white/5 my-0.5" />
              </>
            )}

            {/* Webpage node specific actions */}
            {isContextMenuWeb && hasUrl && (
              <>
                <button
                  onClick={() => {
                    const isCurrentlyInteractive = contextTargetNode?.data?.isInteractive !== false;
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === contextMenu.id) {
                          return {
                            ...node,
                            data: {
                              ...node.data,
                              isInteractive: !isCurrentlyInteractive
                            }
                          };
                        }
                        return node;
                      })
                    );
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  {contextTargetNode?.data?.isInteractive !== false ? (
                    <>
                      <Lock size={14} className="text-stone-500" />
                      <span>锁定网页视口</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={14} className="text-stone-500" />
                      <span>解锁网页交互</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === contextMenu.id) {
                          return {
                            ...node,
                            data: {
                              ...node.data,
                              url: '',
                              title: '网页'
                            }
                          };
                        }
                        return node;
                      })
                    );
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <Globe size={14} className="text-stone-500" />
                  <span>修改网页链接</span>
                </button>

                <button
                  onClick={() => {
                    const url = contextTargetNode?.data?.url as string;
                    if (url) {
                      window.open(url, '_blank');
                    }
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <ExternalLink size={14} className="text-stone-500" />
                  <span>外部打开网页</span>
                </button>
                <div className="h-px bg-stone-105 dark:bg-white/5 my-0.5" />
              </>
            )}

            {contextMenu.type === 'node' && (
              <>
                <button
                  onClick={() => {
                    const currentPriority = contextTargetNode?.data?.scrollPriority !== false;
                    setNodes((nds) =>
                      nds.map((node) => {
                        if (node.id === contextMenu.id) {
                          return {
                            ...node,
                            data: {
                              ...node.data,
                              scrollPriority: !currentPriority
                            }
                          };
                        }
                        return node;
                      })
                    );
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <Hand size={14} className="text-stone-500" />
                  <span>{contextTargetNode?.data?.scrollPriority !== false ? '滚动模式: 优先滚动' : '滚动模式: 优先画板缩放'}</span>
                </button>
                <div className="h-px bg-stone-105 dark:bg-white/5 my-0.5" />
              </>
            )}

            <button
              onClick={() => {
                if (contextMenu.type === 'node') {
                  onNodeDelete(contextMenu.id);
                } else {
                  const edgeToDelete = edges.find((e) => e.id === contextMenu.id);
                  if (edgeToDelete) {
                    setPendingDelete({
                      nodes: [],
                      edges: [edgeToDelete]
                    });
                    setShowDeleteConfirm(true);
                  }
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
              <button
                onClick={() => handleSelectNodeType('file')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
              >
                <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#8f9eb4]/10 flex items-center justify-center text-stone-600 dark:text-[#8f9eb4]">
                  <FileText size={13} strokeWidth={2} />
                </div>
                <span>文件 (File)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pane Context Menu Popup on Empty Canvas */}
      {paneContextMenu && (
        <div 
          className="fixed inset-0 z-[99999]" 
          onClick={() => setPaneContextMenu(null)}
          onContextMenu={(e) => {
            e.preventDefault();
            setPaneContextMenu(null);
          }}
        >
          <div 
            style={{ top: paneContextMenu.y, left: paneContextMenu.x }}
            className="absolute bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/50 dark:border-white/10 p-2 shadow-2xl rounded-2xl w-52 text-stone-700 dark:text-stone-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider border-b border-stone-100 dark:border-white/5 mb-1.5 flex items-center justify-between">
              <span>新建创意粒子</span>
            </div>
            
            <button
              onClick={() => {
                addNodeAtPosition('idea', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#8fa3b4]/10 flex items-center justify-center text-stone-600 dark:text-[#8fa3b4]">
                <Lightbulb size={13} strokeWidth={2} />
              </div>
              <span>想法 (Idea)</span>
            </button>

            <button
              onClick={() => {
                addNodeAtPosition('question', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#b48f8f]/10 flex items-center justify-center text-stone-600 dark:text-[#b48f8f]">
                <CircleHelp size={13} strokeWidth={2} />
              </div>
              <span>质疑 (Question)</span>
            </button>

            <button
              onClick={() => {
                addNodeAtPosition('expansion', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#9d8fb4]/10 flex items-center justify-center text-stone-600 dark:text-[#9d8fb4]">
                <Maximize2 size={13} strokeWidth={2} />
              </div>
              <span>发散 (Expansion)</span>
            </button>

            <button
              onClick={() => {
                addNodeAtPosition('contradiction', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#d4a373]/10 flex items-center justify-center text-stone-600 dark:text-[#d4a373]">
                <Zap size={13} strokeWidth={2} />
              </div>
              <span>冲突 (Contradiction)</span>
            </button>

            <button
              onClick={() => {
                addNodeAtPosition('solution', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#8fb49a]/10 flex items-center justify-center text-stone-600 dark:text-[#8fb49a]">
                <CheckCircle2 size={13} strokeWidth={2} />
              </div>
              <span>解决 (Solution)</span>
            </button>

            <button
              onClick={() => {
                addNodeAtPosition('conclusion', paneContextMenu.flowX, paneContextMenu.flowY);
                setPaneContextMenu(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
            >
              <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-[#b0a18e]/10 flex items-center justify-center text-[#b0a18e]">
                <Flag size={13} strokeWidth={2} />
              </div>
              <span>结论 (Conclusion)</span>
            </button>

            <div className="h-px bg-stone-100 dark:bg-white/5 my-1" />

            <div className="relative group/sub">
              <button
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200 animate-in duration-100"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500">
                    <Library size={13} strokeWidth={2} />
                  </div>
                  <span>功能组件</span>
                </div>
                <span className="text-[9px] text-stone-400">▶</span>
              </button>
              
              <div className="absolute top-0 left-full ml-1 w-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-stone-200/50 dark:border-white/10 p-1.5 shadow-2xl rounded-xl text-stone-700 dark:text-stone-200 flex flex-col gap-0.5 animate-in fade-in slide-in-from-left-2 duration-150 hidden group-hover/sub:flex hover:flex">
                <button
                  onClick={() => {
                    setPendingMediaFlowPos({ x: paneContextMenu.flowX, y: paneContextMenu.flowY });
                    setPaneContextMenu(null);
                    mediaInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <ImageIcon size={13} className="text-stone-500" />
                  <span>上传图片</span>
                </button>
                <button
                  onClick={() => {
                    addWebpageNode({ x: paneContextMenu.flowX, y: paneContextMenu.flowY });
                    setPaneContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <Link size={13} className="text-stone-500" />
                  <span>添加网页</span>
                </button>
                <button
                  onClick={() => {
                    addFileNode({ x: paneContextMenu.flowX, y: paneContextMenu.flowY });
                    setPaneContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer"
                >
                  <FileText size={13} className="text-stone-500" />
                  <span>添加文件</span>
                </button>
              </div>
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
        
        {/* Component Dropdown Menu */}
        <ToolbarButton 
          onClick={() => {
            setShowMediaMenu(!showMediaMenu);
            setShowSettings(false);
          }} 
          icon={<Library size={18} strokeWidth={2} />} 
          label="功能组件" 
          isActive={showMediaMenu} 
        />

        <div className="w-px h-6 bg-stone-200 dark:bg-white/10 mx-1"></div>
        <ToolbarButton 
          onClick={() => {
            setShowSettings(!showSettings);
            setShowMediaMenu(false);
          }} 
          icon={<Settings size={18} strokeWidth={2} />} 
          label="设置" 
          isActive={showSettings} 
        />
        <ToolbarButton 
          onClick={() => {
            setShowDoc(!showDoc);
            setShowMediaMenu(false);
            setShowSettings(false);
          }} 
          icon={<FileText size={18} strokeWidth={2} />} 
          label="文档" 
          isActive={showDoc} 
        />
      </div>

      <input 
        type="file" 
        ref={mediaInputRef} 
        onChange={handleMediaFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {showMediaMenu && (
        <div className="absolute bottom-24 left-1/2 ml-[88px] -translate-x-1/2 z-[100] w-[260px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/50 dark:border-white/10 rounded-2xl shadow-2xl p-5 origin-bottom animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
           <div className="mb-4">
              <h3 className="text-[13px] font-medium text-stone-500 dark:text-stone-400">功能组件</h3>
           </div>
           <div className="space-y-2">
              <button
                onClick={() => {
                  setShowMediaMenu(false);
                  mediaInputRef.current?.click();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-100/40 dark:bg-black/40 hover:bg-stone-100/85 dark:hover:bg-white/5 border border-transparent hover:border-stone-200/50 dark:hover:border-white/10 rounded-xl transition-all cursor-pointer text-stone-700 dark:text-stone-200 text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon size={14} className="text-stone-500 dark:text-stone-400" />
                  <span>上传图片</span>
                </div>
                <Upload size={12} className="opacity-40" />
              </button>
              <button
                onClick={() => {
                  setShowMediaMenu(false);
                  addWebpageNode();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-100/40 dark:bg-black/40 hover:bg-stone-100/85 dark:hover:bg-white/5 border border-transparent hover:border-stone-200/50 dark:hover:border-white/10 rounded-xl transition-all cursor-pointer text-stone-700 dark:text-stone-200 text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Link size={14} className="text-stone-500 dark:text-stone-400" />
                  <span>添加网页</span>
                </div>
                <ExternalLink size={12} className="opacity-40" />
              </button>
              <button
                onClick={() => {
                  setShowMediaMenu(false);
                  addFileNode();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-stone-100/40 dark:bg-black/40 hover:bg-stone-100/85 dark:hover:bg-white/5 border border-transparent hover:border-stone-200/50 dark:hover:border-white/10 rounded-xl transition-all cursor-pointer text-stone-700 dark:text-stone-200 text-xs font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <FileText size={14} className="text-stone-500 dark:text-stone-400" />
                  <span>添加文件</span>
                </div>
                <Upload size={12} className="opacity-40" />
              </button>
           </div>
        </div>
      )}

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
          <div 
            id="design-doc-popup"
            className={`absolute bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border border-stone-200/50 dark:border-white/10 flex flex-col z-[100] overflow-hidden rounded-2xl shadow-2xl select-none ${
              docSnap === 'left' 
                ? 'top-6 left-6 bottom-28 origin-left animate-in slide-in-from-left-10 fade-in duration-300' 
                : docSnap === 'right'
                  ? 'top-6 right-6 bottom-28 origin-right animate-in slide-in-from-right-10 fade-in duration-300'
                  : 'origin-center duration-75'
            }`}
            style={
              docSnap === 'float' 
                ? {
                    left: `${docPos.x}px`,
                    top: `${docPos.y}px`,
                    width: `${docWidth}px`,
                    height: `${docHeight}px`,
                    bottom: 'auto',
                    right: 'auto',
                    position: 'absolute'
                  }
                : {
                    width: `${docWidth}px`,
                    height: 'auto'
                  }
            }
          >
             {/* Drag & Header Bar */}
             <div 
               className="px-4 py-3 border-b border-stone-200/50 dark:border-white/10 flex justify-between items-center text-stone-900 dark:text-white shrink-0 bg-stone-50/50 dark:bg-black/10 select-none cursor-grab active:cursor-grabbing" 
               onMouseDown={handleDragStart}
             >
               <div className="flex items-center gap-2">
                 <div className="flex items-center gap-1 bg-stone-100/80 dark:bg-black/40 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 border border-stone-200/30 dark:border-white/5">
                   <FileText size={13} className="text-stone-500 animate-pulse" />
                   <span>设计文档</span>
                 </div>
                 
                 {/* Snap Controllers */}
                 <div className="flex items-center bg-stone-200/30 dark:bg-black/25 p-0.5 rounded-full border border-stone-200/40 dark:border-white/5 shrink-0">
                   <button 
                     onClick={() => setDocSnap('left')} 
                     className={`p-1.5 rounded-full transition-all cursor-pointer ${docSnap === 'left' ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-sm scale-105' : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'}`}
                     title="吸附至左侧"
                   >
                     <PanelLeft size={11} />
                   </button>
                   <button 
                     onClick={() => setDocSnap('float')} 
                     className={`p-1.5 rounded-full transition-all cursor-pointer ${docSnap === 'float' ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-sm scale-105' : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'}`}
                     title="悬浮自由拖拽"
                   >
                     <Move size={11} />
                   </button>
                   <button 
                     onClick={() => setDocSnap('right')} 
                     className={`p-1.5 rounded-full transition-all cursor-pointer ${docSnap === 'right' ? 'bg-white dark:bg-stone-800 text-stone-950 dark:text-white shadow-sm scale-105' : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'}`}
                     title="吸附至右侧"
                   >
                     <PanelRight size={11} />
                   </button>
                 </div>
               </div>

               <div className="flex items-center gap-2">
                 {/* Mode Switches */}
                 <div className="flex bg-stone-200/50 dark:bg-black/35 p-0.5 rounded-full border border-stone-200/30 dark:border-white/5">
                   <button
                     onClick={() => setDocMode('preview')}
                     className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                       docMode === 'preview'
                         ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                         : 'text-stone-500 hover:text-stone-850 dark:text-stone-400 dark:hover:text-stone-200'
                     }`}
                   >
                     <Eye size={11} />
                     <span>预览</span>
                   </button>
                   <button
                     onClick={() => setDocMode('code')}
                     className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all cursor-pointer ${
                       docMode === 'code'
                         ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm'
                         : 'text-stone-500 hover:text-stone-850 dark:text-stone-400 dark:hover:text-stone-200'
                     }`}
                   >
                     <Code size={11} />
                     <span>源码</span>
                   </button>
                 </div>

                 {/* Export & Close Buttons */}
                 <button 
                   onClick={downloadDoc} 
                   className="flex items-center gap-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-50 text-white dark:text-stone-900 rounded-full font-semibold text-xs transition-all shadow-sm cursor-pointer select-none shrink-0"
                   title="导出设计文档"
                 >
                   <Download size={11} />
                   <span className="hidden sm:inline">导出</span>
                 </button>
                 <button 
                   onClick={() => setShowDoc(false)} 
                   className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-[#1c1c1a]/90 dark:hover:bg-[#2c2c2a] border border-stone-200/60 dark:border-white/10 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 flex items-center justify-center transition-all cursor-pointer shadow-sm select-none shrink-0"
                   title="关闭"
                 >
                   <X size={13} />
                 </button>
               </div>
             </div>

             {/* Document Body View Area */}
             <div className="p-5 overflow-y-auto flex-1 bg-transparent flex flex-col min-h-0 select-text">
               {docMode === 'preview' ? (
                 <div className="prose prose-stone dark:prose-invert max-w-none text-stone-750 dark:text-stone-300 font-sans pb-16">
                   <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{generateDocument()}</ReactMarkdown>
                 </div>
               ) : (
                 <div className="flex-1 w-full h-full flex flex-col relative bg-stone-100/40 dark:bg-black/35 rounded-xl border border-stone-200/40 dark:border-white/5 overflow-hidden font-mono text-xs text-stone-800 dark:text-stone-200">
                   <div className="px-3.5 py-2 bg-stone-200/35 dark:bg-black/20 border-b border-stone-200/30 dark:border-white/5 flex justify-between items-center text-[10px] uppercase tracking-wider text-stone-500 shrink-0 select-none">
                     <span>Markdown 源码模式</span>
                     <button
                       onClick={() => {
                         navigator.clipboard.writeText(generateDocument());
                         setCopiedDoc(true);
                         setTimeout(() => setCopiedDoc(false), 2000);
                       }}
                       className="flex items-center gap-1 px-2.5 py-1 bg-stone-200 dark:bg-[#2c2c2c] hover:bg-stone-250 hover:text-stone-900 dark:hover:bg-[#3c3c3c] dark:hover:text-white rounded-full transition-all border border-transparent font-medium cursor-pointer"
                     >
                       {copiedDoc ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                       <span>{copiedDoc ? '已复制' : '复制文本'}</span>
                     </button>
                   </div>
                   <textarea
                     readOnly
                     value={generateDocument()}
                     className="flex-1 p-3.5 w-full h-full bg-transparent resize-none border-none outline-none focus:ring-0 text-stone-700 dark:text-stone-300 font-mono text-xs select-text leading-relaxed overflow-y-auto scrollbar-thin"
                   />
                 </div>
               )}
             </div>

             {/* Dynamic Four-Corner & Side Resize Handles */}
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'nw')} 
               className="absolute left-0 top-0 w-3 h-3 cursor-nwse-resize z-50 hover:bg-stone-500/20 rounded-full transition-all" 
               title="拉伸"
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'ne')} 
               className="absolute right-0 top-0 w-3 h-3 cursor-nesw-resize z-50 hover:bg-stone-500/20 rounded-full transition-all" 
               title="拉伸"
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'se')} 
               className="absolute right-0 bottom-0 w-3 h-3 cursor-nwse-resize z-50 hover:bg-stone-500/20 rounded-full transition-all" 
               title="拉伸"
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'sw')} 
               className="absolute left-0 bottom-0 w-3 h-3 cursor-nesw-resize z-50 hover:bg-stone-500/20 rounded-full transition-all" 
               title="拉伸"
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'w')} 
               className="absolute left-0 top-3 bottom-3 w-1.5 cursor-ew-resize z-40 hover:bg-stone-500/10 transition-all" 
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'e')} 
               className="absolute right-0 top-3 bottom-3 w-1.5 cursor-ew-resize z-40 hover:bg-stone-500/10 transition-all" 
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 'n')} 
               className="absolute top-0 left-3 right-3 h-1.5 cursor-ns-resize z-40 hover:bg-stone-500/10 transition-all" 
             />
             <div 
               onMouseDown={(e) => handleResizeStart(e, 's')} 
               className="absolute bottom-0 left-3 right-3 h-1.5 cursor-ns-resize z-40 hover:bg-stone-500/10 transition-all" 
             />
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
