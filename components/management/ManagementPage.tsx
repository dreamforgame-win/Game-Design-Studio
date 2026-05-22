import React, { useState } from 'react';
import { Download, Edit2, Trash2, Plus, Upload, Check, X } from 'lucide-react';
import { ViewType } from '../layout/Header';
import { v4 as uuidv4 } from 'uuid';

interface CanvasItem {
  id: string;
  name: string;
  nodesCount: number;
  edgesCount: number;
  updatedAt: string;
  selected?: boolean;
}

interface ManagementPageProps {
  onViewChange: (view: ViewType, canvasId?: string) => void;
  canvases: CanvasItem[];
  onAddCanvas: () => void;
  onDeleteCanvas: (id: string) => void;
  onRenameCanvas: (id: string, newName: string) => void;
  onDeleteAllCanvases: () => void;
}

export function ManagementPage({ 
  onViewChange, 
  canvases, 
  onAddCanvas, 
  onDeleteCanvas, 
  onRenameCanvas, 
  onDeleteAllCanvases 
}: ManagementPageProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  // Selection mode states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation Modals states
  const [canvasToDeleteId, setCanvasToDeleteId] = useState<string | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCanvasToDeleteId(id);
  };

  const handleConfirmSingleDelete = () => {
    if (canvasToDeleteId) {
      onDeleteCanvas(canvasToDeleteId);
      setCanvasToDeleteId(null);
    }
  };
  
  const handleBatchDeleteClick = () => {
    if (selectedIds.length > 0) {
      setShowBatchDeleteModal(true);
    }
  };

  const handleConfirmBatchDelete = () => {
    selectedIds.forEach(id => {
      onDeleteCanvas(id);
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
    setShowBatchDeleteModal(false);
  };

  const startEdit = (canvas: CanvasItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(canvas.id);
    setEditName(canvas.name);
  };

  const saveEdit = (id: string) => {
    onRenameCanvas(id, editName);
    setEditingId(null);
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      setSelectedIds([]);
    } else {
      setIsSelectionMode(true);
      setSelectedIds([]);
    }
  };

  const handleCardClick = (id: string) => {
    if (isSelectionMode) {
      setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-14 px-8 overflow-y-auto relative">
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(150,150,150,0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="max-w-6xl w-full mx-auto py-12 relative z-10">
        
        <div className="mb-10">
          <div className="text-stone-500 dark:text-stone-400 text-xs font-medium mb-2 tracking-wider select-none">灵感演化库</div>
          <div className="flex items-center justify-between select-none">
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">设计沙盘档案</h1>
            
            <div className="flex items-center gap-3">
              {/* Batch Delete button (visible and styled in selection mode) */}
              {isSelectionMode && (
                <button
                  onClick={handleBatchDeleteClick}
                  disabled={selectedIds.length === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 duration-150 ${
                    selectedIds.length > 0
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-md active:scale-95 cursor-pointer'
                      : 'bg-stone-100/50 dark:bg-stone-800/20 text-stone-400 dark:text-stone-600 border border-stone-200 dark:border-white/5 cursor-not-allowed'
                  }`}
                >
                  <Trash2 size={14} />
                  <span>删除已选 ({selectedIds.length})</span>
                </button>
              )}

              <button 
                onClick={toggleSelectionMode} 
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer select-none ${
                  isSelectionMode 
                    ? 'border-stone-400 dark:border-white/30 bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white'
                    : 'border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 text-stone-700 dark:text-stone-300'
                }`}
              >
                {isSelectionMode ? '取消选择' : '选择沙盘'}
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-stone-700 dark:text-stone-300 cursor-pointer">
                <Upload size={14} strokeWidth={2} /> 载入存档
              </button>
              <button 
                onClick={onAddCanvas}
                className="flex items-center gap-2 px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-white dark:hover:bg-stone-200 text-stone-900 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                <Plus size={16} strokeWidth={2} /> 构筑新沙盘
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {canvases.map(canvas => {
            const isSelected = selectedIds.includes(canvas.id);
            return (
              <div 
                key={canvas.id}
                onClick={() => handleCardClick(canvas.id)}
                onDoubleClick={() => {
                  if (!isSelectionMode && editingId !== canvas.id) {
                    onViewChange('workspace', canvas.id);
                  }
                }}
                className={`rounded-2xl p-5 hover:shadow-lg dark:hover:shadow-2xl transition-all group flex flex-col h-[180px] cursor-pointer select-none ${
                  isSelectionMode && isSelected 
                    ? 'bg-stone-100 dark:bg-stone-800/40 border-stone-500 dark:border-white/30 ring-1 ring-stone-500 dark:ring-white/20 shadow-md' 
                    : isSelectionMode
                      ? 'bg-stone-50/50 dark:bg-[#1a1a1a]/40 border-stone-200 dark:border-white/5 hover:border-stone-300 dark:hover:border-white/10'
                      : 'bg-stone-100 dark:bg-[#1f1f1f] border-stone-200 dark:border-transparent'
                } border`}
              >
                <div className="flex items-start gap-3 mb-2" onClick={(e) => { if (isSelectionMode) e.stopPropagation(); }}>
                  {isSelectionMode && (
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleCardClick(canvas.id)}
                      className="mt-1 flex-shrink-0 w-4 h-4 rounded border-stone-300 dark:border-white/20 text-stone-900 dark:text-white focus:ring-0 bg-transparent cursor-pointer"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {editingId === canvas.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                         <input 
                           value={editName}
                           onChange={(e) => setEditName(e.target.value)}
                           autoFocus
                           onKeyDown={(e) => {
                             if (e.key === 'Enter') saveEdit(canvas.id);
                             if (e.key === 'Escape') setEditingId(null);
                           }}
                           className="w-full bg-stone-200 dark:bg-black/50 border border-stone-300 dark:border-white/20 rounded px-2 py-1 text-sm font-semibold text-stone-900 dark:text-white outline-none select-text"
                         />
                         <button onClick={() => saveEdit(canvas.id)} className="text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"><Check size={16} /></button>
                         <button onClick={() => setEditingId(null)} className="text-stone-500 hover:text-stone-900 dark:hover:text-white cursor-pointer"><X size={16} /></button>
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold text-stone-900 dark:text-white truncate">
                        {canvas.name}
                      </h3>
                    )}
                    <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {canvas.nodesCount} 创意粒子 · {canvas.edgesCount} 规则演化链
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto flex items-center justify-between text-stone-400 dark:text-stone-500 text-xs">
                  <span>更新于 {canvas.updatedAt}</span>
                  {!isSelectionMode && (
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => e.stopPropagation()} className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer" title="下载">
                        <Download size={14} strokeWidth={2} />
                      </button>
                      <button 
                        onClick={(e) => startEdit(canvas, e)}
                        className="hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer" 
                        title="重命名"
                      >
                        <Edit2 size={14} strokeWidth={2} />
                      </button>
                      <button onClick={(e) => handleDeleteClick(canvas.id, e)} className="hover:text-red-500 transition-colors cursor-pointer" title="删除">
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Modern Center Modal Overlay for Single Card Delete */}
      {canvasToDeleteId !== null && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center z-[100000] animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl p-6 w-[360px] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1.5">
                确认要删除此设计沙盘吗？
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                删除后，此设计沙盘的所有创意粒子及连接规则将永久丢失，此操作不可撤销。
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setCanvasToDeleteId(null)}
                className="px-4 py-2 border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                删除当前沙盘
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Center Modal Overlay for Batch Delete */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center z-[100000] animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl p-6 w-[365px] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1.5">
                确认要删除选中的 {selectedIds.length} 个沙盘吗？
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                此操作将永久删除所有勾选的设计沙盘档案，以及其中所有的创意结构及演变关系，且不可恢复。
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
