import { Bell, ChevronDown, Key, LogOut, Menu, Settings, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ toggleSidebar, logoUrl = "/sssit-logo.png" }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({
    name: "Student",
    username: "student",
    role: "student",
    logoUrl: logoUrl
  });
  const navigate = useNavigate();

  // Fetch user data on mount and listen for storage changes
  const loadNotifications = () => {
    try {
      const raw = localStorage.getItem("notifications");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
    setNotifications([
      {
        id: 1,
        title: "Welcome to SSSIT",
        message: "Your profile updates and job alerts will appear here.",
        createdAt: new Date().toISOString(),
        read: false,
      },
    ]);
  };

  const updateUserFromStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({
          name: userData.name || userData.username || "Student",
          username: userData.username || "student",
          role: userData.role || "student",
          logoUrl: userData.logoUrl || logoUrl
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser({
          name: "Student",
          username: "student",
          role: "student",
          logoUrl: logoUrl
        });
      }
    }
  };

  useEffect(() => {
    // Initial load
    updateUserFromStorage();
    loadNotifications();

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        updateUserFromStorage();
      }
      if (e.key === "notifications") {
        loadNotifications();
      }
    };

    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notificationsUpdated", handleNotificationsUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notificationsUpdated", handleNotificationsUpdated);
    };
  }, [logoUrl]);

  const logout = () => {
    // Clear only auth-related items, not all localStorage
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    navigate("/");
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markNotificationsRead = () => {
    const updated = notifications.map((item) => ({ ...item, read: true }));
    localStorage.setItem("notifications", JSON.stringify(updated));
    setNotifications(updated);
  };

  const clearNotifications = () => {
    localStorage.setItem("notifications", JSON.stringify([]));
    setNotifications([]);
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
            src={user.logoUrl}
            alt="Logo"
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
          <button
            onClick={() => {
              setNotificationsOpen((prev) => !prev);
              if (unreadCount > 0) markNotificationsRead();
            }}
            className="p-2 rounded-xl hover:bg-gray-200 transition relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-sm">Notifications</span>
                <button
                  onClick={clearNotifications}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-gray-500">No notifications yet.</div>
                ) : (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      className={`px-4 py-3 border-b border-gray-100 ${note.read ? "bg-gray-50" : "bg-white"}`}
                    >
                      <p className="text-sm font-semibold text-gray-800">{note.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{note.message}</p>
                      <p className="text-[11px] text-gray-400 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PROFILE */}
        <div className="relative">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition"
          >
            <UserCircle size={22} />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user.name}
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
                onClick={() => navigate("/dashboard/settings")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
              >
                <Settings size={14} />
                Settings
              </button>

              <button
                onClick={() => navigate("/dashboard/change-password")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
              >
                <Key size={14} />
                Change Password
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