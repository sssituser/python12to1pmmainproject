import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";

function Dashboard() {

  const [sidebarOpen,setSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Hide sidebar on results pages
  const hideSidebar = location.pathname === "/dashboard/playground-results" || location.pathname === "/dashboard/playground/detailed-results";

  return (
    <>
      <Navbar toggleSidebar={()=>setSidebarOpen(!sidebarOpen)} />

      {!hideSidebar && <Sidebar sidebarOpen={sidebarOpen}/>}

      <div className={`main-content ${!sidebarOpen || hideSidebar ? "collapsed" : ""}`} style={hideSidebar ? { marginLeft: "0", marginRight: "0", width: "100%", padding: "0" } : {}}>
        <Outlet/>
      </div>
    </>
  );
}

export default Dashboard;