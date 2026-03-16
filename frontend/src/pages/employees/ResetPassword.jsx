import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldAlert, CheckCircle2, Circle } from "lucide-react"; 
import api from "../../hooks/api";
import { useToast } from "../../context/ToastContext";

const ResetPassword = () => {
 const [password, setPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();
 const { token } = useParams();
 const { addToast } = useToast();

 // Helper to check standard requirements for the UI
 const requirements = [
 { label: "Minimum 10 characters", valid: password.length >= 10 },
 {
 label: "Uppercase & Lowercase",
 valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
 },
 {
 label: "Number & Special Character",
 valid: /[0-9]/.test(password) && /[!@#$%^&*]/.test(password),
 },
 ];

 const handleUpdate = async (e) => {
 e.preventDefault();

 // 1. Frontend Validation
 const passwordRegex =
 /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{10,})/;
 if (!passwordRegex.test(password)) {
 addToast("Password does not meet the security standards.", "error");
 return;
 }

 if (password !== confirmPassword) {
 addToast("Passwords do not match.", "error");
 return;
 }

 setLoading(true);
 try {
 if (token) {
 // Unauthenticated Reset via Email Token
 await api.patch(`/admin/reset-password/${token}`, { password });
 } else {
 // Authenticated "Force Change Password" flow
 await api.patch("/auth/update-password", {
 password,
 passwordConfirm: confirmPassword,
 });
 }

 addToast("Security update successful! Please log in with your new password.", "success");

 // Clean up and redirect
 localStorage.removeItem("token");
 localStorage.removeItem("user");
 navigate("/login");
 } catch (err) {
 // 2. Standard Backend Error
 addToast(
 err.response?.data?.message || "An error occurred during update.",
 "error"
 );
 } finally {
 setLoading(false);
 }
 };
 // Calculate strength (0 to 4)
 const getStrength = () => {
 let s = 0;
 if (password.length >= 10) s++;
 if (/[A-Z]/.test(password) && /[a-z]/.test(password)) s++;
 if (/[0-9]/.test(password)) s++;
 if (/[!@#$%^&*]/.test(password)) s++;
 return s;
 };

 const strength = getStrength();
 const colors = [
 "bg-zinc-800",
 "bg-red-400",
 "bg-orange-400",
 "bg-yellow-400",
 "bg-green-500",
 ];
 return (
 <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
 {/* Decorative Blob */}
 <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
 <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>

 <div className="bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-zinc-800 relative z-10">
 <div className="text-center mb-6">
 <h2 className="text-2xl font-bold text-zinc-50">
 {token ? "Reset Your Password" : "Security Update"}
 </h2>
 <p className="text-sm text-zinc-400 mt-2">
 {token 
 ? "Please enter your new password below." 
 : "You are using a temporary password. Please set a secure private password to proceed."}
 </p>
 </div>

 <form onSubmit={handleUpdate} className="space-y-4">
 <div>
 <input
 type="password"
 placeholder="New Secure Password"
 className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-zinc-50 placeholder-zinc-500"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 required
 />
 </div>

 <div>
 <input
 type="password"
 placeholder="Confirm New Password"
 className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-zinc-50 placeholder-zinc-500"
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 required
 />
 </div>

 {/* Password Checklist UI */}
 <div className="bg-zinc-950/40 p-4 rounded-xl space-y-2 border border-zinc-800">
 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
 Requirements:
 </p>
 {requirements.map((req, i) => (
 <div
 key={i}
 className={`flex items-center gap-2 text-sm ${req.valid ? "text-emerald-400" : "text-zinc-500"}`}
 >
 {req.valid ? (
 <CheckCircle2 className="w-4 h-4" />
 ) : (
 <Circle className="w-4 h-4" />
 )}
 {req.label}
 </div>
 ))}
 </div>

 <button
 disabled={loading}
 className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 shadow-lg shadow-black/20 transition-all active:scale-95 border border-indigo-500/30"
 >
 {loading ? "Updating..." : (token ? "Set New Password" : "Set New Password & Logout")}
 </button>
 </form>
 </div>
 </div>
 );
};

export default ResetPassword;
