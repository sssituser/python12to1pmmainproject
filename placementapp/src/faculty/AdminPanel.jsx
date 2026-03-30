import { useState } from "react";

function AdminPanel() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const token = localStorage.getItem("access");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/admin/create-credentials/", {
        method: "POST",
        headers,
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || data.detail || "Unable to create user.");
      } else {
        setMessage(data.message || "User created successfully");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("student");
      }
    } catch (err) {
      setError("Server error while creating credentials.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Credential Center</h1>
          <p className="text-gray-400 mt-2">
            Create new access credentials for students, faculty, or admin users.
          </p>
        </div>

        {message && <div className="rounded-lg bg-emerald-500/20 border border-emerald-400 p-4 text-emerald-100">{message}</div>}
        {error && <div className="rounded-lg bg-rose-500/20 border border-rose-400 p-4 text-rose-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#020617] p-3 text-white focus:border-indigo-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-white font-semibold hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Credential"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
