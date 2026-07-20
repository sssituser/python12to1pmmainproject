import React from "react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "../utils/useSEO";
import { Code2, BookOpen, ArrowRight, Sparkles, Shield, FlaskConical } from "lucide-react";

function Playground() {
  useSEO(
    "Practice Playground",
    "Access the SSSIT Computer Education Practice Playground. Practice python coding, take exams, and prepare for placements."
  );
  const navigate = useNavigate();

  let username = "";
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    username = user.username || user.first_name || localStorage.getItem("username") || "Student";
  } catch (e) {
    username = localStorage.getItem("username") || "Student";
  }

  React.useEffect(() => {
    localStorage.removeItem("dailyExamState");
    localStorage.removeItem("examResult");
  }, []);

  const practiceCards = [
    {
      id: "practice-exam",
      badge: "Practice Mode",
      badgeColor: "blue",
      icon: <FlaskConical size={26} className="text-white" />,
      iconBg: "from-blue-600 to-cyan-600",
      iconShadow: "shadow-blue-200",
      title: "Practice Exam",
      description:
        "Attempt practice MCQ exams using our static question bank. Test your Python and aptitude skills freely — no timer pressure, no proctoring.",
      features: ["Static question bank", "MCQ format", "Instant score feedback"],
      dotColor: "blue",
      btnLabel: "Start Practice",
      btnClass: "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200",
      borderHover: "hover:border-blue-200",
      bgAccent: "from-blue-50",
      route: "/dashboard/daily-exam",
    },
    {
      id: "code-editor",
      badge: "Coding Practice",
      badgeColor: "emerald",
      icon: <Code2 size={26} className="text-white" />,
      iconBg: "from-emerald-500 to-teal-600",
      iconShadow: "shadow-emerald-200",
      title: "Code Editor",
      description:
        "Write and run Python, JavaScript, and Java code interactively in a browser editor. Practice programs, test logic, and experiment freely.",
      features: ["Interactive editor", "Run code instantly", "Multiple languages supported"],
      dotColor: "emerald",
      btnLabel: "Open Editor",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200",
      borderHover: "hover:border-emerald-200",
      bgAccent: "from-emerald-50",
      route: "/dashboard/playground/python",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/sssit-logo.png" alt="SSSIT Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                SSSIT <span className="text-blue-600 font-extrabold text-sm uppercase px-2 py-0.5 bg-blue-50 rounded-md">Playground</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">SSSIT Computer Education</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600">
              Welcome, <span className="text-blue-600 font-bold">{username}</span> 👋
            </span>
            <button
              onClick={() => navigate("/dashboard/exams")}
              className="flex items-center gap-1.5 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition shadow-sm"
            >
              <Shield size={12} />
              Go to Exams
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full border border-blue-100 mb-5 uppercase tracking-widest">
            <Sparkles size={12} />
            SSSIT LEARNING PLATFORM
          </div>
          <h2 className="text-4xl font-black text-slate-800 leading-tight">
            Level Up Your Skills with <span className="text-blue-600">SSSIT Playground</span>
          </h2>
          <p className="text-slate-500 mt-3 text-base font-medium max-w-2xl mx-auto">
            Enhance your logical, aptitude, and programming skills. Our self-paced sandbox environments have no timer pressure or proctoring – pure learning at your own speed.
          </p>
        </div>

        {/* Practice Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {practiceCards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.route)}
              className={`group relative bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col justify-between cursor-pointer hover:shadow-xl ${card.borderHover} transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
            >
              {/* BG accent */}
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${card.bgAccent} to-transparent rounded-bl-full opacity-50`} />

              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.iconBg} flex items-center justify-center shadow-lg ${card.iconShadow} mb-6`}>
                  {card.icon}
                </div>

                <span className={`inline-block bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100 mb-4`}>
                  {card.badge}
                </span>

                <h3 className="text-2xl font-black text-slate-800 mb-3">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{card.description}</p>

                <ul className="mt-5 space-y-2">
                  {card.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <div className={`w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0`}>
                        <div className={`w-1.5 h-1.5 rounded-full bg-blue-500`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button className={`mt-8 w-full flex items-center justify-center gap-2 ${card.btnClass} text-white py-3.5 rounded-2xl font-black text-sm transition-all shadow-sm group-hover:gap-3`}>
                {card.btnLabel}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ))}
        </div>

        {/* Divider — Faculty Exams CTA */}
        <div
          onClick={() => navigate("/dashboard/exams")}
          className="group bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center shadow-md shadow-indigo-100">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Ready for the real thing?</p>
              <p className="text-xs text-slate-500 font-medium">Take SSSIT faculty-uploaded exams — proctored, timed & graded</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 font-black text-sm group-hover:gap-3 transition-all">
            Go to Exams <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </main>
    </div>
  );
}

export default Playground;

