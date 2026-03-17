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
import api from "../../hooks/api";

// Removed static arrays (roles, levels, departments) to allow free-form text input

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

 // MongoDB documents use _id, not id
 const empId = employeeData._id || employeeData.id;

 if (!empId) {
 alert("Error: Employee ID is missing from the record.");
 return;
 }

 setLoading(true);
 try {
      // This matches your backend route: PATCH /api/admin/employees/:id
      await api.patch(`admin/employees/${empId}`, formData);
 onRefresh();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Error updating employee");
 } finally {
 setLoading(false);
 }
 };
 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900 ">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
 <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
 <h2 className="text-xl font-bold text-zinc-50">Edit Employee</h2>
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
 className="w-full pl-10 pr-4 py-2.5 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"
 value={formData.email}
 onChange={(e) =>
 setFormData({ ...formData, email: e.target.value })
 }
 />
 </div>
 </div>

 {/* Status */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Status
 </label>
 <select
 className="w-full pl-4 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30"
 value={formData.status}
 onChange={(e) =>
 setFormData({ ...formData, status: e.target.value })
 }
 >
 <option value="ACTIVE">Active</option>
 <option value="OFFBOARDED">Offboarded</option>
 </select>
 </div>
 </div>

 {/* Role Access (Admin/Staff) */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5 ml-1">
 Role Access
 </label>
 <select
 className="w-full pl-4 pr-4 py-2.5 border border-zinc-800 rounded-xl outline-none bg-zinc-900 border border-zinc-800 focus:ring-2 focus:ring-indigo-500/30"
 value={formData.roleAccess}
 onChange={(e) =>
 setFormData({ ...formData, roleAccess: e.target.value })
 }
 >
 <option value="STAFF">Staff Member</option>
 <option value="ADMIN">System Admin</option>
 </select>
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
