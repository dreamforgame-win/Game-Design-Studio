import React, { useEffect, useState } from 'react';
import { Mountain, Maximize2, ImagePlus, FileText, Image as ImageIcon, Share2, Sun, Moon, Github, Menu, MessageSquare, Home, Layers, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
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
  onRenameCanvas?: (id: string, newName: string) => void;
}

export function Header({ 
  currentView, 
  onViewChange, 
  activeCanvasId, 
  canvases = [], 
  onAddCanvas, 
  onDeleteCanvas,
  onRenameCanvas
}: HeaderProps) {
  const { toggleTheme, theme, resolvedTheme } = useThemeToggle();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Interactive title renaming states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  // Model settings configuration states
  const [showModelConfig, setShowModelConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_api_url') || 'https://api.openai.com/v1';
    }
    return 'https://api.openai.com/v1';
  });
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_api_key') || '';
    }
    return '';
  });
  const [textModel, setTextModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_text_model') || 'gpt-4o-mini';
    }
    return 'gpt-4o-mini';
  });
  const [imageModel, setImageModel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_image_model') || 'gpt-4o';
    }
    return 'gpt-4o';
  });
  const [isManualModelInput, setIsManualModelInput] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_manual_model_input') === 'true';
    }
    return false;
  });
  const [modelOptions, setModelOptions] = useState<string[]>(() => {
    const defaultList = [
      'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo',
      'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash',
      'deepseek-chat', 'deepseek-coder', 'claude-3-5-sonnet',
      'llama3', 'qwen-max', 'qwen-plus'
    ];
    if (typeof window !== 'undefined') {
      try {
        const parsed = localStorage.getItem('ai_models_list');
        if (parsed) {
          const arr = JSON.parse(parsed);
          if (Array.isArray(arr) && arr.length > 0) return arr;
        }
      } catch (e) {}
    }
    return defaultList;
  });
  const [isFetchingList, setIsFetchingList] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle preset clicks
  const applyPreset = (presetName: string) => {
    let url = '';
    let text = '';
    let img = '';
    let list: string[] = [];

    switch (presetName) {
      case 'openai':
        url = 'https://api.openai.com/v1';
        text = 'gpt-4o-mini';
        img = 'gpt-4o';
        list = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'];
        break;
      case 'gemini':
        url = 'https://generativelanguage.googleapis.com';
        text = 'gemini-1.5-flash';
        img = 'gemini-1.5-flash';
        list = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash'];
        break;
      case 'deepseek':
        url = 'https://api.deepseek.com/v1';
        text = 'deepseek-chat';
        img = 'deepseek-chat';
        list = ['deepseek-chat', 'deepseek-coder'];
        break;
      case 'ollama':
        url = 'http://localhost:11434/v1';
        text = 'llama3';
        img = 'llama3';
        list = ['llama3', 'mistral', 'qwen2'];
        break;
    }

    setApiUrl(url);
    setTextModel(text);
    setImageModel(img);
    setModelOptions(list);
    setFetchStatus({ type: 'idle', message: '' });
  };

  // Safe and responsive API models fetch
  const handleFetchModels = async () => {
    if (!apiUrl.trim()) {
      setFetchStatus({ type: 'error', message: '请先填入 API 接口地址' });
      return;
    }

    setIsFetchingList(true);
    setFetchStatus({ type: 'idle', message: '正在初始化连接...' });

    try {
      let cleanUrl = apiUrl.trim();
      let fetchUrl = cleanUrl;

      if (cleanUrl.includes('generativelanguage.googleapis.com')) {
        let baseUrl = cleanUrl;
        if (baseUrl.endsWith('/')) {
          baseUrl = baseUrl.slice(0, -1);
        }
        if (!baseUrl.includes('/v1beta') && !baseUrl.includes('/v1')) {
          fetchUrl = `${baseUrl}/v1beta/models`;
        } else {
          fetchUrl = `${baseUrl}/models`;
        }
        if (apiKey.trim()) {
          fetchUrl += `?key=${apiKey.trim()}`;
        }
      } else {
        // Strict identical logic replication from user snippet
        if (fetchUrl.indexOf("/chat/completions") !== -1) {
          fetchUrl = fetchUrl.replace("/chat/completions", "/models");
        } else if (!fetchUrl.endsWith("/models")) {
          // 粗暴拼接
          if (fetchUrl.endsWith("/")) fetchUrl += "models";
          else fetchUrl += "/models";
        }
      }

      setFetchStatus({ type: 'idle', message: `正在请求接口拉取模型列表: ${fetchUrl}...` });

      const requestModels = () => {
        return new Promise<any[]>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", fetchUrl, true);
          
          if (apiKey.trim() && !cleanUrl.includes('generativelanguage.googleapis.com')) {
             xhr.setRequestHeader("Authorization", "Bearer " + apiKey.trim());
          }

          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  const resp = JSON.parse(xhr.responseText);
                  let models = [];
                  if (resp && Array.isArray(resp.data)) {
                    models = resp.data;
                  } else if (resp && Array.isArray(resp.models)) {
                    models = resp.models;
                  } else if (resp && typeof resp === 'object') {
                    const potentialArrays = Object.entries(resp).find(([_, value]) => Array.isArray(value));
                    if (potentialArrays) {
                      models = potentialArrays[1] as any[];
                    }
                  }

                  if (models.length > 0) {
                    const list = models.map((m: any) => m.id || m.name?.replace(/^models\//, '')).filter(Boolean);
                    if (list.length > 0) {
                      resolve(list);
                      return;
                    }
                  }
                  reject(new Error("接口返回成功，但未找到模型列表数据结构。"));
                } catch (e: any) {
                  reject(new Error("解析模型列表失败: " + e.message + " (文本前缀: " + xhr.responseText.slice(0, 30) + ")"));
                }
              } else {
                reject(new Error("获取模型失败 (HTTP " + xhr.status + ") - 响应: " + xhr.responseText.slice(0, 60)));
              }
            }
          };

          xhr.onerror = function() {
            reject(new Error("XMLHttpRequest 网络请求或跨域错误。如果代理路由有 CORS 限制或拦截 GCP，建议开启插件模式或手动填入模型名称。"));
          };
          
          xhr.send();
        });
      };

      let list: string[] = [];
      try {
        list = await requestModels();
      } catch(err: any) {
        throw new Error(err.message);
      }

      if (!list || list.length === 0) {
        throw new Error('未能在返回数据中解析出模型列表');
      }

      const cleanList = Array.from(new Set(list)).filter(m => m && typeof m === 'string' && m.length < 100);
      setModelOptions(cleanList);
      
      if (cleanList.length > 0) {
        if (!cleanList.includes(textModel)) {
          const firstText = cleanList.find(m => m.includes('gpt-4') || m.includes('chat') || m.includes('text') || m.includes('mini') || m.includes('flash') || m.includes('seek')) || cleanList[0];
          setTextModel(firstText);
        }
        if (!cleanList.includes(imageModel)) {
          const firstImg = cleanList.find(m => m.includes('vision') || m.includes('gpt-4o') || m.includes('flash') || m.includes('pro')) || cleanList[0];
          setImageModel(firstImg);
        }
      }

      localStorage.setItem('ai_models_list', JSON.stringify(cleanList));

      setFetchStatus({ 
        type: 'success', 
        message: `获取成功！已为您解析并加载 ${cleanList.length} 个可用模型。` 
      });
    } catch (err: any) {
      console.error('Fetch models error:', err);
      let displayMsg = err.message || '连接超时或接口无响应';
      const isAbortError = err.name === 'AbortError' || 
                           displayMsg.toLowerCase().includes('aborted') || 
                           displayMsg.toLowerCase().includes('abort') ||
                           displayMsg.toLowerCase().includes('signal is aborted');
                           
      if (isAbortError) {
        displayMsg = '接口连接超时，或中国大陆出口网络请求被浏览器拦截';
      } else if (displayMsg.includes('fetch') || displayMsg.includes('Failed to fetch')) {
        displayMsg = '网络连接失败，或跨域 (CORS) 拦截限制';
      }

      let isCustomGatewayHint = false;
      try {
        const hostname = new URL(apiUrl.trim()).hostname;
        if (hostname.includes('dianchu.cc') || hostname.includes('gateway') || !hostname.includes('openai.com') && !hostname.includes('googleapis.com')) {
          isCustomGatewayHint = true;
        }
      } catch (_) {}

      if (isCustomGatewayHint) {
        setFetchStatus({
          type: 'error',
          message: `${displayMsg}。温馨提示：由于本系统是基于境外 GCP 云原生容器部署的，企业或专用自建网关 (例如 dianchu.cc 等中国大陆及内部专线服务) 往往会因为地理定位拦截境外 IP 请求，或不具备跨域 (CORS) 头。然而这完全不影响正常聊天使用！请直接勾选下方的「手动输入模型名称」，手动填写您想要调用的模型（如 deepseek-chat 或 gpt-4o 等），直接点击下方【确认保存】即可，系统将自动进行直连！`
        });
      } else {
        setFetchStatus({
          type: 'error',
          message: `${displayMsg}。已推荐加载 12 个本地主流备选模型，您也可以直接勾选「手动输入模型名称」进行自由设定。`
        });
      }

      const defaultList = [
        'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo',
        'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash',
        'deepseek-chat', 'deepseek-coder', 'claude-3-5-sonnet',
        'llama3', 'qwen-max', 'qwen-plus'
      ];
      setModelOptions(defaultList);
    } finally {
      setIsFetchingList(false);
    }
  };

  // Confirm and persist configuration
  const handleSaveConfig = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_api_url', apiUrl.trim());
      localStorage.setItem('ai_api_key', apiKey.trim());
      localStorage.setItem('ai_text_model', textModel);
      localStorage.setItem('ai_image_model', imageModel);
      localStorage.setItem('ai_models_list', JSON.stringify(modelOptions));
      localStorage.setItem('ai_manual_model_input', isManualModelInput ? 'true' : 'false');
      
      window.dispatchEvent(new Event('ai-config-updated'));
    }
    setShowModelConfig(false);
  };

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  const canvasName = activeCanvas ? activeCanvas.name : '未命名创意沙盘';

  // Toggle rename mode
  const handleStartEdit = () => {
    setEditName(canvasName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    setIsEditingName(false);
    if (editName.trim() && editName.trim() !== canvasName && activeCanvasId) {
      onRenameCanvas?.(activeCanvasId, editName.trim());
    }
  };

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
           {isEditingName ? (
             <input
               value={editName}
               onChange={(e) => setEditName(e.target.value)}
               onBlur={handleSaveName}
               onKeyDown={(e) => {
                 if (e.key === 'Enter') {
                   handleSaveName();
                 } else if (e.key === 'Escape') {
                   setIsEditingName(false);
                 }
               }}
               autoFocus
               className="text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-100 bg-white/95 dark:bg-stone-950/90 px-2.5 py-1 rounded-md border border-stone-300 dark:border-white/20 outline-none w-44 pointer-events-auto select-text"
             />
           ) : (
             <div 
               onClick={handleStartEdit}
               className="group flex items-center gap-2 cursor-pointer text-sm font-semibold tracking-wide text-stone-800 dark:text-stone-100 bg-white/70 dark:bg-stone-950/40 backdrop-blur-xs px-2.5 py-1 rounded-md border border-stone-200/20 dark:border-white/5 pointer-events-auto select-none"
             >
               <span className="border-b border-transparent group-hover:border-dashed group-hover:border-stone-400 dark:group-hover:border-white/40">
                 {canvasName}
               </span>
               <button className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-400 hover:text-stone-900 dark:hover:text-white p-0.5">
                 <Edit2 size={12} strokeWidth={2} />
               </button>
             </div>
           )}

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
        <button 
          onClick={() => setShowModelConfig(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Sparkles size={14} className="text-amber-500 animate-pulse" strokeWidth={2} />
          <span>AI模型设定</span>
        </button>
        {currentView === 'workspace' && (
          <button className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
            <Share2 size={16} strokeWidth={2} />
          </button>
        )}
        <button onClick={toggleTheme} className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer">
          {mounted && resolvedTheme === 'dark' ? <Sun size={16} strokeWidth={2} className="animate-in spin-in-90 fade-in duration-300" /> : <Moon size={16} strokeWidth={2} className="animate-in spin-in-90 fade-in duration-300" />}
        </button>
        <span className="opacity-60">v0.0.4</span>
        <a 
          href="https://github.com/dreamforgame-win/Game-Design-Studio" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center justify-center hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Github size={16} strokeWidth={2} />
        </a>
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

      {/* Model Settings Modal overlay */}
      {showModelConfig && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center z-[100000] pointer-events-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-2xl p-6 w-[430px] shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-amber-500" strokeWidth={2} />
                <h3 className="text-sm font-semibold text-stone-900 dark:text-white">
                  AI 大模型接入设定
                </h3>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                填入大模型 API 接口地址与密匙，一键载入模型池，提供文本与图片多模态分析支持。
              </p>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-col gap-1.5 bg-stone-50 dark:bg-stone-950/30 p-2 rounded-xl border border-stone-100 dark:border-white/5">
              <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">
                快速通道（一键填充预设）：
              </span>
              <div className="grid grid-cols-4 gap-1">
                <button 
                  onClick={() => applyPreset('openai')}
                  className="px-1.5 py-1 text-[10px] text-center border border-stone-200/60 dark:border-white/5 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-white/5 rounded-md text-stone-700 dark:text-stone-300 font-semibold transition-all cursor-pointer"
                >
                  OpenAI
                </button>
                <button 
                  onClick={() => applyPreset('gemini')}
                  className="px-1.5 py-1 text-[10px] text-center border border-stone-200/60 dark:border-white/5 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-white/5 rounded-md text-stone-700 dark:text-stone-300 font-semibold transition-all cursor-pointer"
                >
                  Gemini
                </button>
                <button 
                  onClick={() => applyPreset('deepseek')}
                  className="px-1.5 py-1 text-[10px] text-center border border-stone-200/60 dark:border-white/5 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-white/5 rounded-md text-stone-700 dark:text-stone-300 font-semibold transition-all cursor-pointer"
                >
                  DeepSeek
                </button>
                <button 
                  onClick={() => applyPreset('ollama')}
                  className="px-1.5 py-1 text-[10px] text-center border border-stone-200/60 dark:border-white/5 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-white/5 rounded-md text-stone-700 dark:text-stone-300 font-semibold transition-all cursor-pointer"
                >
                  Ollama
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                  接口地址 (API Endpoint)
                </label>
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="如 https://api.openai.com/v1"
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/20 transition-all select-text pointer-events-auto"
                />
              </div>

              {/* API Key */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                  API Key (密钥)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="请输入您的私有令牌密钥"
                  className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/20 transition-all select-text pointer-events-auto"
                />
              </div>

              {/* Trigger */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500">
                    大模型池：当前载入 {modelOptions.length} 个备选模型
                  </span>
                  <button
                    onClick={handleFetchModels}
                    disabled={isFetchingList}
                    className="px-3 py-1 bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 disabled:opacity-50 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    {isFetchingList ? (
                      <>
                        <span className="w-2h h-2 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></span>
                        <span>获取中...</span>
                      </>
                    ) : (
                      <span>获取模型列表</span>
                    )}
                  </button>
                </div>

                {fetchStatus.type !== 'idle' && (
                  <div className={`p-2 rounded-lg text-xs leading-relaxed ${
                    fetchStatus.type === 'success' 
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-950/30' 
                      : 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-950/30'
                  }`}>
                    {fetchStatus.message}
                  </div>
                )}
              </div>

              {/* Selectors Toggle */}
              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium font-sans">选择模式：</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isManualModelInput}
                    onChange={(e) => setIsManualModelInput(e.target.checked)}
                    className="accent-stone-900 dark:accent-stone-100 rounded border-stone-300 dark:border-white/10 w-3 h-3 text-xs"
                  />
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium font-sans">手动输入模型名称</span>
                </label>
              </div>

              {/* Selectors */}
              <div className="grid grid-cols-2 gap-3 mt-1">
                {/* Text Model */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    文本处理模型
                  </label>
                  {isManualModelInput ? (
                    <input
                      type="text"
                      value={textModel}
                      onChange={(e) => setTextModel(e.target.value)}
                      placeholder="例如 deepseek-chat"
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/10 transition-all select-text pointer-events-auto"
                    />
                  ) : (
                    <select
                      value={textModel}
                      onChange={(e) => setTextModel(e.target.value)}
                      className="px-2 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/10 transition-all cursor-pointer"
                    >
                      {modelOptions.map((model) => (
                        <option key={`text-${model}`} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Vision Model */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
                    图片识别模型
                  </label>
                  {isManualModelInput ? (
                    <input
                      type="text"
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      placeholder="例如 gpt-4o"
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/10 transition-all select-text pointer-events-auto"
                    />
                  ) : (
                    <select
                      value={imageModel}
                      onChange={(e) => setImageModel(e.target.value)}
                      className="px-2 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-100 outline-none focus:border-stone-400 dark:focus:border-white/10 transition-all cursor-pointer"
                    >
                      {modelOptions.map((model) => (
                        <option key={`image-${model}`} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex gap-2 justify-end border-t border-stone-100 dark:border-white/5 pt-4">
              <button 
                onClick={() => setShowModelConfig(false)}
                className="px-4 py-2 border border-stone-200 dark:border-white/10 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button 
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-stone-950 dark:bg-stone-50 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                确认保存
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
