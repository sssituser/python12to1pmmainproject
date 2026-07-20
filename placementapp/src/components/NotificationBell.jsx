import React, { useState, useEffect, useCallback, useRef } from "react";

const API = "/api";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const typeStyles = {
  new_student: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: (
      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
    dot: "bg-emerald-400",
  },
  new_faculty: {
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: (
      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    dot: "bg-blue-400",
  },
  system: {
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: (
      <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    dot: "bg-amber-400",
  },
  leave: {
    bg: "bg-purple-500/10 border-purple-500/20",
    icon: (
      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    dot: "bg-purple-400",
  },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("access");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/notifications/unread-count/`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (_) {}
  }, [getHeaders]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/notifications/?limit=30`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (_) {}
    setLoading(false);
  }, [getHeaders]);

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        bellRef.current && !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    if (!open) fetchNotifications();
    setOpen((v) => !v);
  }, [open, fetchNotifications]);

  const handleMarkRead = useCallback(async (id) => {
    try {
      await fetch(`${API}/admin/notifications/${id}/read/`, { method: "POST", headers: getHeaders() });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (_) {}
  }, [getHeaders]);

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    try {
      await fetch(`${API}/admin/notifications/mark-all-read/`, { method: "POST", headers: getHeaders() });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (_) {}
    setMarkingAll(false);
  }, [getHeaders]);

  const handleDelete = useCallback(async (id) => {
    try {
      await fetch(`${API}/admin/notifications/${id}/delete/`, { method: "DELETE", headers: getHeaders() });
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === id);
        if (removed && !removed.is_read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n.id !== id);
      });
    } catch (_) {}
  }, [getHeaders]);

  const style = (type) => typeStyles[type] || typeStyles.system;

  return (
    <div className="relative" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleToggle}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-700/70 hover:border-slate-600 transition-all duration-200 shadow-sm"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg
          className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-amber-400" : "text-slate-400"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-96 max-h-[520px] flex flex-col rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden z-[9999]"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            boxShadow: "0 25px 60px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/50 bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[11px] text-slate-400 hover:text-emerald-400 transition font-medium disabled:opacity-50"
              >
                {markingAll ? "Marking..." : "Mark all read"}
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-emerald-400 rounded-full animate-spin" />
                  <span className="text-xs text-slate-500">Loading notifications…</span>
                </div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-400">All caught up!</p>
                <p className="text-xs text-slate-600 mt-1">No notifications yet.</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {notifications.map((notif) => {
                  const s = style(notif.notification_type);
                  return (
                    <div
                      key={notif.id}
                      className={`relative group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer
                        ${notif.is_read ? "bg-slate-800/20 border-slate-700/30 opacity-70" : `${s.bg} border`}
                      `}
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                    >
                      {/* Unread dot */}
                      {!notif.is_read && (
                        <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${s.dot} shadow-sm`} />
                      )}

                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${s.bg}`}>
                        {s.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <p className={`text-xs font-semibold leading-tight ${notif.is_read ? "text-slate-400" : "text-white"}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] text-slate-600">{timeAgo(notif.created_at)}</span>
                          {notif.related_email && (
                            <span className="text-[10px] text-slate-600 truncate">{notif.related_email}</span>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
                        title="Dismiss"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700/40 px-4 py-2.5 bg-slate-900/40 shrink-0">
            <p className="text-[10px] text-slate-600 text-center">
              Showing last 30 notifications · Auto-refreshes every 30s
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
