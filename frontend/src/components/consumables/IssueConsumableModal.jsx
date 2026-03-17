import React from "react";
import api from "../../hooks/api";
import { X, Loader2, Send, AlertCircle } from "lucide-react";
import { useConsumableModal } from "../../hooks/useConsumableModal";

const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
 const {
 employeeId,
 setEmployeeId,
 quantity,
 setQuantity,
 loading,
 setLoading,
 employees,
 } = useConsumableModal(isOpen, item);

 if (!isOpen || !item) return null;

 const availableStock = item.totalQuantity - item.assignedQuantity;

 const handleIssue = async (e) => {
 e.preventDefault();
 if (!employeeId || quantity < 1 || quantity > availableStock) return;

 setLoading(true);
 try {
 await api.post(`/consumables/${item._id}/assign`, {
 employeeId,
 quantity: Number(quantity),
 });
 onRefresh();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Insufficient stock or error");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900 ">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
 <div>
 <h2 className="text-xl font-bold text-zinc-50">
 Allocate Consumable
 </h2>
 <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
 Inventory Distribution
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleIssue} className="p-6 space-y-6">
 {/* Stock */}
 <div
 className={`flex items-center gap-4 p-4 rounded-xl border ${
 availableStock > 0
 ? "bg-indigo-500/10 border-zinc-700"
 : "bg-red-500/100/10 border-red-500/30"
 }`}
 >
 <div
 className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
 availableStock > 0
 ? "bg-indigo-600 text-white"
 : "bg-red-500/100/15 text-red-400"
 }`}
 >
 {availableStock}
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-bold text-zinc-900">
 {item.itemName}
 </span>
 <span className="text-xs text-zinc-500">
 Units currently available in stock
 </span>
 </div>
 </div>

 {/* Recipient */}
 <div>
 <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5 ml-1">
 Recipient Employee
 </label>
 <select
 required
 value={employeeId}
 onChange={(e) => setEmployeeId(e.target.value)}
 className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm cursor-pointer"
 >
 <option value="">Select an active staff member...</option>
 {employees.map((emp) => (
 <option key={emp._id} value={emp._id}>
 {emp.name} — {emp.department}
 </option>
 ))}
 </select>
 </div>

 {/* Quantity */}
 <div>
 <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5 ml-1">
 Quantity
 </label>
 <input
 type="number"
 min="1"
 max={availableStock}
 required
 value={quantity}
 onChange={(e) => setQuantity(e.target.value)}
 className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-sm"
 />
 {quantity > availableStock && (
 <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
 <AlertCircle size={12} /> Exceeds available stock
 </p>
 )}
 </div>

 {/* Submit */}
 <button
 type="submit"
 disabled={
 loading ||
 !employeeId ||
 quantity < 1 ||
 quantity > availableStock
 }
 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/20"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={20} />
 ) : (
 <>
 <Send size={18} /> Confirm Allocation
 </>
 )}
 </button>
 </form>
 </div>
 </div>
 );
};

export default IssueConsumableModal;
