import React, { useEffect, useState } from 'react';
import { Mountain, Maximize2, ImagePlus, FileText, Image as ImageIcon, Share2, Sun, Moon, Github, Menu, MessageSquare, Home, Layers, Plus, Trash2 } from 'lucide-react';
import { useThemeToggle } from '@/lib/theme';

export type ViewType = 'landing' | 'management' | 'workspace';

interface CanvasItem {
  id: string;
  name: string;
  nodesCount: number;
  edgesCount: number;
  updatedAt: string;
}

interface HeaderProps {
  currentView: ViewType;
  onViewChange: (view: ViewType, canvasId?: string) => void;
  activeCanvasId?: string | null;
  canvases?: CanvasItem[];
  onAddCanvas?: () => void;
  onDeleteCanvas?: (id: string) => void;
}

export function Header({ 
  currentView, 
  onViewChange, 
  activeCanvasId, 
  canvases = [], 
  onAddCanvas, 
  onDeleteCanvas 
}: HeaderProps) {
  const { toggleTheme, theme, resolvedTheme } = useThemeToggle();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const canvasName = activeCanvas ? activeCanvas.name : '未命名创意沙盘';

  const tabs = [
    { id: 'landing', label: '概念大厅', icon: Mountain },
    { id: 'management', label: '设计沙盘', icon: Maximize2 },
    { id: 'generator', label: '原型演化', icon: ImagePlus },
    { id: 'prompts', label: '机制词库', icon: FileText },
    { id: 'assets', label: '设计资产', icon: ImageIcon },
  ];

  return (
    <header className="absolute top-0 left-0 w-full h-14 bg-transparent flex items-center justify-between px-4 z-40 pointer-events-none">
      
      {/* Backdrop trigger for dropdown click outside */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40 pointer-events-auto" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {currentView === 'workspace' ? (
        <div className="flex items-center gap-3 pointer-events-auto pl-4 relative">
           <button 
             onClick={() => setShowMenu(!showMenu)}
             className={`p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-stone-100 dark:hover:bg-white/5 ${showMenu ? 'bg-stone-100 dark:bg-white/10 text-stone-950 dark:text-white' : ''}`}
           >
              <Menu size={20} strokeWidth={2} />
           </button>
           <div className="text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-100 bg-white/70 dark:bg-stone-950/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-stone-200/20 dark:border-white/5">
              {canvasName}
           </div>

           {/* Popover Navigation Menu */}
           {showMenu && (
             <div className="absolute top-12 left-4 w-52 bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-white/10 p-1.5 shadow-2xl rounded-2xl z-50 text-stone-700 dark:text-stone-200 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
               <button
                 onClick={() => {
                   onViewChange('landing');
                   setShowMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
               >
                 <Home size={14} className="text-stone-500 dark:text-stone-400" />
                 <span>主页</span>
               </button>
               
               <button
                 onClick={() => {
                   onViewChange('management');
                   setShowMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
               >
                 <Layers size={14} className="text-stone-500 dark:text-stone-400" />
                 <span>设计沙盘</span>
               </button>

               <div className="my-1 border-t border-stone-100 dark:border-white/5"></div>

               <button
                 onClick={() => {
                   if (onAddCanvas) onAddCanvas();
                   setShowMenu(false);
                 }}
                 className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-stone-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left font-medium cursor-pointer text-stone-700 dark:text-stone-200"
               >
                 <Plus size={14} className="text-stone-500 dark:text-stone-400" />
                 <span>新建沙盘</span>
               </button>

               <button
                 onClick={() => {
                   setShowConfirmDelete(true);
                 }}
                 className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-red-50/50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors text-left font-medium cursor-pointer"
               >
                 <Trash2 size={14} />
                 <span>删除当前沙盘</span>
               </button>
             </div>
           )}
        </div>
      ) : (
        <div className="flex items-center gap-6 h-full pointer-events-auto pl-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentView === tab.id;
            // For now, only landing and management are implemented, others are stubs
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'landing' || tab.id === 'management') {
                    onViewChange(tab.id as ViewType);
                  }
                }}
                className={`flex items-center gap-2 h-full border-b-2 transition-colors ${
                  isActive 
                    ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white' 
                    : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
      
      <div className="flex items-center gap-4 text-stone-600 dark:text-stone-400 text-xs font-medium pointer-events-auto pr-4">
        {currentView === 'workspace' && (
          <button className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
            <Share2 size={16} strokeWidth={2} />
          </button>
        )}
        <button onClick={toggleTheme} className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
          {mounted && resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2} className="animate-in spin-in-90 fade-in duration-300" /> : <Moon size={16} strokeWidth={2} className="animate-in spin-in-90 fade-in duration-300" />}
        </button>
        <span className="opacity-60">v0.0.4</span>
        <button className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
          <Github size={16} strokeWidth={2} />
        </button>
        {currentView === 'workspace' ? (
          <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <MessageSquare size={14} strokeWidth={2} />
              助手
            </button>
          </>
        ) : (
          <button className="flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-white transition-colors ml-2 cursor-pointer">
            <span className="text-sm font-medium">登录</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal overlay centered on screen */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-[100000] pointer-events-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl p-6 w-[360px] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1.5">
                确认要删除当前沙盘吗？
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                删除后，当前设计沙盘的所有创意粒子及规则演化关系将永久丢失，此操作不可撤销。
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={() => {
                  if (onDeleteCanvas && activeCanvasId) {
                    onDeleteCanvas(activeCanvasId);
                  }
                  setShowConfirmDelete(false);
                  setShowMenu(false);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                删除当前沙盘
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
