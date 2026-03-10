import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import api from "../../hooks/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // Password reset required
      if (data.mustChangePassword) {
        localStorage.setItem("token", data.token);
        navigate("/reset-password");
        return;
      }

      // Normal login
      login(data.data, data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Inventory Portal
          </h1>

          <p className="text-slate-500 mt-2">
            Sign in to manage company assets
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 ml-1 mb-2 block">
              Work Email
            </label>

            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 w-5 h-5" />

              <input
                autoFocus
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500 ml-1 mb-2 block">
              Password
            </label>

            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 w-5 h-5" />

              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Signing in...
              </>
            ) : (
              "Login to Dashboard"
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Forgot your password?{" "}
          <span className="text-blue-600 font-medium">Contact Admin</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
