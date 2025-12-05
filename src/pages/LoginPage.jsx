// ================================
// 2. LOGIN.JSX - COMPLETE UPDATED CODE WITH PASSWORD VISIBILITY
// ================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import panda from "../assets/panda-cut.png";

export default function Login() {
  const [user, setUser] = useState({
    email: "",
    role: "",
    password: ""
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate input
    if (!user.email || !user.role || !user.password) {
      setErrorMsg("Email, password aur role zaroori hain.");
      return;
    }

    setLoading(true);

    try {
      let endpoint = '';
      let requestBody = {};
      
      if (user.role === 'admin') {
        // Admin login - password required
        endpoint = "http://localhost:3000/auth/login";
        requestBody = {
          email: user.email,
          password: user.password,
          role: 'admin'
        };
      } else if (user.role === 'candidate') {
        // Candidate login - email aur password dono zaroori
        endpoint = "http://localhost:3000/api/candidates/login";
        requestBody = {
          email: user.email,
          password: user.password
        };
      } else {
        setErrorMsg("Invalid role selected");
        setLoading(false);
        return;
      }

      console.log("Login attempt to:", endpoint);
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!data.success) {
        setErrorMsg(data.message || "Login failed. Check your credentials.");
        setLoading(false);
        return;
      }

      // Save user data
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/AdminDashboard");
      } else if (user.role === "candidate") {
        navigate("/CandidateDashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Server se connection nahi ho paya. Phir koshish karein.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fcd4ab] to-[#f8b6a3]  md:p-6 mt-20">
      <div className="flex flex-col lg:flex-row gap-4lg:gap-10 items-center justify-center max-w-6xl w-full">
        {/* Login Card */}
        <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-2xl order-2 lg:order-1">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">LOGIN</h2>
            <p className="text-gray-600 text-sm md:text-base">Welcome back! Please login to continue</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium text-center">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Select Role:</label>
                <select
                  name="role"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
                  value={user.role}
                  onChange={changeHandler}
                  required
                >
                  <option value="">Choose Role</option>
                  <option value="admin">Admin</option>
                  <option value="candidate">Candidate / Student</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
                  value={user.email}
                  onChange={changeHandler}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">Password:</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm md:text-base"
                    value={user.password}
                    onChange={changeHandler}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm md:text-base"
              disabled={loading}
            >
              {loading ? "Logging in..." : 'Login'}
            </button>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Panda Image - Right side on desktop, above on mobile */}
        <div className="order-1 lg:order-2 flex justify-center lg:block ">
          <img 
            src={panda} 
            alt="panda mascot" 
            className="h-[270px] md:h-[300px] lg:h-[350px] w-auto object-contain" 
          />
        </div>
      </div>
    </div>
  );
}