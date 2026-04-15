import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Play, Terminal, AlertCircle, CheckCircle2, Keyboard, Code } from "lucide-react";

const CodeCompiler = ({ 
  initialCode = "", 
  language = "python", 
  title = "Solution Editor",
  onCodeChange = null,
  isReadOnly = false,
  showLanguageSelect = true
}) => {
  const [selectedLang, setSelectedLang] = useState(language);
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [activeTab, setActiveTab] = useState("terminal");
  const [customInput, setCustomInput] = useState("");

  const supportedLanguages = [
    { label: "Python 3", value: "python" },
    { label: "Java", value: "java" },
    { label: "Node.js", value: "javascript" }
  ];

  const normalizeLanguage = (lang) => {
    const l = (lang || "").toLowerCase();
    if (l.includes("python")) return "python";
    if (l.includes("java") && !l.includes("javascript")) return "java";
    if (l.includes("javascript") || l.includes("node") || l.includes("react")) return "javascript";
    if (l.includes("cpp") || l.includes("c_") || l === "c") return "cpp";
    if (l.includes("html")) return "html";
    if (l.includes("css") || l.includes("bootstrap")) return "css";
    if (l.includes("sql") || l.includes("oracle") || l.includes("database")) return "sql";
    if (l.includes("dotnet") || l.includes("sharp")) return "csharp";
    return "python"; 
  };

  useEffect(() => {
    if (initialCode && !code) {
      setCode(initialCode);
    }
  }, [initialCode]);

  useEffect(() => {
      setSelectedLang(language);
  }, [language]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    
    setIsRunning(true);
    setOutput("");
    setError(null);
    setActiveTab("terminal");

    try {
      const res = await axios.post("/api/run-code/", {
        code,
        language: selectedLang.toLowerCase(),
        stdin: customInput,
      });

      if (res.data && res.data.success) {
        const resultsArray = res.data.results || [];
        if (resultsArray.length > 0) {
          const mainResult = resultsArray[0];
          setOutput(mainResult.output || "");
          if (mainResult.error) setError(mainResult.error);
        }
      } else {
        setError("Unknown Error occurred during execution.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "An error occurred");
    } finally {
      setIsRunning(false);
    }
  };

  const handleChange = (val) => {
    const newCode = val || "";
    setCode(newCode);
    if (onCodeChange) onCodeChange(newCode);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col mt-8">
      {/* Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Code size={16} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">{title}</h4>
          </div>
        </div>

        <div className="flex gap-2">
          {showLanguageSelect && (
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              className="text-[10px] font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {supportedLanguages.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          )}

          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="text-[10px] font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="vs-dark">Dark Mode</option>
            <option value="light">Light Mode</option>
          </select>
          <button
            onClick={handleRunCode}
            disabled={isRunning || isReadOnly}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest text-white transition-all
              ${isRunning ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"}`}
          >
            {isRunning ? "Running..." : "Run Code"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[400px]">
        {/* Editor */}
        <div className="flex-1 relative border-r border-gray-100">
          <Editor
            height="100%"
            language={normalizeLanguage(selectedLang)}
            value={code}
            theme={theme}
            onChange={handleChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              readOnly: isReadOnly,
              padding: { top: 12 },
              fontFamily: "'JetBrains Mono', monospace",
            }}
          />
        </div>

        {/* Console / Output */}
        <div className="w-full lg:w-[350px] bg-slate-900 flex flex-col">
          <div className="flex bg-slate-950 px-2 pt-1.5 gap-1">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-t-lg transition-all
                ${activeTab === "terminal" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Console Output
            </button>
            <button
              onClick={() => setActiveTab("input")}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-t-lg transition-all
                ${activeTab === "input" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              Standard Input
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed">
            {activeTab === "input" ? (
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter inputs here..."
                className="w-full h-full bg-transparent text-slate-300 border-none resize-none focus:outline-none placeholder:text-slate-700"
                spellCheck="false"
              />
            ) : (
              <div className="text-slate-300">
                {isRunning ? (
                  <p className="text-blue-400 animate-pulse font-bold">Executing...</p>
                ) : error ? (
                  <div className="text-red-400 flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Error:</span>
                    <pre className="whitespace-pre-wrap">{error}</pre>
                  </div>
                ) : output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <p className="text-slate-600 italic">No output yet. Run your code to see results.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeCompiler;
