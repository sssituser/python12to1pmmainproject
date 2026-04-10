import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, BarChart, TrendingUp, Trophy, Activity, PieChart } from "lucide-react";

function ExamReports() {
  const navigate = useNavigate();

  const reportCards = [
    {
      title: "Daily Exam",
      path: "/dashboard/daily-exams",
      icon: <Activity className="w-6 h-6 text-indigo-600" />,
      color: "indigo",
      isComingSoon: false,
    },
    {
      title: "Weekly Exam",
      path: "/dashboard/weekly-exams",
      icon: <BarChart className="w-6 h-6 text-emerald-600" />,
      color: "emerald",
      isComingSoon: false,
    },
    {
      title: "Monthly Exam",
      path: "/dashboard/monthly-exams",
      icon: <BarChart className="w-6 h-6 text-purple-600" />,
      color: "purple",
      isComingSoon: false,
    },
    {
      title: "Grand Exam",
      path: null,
      icon: <Trophy className="w-6 h-6 text-gray-400" />,
      color: "gray",
      isComingSoon: true,
    },
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight mb-3">
             Exam <span className="text-blue-600">Reports</span>
          </h1>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Horizontal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {reportCards.map((card, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group active:scale-95 h-full"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-8 group-hover:bg-blue-50 transition-colors">
                {card.icon}
              </div>

              {/* Title */}
              <h5 className="text-lg font-black text-gray-800 uppercase tracking-tight mb-8">
                {card.title}
              </h5>

              {/* Spacer to push buttons to the bottom */}
              <div className="flex-1"></div>

              {/* Action Button */}
              {card.isComingSoon ? (
                <button
                  className="w-full bg-gray-50 text-gray-400 font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] cursor-not-allowed border border-gray-100"
                  disabled
                >
                  Coming Soon
                </button>
              ) : (
                <button
                  onClick={() => navigate(card.path)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 transition-all"
                >
                  View Analysis
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExamReports;
