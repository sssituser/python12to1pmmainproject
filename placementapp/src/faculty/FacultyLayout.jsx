import {
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

function FacultyLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menu = [
    { name: "Dashboard", path: "/faculty/dashboard", icon: <LayoutDashboard size={18}/> },
    { name: "Courses", path: "/faculty/Course", icon: <BookOpen size={18}/> },
    { name: "Statistics", path: "/faculty/Stats", icon: <BarChart3 size={18}/> },
    { name: "Jobs", path: "/faculty/jobs", icon: <Briefcase size={18}/> },
    { name: "Applications", path: "/faculty/applications", icon: <FileText size={18}/> },
    { name: "Exams", path: "/faculty/Exam", icon: <ClipboardList size={18}/> },
    { name: "Leave Requests", path: "/faculty/leaves", icon: <CalendarDays size={18}/> },
  ];


  const linkClass =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium no-underline transition";

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">

      {/* SIDEBAR */}
      <div
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className={`bg-slate-900 text-gray-300 min-h-screen flex flex-col justify-between transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}
      >

        {/* HEADER */}
        <div>
          <div className="h-16 flex items-center px-4 text-white font-semibold border-b border-slate-700">
            {sidebarOpen ? "Faculty Panel" : "FP"}
          </div>

          {/* MENU */}
          <div className="p-2 space-y-2">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${linkClass} ${
                    isActive
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                {item.icon}
                {sidebarOpen && item.name}
              </NavLink>
            ))}
          </div>
        </div>

      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* CONTENT */}
        <div className="flex-1 bg-white p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default FacultyLayout;