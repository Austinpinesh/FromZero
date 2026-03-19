"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { fetchWithAuth } from "@/utils/api";


const API_URL = "http://localhost:5000/api";

interface ChatMessage {
    messageId?: number;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
    isStreaming?: boolean;
}

interface ChatSession {
    sessionId: number;
    title: string | null;
    lessonTitle: string | null;
    isActive: boolean;
    messageCount: number;
    createdAt: string;
}

const promptPills = [
    { label: "Explain simply", icon: "auto_fix_high" },
    { label: "Summarize lesson", icon: "short_text" },
    { label: "Generate Quiz", icon: "quiz" },
    { label: "Show code", icon: "terminal" },
];

export default function AITutorDashboardPage() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const initialMessageSent = useRef(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load sessions on mount
    useEffect(() => {
        if (token) fetchSessions();
    }, [token]);

    // ─── Fetch sessions ──────────────────────────────────────────────────
    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/ai/sessions?limit=50`, {
                headers: authHeaders as Record<string, string>,
            });
            const data = await res.json();
            if (data.success) setSessions(data.data.sessions);
        } catch { /* silently fail */ } finally {
            setSessionsLoading(false);
        }
    };

    // ─── Start new session ───────────────────────────────────────────────
    const startNewSession = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/ai/sessions`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders } as Record<string, string>,
                body: JSON.stringify({}),
            });
            const data = await res.json();
            if (data.success) {
                setActiveSessionId(data.data.sessionId);
                setMessages([]);
                fetchSessions();
            }
        } catch {
            console.error("Failed to start session");
        }
    };

    // ─── Load session history ────────────────────────────────────────────
    const loadSession = async (sessionId: number) => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/ai/sessions/${sessionId}`, {
                headers: authHeaders as Record<string, string>,
            });
            const data = await res.json();
            if (data.success) {
                setActiveSessionId(sessionId);
                setMessages(
                    data.data.messages.map((m: { messageId: number; role: string; content: string; createdAt: string }) => ({
                        messageId: m.messageId,
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        createdAt: m.createdAt,
                    }))
                );
                setShowSidebar(false);
            }
        } catch {
            console.error("Failed to load session");
        } finally {
            setLoading(false);
        }
    };

    // ─── Close session ───────────────────────────────────────────────────
    const closeSession = async (sessionId: number) => {
        try {
            await fetchWithAuth(`${API_URL}/ai/sessions/${sessionId}/close`, {
                method: "PATCH",
                headers: authHeaders as Record<string, string>,
            });
            fetchSessions();
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
        } catch { /* silently fail */ }
    };

    // ─── Delete session ──────────────────────────────────────────────────
    const deleteSession = async (sessionId: number) => {
        try {
            await fetchWithAuth(`${API_URL}/ai/sessions/${sessionId}`, {
                method: "DELETE",
                headers: authHeaders as Record<string, string>,
            });
            fetchSessions();
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
        } catch { /* silently fail */ }
    };

    // ─── Send message with SSE streaming ─────────────────────────────────
    const sendMessage = useCallback(async (text?: string) => {
        const msgText = text || message.trim();
        if (!msgText || streaming) return;

        // If no active session, create one first
        let sessionId = activeSessionId;
        if (!sessionId) {
            try {
                const res = await fetchWithAuth(`${API_URL}/ai/sessions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...authHeaders } as Record<string, string>,
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                if (data.success) {
                    sessionId = data.data.sessionId;
                    setActiveSessionId(sessionId);
                }
            } catch {
                return;
            }
        }

        // Add user message optimistically
        const userMsg: ChatMessage = { role: "user", content: msgText, createdAt: new Date().toISOString() };
        setMessages((prev) => [...prev, userMsg]);
        setMessage("");
        setStreaming(true);

        // Add placeholder AI message for streaming
        const aiPlaceholder: ChatMessage = { role: "assistant", content: "", isStreaming: true };
        setMessages((prev) => [...prev, aiPlaceholder]);

        try {
            const res = await fetchWithAuth(`${API_URL}/ai/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders } as Record<string, string>,
                body: JSON.stringify({ sessionId, message: msgText }),
            });

            if (!res.ok) {
                const errData = await res.json();
                setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = {
                        role: "assistant",
                        content: `Error: ${errData.message || "Something went wrong"}`,
                        isStreaming: false,
                    };
                    return copy;
                });
                setStreaming(false);
                return;
            }

            // Read the SSE stream
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No reader");

            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || ""; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue;
                    try {
                        const payload = JSON.parse(line.slice(6));

                        if (payload.type === "chunk") {
                            setMessages((prev) => {
                                const copy = [...prev];
                                const lastMsg = copy[copy.length - 1];
                                if (lastMsg.isStreaming) {
                                    copy[copy.length - 1] = {
                                        ...lastMsg,
                                        content: lastMsg.content + payload.content,
                                    };
                                }
                                return copy;
                            });
                        } else if (payload.type === "done") {
                            setMessages((prev) => {
                                const copy = [...prev];
                                copy[copy.length - 1] = {
                                    role: "assistant",
                                    content: payload.fullContent,
                                    isStreaming: false,
                                };
                                return copy;
                            });
                        } else if (payload.type === "error") {
                            setMessages((prev) => {
                                const copy = [...prev];
                                copy[copy.length - 1] = {
                                    role: "assistant",
                                    content: `Error: ${payload.message}`,
                                    isStreaming: false,
                                };
                                return copy;
                            });
                        }
                    } catch { /* skip malformed JSON */ }
                }
            }
        } catch {
            setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = {
                    role: "assistant",
                    content: "Failed to connect to AI service. Please try again.",
                    isStreaming: false,
                };
                return copy;
            });
        } finally {
            setStreaming(false);
            fetchSessions(); // Refresh sidebar with new session title
        }
    }, [message, streaming, activeSessionId, authHeaders]);

    // Auto-send initial message if present in URL
    useEffect(() => {
        if (!token) return;
        if (initialMessageSent.current) return;

        const urlParams = new URLSearchParams(window.location.search);
        const initMsg = urlParams.get("message");
        if (initMsg) {
            initialMessageSent.current = true;
            window.history.replaceState({}, '', '/dashboard/ai-tutor');
            // Small delay to ensure session fetching/creation doesn't completely collide
            setTimeout(() => sendMessage(initMsg), 500);
        }
    }, [token, sendMessage]);

    // ─── Handle Enter key ────────────────────────────────────────────────
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // ─── Format timestamp ────────────────────────────────────────────────
    const formatTime = (dateStr?: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // ─── Active session object ───────────────────────────────────────────
    const activeSession = sessions.find((s) => s.sessionId === activeSessionId);

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] bg-white rounded-[2rem] shadow-xl shadow-cyan-500/5 border border-gray-100 relative overflow-hidden">
            {/* Background glows */}
            <div className="absolute -bottom-20 -right-20 size-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -top-20 -left-20 size-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <header className="h-24 px-6 flex items-center justify-between border-b border-white/40 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-5">
                    <div
                        className="size-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/20"
                        style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #20c997 100%)" }}
                    >
                        <span className="material-symbols-outlined text-2xl">psychology</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#1a1a1e] tracking-tight flex items-center gap-3">
                            AI Tutor
                            {streaming && (
                                <span className="flex items-center gap-2 px-3 py-1 bg-[#20c997]/10 text-[#20c997] text-[10px] font-black uppercase tracking-widest rounded-full">
                                    <span className="size-1.5 bg-[#20c997] rounded-full animate-pulse"></span>
                                    Thinking...
                                </span>
                            )}
                        </h1>
                        {activeSession?.title && (
                            <p className="text-xs text-gray-400 font-medium truncate max-w-[300px]">{activeSession.title}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={startNewSession}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/60 border border-white/80 rounded-2xl text-xs font-bold text-[#1a1a1e] hover:bg-white/80 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px] text-[#20c997]">add</span>
                        New Chat
                    </button>
                    <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2.5 hover:bg-white/50 rounded-xl transition-colors border border-white/40"
                    >
                        <span className="material-symbols-outlined text-gray-500">history</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-grow overflow-hidden relative">
                {/* Chat Area */}
                <div className="flex-grow flex flex-col overflow-hidden">
                    {/* Messages */}
                    <div className="flex-grow overflow-y-auto px-6 py-10 space-y-8 flex flex-col">
                        {messages.length === 0 && !loading && (
                            <div className="flex-grow flex flex-col items-center justify-center text-center">
                                <div
                                    className="size-20 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 mb-8"
                                    style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #20c997 100%)" }}
                                >
                                    <span className="material-symbols-outlined text-4xl">psychology</span>
                                </div>
                                <h2 className="text-3xl font-black text-[#1a1a1e] mb-3">How can I help you today?</h2>
                                <p className="text-gray-400 text-base max-w-md mb-10">
                                    Ask me anything about your courses, get explanations, or practice with quizzes.
                                </p>
                                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                                    {[
                                        { icon: "lightbulb", text: "Explain neural networks in simple terms" },
                                        { icon: "code", text: "Help me debug my Python code" },
                                        { icon: "calculate", text: "Walk me through linear algebra basics" },
                                        { icon: "quiz", text: "Create a practice quiz for me" },
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => sendMessage(suggestion.text)}
                                            className="flex items-center gap-3 p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-left hover:bg-white/70 hover:border-[#20c997]/30 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-[#20c997] text-xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                                            <span className="text-xs font-bold text-gray-600 leading-snug">{suggestion.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-grow flex items-center justify-center">
                                <span className="animate-spin material-symbols-outlined text-[#20c997] text-4xl">progress_activity</span>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex flex-col max-w-2xl gap-2 ${msg.role === "user" ? "items-end ml-auto" : "items-start"}`}
                            >
                                <div
                                    className={`p-5 shadow-sm ${msg.role === "assistant"
                                        ? "bg-[#20c997]/10 backdrop-blur-2xl border border-white/40 rounded-3xl rounded-tl-none"
                                        : "bg-gray-100/80 backdrop-blur-md border border-gray-200/50 rounded-3xl rounded-tr-none"
                                        }`}
                                >
                                    <p
                                        className={`text-[#1a1a1e] leading-relaxed text-sm lg:text-base whitespace-pre-wrap ${msg.role === "user" ? "font-medium" : ""}`}
                                    >
                                        {msg.content}
                                        {msg.isStreaming && (
                                            <span className="inline-block w-1.5 h-5 bg-[#20c997] ml-0.5 animate-pulse rounded-sm"></span>
                                        )}
                                    </p>
                                    {msg.role === "assistant" && !msg.isStreaming && msg.content && (
                                        <div className="mt-4 flex items-center justify-end gap-3 border-t border-white/20 pt-3">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(msg.content)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-[#1a1a1e] transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">content_copy</span> COPY
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold text-gray-400 ${msg.role === "user" ? "mr-1" : "ml-1"}`}>
                                    {msg.role === "assistant" ? "AI TUTOR" : "YOU"} • {formatTime(msg.createdAt)}
                                </span>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Footer with Input */}
                    <footer className="p-6 relative flex-shrink-0">
                        {/* Prompt Pills */}
                        <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-2">
                            {promptPills.map((pill, index) => (
                                <button
                                    key={index}
                                    onClick={() => sendMessage(pill.label)}
                                    className="px-5 py-2 rounded-full border border-white/50 bg-white/20 backdrop-blur-md text-xs font-bold text-[#1a1a1e]/70 transition-all hover:bg-white/40 hover:border-[#20c997]/50 cursor-pointer shadow-sm whitespace-nowrap"
                                >
                                    <span className="flex items-center gap-2">
                                        {pill.label}
                                        <span className="material-symbols-outlined text-xs">{pill.icon}</span>
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Input Field */}
                        <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-3xl p-2 shadow-2xl flex items-center gap-4 px-6 py-4">
                            {activeSession?.lessonTitle && (
                                <div className="flex items-center gap-3 pr-4 border-r border-gray-200/50">
                                    <div className="size-2 bg-[#20c997] rounded-full animate-pulse" style={{ boxShadow: "0 0 10px rgba(32,201,151,1)" }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-[#20c997] uppercase tracking-tighter">Context On</span>
                                        <span className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">{activeSession.lessonTitle}</span>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about your path..."
                                disabled={streaming}
                                className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium text-[#1a1a1e] placeholder-gray-400 outline-none disabled:opacity-50"
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={streaming || !message.trim()}
                                className="size-12 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ background: "linear-gradient(135deg, #06b6d4 0%, #8b5cf6 50%, #20c997 100%)" }}
                            >
                                <span className="material-symbols-outlined font-bold">{streaming ? "more_horiz" : "send"}</span>
                            </button>
                        </div>
                    </footer>
                </div>

                {/* Sessions Sidebar */}
                <div
                    className={`absolute top-0 right-0 h-full w-[360px] bg-white/80 backdrop-blur-3xl border-l border-gray-100/40 flex flex-col transition-transform duration-300 z-20 ${showSidebar ? "translate-x-0" : "translate-x-full"}`}
                >
                    <div className="p-6 border-b border-gray-100/60 flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[#1a1a1e]">Chat History</h3>
                        <button onClick={() => setShowSidebar(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-gray-400 text-xl">close</span>
                        </button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-2">
                        {sessionsLoading && (
                            <div className="flex justify-center py-8">
                                <span className="animate-spin material-symbols-outlined text-[#20c997]">progress_activity</span>
                            </div>
                        )}
                        {!sessionsLoading && sessions.length === 0 && (
                            <p className="text-center text-sm text-gray-400 py-8">No chat history yet</p>
                        )}
                        {sessions.map((session) => (
                            <div
                                key={session.sessionId}
                                className={`group p-4 rounded-2xl cursor-pointer transition-all ${session.sessionId === activeSessionId
                                    ? "bg-[#20c997]/10 border border-[#20c997]/20"
                                    : "hover:bg-gray-50 border border-transparent"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-2" onClick={() => loadSession(session.sessionId)}>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-bold text-[#1a1a1e] truncate">
                                            {session.title || "New Chat"}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {session.messageCount} msgs
                                            </span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                            {!session.isActive && (
                                                <>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="text-[10px] font-bold text-gray-400">Closed</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {session.isActive && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); closeSession(session.sessionId); }}
                                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                                title="Close session"
                                            >
                                                <span className="material-symbols-outlined text-gray-400 text-[16px]">lock</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteSession(session.sessionId); }}
                                            className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete session"
                                        >
                                            <span className="material-symbols-outlined text-gray-400 hover:text-red-500 text-[16px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
