import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Dashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  //  BLOCK BACK + FORWARD BUTTON
  useEffect(() => {
    // Push current state
    window.history.pushState(null, "", window.location.href);

    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  return (

    <div className="flex h-screen">

      <Sidebar sidebarOpen={sidebarOpen} />

      <div className="flex flex-col flex-1">

        <Navbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <div className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          <Outlet />
        </div>

      </div>

    </div>

  );

}

export default Dashboard;