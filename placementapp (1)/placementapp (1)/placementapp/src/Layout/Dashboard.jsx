import React from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div>
      <TopNavbar />

      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ flex: 1, padding: "20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;