import { Bell, ChevronDown, Key, LogOut, Menu, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ toggleSidebar, logoUrl = "/sssit-logo.png" }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
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

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`http://${window.location.hostname}:8000/api/jwt/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("access", data.access);
        return data.access;
      } else {
        throw new Error("Token refresh failed");
      }
    } catch (error) {
      console.log("Token refresh failed:", error);
      
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      window.location.href = "/";
      return null;
    }
  };

  const makeAuthenticatedRequest = async (url, options = {}) => {
    let token = localStorage.getItem("access");
    
    const makeRequest = async (authToken) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: authToken ? `Bearer ${authToken}` : undefined,
        },
      });
    };

    let response = await makeRequest(token);
    
    if (response.status === 401 && token) {
      console.log("Token expired, attempting refresh...");
      token = await refreshAccessToken();
      if (token) {
        response = await makeRequest(token);
      }
    }
    
    return response;
  };

  const fetchProfileImage = () => {
    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token) return;

    // Use faculty profile endpoint for faculty users
    const profileEndpoint = user.role === "faculty" 
      ? `http://${window.location.hostname}:8000/api/faculty/profile/`
      : `http://${window.location.hostname}:8000/api/profile/`;

    makeAuthenticatedRequest(profileEndpoint)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      // Update profile image
      if (data && data.avatar) {
        const imageUrl = data.avatar.startsWith('http') 
          ? data.avatar 
          : `http://${window.location.hostname}:8000${data.avatar}`;
        setProfileImage(imageUrl);
      } else if (data && data.profile_image) {
        // Fallback for student profile
        const imageUrl = data.profile_image.startsWith('http') 
          ? data.profile_image 
          : `http://${window.location.hostname}:8000${data.profile_image}`;
        setProfileImage(imageUrl);
      }

      // Update user name from profile data
      if (data) {
        const updatedUser = {
          ...user,
          name: data.full_name || data.first_name || data.name || user.name || user.username || "User"
        };
        setUser(updatedUser);
        // Update localStorage with new name
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    })
    .catch(err => {
      console.log("Failed to fetch profile data:", err);
      // Don't show error for 401 as it's handled by makeAuthenticatedRequest
      if (err.message && !err.message.includes("401")) {
        console.error("Profile data fetch error:", err);
      }
    });
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
    fetchProfileImage();
    loadNotifications();

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        updateUserFromStorage();
        fetchProfileImage(); // Refresh profile image when user data changes
      }
      if (e.key === "notifications") {
        loadNotifications();
      }
      // Listen for profile image updates
      if (e.key === "profileImageUpdated") {
        fetchProfileImage(); // Refresh profile image when updated
      }
      if (e.key === "userProfileImage") {
        // Direct profile image update
        const imageUrl = e.newValue;
        if (imageUrl) {
          setProfileImage(imageUrl);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Close dropdowns on outside click
    const handleClickOutside = (event) => {
      if (!event.target.closest(".notification-area")) {
        setNotificationsOpen(false);
      }
      if (!event.target.closest(".profile-area")) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            src="/sssit-logo.png"
            alt="Logo"
            width="36"
            height="36"
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
        <div className="relative notification-area">
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
        <div className="relative profile-area">
          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition"
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <UserCircle size={22} className={profileImage ? "hidden" : "block"} />
            <span className="text-sm font-medium text-gray-700 hidden md:block">
              {user.name}
            </span>
            <ChevronDown size={16} />
          </button>

          {/* DROPDOWN */}
          {openProfile && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fadeIn">
              <button
                onClick={() => {
                  const path = user.role === "student" ? "/dashboard/profile" : "/faculty/profile";
                  navigate(path);
                  setOpenProfile(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              >
                {user.role === "student" ? "Profile" : "My Profile"}
              </button>

              <button
                onClick={() => {
                  const path = user.role === "student" ? "/dashboard/change-password" : "/faculty/change-password";
                  navigate(path);
                  setOpenProfile(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2"
              >
                <Key size={14} />
                Change Password
              </button>

              <button
                onClick={() => {
                  logout();
                  setOpenProfile(false);
                }}
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
