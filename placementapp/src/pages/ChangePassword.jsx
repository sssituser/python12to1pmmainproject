import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "student";
  const backPath = isStudent ? "/dashboard/profile" : "/faculty/dashboard";
  const backLabel = isStudent ? "Back to Profile" : "Back to Dashboard";

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("access");
    const url = `http://${window.location.hostname}:8000/api/change-password/`;
    const payload = {
      current_password: formData.currentPassword,
      old_password: formData.currentPassword,
      new_password: formData.newPassword,
      confirm_password: formData.confirmPassword
    };

    try {
      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      navigate(backPath);

    } catch (err) {
      let finalError = err;
      if (err.response?.status === 405) {
        try {
          await axios.put(url, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Password changed successfully!");
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          navigate(backPath);
          return;
        } catch (fallbackErr) {
          finalError = fallbackErr;
        }
      }

      if (finalError.response?.status === 400) {
        toast.error("Current password is incorrect or the new password is invalid.");
      } else if (finalError.response?.data?.detail) {
        toast.error(finalError.response.data.detail);
      } else {
        toast.error("Failed to change password. Please try again.");
      }
      console.error(finalError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Change Password</h1>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* CURRENT PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter current password"
              />
            </div>

            {/* NEW PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter new password"
                minLength="8"
              />
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters long</p>
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Confirm new password"
                minLength="8"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition"
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            </div>

          </form>

          {/* BACK BUTTON */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate(backPath)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
