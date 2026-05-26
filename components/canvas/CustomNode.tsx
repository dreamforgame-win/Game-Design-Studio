import React, { useState, useEffect, memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Lightbulb, CircleHelp, Maximize2, Zap, CheckCircle2, Flag, Edit2, Image as ImageIcon, Link, Upload, Globe, AlertTriangle, ExternalLink, FileText, Download, Sparkles, Send, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export type NodeType = 'idea' | 'question' | 'expansion' | 'contradiction' | 'solution' | 'conclusion' | 'image' | 'webpage' | 'file';

const nodeConfig = {
  idea: { border: 'border-stone-300 dark:border-[#8fa3b4]/30', headerBg: 'bg-stone-50 dark:bg-[#8fa3b4]/[0.05]', icon: Lightbulb, label: '想法', text: 'text-stone-700 dark:text-[#8fa3b4]', handle: 'bg-stone-400 dark:bg-[#8fa3b4]/30 hover:bg-stone-600 dark:hover:bg-[#8fa3b4]/80' },
  question: { border: 'border-stone-300 dark:border-[#b48f8f]/30', headerBg: 'bg-stone-50 dark:bg-[#b48f8f]/[0.05]', icon: CircleHelp, label: '质疑', text: 'text-stone-700 dark:text-[#b48f8f]', handle: 'bg-stone-400 dark:bg-[#b48f8f]/30 hover:bg-stone-600 dark:hover:bg-[#b48f8f]/80' },
  expansion: { border: 'border-stone-300 dark:border-[#9d8fb4]/30', headerBg: 'bg-stone-50 dark:bg-[#9d8fb4]/[0.05]', icon: Maximize2, label: '发散', text: 'text-stone-700 dark:text-[#9d8fb4]', handle: 'bg-stone-400 dark:bg-[#9d8fb4]/30 hover:bg-stone-600 dark:hover:bg-[#9d8fb4]/80' },
  contradiction: { border: 'border-stone-300 dark:border-[#d4a373]/30', headerBg: 'bg-stone-50 dark:bg-[#d4a373]/[0.05]', icon: Zap, label: '冲突', text: 'text-stone-700 dark:text-[#d4a373]', handle: 'bg-stone-400 dark:bg-[#d4a373]/30 hover:bg-stone-600 dark:hover:bg-[#d4a373]/80' },
  solution: { border: 'border-stone-300 dark:border-[#8fb49a]/30', headerBg: 'bg-stone-50 dark:bg-[#8fb49a]/[0.05]', icon: CheckCircle2, label: '解决', text: 'text-stone-700 dark:text-[#8fb49a]', handle: 'bg-stone-400 dark:bg-[#8fb49a]/30 hover:bg-stone-600 dark:hover:bg-[#8fb49a]/80' },
  conclusion: { border: 'border-[#b0a18e]/50 dark:border-[#b0a18e]/50', headerBg: 'bg-stone-50 dark:bg-[#b0a18e]/[0.1]', icon: Flag, label: '结论', text: 'text-[#b0a18e]', handle: 'bg-[#b0a18e]/50 hover:bg-[#b0a18e]/90' },
  image: { border: 'border-[#a3b48f]/50 dark:border-[#a3b48f]/30', headerBg: 'bg-[#a3b48f]/[0.03] dark:bg-[#a3b48f]/[0.05]', icon: ImageIcon, label: '图片', text: 'text-stone-700 dark:text-[#a3b48f]', handle: 'bg-stone-400 dark:bg-[#a3b48f]/30 hover:bg-stone-600 dark:hover:bg-[#a3b48f]/80' },
  webpage: { border: 'border-[#8fa3b4]/50 dark:border-[#8fa3b4]/30', headerBg: 'bg-[#8fa3b4]/[0.03] dark:bg-[#8fa3b4]/[0.05]', icon: Link, label: '网页', text: 'text-stone-700 dark:text-[#8fa3b4]', handle: 'bg-stone-400 dark:bg-[#8fa3b4]/30 hover:bg-stone-600 dark:hover:bg-[#8fa3b4]/80' },
  file: { border: 'border-[#8f9eb4]/50 dark:border-[#8f9eb4]/30', headerBg: 'bg-[#8f9eb4]/[0.03] dark:bg-[#8f9eb4]/[0.05]', icon: FileText, label: '文件', text: 'text-stone-700 dark:text-[#8f9eb4]', handle: 'bg-stone-400 dark:bg-[#8f9eb4]/30 hover:bg-stone-600 dark:hover:bg-[#8f9eb4]/80' }
};

const CustomNode = memo(function CustomNode({ data, id, selected }: NodeProps) {
  const type = data.nodeType as NodeType || 'idea';
  const config = nodeConfig[type] || nodeConfig.idea;
  
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content as string || '');
  const [title, setTitle] = useState(data.title as string || config.label);

  const Icon = config.icon;

  // Webpage status values
  const webUrl = data.url as string || '';
  const [prevWebUrl, setPrevWebUrl] = useState(webUrl);
  const [inputUrl, setInputUrl] = useState(webUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(!webUrl);
  const [isInteractive, setIsInteractive] = useState(false);

  // File status values
  const fileType = data.fileType as string || '';
  const fileName = data.fileName as string || '';
  const fileSize = data.fileSize as string || '';
  const tableRows = data.tableRows as any[][] || null;
  const colWidths = data.colWidths as number[] || [];

  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [tempCellValue, setTempCellValue] = useState('');
  const [fileIsEditing, setFileIsEditing] = useState(false);
  const [dragCol, setDragCol] = useState<{ index: number; startX: number; startWidth: number } | null>(null);
  const [tableContextMenu, setTableContextMenu] = useState<{
    x: number;
    y: number;
    row: number;
    col: number;
  } | null>(null);

  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const tableRef = React.useRef<HTMLTableElement | null>(null);

  const [showApiInput, setShowApiInput] = useState(false);
  const [apiPrompt, setApiPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApiProcess = async () => {
    if (!apiPrompt.trim()) return;
    setIsProcessing(true);
    try {
      const apiUrl = localStorage.getItem('ai_api_url') || 'https://api.openai.com/v1';
      const apiKey = localStorage.getItem('ai_api_key') || '';
      const aiModel = localStorage.getItem('ai_text_model') || 'gpt-4o-mini';

      let fetchUrl = apiUrl.trim();
      let isGemini = false;
      let requestBody: any = {
        model: aiModel,
        messages: [{ role: "user", content: `指令: ${apiPrompt}\n当前节点内容参考:\n${content.slice(0, 2000)}` }]
      };
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (fetchUrl.includes('generativelanguage.googleapis.com')) {
        isGemini = true;
        let baseUrl = fetchUrl;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        if (baseUrl.includes('/chat/completions')) {
           baseUrl = baseUrl.replace('/chat/completions', '');
        }
        if (baseUrl.endsWith('/v1beta/models')) baseUrl = baseUrl.replace('/v1beta/models', '');
        if (baseUrl.endsWith('/v1/models')) baseUrl = baseUrl.replace('/v1/models', '');
        if (baseUrl.endsWith('/models')) baseUrl = baseUrl.replace('/models', '');
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        
        fetchUrl = `${baseUrl}/v1beta/models/${aiModel}:generateContent?key=${apiKey.trim()}`;
        requestBody = {
          contents: [{ parts: [{ text: `指令: ${apiPrompt}\n当前节点内容参考:\n${content.slice(0, 2000)}` }] }]
        };
      } else {
        if (!fetchUrl.endsWith('/chat/completions')) {
          if (fetchUrl.endsWith('/')) fetchUrl += 'chat/completions';
          else fetchUrl += '/chat/completions';
        }
        if (apiKey.trim()) {
          headers['Authorization'] = `Bearer ${apiKey.trim()}`;
        }
      }

      let responseText = "";
      let resStatus = 0;

      // 1. Try Direct Browser Fetch First (works if CORS is allowed and bypasses GCP server blocking)
      try {
        const directHeaders = { ...headers };
        const directRes = await fetch(fetchUrl, {
          method: 'POST',
          headers: directHeaders,
          body: JSON.stringify(requestBody)
        });
        resStatus = directRes.status;
        responseText = await directRes.text();
      } catch (directError: any) {
        console.warn("直接通过浏览器发起的请求失败 (跨域拦截或本地代理问题)，将尝试通过 GCP 服务器代理转发:", directError.message);
        
        // 2. Fallback to server-side proxy
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: fetchUrl,
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
          })
        });
        resStatus = res.status;
        responseText = await res.text();
      }

      if (resStatus < 200 || resStatus >= 300) {
         let errorDetail = responseText.slice(0, 500);
         try {
             const errJson = JSON.parse(responseText);
             if (errJson.error && errJson.error.message) {
                 errorDetail = errJson.error.message;
                 if (errJson.error.details && (errJson.error.details.includes('ConnectTimeoutError') || errJson.error.details.includes('fetch failed'))) {
                     errorDetail = "目标接口响应超时或拒绝连接，通常是因为自建代理网关 (如 dianchu.cc 等) 拦截了境外云服务 (GCP) 的访问。";
                 } else if (errJson.error.details) {
                     errorDetail += " - " + errJson.error.details.slice(0, 100);
                 }
             }
         } catch(e) {}

         if (responseText.trim().startsWith('<')) {
            errorDetail = "接口返回了 HTML 页面而非 JSON 数据。这通常意味着所在网络拦截了境外云服务器端访问，或网关地址配置有误。";
         }
         throw new Error(`API 返回错误 (HTTP ${resStatus}): ${errorDetail}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e: any) {
        if (responseText.trim().startsWith('<')) {
           throw new Error("接口被拦截，返回了 HTML 页面而非 JSON 数据。请检查接口地址是否正确，或目标网关是否屏蔽了境外服务器。");
        }
        throw new Error("解析接口返回内容失败。收到非 JSON 数据: " + responseText.slice(0, 100));
      }
      let aiText = '';
      if (isGemini) {
        aiText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "接口返回中未找到正文。";
      } else {
        aiText = responseData.choices?.[0]?.message?.content || "接口返回中未找到正文。";
      }

      const newContent = content + (content ? '\n\n' : '') + `> [!tip] AI 助手解析处理: ${apiPrompt}\n${aiText}`;
      setContent(newContent);
      if (data.onChange) {
        // @ts-ignore
        data.onChange(id, newContent, title);
      }
    } catch (err: any) {
      console.error(err);
      const newContent = content + (content ? '\n\n' : '') + `> [!warning] AI 接口请求失败 (${apiPrompt}):\n${err.message}`;
      setContent(newContent);
      if (data.onChange) {
        // @ts-ignore
        data.onChange(id, newContent, title);
      }
    } finally {
      setIsProcessing(false);
      setShowApiInput(false);
      setApiPrompt('');
    }
  };

  if (webUrl !== prevWebUrl) {
    setPrevWebUrl(webUrl);
    setInputUrl(webUrl);
    setIsEditingUrl(!webUrl);
  }

  const currentDataContent = data.content as string || '';
  const [prevContent, setPrevContent] = useState(currentDataContent);
  if (currentDataContent !== prevContent) {
    setPrevContent(currentDataContent);
    if (!isEditing && !fileIsEditing) {
      setContent(currentDataContent);
    }
  }

  const currentDataTitle = data.title as string || config.label;
  const [prevTitle, setPrevTitle] = useState(currentDataTitle);
  if (currentDataTitle !== prevTitle) {
    setPrevTitle(currentDataTitle);
    if (!isEditing) {
      setTitle(currentDataTitle);
    }
  }

  const handleSave = (extraData?: any) => {
    setIsEditing(false);
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, content, title, extraData);
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

  // Image Upload handler for the node
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (data.onChange) {
            // @ts-ignore
            data.onChange(id, content, title === '图片' ? '上传的图片' : title, { imageUrl: base64 });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          if (data.onChange) {
            // @ts-ignore
            data.onChange(id, content, title === '图片' ? '拖拽上传的图片' : title, { imageUrl: base64 });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processFile = async (file: File) => {
    const name = file.name;
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const size = Math.round(file.size / 1024) + ' KB';

    if (ext === 'md' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (data.onChange) {
          // @ts-ignore
          data.onChange(id, text, name, {
            fileType: ext === 'md' ? 'markdown' : 'text',
            fileName: name,
            fileSize: size,
          });
        }
      };
      reader.readAsText(file);
    } else if (ext === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n')
          .filter(line => line.trim() !== '')
          .map(row => row.split(',').map(cell => {
            let trimmed = cell.trim();
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
              trimmed = trimmed.substring(1, trimmed.length - 1);
            }
            return trimmed;
          }));
        if (data.onChange) {
          // @ts-ignore
          data.onChange(id, '', name, {
            fileType: 'spreadsheet',
            fileName: name,
            fileSize: size,
            tableRows: rows,
          });
        }
      };
      reader.readAsText(file);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const mammothInstance = await import('mammoth');
          const result = await mammothInstance.extractRawText({ arrayBuffer });
          const text = result.value;
          if (data.onChange) {
            // @ts-ignore
            data.onChange(id, text, name, {
              fileType: 'docx',
              fileName: name,
              fileSize: size,
            });
          }
        } catch (error) {
          console.error("Mammoth failed to parse docx", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const XLSX = await import('xlsx');
          const dataBytes = new Uint8Array(arrayBuffer);
          const workbook = XLSX.read(dataBytes, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const aoa = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          const rows = aoa.map(row => (row || []).map(cell => cell === null || cell === undefined ? '' : String(cell)));
          if (rows.length === 0) rows.push(['']);
          
          if (data.onChange) {
            // @ts-ignore
            data.onChange(id, '', name, {
              fileType: 'spreadsheet',
              fileName: name,
              fileSize: size,
              tableRows: rows,
            });
          }
        } catch (error) {
          console.error("XLSX parse error", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (data.onChange) {
          // @ts-ignore
          data.onChange(id, text, name, {
            fileType: 'text',
            fileName: name,
            fileSize: size,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCreateBlankMarkdown = () => {
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '# 新建 Markdown 文件\n\n在此开始双击或点击此区域编辑您的文档内容...', '新建文件.md', {
        fileType: 'markdown',
        fileName: '新建文件.md',
        fileSize: '0 KB',
      });
      setFileIsEditing(true);
    }
  };

  // Memoize ReactMarkdown compiler to save parsing costs for huge files
  const memoizedMarkdown = useMemo(() => {
    if (!content) return null;
    return <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>;
  }, [content]);

  const handleCreateBlankText = () => {
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '开始编写文本内容...', '新建文件.txt', {
        fileType: 'text',
        fileName: '新建文件.txt',
        fileSize: '0 KB',
      });
      setFileIsEditing(true);
    }
  };

  const handleCreateBlankSpreadsheet = () => {
    const defaultRows = [
      ['列 A', '列 B', '列 C'],
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', '新建表格.csv', {
        fileType: 'spreadsheet',
        fileName: '新建表格.csv',
        fileSize: '0 KB',
        tableRows: defaultRows,
      });
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const startEditCell = (rIdx: number, cIdx: number, val: string) => {
    setEditingCell({ row: rIdx, col: cIdx });
    setTempCellValue(val);
  };

  const handleTableContextMenu = (e: React.MouseEvent, rIdx: number, cIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setTableContextMenu({
      x: e.clientX,
      y: e.clientY,
      row: rIdx,
      col: cIdx
    });
  };

  const saveCurrentCell = () => {
    if (!editingCell || !tableRows) return;
    const newRows = tableRows.map((row, rIdx) => 
      row.map((cell, cIdx) => 
        rIdx === editingCell.row && cIdx === editingCell.col ? tempCellValue : cell
      )
    );
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, {
        tableRows: newRows,
      });
    }
    setEditingCell(null);
  };

  const handleInsertRowAtIndex = (rIdx: number) => {
    if (!tableRows) return;
    const colCount = tableRows[0]?.length || 1;
    const newRow = Array(colCount).fill('');
    const newRows = [...tableRows];
    newRows.splice(rIdx, 0, newRow);
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { tableRows: newRows });
    }
  };

  const handleInsertColumnAtIndex = (cIdx: number) => {
    if (!tableRows) return;
    const newRows = tableRows.map(row => {
      const copy = [...row];
      copy.splice(cIdx, 0, '');
      return copy;
    });

    const newColWidths = [...colWidths];
    newColWidths.splice(cIdx, 0, 120);

    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { 
        tableRows: newRows,
        colWidths: newColWidths 
      });
    }
  };

  // Close table context menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      setTableContextMenu(null);
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setSelectedCell(null);
        setSelectedRow(null);
        setSelectedCol(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Column width mouse drag listener
  useEffect(() => {
    if (!dragCol) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragCol.startX;
      const newWidth = Math.max(50, dragCol.startWidth + deltaX);
      
      const currentWidths = [...colWidths];
      const colCount = tableRows?.[0]?.length || 0;
      for (let i = 0; i < colCount; i++) {
        if (currentWidths[i] === undefined) {
          currentWidths[i] = 120;
        }
      }
      currentWidths[dragCol.index] = newWidth;
      
      if (data.onChange) {
        // @ts-ignore
        data.onChange(id, '', fileName, { colWidths: currentWidths });
      }
    };

    const handleMouseUp = () => {
      setDragCol(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragCol, colWidths, tableRows, id, fileName, data]);

  const handleAddRow = () => {
    if (!tableRows) return;
    const colCount = tableRows[0]?.length || 1;
    const newRow = Array(colCount).fill('');
    const newRows = [...tableRows, newRow];
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { tableRows: newRows });
    }
  };

  const handleDeleteRow = (rIdx: number) => {
    if (!tableRows || tableRows.length <= 1) return;
    const newRows = tableRows.filter((_, i) => i !== rIdx);
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { tableRows: newRows });
    }
  };

  const handleAddColumn = () => {
    if (!tableRows) return;
    const newRows = tableRows.map(row => [...row, '']);
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { tableRows: newRows });
    }
  };

  const handleDeleteColumn = (cIdx: number) => {
    if (!tableRows) return;
    const colCount = tableRows[0]?.length || 0;
    if (colCount <= 1) return;
    const newRows = tableRows.map(row => row.filter((_, i) => i !== cIdx));
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, '', fileName, { tableRows: newRows });
    }
  };

  const downloadSpreadsheetAsCSV = () => {
    if (!tableRows) return;
    const csvContent = tableRows.map(row => 
      row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName || "export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTextFile = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const downloadName = fileName || 'document.txt';
    link.setAttribute("download", downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Node specific paste listener
  useEffect(() => {
    if (type !== 'image' || !selected) return;
    
    const handleNodePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              if (base64 && data.onChange) {
                // @ts-ignore
                data.onChange(id, content, title === '图片' ? '粘贴的图片' : title, { imageUrl: base64 });
              }
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleNodePaste);
    return () => window.removeEventListener('paste', handleNodePaste);
  }, [type, selected, id, content, title, data]);

  const handleUrlSave = () => {
    let formattedUrl = (inputUrl || '').trim();
    if (!formattedUrl) return;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    setInputUrl(formattedUrl);
    setIsEditingUrl(false);
    
    if (data.onChange) {
      // @ts-ignore
      data.onChange(id, content, title === '网页' ? '网页: ' + formattedUrl.replace(/^https?:\/\/(www\.)?/i, '') : title, { url: formattedUrl });
    }
  };

  const imageUrl = data.imageUrl as string || '';

  const isScrollPriority = data.scrollPriority !== false;

  const getCellSelectionStyle = (rIdx: number, cIdx: number) => {
    const isSelectedCell = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
    const isSelectedRow = selectedRow === rIdx;
    const isSelectedCol = selectedCol === cIdx;
    
    const shadows: string[] = [];
    
    if (isSelectedCell) {
      // 4-side highlighted thick border
      shadows.push('inset 0 0 0 2px #3b82f6');
    } else {
      // Check row selection outline
      if (isSelectedRow) {
        const isLeftmost = cIdx === -1;
        const isRightmost = tableRows ? cIdx === tableRows[0]?.length - 1 : false;
        
        shadows.push('inset 0 2px 0 0 #3b82f6'); // top edge
        shadows.push('inset 0 -2px 0 0 #3b82f6'); // bottom edge
        if (isLeftmost) shadows.push('inset 2px 0 0 0 #3b82f6'); // leftmost edge
        if (isRightmost) shadows.push('inset -2px 0 0 0 #3b82f6'); // rightmost edge
      }
      
      // Check column selection outline
      if (isSelectedCol) {
        const isTopmost = rIdx === -1;
        const isBottommost = tableRows ? rIdx === tableRows.length - 1 : false;
        
        shadows.push('inset 2px 0 0 0 #3b82f6'); // left edge
        shadows.push('inset -2px 0 0 0 #3b82f6'); // right edge
        if (isTopmost) shadows.push('inset 0 2px 0 0 #3b82f6'); // top edge
        if (isBottommost) shadows.push('inset 0 -2px 0 0 #3b82f6'); // bottom edge
      }
    }
    
    if (shadows.length > 0) {
      return { 
        boxShadow: shadows.join(', '), 
        position: 'relative' as const, 
        zIndex: isSelectedCell ? 40 : 35 
      };
    }
    return {};
  };

  return (
    <div 
      onBlur={handleBlur}
      className={`group w-full h-full min-w-[200px] min-h-[140px] rounded-2xl bg-white/95 dark:bg-[#1a1a1a]/95 border-2 flex flex-col backdrop-blur-3xl transition-all duration-200 text-stone-900 dark:text-stone-200 ${
        selected 
          ? 'border-stone-800 dark:border-stone-100 shadow-[0_0_25px_rgba(0,0,0,0.15)] dark:shadow-[0_0_25px_rgba(255,255,255,0.08)]' 
          : `hover:border-stone-400 dark:hover:border-stone-500 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.03)] ${config.border}`
      } ${isEditing ? '' : 'cursor-move'} ${isScrollPriority ? 'nowheel' : ''}`}
    >
      <NodeResizer 
        minWidth={200} 
        minHeight={140} 
        isVisible={true} 
        lineStyle={{ border: 'none', borderColor: 'transparent' }} 
        handleStyle={{ 
          background: 'transparent', 
          border: 'none', 
          width: '28px', 
          height: '28px',
          boxShadow: 'none'
        }} 
      />

      <Handle type="target" position={Position.Left} id="target" className={`w-[10px] h-[10px] ${config.handle} transition-transform duration-200 rounded-full border-2 border-white dark:border-[#1a1a1a] -left-[5px] hover:![transform:translate(-50%,-50%)_scale(1.5)] shadow-sm cursor-crosshair`} style={{ width: '10px', height: '10px' }} />
      
      {/* AI Process Button on Hover */}
      <div className={`absolute -top-12 right-4 z-50 transition-opacity duration-200 nodrag nowheel ${showApiInput ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        {!showApiInput ? (
          <button
            onClick={() => setShowApiInput(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-semibold shadow-xl border border-stone-800 dark:border-stone-200 hover:scale-105 hover:shadow-2xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            处理 (Test)
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-white dark:bg-stone-800 p-2 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-stone-200 dark:border-stone-700">
            <input
              type="text"
              autoFocus
              placeholder="输入指令..."
              value={apiPrompt}
              onChange={(e) => setApiPrompt(e.target.value)}
              className="px-3 py-1.5 text-sm bg-stone-100 dark:bg-stone-900 rounded-lg outline-none w-56 font-medium text-stone-800 dark:text-stone-200 border border-transparent focus:border-blue-500 transition-colors placeholder:text-stone-400"
              onKeyDown={(e) => {
                 if (e.key === 'Enter') handleApiProcess();
                 if (e.key === 'Escape') setShowApiInput(false);
              }}
            />
            <button
              onClick={handleApiProcess}
              disabled={isProcessing || !apiPrompt.trim()}
              className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center min-w-[32px]"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowApiInput(false)}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
      {type === 'image' ? (
        <div 
          className="flex-1 w-full h-full p-2 flex flex-col overflow-hidden relative"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {imageUrl ? (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200/20 dark:border-white/5">
              <img 
                src={imageUrl || undefined} 
                alt={title} 
                className="max-w-full max-h-full object-contain select-none pointer-events-none rounded-lg"
              />
            </div>
          ) : (
            <label className="flex-1 w-full h-full border-2 border-dashed border-stone-300 dark:border-white/10 rounded-xl hover:border-stone-500 hover:bg-stone-100/30 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                <Upload size={18} />
              </div>
              <div>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300 block mb-0.5">点击或拖拽上传图片</span>
                <span className="text-[10px] text-stone-400 dark:text-stone-500">也支持在此处或在画布上直接粘贴</span>
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          )}
        </div>
      ) : type === 'webpage' ? (
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative">
          {isEditingUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 bg-stone-50/50 dark:bg-stone-900/10 rounded-b-xl">
              <div className="w-10 h-10 rounded-full bg-stone-150 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                <Globe size={18} />
              </div>
              <div className="w-full max-w-sm space-y-2 text-center">
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300 block">配置网页节点</span>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">请输入网站链接（例如 google.com 或 aistudio.google）</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="example.com"
                    className="nodrag flex-1 bg-stone-100/80 dark:bg-black/55 border border-stone-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-900 dark:text-white outline-none focus:border-stone-400 dark:focus:border-white/30"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUrlSave();
                    }}
                  />
                  <button
                    onClick={handleUrlSave}
                    className="px-3 py-1.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-stone-100 cursor-pointer"
                  >
                    载入
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 w-full h-full relative">
              {/* Cover mask to allow drag-and-drop / node panning safely without iframe intercepting */}
              {data.isInteractive === false && (
                <div className="absolute inset-0 bg-transparent z-10 cursor-default" />
              )}
              
              {/* iframe container */}
              <div className="w-full h-full bg-white rounded-b-xl relative overflow-hidden">
                {webUrl ? (() => {
                  let finalUrl = webUrl;
                  // Auto-convert Figma links to embed links
                  if (finalUrl.includes('figma.com/file/') || finalUrl.includes('figma.com/design/')) {
                    finalUrl = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(finalUrl)}`;
                  }
                  
                  const isKnownRestrictive = 
                    finalUrl.includes('github.com') || 
                    finalUrl.includes('baidu.com') || 
                    finalUrl.includes('google.com') ||
                    (finalUrl.includes('mastergo.com') && !finalUrl.includes('embed'));

                  return (
                    <>
                      {isKnownRestrictive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-900/50 p-6 text-center z-0">
                          <AlertTriangle size={24} className="text-amber-500 mb-2" />
                          <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-1">目标网站可能会拒绝受访</h3>
                          <p className="text-xs text-stone-500 max-w-[200px] mb-3 leading-relaxed">
                            该网站 (如 MasterGo) 启用了防嵌套安全机制。
                          </p>
                          <div className="flex flex-col gap-2 w-full max-w-[180px]">
                            <a 
                              href={webUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>在新标签页打开</span>
                              <ExternalLink size={12} />
                            </a>
                            {finalUrl.includes('mastergo.com') && (
                              <p className="text-[10px] text-stone-400 mt-1">
                                💡 提示: 请在 MasterGo 中使用“获取嵌入代码”功能，提取真实的 embed 链接来替换。
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <iframe 
                        src={finalUrl} 
                        title={title}
                        className="w-full h-full border-none pointer-events-auto bg-white relative z-10"
                        // Handle load errors silently as browser blocks access to error details for cross-origin
                      />
                    </>
                  );
                })() : null}
              </div>
            </div>
          )}
        </div>
      ) : type === 'file' ? (
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden relative">
          {!fileType ? (
            <div className="flex-1 w-full h-full flex flex-col min-h-0 bg-transparent rounded-b-2xl overflow-hidden border border-t-0 border-stone-200/60 dark:border-white/10">
              {/* Drag and Drop label */}
              <label 
                onDragOver={handleDragOver}
                onDrop={handleFileDrop}
                className="flex-1 border-2 border-dashed border-stone-300 dark:border-white/10 rounded-xl hover:border-stone-500 hover:bg-stone-100/30 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center m-3 mb-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-stone-400">
                  <Upload size={14} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 block">点击或拖拽上传文件</span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block">支持 Word (.docx), Excel (.xlsx, .xls), Markdown (.md), CSV 和 txt 格式</span>
                </div>
                <input type="file" accept=".docx,.xlsx,.xls,.csv,.md,.txt" onChange={handleFileSelect} className="hidden" />
              </label>

              {/* Quick Create buttons */}
              <div className="p-3 pt-1.5 border-t border-stone-150 dark:border-white/5 bg-stone-55/50 dark:bg-stone-900/30 flex flex-col gap-1.5 shrink-0">
                <span className="text-[10px] font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider text-center block">
                  快捷新建空白文件 (同等格式编辑)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={handleCreateBlankMarkdown}
                    className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 bg-white/60 dark:bg-stone-900 border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/30 rounded-xl hover:bg-stone-100/30 dark:hover:bg-white/[0.02] cursor-pointer transition-all select-none group pointer-events-auto"
                  >
                    <FileText size={13} className="text-emerald-500" />
                    <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-white">Markdown</span>
                  </button>
                  <button 
                    onClick={handleCreateBlankText}
                    className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 bg-white/60 dark:bg-stone-900 border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/30 rounded-xl hover:bg-stone-100/30 dark:hover:bg-white/[0.02] cursor-pointer transition-all select-none group pointer-events-auto"
                  >
                    <FileText size={13} className="text-blue-500" />
                    <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-white">纯文本 (txt)</span>
                  </button>
                  <button 
                    onClick={handleCreateBlankSpreadsheet}
                    className="flex flex-col items-center justify-center gap-1.5 py-2 px-1 bg-white/60 dark:bg-stone-900 border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/30 rounded-xl hover:bg-stone-100/30 dark:hover:bg-white/[0.02] cursor-pointer transition-all select-none group pointer-events-auto"
                  >
                    <FileText size={13} className="text-amber-500" />
                    <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300 group-hover:text-stone-800 dark:group-hover:text-white">在线表格</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden bg-white/50 dark:bg-[#151515]/30 rounded-b-2xl text-stone-800 dark:text-stone-200">
              {/* File details bar */}
              <div className="px-4 py-2 bg-stone-100/60 dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] shrink-0">
                <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">格式:</span>
                  <span className="font-mono text-stone-500 uppercase">{fileType}</span>
                  <span className="text-stone-300 dark:text-stone-700">|</span>
                  <span className="font-semibold text-stone-600 dark:text-stone-400">大小:</span>
                  <span className="font-mono text-stone-500">{fileSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Edit/Preview Toggle for docx / markdown / text */}
                  {fileType !== 'spreadsheet' && (
                    <button 
                      onClick={() => {
                        if (fileIsEditing && data.onChange) {
                          // Save the edited content to parent state when switching back to preview
                          // @ts-ignore
                          data.onChange(id, content, title);
                        }
                        setFileIsEditing(!fileIsEditing);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border border-stone-200/60 dark:border-white/10 hover:bg-stone-150 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1 ${fileIsEditing ? 'bg-stone-200 dark:bg-white/10 font-semibold' : ''}`}
                    >
                      <Edit2 size={10} />
                      <span>{fileIsEditing ? '预览' : '编辑'}</span>
                    </button>
                  )}
                  {/* Download button */}
                  <button 
                    onClick={fileType === 'spreadsheet' ? downloadSpreadsheetAsCSV : downloadTextFile}
                    title="下载/导出"
                    className="px-2 py-0.5 rounded text-[10px] font-medium border border-stone-200/60 dark:border-white/10 hover:bg-stone-150 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1"
                  >
                    <Download size={10} />
                    <span>导出</span>
                  </button>
                  {/* Re-upload button */}
                  <label className="px-2 py-0.5 rounded text-[10px] font-medium border border-stone-200/60 dark:border-white/10 hover:bg-stone-150 dark:hover:bg-white/5 cursor-pointer flex items-center gap-1">
                    <Upload size={10} />
                    <span>重新选择</span>
                    <input type="file" accept=".docx,.xlsx,.xls,.csv,.md,.txt" onChange={handleFileSelect} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Document view area */}
              <div className={`flex-1 flex flex-col relative min-h-0 bg-transparent ${fileType === 'spreadsheet' ? 'overflow-hidden p-3' : 'overflow-auto p-4'}`}>
                {fileType === 'spreadsheet' ? (
                  // Scrollable Excel table editor
                  <div className="flex-1 flex flex-col gap-3 h-full overflow-hidden select-none nodrag">
                    <div className="flex items-center gap-2 shrink-0 mr-1.5 ml-1.5 mt-0.5">
                      <button 
                        onClick={handleAddRow}
                        className="px-2 py-1 bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-200 rounded text-[10px] font-semibold border border-stone-200/50 dark:border-white/10 hover:bg-stone-200 pointer-events-auto cursor-pointer flex items-center gap-1"
                      >
                        <span>+ 新增行</span>
                      </button>
                      <button 
                        onClick={handleAddColumn}
                        className="px-2 py-1 bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-stone-200 rounded text-[10px] font-semibold border border-stone-200/50 dark:border-white/10 hover:bg-stone-200 pointer-events-auto cursor-pointer flex items-center gap-1"
                      >
                        <span>+ 新增列</span>
                      </button>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 italic ml-auto pointer-events-none">
                        💡 双击单元格可直接编辑数据，右键点击行列头呼出菜单
                      </span>
                    </div>

                    <div className="flex-1 overflow-auto border border-stone-200 dark:border-white/5 rounded-xl bg-stone-50/40 dark:bg-stone-900/10 min-h-0 relative">
                      <div className="relative pt-6 pl-6 pr-6 pb-6 w-max">
                        <table 
                          ref={tableRef}
                          className="text-xs text-left border-separate border-spacing-0 select-text pointer-events-auto table-fixed"
                          style={{ 
                            width: tableRows && tableRows[0] 
                              ? 40 + tableRows[0].reduce((sum, _, idx) => sum + (colWidths[idx] || 120), 0) 
                              : '100%' 
                          }}
                        >
                          <colgroup>
                            <col style={{ width: 40 }} />
                            {tableRows && tableRows[0]?.map((_, cIdx) => (
                              <col key={cIdx} style={{ width: colWidths[cIdx] || 120 }} />
                            ))}
                          </colgroup>
                          <thead className="bg-stone-150 dark:bg-stone-900 font-semibold text-stone-600 dark:text-stone-400 sticky top-0 z-30">
                            <tr>
                              <th 
                                onClick={() => {
                                  setSelectedCell(null);
                                  setSelectedRow(null);
                                  setSelectedCol(null);
                                }}
                                className="w-10 px-2 py-1.5 border-r border-b border-stone-250 dark:border-white/10 text-center bg-stone-150 dark:bg-stone-900 select-none sticky left-0 top-0 z-40 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-800"
                              >
                                #
                              </th>
                              {tableRows && tableRows[0]?.map((_, cIdx) => (
                                <th 
                                  key={cIdx} 
                                  onContextMenu={(e) => handleTableContextMenu(e, -1, cIdx)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCol(cIdx);
                                    setSelectedRow(null);
                                    setSelectedCell(null);
                                  }}
                                  style={{ ...getCellSelectionStyle(-1, cIdx) }}
                                  className={`px-3 py-1.5 border-r border-b border-stone-200 dark:border-white/5 ${
                                    selectedCol === cIdx 
                                      ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold' 
                                      : 'bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400'
                                  } sticky top-0 z-30 relative group/col select-none hover:z-45 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-850/85 transition-colors`}
                                >
                                  <div className="flex items-center justify-between col-span-1">
                                    <span>{String.fromCharCode(65 + (cIdx % 26))}{cIdx >= 26 ? Math.floor(cIdx / 26) : ''}</span>
                                  </div>

                                  {/* Drag-to-Resize & Add-Column Divider Zone */}
                                  <div 
                                    className="nodrag absolute top-0 right-[-8px] w-[16px] h-full cursor-col-resize z-25 group/divider select-none"
                                    onMouseDown={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setDragCol({
                                        index: cIdx,
                                        startX: e.clientX,
                                        startWidth: colWidths[cIdx] || 120
                                      });
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    {/* Custom Drag Divider Highlight */}
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-full bg-transparent group-hover/divider:bg-blue-500/80 transition-colors" />
                                    
                                    {/* Hover circular "+" indicator button completely outside at the top */}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleInsertColumnAtIndex(cIdx + 1);
                                      }}
                                      className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 w-[18px] h-[18px] rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover/divider:opacity-100 transition-opacity cursor-pointer shadow-md select-none pointer-events-auto z-50 border border-white/20 animate-in fade-in duration-100"
                                      title="在此列右侧插入列"
                                    >
                                      +
                                    </button>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tableRows && tableRows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-stone-100/30 dark:hover:bg-white/[0.02]">
                                <td 
                                  onContextMenu={(e) => handleTableContextMenu(e, rIdx, -1)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRow(rIdx);
                                    setSelectedCol(null);
                                    setSelectedCell(null);
                                  }}
                                  style={{ ...getCellSelectionStyle(rIdx, -1) }}
                                  className={`px-2 py-1.5 border-r border-b border-stone-200 dark:border-white/5 text-center ${
                                    selectedRow === rIdx 
                                      ? 'bg-blue-50/50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-bold' 
                                      : 'bg-stone-100 dark:bg-stone-900 text-stone-400'
                                  } font-mono font-semibold group/row relative select-none sticky left-0 z-20 hover:z-45 cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-850/85 transition-colors`}
                                >
                                  <span>{rIdx + 1}</span>

                                  {/* Drag-to-Resize & Add-Row Divider Zone */}
                                  <div 
                                    className="nodrag absolute bottom-[-8px] left-0 w-full h-[16px] group/row-divider select-none cursor-row-resize z-25"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Custom Horizontal Highlight Divider */}
                                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] bg-transparent group-hover/row-divider:bg-blue-500/80 transition-colors" />

                                    {/* Hover circular "+" indicator button completely outside to the left */}
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleInsertRowAtIndex(rIdx + 1);
                                      }}
                                      className="absolute right-full mr-1.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white flex items-center justify-center font-bold text-xs opacity-0 group-hover/row-divider:opacity-100 transition-opacity cursor-pointer shadow-md select-none pointer-events-auto z-50 border border-white/20 animate-in fade-in duration-100"
                                      title="在此行下方插入行"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                {row.map((cell, cIdx) => {
                                  const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                                  return (
                                    <td 
                                      key={cIdx} 
                                      className="border-r border-b border-stone-200 dark:border-white/5 min-w-[80px] bg-white dark:bg-[#1a1a1a] hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-all duration-75 relative"
                                      onContextMenu={(e) => handleTableContextMenu(e, rIdx, cIdx)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isSelected) {
                                          startEditCell(rIdx, cIdx, cell);
                                        } else {
                                          setSelectedCell({ row: rIdx, col: cIdx });
                                          setSelectedRow(null);
                                          setSelectedCol(null);
                                        }
                                      }}
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        startEditCell(rIdx, cIdx, cell);
                                      }}
                                      style={{ ...getCellSelectionStyle(rIdx, cIdx) }}
                                    >
                                      {editingCell?.row === rIdx && editingCell?.col === cIdx ? (
                                        <input
                                          type="text"
                                          className="nodrag w-full h-full px-3 py-1.5 border-none focus:outline-none focus:ring-0 text-xs bg-stone-150 dark:bg-white/10 text-stone-900 dark:text-white cursor-text block"
                                          value={tempCellValue}
                                          onChange={(e) => setTempCellValue(e.target.value)}
                                          onBlur={saveCurrentCell}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveCurrentCell();
                                          }}
                                          autoFocus
                                        />
                                      ) : (
                                        <div 
                                          className="px-3 py-1.5 min-h-[28px] h-full flex items-center overflow-hidden text-ellipsis whitespace-nowrap cursor-text text-stone-700 dark:text-stone-200 font-medium"
                                        >
                                          {cell !== '' ? cell : <span className="text-stone-300 dark:text-stone-600/50 italic text-[10px] select-none cursor-text">无数据</span>}
                                        </div>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : fileIsEditing ? (
                  // Editable document content
                  <textarea
                    className="nodrag w-full flex-1 p-0 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-white/20 font-sans text-xs leading-relaxed"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={() => {
                      if (data.onChange) {
                        // @ts-ignore
                        data.onChange(id, content, title);
                      }
                    }}
                    placeholder="编辑文件内容..."
                    autoFocus
                  />
                ) : (
                  // Preview mode for text, docx and markdown
                  <div className={`prose prose-sm prose-stone dark:prose-invert max-w-none break-words flex-1 w-full h-full select-text pointer-events-auto bg-transparent ${fileType === 'markdown' ? '' : 'whitespace-pre-wrap'}`}>
                    {fileType === 'markdown' ? (
                      memoizedMarkdown || <span className="text-stone-400 dark:text-stone-600/80 italic">无内容或空文件...</span>
                    ) : (
                      <div className="text-stone-700 dark:text-stone-300 font-sans text-xs whitespace-pre-wrap animate-in fade-in duration-150">
                        {content || <span className="text-stone-400 dark:text-stone-600/80 italic">无内容或空文件...</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
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
            <div className="prose prose-sm prose-stone dark:prose-invert max-w-none break-words hover:text-stone-900 dark:hover:text-white transition-colors flex-1 w-full h-full bg-transparent">
              {content ? (
                memoizedMarkdown
              ) : (
                <span className="text-stone-400 dark:text-white/20 italic font-serif text-sm tracking-wide pointer-events-none" style={{ fontFamily: 'Georgia, serif' }}>双击编辑内容...</span>
              )}
            </div>
          )}
        </div>
      )}

      {tableContextMenu && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-white dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col min-w-[150px] animate-in zoom-in-95 fade-in duration-100 select-none cursor-default"
          style={{ 
            left: tableContextMenu.x, 
            top: tableContextMenu.y 
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {tableContextMenu.row !== -1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertRowAtIndex(tableContextMenu.row);
                  setTableContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>向上插入行</span>
                <span className="text-[10px] text-stone-400 font-mono">↑</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertRowAtIndex(tableContextMenu.row + 1);
                  setTableContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>向下插入行</span>
                <span className="text-[10px] text-stone-400 font-mono">↓</span>
              </button>
              {tableRows && tableRows.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRow(tableContextMenu.row);
                    setTableContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-semibold text-red-500 transition-colors flex items-center justify-between mt-1 pt-1.5 border-t border-stone-100 dark:border-white/5 cursor-pointer"
                >
                  <span>删除此行</span>
                  <span className="text-[10px] text-red-400">✕</span>
                </button>
              )}
            </>
          )}

          {tableContextMenu.col !== -1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertColumnAtIndex(tableContextMenu.col);
                  setTableContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>向左插入列</span>
                <span className="text-[10px] text-stone-400 font-mono">←</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertColumnAtIndex(tableContextMenu.col + 1);
                  setTableContextMenu(null);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-white/5 rounded-lg text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>向右插入列</span>
                <span className="text-[10px] text-stone-400 font-mono">→</span>
              </button>
              {tableRows && tableRows[0]?.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteColumn(tableContextMenu.col);
                    setTableContextMenu(null);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-xs font-semibold text-red-500 transition-colors flex items-center justify-between mt-1 pt-1.5 border-t border-stone-100 dark:border-white/5 cursor-pointer"
                >
                  <span>删除此列</span>
                  <span className="text-[10px] text-red-400">✕</span>
                </button>
              )}
            </>
          )}
        </div>,
        document.body
      )}

      <Handle type="source" position={Position.Right} id="source" className={`w-[10px] h-[10px] ${config.handle} transition-transform duration-200 rounded-full border-2 border-white dark:border-[#1a1a1a] -right-[5px] hover:![transform:translate(50%,-50%)_scale(1.5)] shadow-sm cursor-crosshair`} style={{ width: '10px', height: '10px' }} />
    </div>
  );
});

export default CustomNode;

