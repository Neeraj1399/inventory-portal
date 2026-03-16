import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
 Mail,
 Loader2,
 ArrowLeft,
 Send,
 CheckCircle2,
 ShieldCheck,
} from "lucide-react";
import api from "../hooks/api";

const ForgotPassword = () => {
 const [email, setEmail] = useState("");
 const [status, setStatus] = useState({
 loading: false,
 error: "",
 success: false,
 });
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (status.loading) return;

 setStatus({ loading: true, error: "", success: false });

 try {
 // Hits the POST /api/auth/forgot-password route
 await api.post("/auth/forgot-password", {
 email: email.trim().toLowerCase(),
 });

 setStatus({ loading: false, error: "", success: true });
 } catch (err) {
 setStatus({
 loading: false,
 error:
 err.response?.data?.message ||
 "Could not process request. Please try again.",
 success: false,
 });
 }
 };

 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 p-6">
 <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl shadow-black/20/60 p-10 border border-zinc-800 transition-all">
 {/* Branding/Icon */}
 <div className="flex flex-col items-center mb-8">
 <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4">
 <ShieldCheck className="text-zinc-300 w-6 h-6" />
 </div>
 <h1 className="text-2xl font-extrabold text-zinc-50 tracking-tight">
 Account Recovery
 </h1>
 </div>

 {!status.success ? (
 <>
 <p className="text-zinc-500 text-sm text-center mb-8 leading-relaxed">
 Enter your registered work email address. We'll send you a secure
 link to reset your password.
 </p>

 {status.error && (
 <div className="mb-6 p-4 bg-red-500/100/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-1">
 {status.error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-zinc-300 uppercase tracking-widest ml-1">
 Work Email
 </label>
 <div className="relative group">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
 <input
 type="email"
 required
 autoFocus
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="e.g. employee@company.com"
 className="w-full pl-12 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/30/10 focus:border-indigo-500 focus:bg-zinc-900 border border-zinc-800 transition-all outline-none"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={status.loading || !email}
 className="w-full bg-zinc-950 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
 >
 {status.loading ? (
 <Loader2 className="w-5 h-5 animate-spin" />
 ) : (
 <>
 <Send size={18} />
 Send Reset Link
 </>
 )}
 </button>
 </form>
 </>
 ) : (
 /* Success State */
 <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
 <div className="w-16 h-16 bg-emerald-100 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
 <CheckCircle2 size={32} />
 </div>
 <h2 className="text-xl font-bold text-zinc-50">
 Check your inbox
 </h2>
 <p className="text-zinc-500 mt-3 text-sm leading-relaxed px-4">
 If an account exists for{" "}
 <span className="font-semibold text-zinc-50">{email}</span>, you
 will receive a password reset link shortly.
 </p>
 </div>
 )}

 {/* Navigation Footer */}
 <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
 <button
 onClick={() => navigate("/login")}
 className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-400 transition-colors"
 >
 <ArrowLeft size={16} /> Back to Sign In
 </button>
 </div>
 </div>

 <p className="mt-8 text-zinc-400 text-xs">
 &copy; {new Date().getFullYear()} Internal Inventory Portal
 </p>
 </div>
 );
};

export default ForgotPassword;
