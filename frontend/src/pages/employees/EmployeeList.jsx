import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
 UserPlus,
 Mail,
 UserMinus,
 Laptop,
 Plus,
 Edit,
 Package,
 ShieldCheck,
} from "lucide-react";

import api from "../../hooks/api";
import { useToast } from "../../context/ToastContext";

import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../../components/employees/EditEmployeeModal";
import ManageAssetsModal from "../assets/ManageAssetsModal";

const EmployeeList = () => {
 const [employees, setEmployees] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
 const [viewStatus, setViewStatus] = useState("ACTIVE");
 const [selectedEmployee, setSelectedEmployee] = useState(null);
 const [resetRequests, setResetRequests] = useState([]);
 const { addToast } = useToast();

 const fetchEmployees = useCallback(async () => {
 try {
 setLoading(true);
 const res = await api.get("admin/employees");
 // res.data.data should include assignedAssetsCount and assignedConsumablesCount from backend
 setEmployees(res.data.data || []);
 } catch (err) {
 console.error("Error fetching employees", err);
 } finally {
 setLoading(false);
 }
 }, []);

 const fetchResetRequests = useCallback(async () => {
 try {
 const res = await api.get("admin/reset-requests");
 setResetRequests(res.data.data || []);
 } catch (err) {
 console.error("Error fetching reset requests", err);
 }
 }, []);

 useEffect(() => {
 fetchEmployees();
 fetchResetRequests();
 }, [fetchEmployees, fetchResetRequests]);

 const handleToggleStatus = async (id, currentStatus) => {
 try {
 if (currentStatus === "ACTIVE") {
 if (
 !window.confirm(
 "Initiate workforce offboarding protocol? All hardware and consumables must be returned first.",
 )
 )
 return;
 await api.patch(`admin/employees/${id}/offboard`);
 addToast("Employee offboarded successfully.", "success");
 } else {
 if (!window.confirm("Reactivate this employee?")) return;
 await api.patch(`admin/employees/${id}`, { status: "ACTIVE" });
 addToast("Employee reactivated successfully.", "success");
 }
 fetchEmployees();
 } catch (err) {
 addToast(err.response?.data?.message || "Operation failed", "error");
 }
 };

 const handleApproveReset = async (email) => {
 if (!window.confirm(`Approve reset for ${email}? This sends a temporary link.`)) return;
 try {
 const res = await api.post("admin/forgot-password", { email });
 addToast(res.data?.message || "Reset link generated and sent.", "success");
 fetchResetRequests(); 
 fetchEmployees(); 
 } catch (err) {
 addToast(err.response?.data?.message || "Failed to approve reset", "error");
 }
 };

 const filteredEmployees = useMemo(() => {
 return employees.filter((emp) => {
 const name = (emp.name || "").toLowerCase();
 const email = (emp.email || "").toLowerCase();
 const matchesSearch =
 name.includes(searchTerm.toLowerCase()) ||
 email.includes(searchTerm.toLowerCase());
 return matchesSearch && emp.status === viewStatus;
 });
 }, [employees, searchTerm, viewStatus]);

 if (loading && employees.length === 0) {
 return (
 <div className="p-20 flex flex-col items-center justify-center">
 <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-zinc-500 font-medium">Loading Directory...</p>
 </div>
 );
 }

 return (
 <div className="space-y-6 p-4 md:p-0">
  {/* Header */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
  <div className="flex-1">
  <h1 className="text-3xl font-black text-zinc-50 tracking-tight">
  Employee Directory
  </h1>
  <p className="text-zinc-400 text-sm mt-1">
  Organization directory and asset allocation management
  </p>
  </div>

  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
  <div className="relative flex-1 sm:w-64">
  <input
    type="text"
    placeholder="Search directory..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all pl-12"
  />
  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
  </div>

  <button
  onClick={() => setIsAddModalOpen(true)}
  className="bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-indigo-200 active:scale-95 transition-all w-full sm:w-auto whitespace-nowrap"
  >
  <UserPlus size={20} />
  Add Employee
  </button>
  </div>
  </div>

 {/* Pending Reset Requests Section */}
 {resetRequests.length > 0 && (
 <div className="bg-zinc-900 border border-amber-500/20 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl shadow-amber-900/5 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
 <div className="flex items-center gap-4 mb-6 relative">
 <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-500/20">
 <ShieldCheck size={24} />
 </div>
 <div>
 <h2 className="text-xl font-bold text-zinc-50">
 Pending Password Resets
 </h2>
 <p className="text-zinc-400 text-sm">{resetRequests.length} employees waiting for your approval</p>
 </div>
 </div>
 
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 relative">
 {resetRequests.map((req) => (
 <div key={req._id} className="bg-zinc-800 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300">
 <div className="mb-4">
 <div className="font-bold text-zinc-50 text-lg">{req.name}</div>
 <div className="text-sm text-zinc-400 mb-4">{req.email}</div>
 <div className="flex flex-wrap gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
 <span className="bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{req.role}</span>
 <span className="bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">{req.department}</span>
 </div>
 </div>
 <button
 onClick={() => handleApproveReset(req.email)}
 className="w-full bg-zinc-950 hover:bg-zinc-950 text-amber-500 font-bold py-3 rounded-xl text-sm transition-all shadow-md active:scale-95 border border-amber-500/20"
 >
 Approve & Email Link
 </button>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Directory Grid */}
 {filteredEmployees.length === 0 ? (
 <div className="text-center py-16 text-zinc-400 border border-zinc-800 rounded-3xl">
 No employees found
 </div>
 ) : (
 <div className="flex flex-col gap-3">
 {/* Table Header (Desktop Only) */}
 <div className="hidden md:grid grid-cols-[3fr_1.5fr_1.5fr_240px] gap-6 px-6 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 mb-2">
 <div>Employee</div>
 <div className="flex items-center">Hardware</div>
 <div className="flex items-center">Consumables</div>
 <div className="flex items-center justify-end pr-2">Actions</div>
 </div>

 {filteredEmployees.map((emp) => {
 // Check if employee has ANY company property
 const hasItemsAssigned =
 emp.assignedAssetsCount > 0 || emp.assignedConsumablesCount > 0;

 return (
 <div
 key={emp._id}
 className="group bg-zinc-900 border border-zinc-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-[3fr_1.5fr_1.5fr_240px] gap-4 md:gap-6 items-center hover:shadow-2xl hover:-translate-y-1 hover:border-indigo-500/50 hover:bg-zinc-800/90 transition-all duration-300 w-full"
 >
 <div className="flex items-center gap-5">
 <div className="h-14 w-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border border-indigo-500/30">
 {emp.name?.charAt(0) || "U"}
 </div>
 <div className="flex flex-col">
 <span className="font-extrabold text-zinc-50 text-lg mb-0.5">{emp.name}</span>
 <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
 <Mail size={14} className="text-indigo-400" />
 {emp.email}
 </span>
 </div>
 </div>

 {/* Inventory Status Indicators */}
 <div className="flex items-center gap-4">
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-zinc-400 uppercase md:hidden block mb-1">
 Hardware
 </span>
 <div
 className={`flex items-center gap-2 text-sm font-medium ${
 emp.assignedAssetsCount > 0
 ? "text-amber-400"
 : "text-zinc-400"
 }`}
 >
 <Laptop size={16} />
 <span>{emp.assignedAssetsCount || 0}</span>
 </div>
 </div>

 </div>

 <div className="flex items-center gap-4">
 <div className="flex flex-col">
 <span className="text-[10px] font-bold text-zinc-400 uppercase md:hidden block mb-1">
 Consumables
 </span>
 <div
 className={`flex items-center gap-2 text-sm font-medium ${
 // Explicitly check for > 0 to handle null/undefined safely
 (emp.assignedConsumablesCount || 0) > 0
 ? "text-indigo-400"
 : "text-zinc-400"
 }`}
 >
 <Package size={16} />
 {/* Use a fallback of 0 */}
 <span>{emp.assignedConsumablesCount || 0}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3 border-t border-zinc-800 md:border-t-0 pt-4 md:pt-0">
 {emp.status === "ACTIVE" && (
 <>
 <button
 onClick={() => {
 setSelectedEmployee(emp);
 setIsAssetModalOpen(true);
 }}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors shadow-sm"
 >
 <Plus size={16} />
 Allocate Asset
 </button>

 <button
 onClick={() => {
 setSelectedEmployee(emp);
 setIsEditModalOpen(true);
 }}
 className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-zinc-300 bg-zinc-700/50 hover:bg-zinc-700 transition-colors shadow-sm"
 >
 <Edit size={16} />
 Edit
 </button>

 <button
 disabled={hasItemsAssigned}
 title={
 hasItemsAssigned
 ? "Return all assets and consumables before offboarding"
 : "Offboard employee"
 }
 onClick={() => handleToggleStatus(emp._id, emp.status)}
 className={`p-2 rounded-xl transition-all ${
 hasItemsAssigned
 ? "text-zinc-300 cursor-not-allowed"
 : "text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
 }`}
 >
 <UserMinus size={18} />
 </button>
 </>
 )}
 {/* <button className="p-2 text-zinc-300 hover:text-indigo-400 transition-colors">
 <ArrowRight size={20} />
 </button> */}
 </div>
 </div>
 );
 })}
 </div>
 )}

 {/* Modals */}
 <AddEmployeeModal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 onRefresh={fetchEmployees}
 />

 {selectedEmployee && (
 <>
 <EditEmployeeModal
 isOpen={isEditModalOpen}
 onClose={() => {
 setIsEditModalOpen(false);
 setSelectedEmployee(null);
 }}
 employeeData={selectedEmployee}
 onRefresh={fetchEmployees}
 />

 <ManageAssetsModal
 isOpen={isAssetModalOpen}
 employee={selectedEmployee}
 onClose={() => {
 setIsAssetModalOpen(false);
 setSelectedEmployee(null);
 }}
 onRefresh={fetchEmployees}
 />
 </>
 )}
 </div>
 );
};

export default EmployeeList;
