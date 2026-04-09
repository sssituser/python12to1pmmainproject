import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { toast } from "react-toastify";
import { Play, ArrowLeft, Terminal, AlertCircle, CheckCircle2, Keyboard } from "lucide-react";

function PlaygroundDetail() {
  const { language = "python" } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState("vs-dark");

  const [testResults, setTestResults] = useState([]);
  const [activeTab, setActiveTab] = useState("terminal"); // 'terminal' | 'tests' | 'input'
  const [customInput, setCustomInput] = useState("");

  useEffect(() => {
    const lang = language.toLowerCase();
    if (lang === "python") {
      setCode('def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))\n');
    } else if (lang === "javascript") {
      setCode('function greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));\n');
    } else if (lang === "java") {
      setCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n');
    } else if (lang === "c" || lang === "cpp") {
      setCode('#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}\n');
    } else {
      setCode('// Write your code here\n');
    }
    setOutput("");
    setError(null);
    setTestResults([]);
    setCustomInput("");
  }, [language]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before running!");
      return;
    }
    
    setIsRunning(true);
    setOutput("");
    setError(null);
    setTestResults([]);
    setActiveTab("terminal");

    try {
      const res = await axios.post("/api/run-code/", {
        code,
        language: language.toLowerCase(),
        stdin: customInput,
        test_cases: [] // Could be populated for exam mode
      });

      if (res.data && res.data.success) {
        const resultsArray = res.data.results || [];
        
        if (resultsArray.length > 0) {
          const mainResult = resultsArray[0];
          setOutput(mainResult.output || "");
          
          if (mainResult.error) {
            setError(mainResult.error);
          }
          
          // Only show test cases tab if we actively passed multiple cases
          if (res.data.total_count > 1) {
             setTestResults(resultsArray);
             setActiveTab("tests");
          }
        }

        if (!res.data.success || (resultsArray.length > 0 && resultsArray[0].error)) {
             toast.error("Execution resulted in an error");
        } else {
             toast.success("Executed successfully");
        }
      } else {
        toast.error("Failed to execute code.");
        setError("Unknown Error occurred during execution.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "An error occurred");
      toast.error("Network or server error during execution");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none flex items-center gap-2">
              Code Compiler
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {language}
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1 tracking-wide">
              Practice playground & exam environment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={language.toLowerCase()} 
            onChange={(e) => navigate(`/dashboard/playground/${e.target.value}`)}
            className="bg-white border text-sm rounded-lg px-3 py-2 font-semibold tracking-wide text-slate-700 border-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors shadow-sm cursor-pointer"
          >
            <option value="python">Python 3</option>
            <option value="javascript">Node.js</option>
            <option value="java">Java</option>
          </select>

          <select 
            value={theme} 
            onChange={(e) => setTheme(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow font-medium shadow-sm cursor-pointer"
          >
            <option value="vs-dark">Dark Theme</option>
            <option value="light">Light Theme</option>
          </select>

          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm tracking-wide text-white transition-all shadow-sm
              ${isRunning 
                ? "bg-slate-400 cursor-not-allowed shadow-none" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-md active:scale-[0.98]"}`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Code</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 border-r border-slate-200 bg-white relative">
          <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2 bg-slate-50/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> main.{language === 'python' ? 'py' : language === 'javascript' ? 'js' : language}
            </span>
          </div>
          <div className="pt-10 h-full w-full">
            <Editor
              height="100%"
              width="100%"
              language={language.toLowerCase() === 'c' || language.toLowerCase() === 'cpp' ? 'cpp' : language.toLowerCase()}
              value={code}
              theme={theme}
              loading={<div className="flex h-full items-center justify-center text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Initializing Environment...</div>}
              onChange={(val) => setCode(val || "")}
              options={{
                fontSize: 14,
                fontFamily: "JetBrains Mono, 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 16 },
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
              }}
            />
          </div>
        </div>

        {/* Output / Tests Pane */}
        <div className="w-full lg:w-[450px] xl:w-[550px] bg-slate-900 flex flex-col relative text-slate-300">
          {/* Tabs */}
          <div className="flex bg-slate-950 px-2 pt-2 border-b border-white/10 gap-1">
            <button
              onClick={() => setActiveTab("input")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all flex items-center gap-2
                ${activeTab === "input" 
                  ? "bg-slate-900 text-white border-t border-purple-500 shadow-[0_-4px_10px_rgba(168,85,247,0.1)]" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"}`}
            >
              <Keyboard size={14} /> stdin
            </button>
            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all flex items-center gap-2
                ${activeTab === "terminal" 
                  ? "bg-slate-900 text-white border-t border-blue-500 shadow-[0_-4px_10px_rgba(59,130,246,0.1)]" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"}`}
            >
              <Terminal size={14} /> Output
            </button>
            {testResults.length > 0 && (
              <button
                onClick={() => setActiveTab("tests")}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-all flex items-center gap-2
                  ${activeTab === "tests" 
                    ? "bg-slate-900 text-white border-t border-emerald-500 shadow-[0_-4px_10px_rgba(16,185,129,0.1)]" 
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"}`}
              >
                <CheckCircle2 size={14} /> Test Results
                <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[10px]">
                  {testResults.filter(t => t.passed).length}/{testResults.length}
                </span>
              </button>
            )}
          </div>

          {/* Input View */}
          {activeTab === "input" && (
            <div className="flex-1 p-4 font-mono text-sm leading-relaxed flex flex-col">
              <label className="text-xs uppercase tracking-widest text-slate-500 mb-2">Standard Input (stdin)</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter input values expected by your script (e.g. for input() or scanf())..."
                className="flex-1 w-full bg-slate-900/50 text-slate-300 border border-slate-700/50 rounded-lg p-3 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                spellCheck="false"
              />
            </div>
          )}

          {/* Terminal View */}
          {activeTab === "terminal" && (
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed">
              {!output && !error && !isRunning && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                  <Terminal size={40} className="opacity-20" />
                  <p className="text-xs uppercase tracking-widest">Compiler ready.</p>
                </div>
              )}
              
              {isRunning && (
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  <span className="animate-pulse">Executing code...</span>
                </div>
              )}
              
              {output && (
                <div className="whitespace-pre-wrap break-words text-slate-300">
                  {output}
                </div>
              )}
              
              {error && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 whitespace-pre-wrap break-words flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Execution Error</h4>
                    <p className="text-[13px]">{error}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tests View */}
          {activeTab === "tests" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {testResults.map((tc, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border ${tc.passed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {tc.passed ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={16} className="text-red-400" />
                    )}
                    <span className={`font-bold text-sm ${tc.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                      Test Case {idx + 1}
                    </span>
                  </div>
                  
                  <div className="grid gap-3 font-mono text-xs">
                    <div>
                      <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Input Data:</span>
                      <div className="bg-slate-900 px-3 py-2 rounded border border-white/5 text-slate-300">
                        {tc.input || "No Input"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Expected:</span>
                        <div className="bg-slate-900 px-3 py-2 rounded border border-white/5 text-slate-300">
                          {tc.expected}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Actual Output:</span>
                        <div className={`bg-slate-900 px-3 py-2 rounded border border-white/5 ${!tc.passed && tc.actual !== tc.expected ? 'text-red-400' : 'text-slate-300'}`}>
                          {tc.actual || "Empty string"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PlaygroundDetail;
