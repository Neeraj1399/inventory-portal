import React, { useState, useEffect, useRef } from "react";
import { X, UserPlus, Loader2, Search, Check } from "lucide-react";
import api from "../../hooks/api";

const AssignAssetModal = ({ isOpen, onClose, asset, onRefresh }) => {
 const [employees, setEmployees] = useState([]);
 const [filteredEmployees, setFilteredEmployees] = useState([]);
 const [searchTerm, setSearchTerm] = useState("");
 const [selectedEmployee, setSelectedEmployee] = useState(null);
 const [isDropdownOpen, setIsDropdownOpen] = useState(false);
 const [loading, setLoading] = useState(false);
 const dropdownRef = useRef(null);

 useEffect(() => {
 if (isOpen) {
 fetchEmployees();
 setSelectedEmployee(null);
 setSearchTerm("");
 setIsDropdownOpen(false);
 }
 }, [isOpen]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
 setIsDropdownOpen(false);
 }
 };
 document.addEventListener("mousedown", handleClickOutside);
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, []);

 const fetchEmployees = async () => {
 try {
 // Use the timestamp to bypass any browser caching
 const res = await api.get(`admin/employees?t=${Date.now()}`);
 const data = res.data.data || [];
 setEmployees(data);
 // Initialize filtered list with all employees so it's not empty on first click
 setFilteredEmployees(data);
 } catch (err) {
 console.error("Failed to load employees", err);
 }
 };

 const handleSearch = (e) => {
 const term = e.target.value.toLowerCase();
 setSearchTerm(term);

 const filtered = employees.filter((emp) => {
 const nameMatch = emp.name?.toLowerCase().includes(term);
 const deptMatch = (emp.department || "Staff")
 .toLowerCase()
 .includes(term);
 return nameMatch || deptMatch;
 });

 setFilteredEmployees(filtered);
 setIsDropdownOpen(true);
 };

 const handleAssign = async (e) => {
 e.preventDefault();
 if (!selectedEmployee) return;
 setLoading(true);
 try {
 await api.patch(`/assets/${asset._id}/assign`, {
 employeeId: selectedEmployee._id,
 });
 onRefresh();
 onClose();
 } catch (err) {
 if (err.response?.status === 400) {
 await onRefresh();
 onClose();
 } else {
 alert(
 "Assignment failed: " +
 (err.response?.data?.message || "Server error"),
 );
 }
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen || !asset) return null;

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900 animate-in fade-in duration-200">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
 <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
 <div>
 <h2 className="text-xl font-bold text-zinc-50">
 Allocate Hardware
 </h2>
 <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
 Inventory Management
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400"
 >
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleAssign} className="p-6 space-y-6">
 <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
 <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm text-indigo-400">
 <Check size={20} />
 </div>
 <div>
 <p className="text-sm font-bold text-zinc-50">{asset.model}</p>
 <p className="text-[11px] text-zinc-500 font-mono">
 {asset.serialNumber}
 </p>
 </div>
 </div>

 <div className="relative" ref={dropdownRef}>
 <label className="block text-xs font-bold uppercase text-zinc-400 mb-2 px-1">
 Select Recipient
 </label>
 <div className="relative">
 <Search
 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
 size={18}
 />
 <input
 type="text"
 placeholder="Search name or department..."
 className={`w-full pl-12 pr-10 py-3.5 bg-zinc-900 border rounded-2xl outline-none transition-all ${
 selectedEmployee
 ? "border-indigo-500/200 ring-2 ring-indigo-500/20"
 : "border-zinc-800 focus:border-blue-400"
 }`}
 value={selectedEmployee ? selectedEmployee.name : searchTerm}
 onChange={handleSearch}
 onFocus={() => setIsDropdownOpen(true)}
 readOnly={!!selectedEmployee}
 />
 {selectedEmployee && (
 <button
 type="button"
 onClick={() => {
 setSelectedEmployee(null);
 setSearchTerm("");
 }}
 className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500"
 >
 <X size={16} />
 </button>
 )}
 </div>

 {isDropdownOpen && (
 <div className="absolute w-full mt-2 bg-zinc-900 border border-zinc-800 border border-zinc-800 rounded-2xl shadow-2xl z-[80] max-h-[450px] overflow-y-auto p-2">
 {filteredEmployees.length > 0 ? (
 filteredEmployees.map((emp) => (
 <div
 key={emp._id}
 className="px-4 py-3 hover:bg-indigo-500/10 rounded-xl cursor-pointer flex justify-between items-center group"
 onClick={() => {
 setSelectedEmployee(emp);
 setIsDropdownOpen(false);
 }}
 >
 <div>
 <p className="text-sm font-bold text-zinc-200 group-hover:text-indigo-400">
 {emp.name}
 </p>
 <p className="text-[10px] text-zinc-400 uppercase font-medium">
 {emp.department || "Staff"}
 </p>
 </div>
 {selectedEmployee?._id === emp._id && (
 <Check size={16} className="text-indigo-400" />
 )}
 </div>
 ))
 ) : (
 <div className="py-8 text-center text-zinc-400 italic text-sm">
 No employees found
 </div>
 )}
 </div>
 )}
 </div>

 <button
 type="submit"
 disabled={loading || !selectedEmployee}
 className="w-full bg-zinc-950 hover:bg-black text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30 shadow-lg shadow-black/20"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={20} />
 ) : (
 <>
 <UserPlus size={18} /> Allocate Hardware
 </>
 )}
 </button>
 </form>
 </div>
 </div>
 );
};

export default AssignAssetModal;
