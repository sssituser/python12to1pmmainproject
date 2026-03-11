import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Globe from "../components/Globe";

function Login() {

const navigate = useNavigate();

const [showPassword, setShowPassword] = useState(false);
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const handleLogin = async () => {
if (!username || !password) {
  toast.error("Please enter username and password");
  return;
}
setLoading(true);
try {
  const response = await axios.post(
    "http://127.0.0.1:8000/api/login/",
    {
      username: username,
      password: password
    },
    {
      withCredentials:true
    }
  );
  const data = response.data;
  localStorage.setItem("user", JSON.stringify(data.user));
  toast.success("Login successful");
  setTimeout(() => {
    navigate("/dashboard");
  }, 1500);
} catch (error) {
  if (error.response) {
    toast.error(error.response.data.error || "Invalid username or password");
  } else {
    toast.error("Something went wrong");
  }
}
setLoading(false);
};

return (
  <div className="flex h-screen w-full overflow-hidden">
  <div className="w-1/2 h-full bg-black relative flex items-center justify-center overflow-hidden">
    <Globe />
    <div className="absolute left-16 text-white z-10 max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-4xl font-bold">Hello</span>
        <div className="w-4 h-4 bg-green-500"></div>
      </div>
      <p className="text-gray-400 text-lg mb-2">
        Welcome to
      </p>
      <h1 className="text-5xl font-bold mb-4">
        Placement Portal
      </h1>
      <p className="text-gray-400">
        Practice coding, prepare for interviews and land your dream job.
      </p>
    </div>
  </div>
  <div className="w-1/2 h-full flex items-center justify-center bg-gray-100">
    <div className="bg-white shadow-2xl rounded-xl p-10 w-[420px]">
      <h1 className="text-3xl font-semibold mb-2">
        Welcome back!
      </h1>
      <p className="text-gray-500 mb-8">
        Login to your account
      </p>
      <input
        type="text"
        placeholder="Your username"
        value={username}
        onChange={(e)=>setUsername(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Your password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          type="button"
          onClick={()=>setShowPassword(!showPassword)}
          className="absolute right-3 top-3"
        >
          👁
        </button>
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-3 mb-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-500 transition shadow-lg cursor-pointer"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>
      <div className="flex justify-between text-sm mb-6">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Remember me
        </label>
        <a href="#" className="text-blue-600">
          Forgot password?
        </a>
      </div>
    </div>
  </div>
</div>


);
}

export default Login;
