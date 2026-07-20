import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useSEO } from "../utils/useSEO";

const API = `http://${window.location.hostname}:8000/api`;
const getToken = () => localStorage.getItem("access")?.replace(/^"|"$/g, "");

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
};

const ROLE_CONFIG = {
  student: {
    color: "indigo",
    icon: "🎓",
    label: "Student",
    suggestions: [
      "Recommend jobs for me",
      "How should I prepare for placement?",
      "Give me an aptitude practice question",
      "Create my 4-week study plan",
      "Explain my exam mistakes",
    ],
  },
  faculty: {
    color: "amber",
    icon: "👨‍🏫",
    label: "Faculty",
    suggestions: [
      "Which students need training?",
      "Which department is performing poorly?",
      "Generate placement report summary",
      "Who are the top performers?",
    ],
  },
  recruiter: {
    color: "purple",
    icon: "💼",
    label: "Recruiter",
    suggestions: [
      "Find candidates skilled in Django and React",
      "Summarise the top candidates",
      "Who is the best applicant for a Python role?",
      "Rank applicants for a DevOps position",
    ],
  },
};

const COLORS = {
  indigo: { bg: "bg-indigo-600", light: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
  amber: { bg: "bg-amber-600", light: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  purple: { bg: "bg-purple-600", light: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
};

const Message = ({ msg, roleColor }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">
          🤖
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? `${COLORS[roleColor]?.bg || "bg-indigo-600"} text-white rounded-tr-sm`
          : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm"
        }`}>
        <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
      </div>
      {isUser && (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${COLORS[roleColor]?.bg || "bg-indigo-600"}`}>
          👤
        </div>
      )}
    </div>
  );
};

const TypingDot = () => (
  <div className="flex gap-3 mb-4">
    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">🤖</div>
    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </div>
  </div>
);

export default function AIChatAssistant() {
  useSEO("AI Placement Assistant", "Interact with the SSSIT AI assistant to discover job recommendations, plan placement strategies, and analyze curriculum assessments.");
  const user = getUser();
  const userRole = user?.role?.toLowerCase() || "student";
  const roleConfig = ROLE_CONFIG[userRole] || ROLE_CONFIG.student;
  const roleColor = roleConfig.color;

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hello ${user?.username || ""}! 👋 I'm your SSSIT Placement AI Assistant.\n\nI'm here to help you with ${
        userRole === "student"
          ? "job recommendations, interview preparation, exam explanations, and placement planning."
          : userRole === "faculty"
          ? "student performance reports, weak student identification, and placement analysis."
          : "candidate search, applicant ranking, and resume summaries."
      }\n\nWhat would you like help with today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ai/chat/`,
        { message: msg },
        { headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" } }
      );
      setMessages(prev => [...prev, { role: "ai", text: res.data.response }]);
    } catch (e) {
      const errMsg = e.response?.data?.error || "I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "ai", text: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "ai",
      text: `Chat cleared! How can I help you today?`,
    }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0b1120] text-white overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-slate-900 border-b border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${COLORS[roleColor]?.bg || "bg-indigo-600"} flex items-center justify-center text-xl`}>
              🤖
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight">AI Placement Assistant</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400">Online • {roleConfig.icon} {roleConfig.label} mode</span>
              </div>
            </div>
          </div>
          <button onClick={clearChat}
            className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2 transition-all">
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} roleColor={roleColor} />
          ))}
          {loading && <TypingDot />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Suggestions */}
      <div className="shrink-0 bg-slate-900/50 border-t border-slate-800/50 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {roleConfig.suggestions.map(s => (
              <button key={s} onClick={() => send(s)}
                disabled={loading}
                className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all hover:opacity-80 disabled:opacity-40
                  ${COLORS[roleColor]?.light || "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Ask me anything as ${roleConfig.label.toLowerCase()}…`}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 disabled:opacity-40
              ${COLORS[roleColor]?.bg || "bg-indigo-600"} hover:opacity-90 shadow-lg`}>
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
}
