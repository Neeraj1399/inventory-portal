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
 ChevronDown,
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
 const [isRoleOpen, setIsRoleOpen] = useState(false);

 useEffect(() => {
 if (isOpen) {
 setFormData((prev) => ({
 ...prev,
 name: "",
 email: "",
 password: generateTempPassword(),
 }));
 setIsRoleOpen(false);
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
 const labelClass = "block text-[10px] font-bold text-text-muted mb-1 ml-1 tracking-wide";
 const iconWrap = "flex items-center gap-2 px-3 py-2 bg-bg-tertiary border border-border rounded-xl focus-within:ring-2 focus-within:ring-accent-primary/30 focus-within:border-accent-primary transition-all duration-200";
 const iconInput = "flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none min-w-0";

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-bg-secondary border border-border w-full max-w-lg rounded-2xl shadow-premium overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
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
 <div className={iconWrap}>
 <Mail size={15} className="text-text-muted shrink-0" />
 <input
 type="email"
 required
 placeholder="john@athiva.com"
 className={iconInput}
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 />
 </div>
 </div>

 {/* Password */}
 <div>
 <label className={labelClass}>Temp Password</label>
 <div className={iconWrap}>
 <Lock size={15} className="text-text-muted shrink-0" />
 <input
 type="text"
 required
 className={`${iconInput} font-mono`}
 value={formData.password}
 readOnly
 />
 <button
 type="button"
 onClick={handleRefreshPassword}
 className="text-accent-primary hover:rotate-180 transition-transform duration-300 shrink-0"
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
 <div className={iconWrap}>
 <Briefcase size={15} className="text-text-muted shrink-0" />
 <input
 type="text"
 required
 placeholder="Full-Time"
 className={iconInput}
 value={formData.type}
 onChange={(e) => setFormData({ ...formData, type: e.target.value })}
 />
 </div>
 </div>

 {/* Role */}
 <div>
 <label className={labelClass}>Role</label>
 <div className={iconWrap}>
 <Shield size={15} className="text-text-muted shrink-0" />
 <input
 type="text"
 required
 placeholder="Developer"
 className={iconInput}
 value={formData.role}
 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
 />
 </div>
 </div>

 {/* Level */}
 <div>
 <label className={labelClass}>Level</label>
 <div className={iconWrap}>
 <Layers size={15} className="text-text-muted shrink-0" />
 <input
 type="text"
 required
 placeholder="Senior"
 className={iconInput}
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
 <div className={iconWrap}>
 <Building2 size={15} className="text-text-muted shrink-0" />
 <input
 type="text"
 required
 placeholder="Engineering"
 className={iconInput}
 value={formData.department}
 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
 />
 </div>
 </div>

 {/* Role Access */}
 <div>
 <label className={labelClass}>Role Access</label>
 <div className="relative">
   <button
     type="button"
     onClick={() => setIsRoleOpen(o => !o)}
     className={`w-full flex items-center justify-between px-5 h-12 bg-bg-tertiary border rounded-2xl transition-all text-text-primary ${isRoleOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}
   >
     <span className="text-sm font-bold">{formData.roleAccess === "ADMIN" ? "System Admin" : "Staff Member"}</span>
     <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isRoleOpen ? "rotate-180" : ""}`} />
   </button>
   {isRoleOpen && (
     <>
       <div className="fixed inset-0 z-10" onClick={() => setIsRoleOpen(false)} />
       <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
         {[{ value: "STAFF", label: "Staff Member" }, { value: "ADMIN", label: "System Admin" }].map(opt => (
           <button type="button" key={opt.value} onClick={() => { setFormData({ ...formData, roleAccess: opt.value }); setIsRoleOpen(false); }}
             className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${formData.roleAccess === opt.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
             {opt.label}
             {formData.roleAccess === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
           </button>
         ))}
       </div>
     </>
   )}
 </div>
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
