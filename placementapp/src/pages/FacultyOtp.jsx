import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyFaculty() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/verify-otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    if (res.ok) {
      alert("Faculty verified 🎉");
      navigate("/login");
    } else {
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-6 rounded-xl shadow-lg w-96 text-center">

        <h3 className="text-xl font-semibold mb-3">Verify Faculty</h3>

        <p className="text-sm text-gray-500 mb-3">
          OTP sent to {email}
        </p>

        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          className="form-control text-center text-lg tracking-widest"
          placeholder="Enter OTP"
        />

        <button
          onClick={handleVerify}
          className="btn btn-success w-100 mt-4"
        >
          Verify & Login
        </button>

      </div>
    </div>
  );
}

export default VerifyFaculty;