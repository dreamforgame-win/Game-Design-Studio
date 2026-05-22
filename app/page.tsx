'use client';

import { Menu, Share2, Sun, Moon, Github, MessageSquare, Hand, Undo2, Redo2, Type, Image as ImageIcon, Link, Upload, Library, Folder, Palette, Eraser } from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import Workspace from '@/components/canvas/Workspace';
import { useState, useEffect, useCallback } from 'react';
import { Header, ViewType } from '@/components/layout/Header';
import { LandingPage } from '@/components/landing/LandingPage';
import { ManagementPage } from '@/components/management/ManagementPage';
import { v4 as uuidv4 } from 'uuid';

export interface CanvasItem {
  id: string;
  name: string;
  nodesCount: number;
  edgesCount: number;
  updatedAt: string;
}

export default function Page() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  // Initialize sandboxes from localStorage
  const [canvases, setCanvases] = useState<CanvasItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game-design-canvases');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // fallback
        }
      }
    }
    return [
      {
        id: '1',
        name: '核心机制 & 体验循环演化',
        nodesCount: 5,
        edgesCount: 4,
        updatedAt: '05/22 12:13',
      }
    ];
  });

  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game-design-canvases');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0].id;
          }
        } catch (e) {
          // fallback
        }
      }
    }
    return '1';
  });

  const saveCanvases = useCallback((updated: CanvasItem[]) => {
    setCanvases(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('game-design-canvases', JSON.stringify(updated));
    }
  }, []);

  const handleCreateNewCanvas = useCallback(() => {
    const newId = uuidv4();
    const newCanvas: CanvasItem = {
      id: newId,
      name: `未命名的创意沙盘 ${canvases.length + 1}`,
      nodesCount: 0,
      edgesCount: 0,
      updatedAt: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    // Save empty canvas
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sandbox-canvas-${newId}`, JSON.stringify({
        nodes: [],
        edges: []
      }));
    }

    setCanvases((prev) => {
      const updated = [newCanvas, ...prev];
      localStorage.setItem('game-design-canvases', JSON.stringify(updated));
      return updated;
    });

    setActiveCanvasId(newId);
    setCurrentView('workspace');
  }, [canvases.length]);

  const handleDeleteCanvas = useCallback((id: string) => {
    setCanvases((prev) => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('game-design-canvases', JSON.stringify(updated));
      return updated;
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`sandbox-canvas-${id}`);
    }
    if (activeCanvasId === id || currentView === 'workspace') {
      setCurrentView('management');
      setActiveCanvasId(null);
    }
  }, [activeCanvasId, currentView]);

  const handleRenameCanvas = useCallback((id: string, newName: string) => {
    setCanvases((prev) => {
      const updated = prev.map(c => c.id === id ? { ...c, name: newName } : c);
      localStorage.setItem('game-design-canvases', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleDeleteAllCanvases = useCallback(() => {
    saveCanvases([]);
    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sandbox-canvas-')) {
          localStorage.removeItem(key);
        }
      }
    }
    setActiveCanvasId(null);
    setCurrentView('management');
  }, [saveCanvases]);

  const handleUpdateCanvasStats = useCallback((id: string, nodesCount: number, edgesCount: number) => {
    setCanvases((prev) => {
      let changed = false;
      const updated = prev.map((c) => {
        if (c.id === id) {
          if (c.nodesCount !== nodesCount || c.edgesCount !== edgesCount) {
            changed = true;
            return {
              ...c,
              nodesCount,
              edgesCount,
              updatedAt: new Date().toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
            };
          }
        }
        return c;
      });
      if (changed) {
        localStorage.setItem('game-design-canvases', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  const handleViewChange = (view: ViewType, canvasId?: string) => {
    setCurrentView(view);
    if (canvasId) {
      setActiveCanvasId(canvasId);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-stone-50 dark:bg-[#0a0a0a] text-stone-900 dark:text-[#d4d4d8] transition-colors duration-300" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
       
       <Header 
         currentView={currentView} 
         onViewChange={handleViewChange}
         activeCanvasId={activeCanvasId}
         canvases={canvases}
         onAddCanvas={handleCreateNewCanvas}
         onDeleteCanvas={handleDeleteCanvas}
       />

       <main className="w-full h-full relative">
          {currentView === 'landing' && <LandingPage onViewChange={handleViewChange} />}
          {currentView === 'management' && (
            <ManagementPage 
              onViewChange={handleViewChange} 
              canvases={canvases}
              onAddCanvas={handleCreateNewCanvas}
              onDeleteCanvas={handleDeleteCanvas}
              onRenameCanvas={handleRenameCanvas}
              onDeleteAllCanvases={handleDeleteAllCanvases}
            />
          )}
          {currentView === 'workspace' && (
            <ReactFlowProvider>
               <Workspace 
                 activeCanvasId={activeCanvasId}
                 onUpdateCanvasStats={handleUpdateCanvasStats}
               />
            </ReactFlowProvider>
          )}
       </main>
    </div>
  );
}
