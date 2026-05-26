import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  X,
  Menu,
  Edit,
  Search,
  LayoutGrid,
  Plus,
  Book,
  MoreHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Rnd } from "react-rnd";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

interface ChatAssistantWindowProps {
  onClose: () => void;
}

export function ChatAssistantWindow({ onClose }: ChatAssistantWindowProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    Date.now().toString(),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [models, setModels] = useState<{ id: string; name: string }[]>([
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  ]);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [currentModel, setCurrentModel] = useState("gpt-4o-mini");

  useEffect(() => {
    const savedModel = localStorage.getItem("ai_text_model");
    if (savedModel) setCurrentModel(savedModel);

    const fetchModels = async () => {
      try {
        const apiUrl =
          localStorage.getItem("ai_api_url") || "https://api.openai.com/v1";
        const apiKey = localStorage.getItem("ai_api_key") || "";

        let targetUrl = `${apiUrl}/models`;

        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: targetUrl,
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            method: "GET",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && Array.isArray(data.data)) {
            const fetchedModels = data.data.map((m: any) => ({
              id: m.id,
              name: m.id,
            }));
            setModels(fetchedModels);
            if (!savedModel && fetchedModels.length > 0) {
              setCurrentModel(fetchedModels[0].id);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch models", err);
      }
    };
    fetchModels();
  }, []);

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    localStorage.setItem("ai_text_model", model);
    setShowModelDropdown(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem("ai_chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
          setMessages(parsed[0].messages);
        }
      } catch (e) {}
    }
  }, []);

  const setAndSaveMessages = (
    getNewMessages: (prev: ChatMessage[]) => ChatMessage[],
  ) => {
    setMessages((prev) => {
      const newM = getNewMessages(prev);
      setSessions((prevSessions) => {
        let updated = [...prevSessions];
        let idx = updated.findIndex((s) => s.id === currentSessionId);
        if (idx === -1) {
          updated.unshift({
            id: currentSessionId,
            title: newM[0]?.content.slice(0, 30) || "新对话",
            messages: newM,
            updatedAt: Date.now(),
          });
        } else {
          updated[idx] = {
            ...updated[idx],
            messages: newM,
            title:
              updated[idx].title === "新对话" && newM.length > 0
                ? newM[0].content.slice(0, 30)
                : updated[idx].title,
            updatedAt: Date.now(),
          };
          const [moved] = updated.splice(idx, 1);
          updated.unshift(moved);
        }
        localStorage.setItem("ai_chat_sessions", JSON.stringify(updated));
        return updated;
      });
      return newM;
    });
  };

  const createNewChat = () => {
    const newId = Date.now().toString();
    setCurrentSessionId(newId);
    setMessages([]);
    setView("chat");
  };

  const switchChat = (id: string) => {
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setView("chat");
    }
  };

  const [size, setSize] = useState({ width: 550, height: 600 });
  const [position, setPosition] = useState({
    x: typeof window !== "undefined" ? window.innerWidth - 574 : 0,
    y: 76,
  });

  useEffect(() => {
    // Try to load user custom saved size and position
    const savedSize = localStorage.getItem("nova_chat_size");
    const savedPos = localStorage.getItem("nova_chat_position");

    if (savedSize && savedPos) {
      try {
        setSize(JSON.parse(savedSize));
        setPosition(JSON.parse(savedPos));
        return;
      } catch (e) {
        // Fallback to automatic calculation if parsing fails
      }
    }

    const handleResize = () => {
      const targetWidth = Math.min(550, window.innerWidth - 32);
      const targetHeight = Math.max(350, window.innerHeight - 184); // 20px below top bar (76px) and 20px above bottom toolbar (108px)
      const targetX = window.innerWidth - targetWidth - 24;

      setSize({ width: targetWidth, height: targetHeight });
      setPosition({ x: targetX, y: 76 });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleDragStop = (e: any, d: any) => {
    let newX = d.x;
    const snapThreshold = 40;

    if (newX < snapThreshold) {
      newX = 24;
    } else if (window.innerWidth - (newX + size.width) < snapThreshold) {
      newX = window.innerWidth - size.width - 24;
    }

    const newPos = { x: newX, y: d.y };
    setPosition(newPos);
    localStorage.setItem("nova_chat_position", JSON.stringify(newPos));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };
    setAndSaveMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const apiUrl =
        localStorage.getItem("ai_api_url") || "https://api.openai.com/v1";
      const apiKey = localStorage.getItem("ai_api_key") || "";
      const aiModel = localStorage.getItem("ai_text_model") || "gpt-4o-mini";

      let fetchUrl = apiUrl.trim();
      let isGemini = false;

      const conversationContext = messages.map((m) => {
        if (isGemini) {
          // Gemini wants "user" and "model" roles
          return {
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          };
        }
        return { role: m.role, content: m.content };
      });

      let requestBody: any = {
        model: aiModel,
        messages: [
          ...conversationContext,
          { role: "user", content: userMessage.content },
        ],
      };

      let headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (fetchUrl.includes("generativelanguage.googleapis.com")) {
        isGemini = true;
        let baseUrl = fetchUrl;
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);
        if (baseUrl.includes("/chat/completions")) {
          baseUrl = baseUrl.replace("/chat/completions", "");
        }
        if (baseUrl.endsWith("/v1beta/models"))
          baseUrl = baseUrl.replace("/v1beta/models", "");
        if (baseUrl.endsWith("/v1/models"))
          baseUrl = baseUrl.replace("/v1/models", "");
        if (baseUrl.endsWith("/models"))
          baseUrl = baseUrl.replace("/models", "");
        if (baseUrl.endsWith("/")) baseUrl = baseUrl.slice(0, -1);

        fetchUrl = `${baseUrl}/v1beta/models/${aiModel}:generateContent?key=${apiKey.trim()}`;
        requestBody = {
          contents: [
            ...conversationContext,
            { role: "user", parts: [{ text: userMessage.content }] },
          ],
        };
      } else {
        if (!fetchUrl.endsWith("/chat/completions")) {
          if (fetchUrl.endsWith("/")) fetchUrl += "chat/completions";
          else fetchUrl += "/chat/completions";
        }
        if (apiKey.trim()) {
          headers["Authorization"] = `Bearer ${apiKey.trim()}`;
        }
      }

      let responseText = "";
      let resStatus = 0;

      // 1. Try Direct Browser Fetch First
      try {
        const directHeaders = { ...headers };
        const directRes = await fetch(fetchUrl, {
          method: "POST",
          headers: directHeaders,
          body: JSON.stringify(requestBody),
        });
        resStatus = directRes.status;
        responseText = await directRes.text();
      } catch (directError: any) {
        console.warn(
          "直接通过浏览器发起的请求失败 (跨域拦截或本地代理问题)，将尝试通过 GCP 服务器代理转发:",
          directError.message,
        );

        // 2. Fallback to server-side proxy
        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: fetchUrl,
            method: "POST",
            headers,
            body: JSON.stringify(requestBody),
          }),
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
            if (
              errJson.error.details &&
              (errJson.error.details.includes("ConnectTimeoutError") ||
                errJson.error.details.includes("fetch failed"))
            ) {
              errorDetail = "目标接口响应超时或拒绝连接。";
            } else if (errJson.error.details) {
              errorDetail += " - " + errJson.error.details.slice(0, 100);
            }
          }
        } catch (e) {}

        if (responseText.trim().startsWith("<")) {
          errorDetail = "接口返回了 HTML 页面而非 JSON 数据。";
        }
        throw new Error(`API 返回错误 (HTTP ${resStatus}): ${errorDetail}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e: any) {
        if (responseText.trim().startsWith("<")) {
          throw new Error(
            "接口被拦截，返回了 HTML 页面而非 JSON 数据。请检查接口地址是否正确。",
          );
        }
        throw new Error(
          "解析接口返回内容失败。收到非 JSON 数据: " +
            responseText.slice(0, 100),
        );
      }

      let aiText = "";
      if (isGemini) {
        aiText =
          responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
          "接口返回中未找到正文。";
      } else {
        aiText =
          responseData.choices?.[0]?.message?.content ||
          "接口返回中未找到正文。";
      }

      setAndSaveMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: aiText },
      ]);
    } catch (err: any) {
      console.error(err);
      setAndSaveMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `> [!warning] 接口请求失败:\n${err.message}`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={(e, d) => handleDragStop(e, d)}
      onResize={(e, direction, ref, delta, position) => {
        const newSize = {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
        };
        setSize(newSize);
        setPosition(position);
        localStorage.setItem("nova_chat_size", JSON.stringify(newSize));
        localStorage.setItem("nova_chat_position", JSON.stringify(position));
      }}
      minWidth={280}
      minHeight={350}
      bounds="window"
      dragHandleClassName="chat-drag-handle"
      className="z-[99999] pointer-events-auto"
      style={{ position: "fixed" }}
    >
      <div
        className="flex flex-col w-full h-full bg-white dark:bg-stone-900 border border-stone-200/50 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onWheel={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {view === "history" ? (
          <div className="flex-1 flex flex-col bg-stone-50 dark:bg-stone-950 overflow-hidden cursor-auto">
            <div className="px-4 py-3 flex items-center justify-between pointer-events-auto border-b border-stone-100 dark:border-stone-800">
              <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Nova
              </span>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setView("chat")}
                className="p-1.5 rounded-full hover:bg-stone-200/50 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div
              className="flex-1 overflow-y-auto px-2 pb-4 pt-2"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={createNewChat}
                  className="flex items-center gap-3 px-4 py-3 mx-2 my-1 bg-stone-200/50 dark:bg-stone-800/50 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-2xl transition-colors text-stone-800 dark:text-stone-200 pointer-events-auto cursor-pointer"
                >
                  <Edit size={18} />
                  <span className="text-sm font-medium">发起新对话</span>
                </button>
              </div>

              <div className="mt-6 px-4">
                <div className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2">
                  近期对话
                </div>
                <div className="flex flex-col gap-0.5">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => switchChat(s.id)}
                      className="flex text-left w-full truncate py-2.5 text-sm text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50 -mx-3 px-3 rounded-xl pointer-events-auto cursor-pointer transition-colors"
                    >
                      {s.title}
                    </button>
                  ))}
                  {sessions.length === 0 && (
                    <div className="text-sm text-stone-400 py-2">
                      暂无近期对话
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="chat-drag-handle px-4 py-3 flex items-center justify-between border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 cursor-move">
              <div className="flex items-center gap-3">
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setView("history")}
                  className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 pointer-events-auto cursor-pointer p-1.5 -ml-1.5 rounded-full hover:bg-stone-200/50 dark:hover:bg-white/10 transition-colors"
                >
                  <Menu size={18} />
                </button>
                <div className="relative">
                  <div
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-stone-200/50 dark:hover:bg-white/5 transition-colors cursor-pointer text-stone-900 dark:text-stone-100 group pointer-events-auto"
                  >
                    <span className="text-sm font-semibold">
                      {models.find((m) => m.id === currentModel)?.name ||
                        currentModel}
                    </span>
                    <svg
                      className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {showModelDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl overflow-hidden z-50 pointer-events-auto">
                      <div className="flex flex-col py-1">
                        {models.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleModelChange(m.id)}
                            className={`px-3 py-2 text-left text-sm transition-colors cursor-pointer ${currentModel === m.id ? "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium" : "text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-stone-200"}`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="p-1 rounded-md hover:bg-stone-200/50 dark:hover:bg-white/10 text-stone-500 dark:text-stone-400 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 pb-24 flex flex-col gap-4 cursor-auto relative"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-20 pointer-events-none select-none">
                  <div className="text-xl font-medium text-stone-900 dark:text-stone-100 mb-2">
                    你好，我是 Nova
                  </div>
                  <div className="text-sm text-stone-500 dark:text-stone-400">
                    想探讨什么设计呢？
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"}`}
                  >
                    {msg.role === "user" ? (
                      <User size={14} />
                    ) : (
                      <Bot size={14} />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-1.5 text-sm flex items-center ${
                      msg.role === "user"
                        ? "bg-black text-white dark:bg-white dark:text-black font-medium"
                        : "bg-stone-50 text-stone-900 dark:bg-stone-800/50 dark:text-stone-100 border border-stone-200/50 dark:border-white/5 prose prose-sm dark:prose-invert max-w-none"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap text-sm leading-snug py-0.5">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed prose-p:my-0 prose-headings:my-1 prose-ul:my-0 prose-ol:my-0 py-0.5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 flex-row">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Bot size={14} />
                  </div>
                  <div className="bg-stone-50 dark:bg-stone-800/50 rounded-2xl px-3 py-2 flex items-center justify-center border border-stone-200/50 dark:border-white/5">
                    <Loader2
                      size={14}
                      className="animate-spin text-stone-400"
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="absolute bottom-4 left-4 right-4 pointer-events-auto"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Light effect */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-blue-400/20 dark:bg-blue-600/20 blur-[30px] animate-pulse rounded-full pointer-events-none" />

              <div className="relative flex items-center gap-2 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl p-1.5 rounded-full border border-stone-200/50 dark:border-white/10 shadow-lg focus-within:border-stone-400 dark:focus-within:border-stone-600 transition-colors">
                <button className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors shrink-0 cursor-pointer">
                  <Plus size={18} />
                </button>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none text-sm px-1 text-stone-800 dark:text-stone-200 placeholder:text-stone-400"
                  placeholder="问问 Nova..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button
                  className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors cursor-pointer mr-0.5 shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Rnd>
  );
}
