import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps, NodeResizeControl } from '@xyflow/react';
import { Lightbulb, CircleHelp, Maximize2, Zap, CheckCircle2, Flag, Edit2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type NodeType = 'idea' | 'question' | 'expansion' | 'contradiction' | 'solution' | 'conclusion';

const nodeConfig = {
  idea: { border: 'border-stone-350 dark:border-[#8fa3b4]/30', headerBg: 'bg-stone-55 dark:bg-[#8fa3b4]/[0.05]', icon: Lightbulb, label: '想法', text: 'text-stone-700 dark:text-[#8fa3b4]', handle: 'bg-stone-400 dark:bg-[#8fa3b4]/30 hover:bg-stone-600 dark:hover:bg-[#8fa3b4]/80' },
  question: { border: 'border-stone-350 dark:border-[#b48f8f]/30', headerBg: 'bg-stone-55 dark:bg-[#b48f8f]/[0.05]', icon: CircleHelp, label: '质疑', text: 'text-stone-700 dark:text-[#b48f8f]', handle: 'bg-stone-400 dark:bg-[#b48f8f]/30 hover:bg-stone-600 dark:hover:bg-[#b48f8f]/80' },
  expansion: { border: 'border-stone-350 dark:border-[#9d8fb4]/30', headerBg: 'bg-stone-55 dark:bg-[#9d8fb4]/[0.05]', icon: Maximize2, label: '发散', text: 'text-stone-700 dark:text-[#9d8fb4]', handle: 'bg-stone-400 dark:bg-[#9d8fb4]/30 hover:bg-stone-600 dark:hover:bg-[#9d8fb4]/80' },
  contradiction: { border: 'border-stone-350 dark:border-[#d4a373]/30', headerBg: 'bg-stone-55 dark:bg-[#d4a373]/[0.05]', icon: Zap, label: '冲突', text: 'text-stone-700 dark:text-[#d4a373]', handle: 'bg-stone-400 dark:bg-[#d4a373]/30 hover:bg-stone-600 dark:hover:bg-[#d4a373]/80' },
  solution: { border: 'border-stone-350 dark:border-[#8fb49a]/30', headerBg: 'bg-stone-55 dark:bg-[#8fb49a]/[0.05]', icon: CheckCircle2, label: '解决', text: 'text-stone-700 dark:text-[#8fb49a]', handle: 'bg-stone-400 dark:bg-[#8fb49a]/30 hover:bg-stone-600 dark:hover:bg-[#8fb49a]/80' },
  conclusion: { border: 'border-[#b0a18e]/50 dark:border-[#b0a18e]/50', headerBg: 'bg-stone-55 dark:bg-[#b0a18e]/[0.1]', icon: Flag, label: '结论', text: 'text-[#b0a18e]', handle: 'bg-[#b0a18e]/50 hover:bg-[#b0a18e]/90' }
};

export default function CustomNode({ data, id, selected }: NodeProps) {
  const type = data.nodeType as NodeType || 'idea';
  const config = nodeConfig[type] || nodeConfig.idea;
  
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content as string || '');
  const [title, setTitle] = useState(data.title as string || config.label);

  const Icon = config.icon;

  const handleSave = () => {
    setIsEditing(false);
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, content, title);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const currentTarget = e.currentTarget;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        handleSave();
      }
    }, 50);
  };

  return (
    <div 
      onBlur={handleBlur}
      className={`group w-full h-full min-w-[200px] min-h-[140px] rounded-2xl bg-white/95 dark:bg-[#1a1a1a]/95 border-2 flex flex-col backdrop-blur-3xl transition-all duration-200 text-stone-900 dark:text-stone-200 ${
        selected 
          ? 'border-stone-850 dark:border-stone-100 ring-3 ring-stone-850/10 dark:ring-white/10 shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(255,255,255,0.08)] scale-[1.01]' 
          : `hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] ${config.border}`
      } ${isEditing ? '' : 'cursor-move [&_*]:cursor-move'}`}
    >
      <NodeResizeControl minWidth={200} minHeight={140} className="!bg-transparent !border-none !w-8 !h-8 !right-0 !bottom-0 flex items-end justify-end p-2 cursor-nwse-resize group">
         <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none pb-1 pr-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-stone-400 dark:text-white/20">
               <line x1="21" y1="21" x2="21" y2="21" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
               <line x1="15" y1="21" x2="21" y2="15" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
               <line x1="9" y1="21" x2="21" y2="9" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
         </div>
      </NodeResizeControl>

      <Handle type="target" position={Position.Left} id="target" className={`w-[10px] h-[10px] ${config.handle} transition-all duration-200 rounded-full border-2 border-white dark:border-[#1a1a1a] -left-[5px] hover:scale-150 shadow-sm cursor-crosshair`} />
      
      {/* Header */}
      <div className={`px-4 py-3 border-b border-black/5 dark:border-white/5 flex items-center justify-between rounded-t-2xl shrink-0 ${config.headerBg}`}>
        <div className={`flex items-center space-x-3`}>
          {isEditing ? (
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-sm font-semibold tracking-wide placeholder:text-stone-400/50 dark:placeholder:text-white/20 outline-none shadow-none text-stone-800 dark:text-stone-200 w-[120px]"
              placeholder="节点名称..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          ) : (
            <span className="text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-200" onDoubleClick={() => setIsEditing(true)}>{title}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs font-medium px-2 py-0.5 rounded border border-stone-200/50 dark:border-white/10 bg-white/50 dark:bg-white/5 text-stone-500 dark:text-stone-400 shrink-0">
            <Icon size={12} strokeWidth={2} />
            <span>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div 
        className={`p-6 bg-transparent flex-1 overflow-auto text-stone-700 dark:text-[#d4d4d8] text-[13px] font-light leading-relaxed flex flex-col ${
          isEditing ? 'cursor-text' : ''
        }`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <textarea
            className="nodrag w-full flex-1 p-0 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/20 font-sans"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown 格式..."
            autoFocus
          />
        ) : (
          <div className="prose prose-sm prose-stone dark:prose-invert max-w-none break-words hover:text-stone-900 dark:hover:text-white transition-colors flex-1 w-full h-full">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            ) : (
              <span className="text-stone-400 dark:text-white/20 italic font-serif text-sm tracking-wide pointer-events-none" style={{ fontFamily: 'Georgia, serif' }}>双击编辑内容...</span>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} id="source" className={`w-[10px] h-[10px] ${config.handle} transition-all duration-200 rounded-full border-2 border-white dark:border-[#1a1a1a] -right-[5px] hover:scale-150 shadow-sm cursor-crosshair`} />
    </div>
  );
}
