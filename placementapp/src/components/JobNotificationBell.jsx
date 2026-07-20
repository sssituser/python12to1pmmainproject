import React, { useState, useEffect, useCallback, useRef } from "react";

const JOB_NOTIF_SEEN_KEY = "job_notifs_last_seen";

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function JobNotificationBell({ onViewJobs }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  const getLastSeen = useCallback(() => {
    return localStorage.getItem(JOB_NOTIF_SEEN_KEY) || null;
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const since = getLastSeen();
      const url = since
        ? `/api/job-notifications/?since=${encodeURIComponent(since)}`
        : `/api/job-notifications/`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (_) {}
    setLoading(false);
  }, [getLastSeen]);

  // Poll every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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

  const handleOpen = useCallback(() => {
    if (!open) {
      fetchNotifications();
    }
    setOpen((v) => !v);
  }, [open, fetchNotifications]);

  const markAllSeen = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(JOB_NOTIF_SEEN_KEY, now);
    setUnreadCount(0);
  }, []);

  const handleMarkSeen = useCallback(() => {
    markAllSeen();
    setOpen(false);
    if (onViewJobs) onViewJobs();
  }, [markAllSeen, onViewJobs]);

  return (
    <div className="relative" style={{ fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={handleOpen}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200"
        style={{
          background: unreadCount > 0 ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.05)",
          borderColor: unreadCount > 0 ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.12)",
        }}
        aria-label="Job Notifications"
        title="New job alerts"
      >
        <svg
          className={`w-5 h-5 transition-colors ${unreadCount > 0 ? "text-emerald-400" : "text-slate-400"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-lg">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-12 w-80 max-h-96 flex flex-col rounded-2xl border z-[9999] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            borderColor: "rgba(255,255,255,0.07)",
            boxShadow: "0 20px 50px -10px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Job Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllSeen} className="text-[11px] text-slate-400 hover:text-emerald-400 transition">
                Mark all seen
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 font-medium">No job alerts yet</p>
                <p className="text-xs text-slate-600 mt-1">New jobs will appear here</p>
              </div>
            ) : (
              <div className="p-2 space-y-1.5">
                {notifications.map((notif) => {
                  const lastSeen = getLastSeen();
                  const isNew = !lastSeen || new Date(notif.created_at) > new Date(lastSeen);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer hover:bg-slate-800/40 ${
                        isNew
                          ? "bg-emerald-500/5 border-emerald-500/15"
                          : "bg-slate-800/10 border-slate-700/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight truncate">{notif.job_title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{notif.company}{notif.location ? ` · ${notif.location}` : ""}</p>
                          {notif.salary && <p className="text-[11px] text-emerald-400 font-medium mt-0.5">{notif.salary}</p>}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-600">{timeAgo(notif.created_at)}</span>
                            {notif.deadline && (
                              <span className="text-[10px] text-amber-500">Deadline: {notif.deadline}</span>
                            )}
                            {isNew && <span className="text-[10px] text-emerald-400 font-semibold">NEW</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t p-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <button
              onClick={handleMarkSeen}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
            >
              View All Jobs →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
