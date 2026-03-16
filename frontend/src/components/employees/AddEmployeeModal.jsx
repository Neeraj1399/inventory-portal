import React, { useState, useEffect } from "react";
import {
 X,
 UserPlus,
 Loader2,
 Mail,
 Briefcase,
 Shield,
 Lock,
 Building2,
 Layers,
 RefreshCw,
} from "lucide-react";
import api from "../../hooks/api";

// Removed static arrays (roles, levels, departments) to allow free-form text input

/**
 * Helper: Generates a secure temporary password meeting the criteria:
 * 10+ chars, 1 Upper, 1 Lower, 1 Number, 1 Special.
 */
const generateTempPassword = () => {
 const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 const lower = "abcdefghijklmnopqrstuvwxyz";
 const numbers = "0123456789";
 const special = "!@#$%^&*";
 const allChars = upper + lower + numbers + special;

 let password = "";
 // Ensure at least one of each required type
 password += upper[Math.floor(Math.random() * upper.length)];
 password += lower[Math.floor(Math.random() * lower.length)];
 password += numbers[Math.floor(Math.random() * numbers.length)];
 password += special[Math.floor(Math.random() * special.length)];

 // Fill the rest to reach 12 characters
 for (let i = 0; i < 8; i++) {
 password += allChars[Math.floor(Math.random() * allChars.length)];
 }

 // Shuffle the string
 return password
 .split("")
 .sort(() => 0.5 - Math.random())
 .join("");
};

const AddEmployeeModal = ({ isOpen, onClose, onRefresh }) => {
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 password: "",
 type: "",
 role: "",
 level: "",
 department: "",
 });
 const [loading, setLoading] = useState(false);

 // Automatically generate password whenever the modal is opened
 useEffect(() => {
 if (isOpen) {
 setFormData((prev) => ({
 ...prev,
 name: "",
 email: "",
 password: generateTempPassword(),
 }));
 }
 }, [isOpen]);

 if (!isOpen) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);
 try {
 await api.post("admin/employees", formData);
 onRefresh();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Error creating employee");
 } finally {
 setLoading(false);
 }
 };

 const handleRefreshPassword = () => {
 setFormData({ ...formData, password: generateTempPassword() });
 };

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900 ">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
 <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
 <div className="flex items-center gap-2">
 <div className="p-2 bg-blue-100 text-indigo-400 rounded-lg">
 <UserPlus size={20} />
 </div>
 <h2 className="text-xl font-bold text-zinc-50">
 Add New Team Member
 </h2>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
 >
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 {/* Name */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Full Name
 </label>
 <input
 type="text"
 required
 placeholder="John Doe"
 className="w-full pl-4 pr-4 py-2.5 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 {/* Email */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Work Email
 </label>
 <div className="relative flex items-center">
 <Mail className="absolute left-3 text-zinc-400" size={16} />
 <input
 type="email"
 required
 placeholder="john@athiva.com"
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"
 value={formData.email}
 onChange={(e) =>
 setFormData({ ...formData, email: e.target.value })
 }
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Temp Password
 </label>
 <div className="relative flex items-center">
 <Lock className="absolute left-3 text-zinc-400" size={16} />
 <input
 type="text" // Changed to text so admin can see/copy it easily
 required
 className="w-full pl-10 pr-10 py-2.5 border border-zinc-800 rounded-xl bg-zinc-900 font-mono text-sm outline-none"
 value={formData.password}
 readOnly
 />
 <button
 type="button"
 onClick={handleRefreshPassword}
 className="absolute right-3 text-indigo-400 hover:rotate-180 transition-transform duration-300"
 title="Regenerate Password"
 >
 <RefreshCw size={16} />
 </button>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-4">
 {/* Employment Type */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Employment Type
 </label>
 <div className="relative flex items-center">
 <Briefcase
 className="absolute left-3 text-zinc-400"
 size={16}
 />
 <input
 type="text"
 required
 placeholder="e.g. Full-Time"
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30 transition-all"
 value={formData.type}
 onChange={(e) =>
 setFormData({ ...formData, type: e.target.value })
 }
 />
 </div>
 </div>

 {/* Role */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Role
 </label>
 <div className="relative flex items-center">
 <Shield className="absolute left-3 text-zinc-400" size={16} />
 <input
 type="text"
 required
 placeholder="e.g. Developer"
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30 transition-all"
 value={formData.role}
 onChange={(e) =>
 setFormData({ ...formData, role: e.target.value })
 }
 />
 </div>
 </div>

 {/* Level */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Level
 </label>
 <div className="relative flex items-center">
 <Layers className="absolute left-3 text-zinc-400" size={16} />
 <input
 type="text"
 required
 placeholder="e.g. Senior"
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30 transition-all"
 value={formData.level}
 onChange={(e) =>
 setFormData({ ...formData, level: e.target.value })
 }
 />
 </div>
 </div>
 </div>

 {/* Department */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Department
 </label>
 <div className="relative flex items-center">
 <Building2 className="absolute left-3 text-zinc-400" size={16} />
 <input
 type="text"
 required
 placeholder="e.g. Engineering"
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30 transition-all"
 value={formData.department}
 onChange={(e) =>
 setFormData({ ...formData, department: e.target.value })
 }
 />
 </div>
 </div>

 <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 mt-2">
 <p className="text-xs text-amber-700 leading-tight">
 <strong>Note:</strong> Password meets security requirements.
 Assign hardware from the Asset Management tab after creation.
 </p>
 </div>

 <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
 <button
 type="button"
 onClick={onClose}
 className="px-6 py-2.5 text-zinc-300 font-semibold hover:bg-zinc-800 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 "Create Employee"
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default AddEmployeeModal;
