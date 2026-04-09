import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

function VerifyFaculty() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`http://${window.location.hostname}:8000/api/verify_otp/`, {
        username: email, // Backend expects 'username' as the identifier
        otp: otp
      });


      if (res.data.access) {
        toast.success("Faculty verified successfully 🎉");
        setTimeout(() => navigate("/faculty/login"), 1500);
      } else {
        toast.error("Verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      await axios.post(`http://${window.location.hostname}:8000/api/send_otp/`, {
        username: email
      });
      toast.success("New OTP sent to your email");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster />
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Verify Faculty</h3>
        
        <div className="mb-6">
          <p className="text-gray-500 mb-1">We've sent a 6-digit code to</p>
          <p className="font-semibold text-blue-600">{email || "your email"}</p>
        </div>

        <div className="space-y-4">
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="form-control text-center text-2xl tracking-widest font-mono py-3 border-2 focus:border-green-500 focus:ring-0 transition-colors"
            placeholder="Enter The 6 Digit OTP"
          />

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn btn-success w-full py-3 text-lg font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {loading ? "Verifying..." : "VERIFY & LOGIN"}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center">
          {timer > 0 ? (
            <div className="flex items-center text-sm text-gray-400 gap-2">
              <span>Didn't receive code? Resend in</span>
              <span className="font-bold text-orange-500 w-8">{timer}s</span>
            </div>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors cursor-pointer"
            >
              RESEND OTP
            </button>
          )}
        </div>

        <button 
          onClick={() => navigate("/register")}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Back to registration
        </button>
      </div>
    </div>
  );
}

export default VerifyFaculty;
