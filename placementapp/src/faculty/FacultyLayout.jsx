import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Briefcase,
  FileText,
  ClipboardList,
  CalendarDays,
} from "lucide-react";

function FacultyLayout() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menu = [
    { name: "Dashboard", path: "/faculty/Dashboard", icon: <LayoutDashboard size={20}/> },
    { name: "Course", path: "/faculty/Course", icon: <BookOpen size={20}/> },
    { name: "Stats", path: "/faculty/Stats", icon: <BarChart3 size={20}/> },
    { name: "Jobs", path: "/faculty/jobs", icon: <Briefcase size={20}/> },
    { name: "Applications", path: "/faculty/applications", icon: <FileText size={20}/> },
    { name: "Exam", path: "/faculty/Exam", icon: <ClipboardList size={20}/> },
    { name: "Leave Requests", path: "/faculty/leaves", icon: <CalendarDays size={20}/> },
  ];

  return (
    <div className="flex h-screen">
      
      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`${
          isOpen ? "w-64" : "w-20"
        } bg-[#0f172a] text-white flex flex-col p-4 transition-all duration-300`}
      >
        {/* Title */}
        <h1 className={`text-xl font-semibold mb-6 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 hidden"
        }`}>
          Faculty Panel
        </h1>

        {/* Menu */}
        <nav className="flex flex-col gap-3">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-all ${
                location.pathname === item.path
                  ? "bg-gray-700"
                  : "hover:bg-gray-800"
              }`}
            >
              {/* Icon always visible */}
              <span>{item.icon}</span>

              {/* Text only when expanded */}
              <span
                className={`whitespace-nowrap transition-all duration-200 ${
                  isOpen ? "opacity-100" : "opacity-0 hidden"
                }`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default FacultyLayout;