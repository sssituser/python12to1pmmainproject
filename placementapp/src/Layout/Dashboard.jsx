import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : false; // Default to false like faculty
  });

  const handleToggleSidebar = () => {
    setSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">

      {/* ✅ SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex flex-col flex-1 relative">

        {/* ✅ NAVBAR */}
        <Navbar toggleSidebar={handleToggleSidebar} />

        {/* ✅ MAIN CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto relative z-10">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
