import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">

      {/* ✅ SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex flex-col flex-1 relative">

        {/* ✅ NAVBAR */}
        <Navbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />

        {/* ✅ MAIN CONTENT */}
        <div className="p-6 flex-1 overflow-y-auto relative z-10">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
