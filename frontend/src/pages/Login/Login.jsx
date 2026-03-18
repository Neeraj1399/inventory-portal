import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
 const [successMessage, setSuccessMessage] = useState("");

 const [isForgotPassword, setIsForgotPassword] = useState(false);
 const [resetEmail, setResetEmail] = useState("");

 const navigate = useNavigate();
 const { login } = useAuth();

 const handleLogin = async (e) => {
 e.preventDefault();
 if (loading) return;

 setLoading(true);
 setError("");

 try {
 const { data: resBody } = await api.post("/auth/login", {
 email: email.trim(),
 password,
 });

 // //update: Access data correctly based on your authController structure
 const userData = resBody.data.user;
 const accessToken = resBody.accessToken;

 if (resBody.mustChangePassword) {
 localStorage.setItem("token", accessToken);
 navigate("/reset-password");
 return;
 }

 login(userData, accessToken);
 navigate("/");
 } catch (err) {
 console.error("Login error:", err);
 setError(err.response?.data?.message || "Invalid login credentials");
 } finally {
 setLoading(false);
 }
 };

 const handleForgotPasswordSubmit = async (e) => {
 e.preventDefault();
 if (loading) return;

 setLoading(true);
 setError("");
 setSuccessMessage("");

 try {
 const res = await api.post("/auth/forgot-password-request", {
 email: resetEmail.trim(),
 });
 setSuccessMessage(res.data.message || "Reset request sent successfully.");
 setResetEmail("");
 } catch (err) {
 console.error("Forgot password error:", err);
 setError(err.response?.data?.message || "Error submitting request. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
 {/* Decorative Blob */}
 <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
 <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
 <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
 
  <motion.div 
    initial={{ scale: 0.95, opacity: 0, y: 20 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    transition={{ type: "spring", damping: 25, stiffness: 300 }}
    className="max-w-md w-full bg-zinc-900 rounded-3xl shadow-2xl shadow-indigo-500/10 p-8 border border-zinc-800 relative z-10"
  >
 <div className="text-center mb-8">
 <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-4 shadow-lg shadow-black/20 transform hover:scale-105 transition-transform duration-300">
 <ShieldCheck className="text-white w-10 h-10" />
 </div>
 <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
 Inventory Portal
 </h1>
 <p className="text-zinc-400 mt-2">
 {isForgotPassword ? "Request a password reset" : "Sign in to manage company assets"}
 </p>
 </div>

 {error && (
 <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm rounded-r-lg shadow-sm">
 {error}
 </div>
 )}

 {successMessage && (
 <div className="mb-6 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-400 text-sm rounded-r-lg shadow-sm">
 {successMessage}
 </div>
 )}

  <AnimatePresence mode="wait">
  {isForgotPassword ? (
  <motion.form 
    key="forgot-password"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    onSubmit={handleForgotPasswordSubmit} 
    className="space-y-6"
  >
 <div>
 <label className="text-xs font-semibold uppercase text-zinc-400 ml-1 mb-2 block">
 Work Email
 </label>
 <div className="relative group">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
 <input
 autoFocus
 type="email"
 required
 placeholder="name@company.com"
 value={resetEmail}
 onChange={(e) => {
 setResetEmail(e.target.value);
 if (error) setError("");
 if (successMessage) setSuccessMessage("");
 }}
 className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:bg-zinc-950 focus:border-indigo-500 outline-none transition-all"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 transition-all active:scale-[0.98] hover:shadow-xl disabled:opacity-70 disabled:hover:scale-100"
 >
 {loading ? (
 <>
 <Loader2 className="animate-spin w-5 h-5" />
 Sending Request...
 </>
 ) : (
 "Request Reset"
 )}
 </button>

 <p className="text-center text-zinc-400 text-sm mt-8">
 Remember your password?{" "}
 <button 
 type="button"
 onClick={() => {
 setIsForgotPassword(false);
 setError("");
 setSuccessMessage("");
 }}
 className="text-indigo-400 font-medium hover:underline hover:text-indigo-300 transition-colors"
 >
 Sign In
 </button>
 </p>
  </motion.form>
  ) : (
  <motion.form 
    key="login"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    onSubmit={handleLogin} 
    className="space-y-6"
  >
 <div>
 <label className="text-xs font-semibold uppercase text-zinc-400 ml-1 mb-2 block">
 Work Email
 </label>
 <div className="relative group">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
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
 className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:bg-zinc-950 focus:border-indigo-500 outline-none transition-all"
 />
 </div>
 </div>

 <div>
 <label className="text-xs font-semibold uppercase text-zinc-400 ml-1 mb-2 block">
 Password
 </label>
 <div className="relative group">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
 <input
 type={showPassword ? "text" : "password"}
 required
 placeholder="••••••••"
 value={password}
 onChange={(e) => {
 setPassword(e.target.value);
 if (error) setError("");
 }}
 className="w-full pl-11 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-50 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:bg-zinc-950 focus:border-indigo-500 outline-none transition-all"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-indigo-400 transition-colors"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 transition-all active:scale-[0.98] hover:shadow-xl disabled:opacity-70 disabled:hover:scale-100"
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
 <p className="text-center text-zinc-400 text-sm mt-8">
 Forgot your password?{" "}
 <button 
 type="button"
 onClick={() => {
 setIsForgotPassword(true);
 setError("");
 }}
 className="text-indigo-400 font-medium hover:underline hover:text-indigo-300 transition-colors"
 >
 Reset it here
 </button>
 </p>
  </motion.form>
  )}
  </AnimatePresence>
  </motion.div>
  </div>
 );
};

export default Login;
