import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

function Dashboard() {

  const [sidebarOpen,setSidebarOpen] = useState(true);

  return (
    <>
      <Navbar toggleSidebar={()=>setSidebarOpen(!sidebarOpen)} />

      <Sidebar sidebarOpen={sidebarOpen}/>

      <div className={`main-content ${!sidebarOpen ? "collapsed" : ""}`}>
        <Outlet/>
      </div>
    </>
  );
}

export default Dashboard;