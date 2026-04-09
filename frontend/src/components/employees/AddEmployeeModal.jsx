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
import api from "../../services/api";

const generateTempPassword = () => {
 const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
 const lower = "abcdefghijklmnopqrstuvwxyz";
 const numbers = "0123456789";
 const special = "!@#$%^&*";
 const allChars = upper + lower + numbers + special;

 let password = "";
 password += upper[Math.floor(Math.random() * upper.length)];
 password += lower[Math.floor(Math.random() * lower.length)];
 password += numbers[Math.floor(Math.random() * numbers.length)];
 password += special[Math.floor(Math.random() * special.length)];

 for (let i = 0; i < 8; i++) {
 password += allChars[Math.floor(Math.random() * allChars.length)];
 }

 return password.split("").sort(() => 0.5 - Math.random()).join("");
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
 roleAccess: "STAFF",
 });
 const [loading, setLoading] = useState(false);

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

 const inputClass = "input-base bg-bg-tertiary";
 const labelClass = "block text-[10px] font-bold uppercase text-text-muted mb-1 ml-1 tracking-wide";

 return (
 <div className="fixed inset-0 z-[60] flex items-start justify-center pt-10 px-4 pb-4 bg-bg-primary/80 backdrop-blur-sm">
 <div className="bg-bg-secondary border border-border w-full max-w-lg rounded-2xl shadow-premium overflow-hidden animate-in fade-in zoom-in duration-200">
  {/* Header */}
  <div className="px-5 py-3.5 border-b border-border flex justify-between items-center shrink-0">
 <div className="flex items-center gap-2.5">
 <div className="p-2 bg-accent-primary/10 text-accent-primary rounded-xl border border-accent-primary/20">
 <UserPlus size={18} />
 </div>
 <h2 className="text-lg font-bold text-text-primary">
 Add New Team Member
 </h2>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-bg-tertiary rounded-full transition-all duration-200 text-text-muted"
 >
 <X size={18} />
 </button>
  </div>

 <form onSubmit={handleSubmit} className="p-5 space-y-3">
 {/* Name */}
 <div>
 <label className={labelClass}>Full Name</label>
 <input
 type="text"
 required
 placeholder="John Doe"
 className={inputClass}
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {/* Email */}
 <div>
 <label className={labelClass}>Work Email</label>
 <div className="relative flex items-center">
 <Mail className="absolute left-3 text-text-muted" size={15} />
 <input
 type="email"
 required
 placeholder="john@athiva.com"
 className={`${inputClass} pl-9`}
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label className={labelClass}>Temp Password</label>
 <div className="relative flex items-center">
 <Lock className="absolute left-3 text-text-muted" size={15} />
 <input
 type="text"
 required
 className={`${inputClass} pl-9 pr-9 font-mono text-sm`}
 value={formData.password}
 readOnly
 />
 <button
 type="button"
 onClick={handleRefreshPassword}
 className="absolute right-3 text-accent-primary hover:rotate-180 transition-transform duration-300"
 title="Regenerate Password"
 >
 <RefreshCw size={15} />
 </button>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {/* Employment Type */}
 <div>
 <label className={labelClass}>Type</label>
 <div className="relative flex items-center">
 <Briefcase className="absolute left-3 text-text-muted" size={15} />
 <input
 type="text"
 required
 placeholder="Full-Time"
 className={`${inputClass} pl-9`}
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
 />
 </div>
 </div>

 {/* Role */}
 <div>
 <label className={labelClass}>Role</label>
 <div className="relative flex items-center">
 <Shield className="absolute left-3 text-text-muted" size={15} />
 <input
 type="text"
 required
 placeholder="Developer"
 className={`${inputClass} pl-9`}
 value={formData.role}
 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
 />
 </div>
 </div>

 {/* Level */}
 <div>
 <label className={labelClass}>Level</label>
 <div className="relative flex items-center">
 <Layers className="absolute left-3 text-text-muted" size={15} />
 <input
 type="text"
 required
 placeholder="Senior"
 className={`${inputClass} pl-9`}
 value={formData.level}
 onChange={(e) => setFormData({ ...formData, level: e.target.value })}
 />
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {/* Department */}
 <div>
 <label className={labelClass}>Department</label>
 <div className="relative flex items-center">
 <Building2 className="absolute left-3 text-text-muted" size={15} />
 <input
 type="text"
 required
 placeholder="Engineering"
 className={`${inputClass} pl-9`}
 value={formData.department}
 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
 />
 </div>
 </div>

 {/* Role Access */}
 <div>
 <label className={labelClass}>Role Access</label>
 <select
 className="select-base bg-bg-tertiary py-2"
 value={formData.roleAccess}
 onChange={(e) => setFormData({ ...formData, roleAccess: e.target.value })}
 >
 <option value="STAFF">Staff Member</option>
 <option value="ADMIN">System Admin</option>
 </select>
 </div>
 </div>

 <div className="p-3 bg-status-warning/10 rounded-xl border border-status-warning/20">
 <p className="text-xs text-status-warning leading-tight">
 <strong>Note:</strong> Password meets security requirements.
 Assign hardware from the Asset Management tab after creation.
 </p>
 </div>

 {/* Footer */}
 <div className="flex justify-end gap-3 pt-2 border-t border-border mt-1">
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-2 text-text-secondary font-semibold hover:bg-bg-tertiary rounded-xl transition-all duration-200"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-7 py-2 bg-accent-gradient hover:brightness-110 text-white font-bold rounded-xl active:scale-95 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 border border-border"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={16} />
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
