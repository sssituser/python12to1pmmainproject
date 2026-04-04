import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPython, faJava, faReact } from "@fortawesome/free-brands-svg-icons";
import { faDatabase, faCode, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

const subjects = [
  { name: "Python", key: "python", icon: faPython, textStyle: "text-blue-500", bgStyle: "bg-blue-50", hoverBorder: "hover:border-blue-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.2)]" },
  { name: "Oracle", key: "oracle", icon: faDatabase, textStyle: "text-red-500", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(239,68,68,0.2)]" },
  { name: "Django", key: "django", icon: faCode, textStyle: "text-emerald-600", bgStyle: "bg-emerald-50", hoverBorder: "hover:border-emerald-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(16,185,129,0.2)]" },
  { name: "Java", key: "java", icon: faJava, textStyle: "text-red-600", bgStyle: "bg-red-50", hoverBorder: "hover:border-red-400", hoverShadow: "hover:shadow-[0_10px_40px_rgba(220,38,38,0.2)]" },
  { name: "React", key: "react", icon: faReact, textStyle: "text-cyan-600", bgStyle: "bg-cyan-50", hoverBorder: "hover:border-cyan-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(8,145,178,0.2)]" },
  { name: "UI", key: "ui", icon: faLayerGroup, textStyle: "text-purple-500", bgStyle: "bg-purple-50", hoverBorder: "hover:border-purple-300", hoverShadow: "hover:shadow-[0_10px_40px_rgba(168,85,247,0.2)]" },
];

function DailyExamSubjects() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any previous exam result flag so we don't instantly bounce back to results
    localStorage.removeItem("examResult");
  }, []);

  const handleSelectSubject = (subjectKey) => {
    navigate(`/dashboard/daily-exam/${subjectKey}`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 relative">
      
      <div className="relative z-10 max-w-6xl w-full">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 mb-6 transform transition-transform hover:scale-110 hover:rotate-3 duration-300">
            <FontAwesomeIcon icon={faCode} className="text-3xl text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Daily Assessment Center
          </h2>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto text-lg">
            Choose your technical domain. Each assessment delivers curated questions dynamically shuffled to validate your proficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link
              key={subject.key}
              to={`/dashboard/daily-exam/${subject.key}`}
              className={`group relative flex items-center justify-between w-full p-6 bg-white rounded-3xl border border-gray-100 hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden shadow-sm ${subject.hoverShadow} ${subject.hoverBorder}`}
            >
              <div className="flex items-center gap-5">
                {/* Icon Container */}
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${subject.bgStyle}`}>
                    <FontAwesomeIcon icon={subject.icon} className={`text-3xl ${subject.textStyle} transition-transform duration-300`} />
                </div>

                {/* Text Info */}
                <div className="text-left flex flex-col justify-center">
                    <h3 className="text-xl font-black text-gray-800 tracking-wide group-hover:text-gray-900 transition-colors uppercase">
                        {subject.name}
                    </h3>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1.5 group-hover:text-gray-500 transition-colors">
                        Select Topic
                    </p>
                </div>
              </div>

              {/* Arrow Icon on hover */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 group-hover:${subject.bgStyle.split('/')[0]} ${subject.textStyle.replace('text-', 'group-hover:text-')}`}>
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                 </svg>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default DailyExamSubjects;
