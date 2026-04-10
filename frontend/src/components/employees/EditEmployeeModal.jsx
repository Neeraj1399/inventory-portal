import React, { useState, useEffect } from "react";
import {
 X,
 Loader2,
 Mail,
 Briefcase,
 Shield,
 Building2,
 Layers,
} from "lucide-react";
import api from "../../services/api";

const EditEmployeeModal = ({ isOpen, onClose, employeeData, onRefresh }) => {
 const [formData, setFormData] = useState({
 name: "",
 email: "",
 type: "",
 role: "",
 level: "",
 department: "",
 status: "ACTIVE",
 roleAccess: "STAFF",
 });
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (employeeData) {
 setFormData({
 name: employeeData.name || "",
 email: employeeData.email || "",
 type: employeeData.type || "",
 role: employeeData.role || "",
 level: employeeData.level || "",
 department: employeeData.department || "",
 status: employeeData.status || "ACTIVE",
 roleAccess: employeeData.roleAccess || "STAFF",
 });
 }
 }, [employeeData]);

 if (!isOpen) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 const empId = employeeData._id || employeeData.id;
 if (!empId) {
 alert("Error: Employee ID is missing from the record.");
 return;
 }
 setLoading(true);
 try {
 await api.patch(`admin/employees/${empId}`, formData);
 onRefresh();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Error updating employee");
 } finally {
 setLoading(false);
 }
 };

 const inputClass = "input-base bg-bg-tertiary";
 const labelClass = "block text-[10px] font-bold uppercase text-text-muted mb-1 ml-1 tracking-wide";
 const iconWrap = "flex items-center gap-2 px-3 py-2 bg-bg-tertiary border border-border rounded-xl focus-within:ring-2 focus-within:ring-accent-primary/30 focus-within:border-accent-primary transition-all duration-200";
 const iconInput = "flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-disabled focus:outline-none min-w-0";

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
 <div className="bg-bg-secondary border border-border w-full max-w-lg rounded-2xl shadow-premium overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
  {/* Header */}
  <div className="px-5 py-3.5 border-b border-border flex justify-between items-center">
 <h2 className="text-lg font-bold text-text-primary">Edit Employee</h2>
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
 className={iconInput}
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 />
 </div>
 </div>

 {/* Status */}
 <div>
 <label className={labelClass}>Status</label>
 <select
 className="select-base bg-bg-tertiary py-2"
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 >
 <option value="ACTIVE">Active</option>
 <option value="OFFBOARDED">Offboarded</option>
 </select>
 </div>
 </div>

 {/* Role Access */}
 <div>
 <label className={labelClass}>Role Access</label>
 {employeeData?.isSuperAdmin ? (
 <div className="w-full px-4 py-2 border border-status-warning/30 rounded-xl bg-status-warning/5 text-status-warning font-bold text-sm flex items-center justify-between cursor-not-allowed">
 🔒 Super Admin (Protected)
 </div>
 ) : (
 <select
 className="select-base bg-bg-tertiary py-2"
 value={formData.roleAccess}
 onChange={(e) => setFormData({ ...formData, roleAccess: e.target.value })}
 >
 <option value="STAFF">Staff Member</option>
 <option value="ADMIN">System Admin</option>
 </select>
 )}
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
 "Update Employee"
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default EditEmployeeModal;
