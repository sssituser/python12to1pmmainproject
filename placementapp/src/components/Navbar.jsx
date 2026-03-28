import React, { useState } from "react";
import { Menu, Bell, UserCircle, ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar({ toggleSidebar }) {
const [openProfile, setOpenProfile] = useState(false);
const navigate = useNavigate();

const logout = () => {
    localStorage.clear();
    navigate("/");
};

return (
    <div className="h-16 backdrop-blur-md bg-white/70 border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-50">

      {/* LEFT */}
    <div className="flex items-center gap-4">

        {/* MENU */}
        <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl hover:bg-gray-200 transition"
        >
        <Menu size={20} />
        </button>

        {/* LOGO */}
        <div className="flex items-center gap-3 cursor-pointer">
            <img
            src="/sssit-logo.png"
            alt="SSSIT"
            className="h-9 object-contain"
            />

            <div className="hidden md:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-gray-800">
            SSSIT
            </span>
            <span className="text-xs text-gray-500">
            Computer Education
            </span>
            </div>
        </div>
    </div>

      {/* RIGHT */}
        <div className="flex items-center gap-4">

        {/* NOTIFICATIONS */}
        <div className="relative">
        <button className="p-2 rounded-xl hover:bg-gray-200 transition relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            3
            </span>
        </button>
        </div>

        {/* PROFILE */}
        <div className="relative">

            <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition"
            >
            <UserCircle size={22} />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
            Student
            </span>
            <ChevronDown size={16} />
            </button>

          {/* DROPDOWN */}
            {openProfile && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">

                <button
                onClick={() => navigate("/dashboard/profile")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                >
                Profile
                </button>

                <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 text-sm flex items-center gap-2"
                >
                <LogOut size={14} />
                Logout
                </button>

            </div>
        )}

        </div>
    </div>
    </div>
);
}

export default Navbar;