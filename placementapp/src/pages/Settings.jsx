import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const defaultSettings = {
  emailNotifications: true,
  pushNotifications: false,
  theme: "light",
  language: "en"
};

export default function Settings() {
  const localStorageKey = "sssit-settings";
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (err) {
        console.error("Error parsing stored settings:", err);
      }
    } else {
      localStorage.setItem(localStorageKey, JSON.stringify(defaultSettings));
    }
    loadedRef.current = true;
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem(localStorageKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const applyTheme = (theme) => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.body.style.backgroundColor = "#0f172a";
        document.body.style.color = "#e2e8f0";
      } else if (theme === "light") {
        document.documentElement.classList.remove("dark");
        document.body.style.backgroundColor = "#f8fafc";
        document.body.style.color = "#0f172a";
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark) {
          document.documentElement.classList.add("dark");
          document.body.style.backgroundColor = "#0f172a";
          document.body.style.color = "#e2e8f0";
        } else {
          document.documentElement.classList.remove("dark");
          document.body.style.backgroundColor = "#f8fafc";
          document.body.style.color = "#0f172a";
        }
      }
    };

    applyTheme(settings.theme);
  }, [settings.theme]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(settings));
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
      console.error(err);
    }
  };

  const systemPrefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const activeTheme = settings.theme === "auto" ? (systemPrefersDark ? "dark" : "light") : settings.theme;

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className={`min-h-screen ${activeTheme === "dark" ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${activeTheme === "dark" ? "bg-slate-900" : "bg-white"} rounded-lg shadow-md p-6`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NOTIFICATIONS */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Email notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Push notifications</span>
                </label>
              </div>
            </div>

            {/* APPEARANCE */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            {/* LANGUAGE */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Language & Region</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="te">Telugu</option>
                </select>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Save Settings
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}