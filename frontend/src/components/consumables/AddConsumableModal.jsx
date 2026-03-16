import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../../hooks/api";

const AddConsumableModal = ({ isOpen, onClose, onRefresh }) => {
 const [formData, setFormData] = useState({
 itemName: "",
 category: "", // Changed to empty string for manual entry
 totalQuantity: "",
 unitCost: "",
 lowStockThreshold: 5,
 });

 if (!isOpen) return null;

 const handleChange = (e) => {
 const { name, value } = e.target;
 setFormData((prev) => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 try {
 const payload = {
 ...formData,
 totalQuantity: Number(formData.totalQuantity) || 0,
 unitCost: Number(formData.unitCost) || 0,
 lowStockThreshold: Number(formData.lowStockThreshold) || 0,
 // Ensure maintenanceQuantity starts at 0 as per our new backend logic
 maintenanceQuantity: 0,
 assignedQuantity: 0,
 };

 await api.post("/consumables", payload);
 onRefresh();

 // Reset form
 setFormData({
 itemName: "",
 category: "",
 totalQuantity: "",
 unitCost: "",
 lowStockThreshold: 5,
 });
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Failed to add consumable");
 }
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 p-4">
 <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="p-6 border-b flex justify-between items-center">
 <h2 className="text-xl font-bold text-zinc-50">New Consumable</h2>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
 >
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-8 space-y-5">
 {/* Item Name */}
 <div>
 <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
 Item Name
 </label>
 <input
 required
 name="itemName"
 value={formData.itemName}
 onChange={handleChange}
 className="w-full border border-zinc-800 rounded-xl p-3 outline-none focus:ring-4 focus:ring-indigo-500/30/10 focus:border-indigo-500 transition-all font-semibold text-zinc-200 placeholder:text-zinc-300"
 placeholder="e.g. Logitech Mouse"
 />
 </div>

 <div className="grid grid-cols-2 gap-5">
 {/* Asset Classification - Now an Input instead of Dropdown */}
 <div>
 <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
 Asset Classification
 </label>
 <input
 required
 name="category"
 value={formData.category}
 onChange={handleChange}
 placeholder="e.g. Peripheral"
 className="w-full border border-zinc-800 rounded-xl p-3 font-semibold text-zinc-200 outline-none focus:border-indigo-500"
 />
 </div>

 {/* Unit Cost */}
 <div>
 <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
 Unit Cost ($)
 </label>
 <input
 type="number"
 step="0.01"
 required
 name="unitCost"
 value={formData.unitCost}
 onChange={handleChange}
 placeholder="0.00"
 className="w-full border border-zinc-800 rounded-xl p-3 font-semibold text-zinc-200 outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-5">
 {/* Quantity */}
 <div>
 <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
 Total Quantity
 </label>
 <input
 type="number"
 required
 name="totalQuantity"
 value={formData.totalQuantity}
 onChange={handleChange}
 placeholder="0"
 className="w-full border border-zinc-800 rounded-xl p-3 font-semibold text-zinc-200 outline-none focus:border-indigo-500"
 />
 </div>

 {/* Low Stock Alert */}
 <div>
 <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-1.5 ml-1">
 Low Stock Alert
 </label>
 <input
 type="number"
 name="lowStockThreshold"
 value={formData.lowStockThreshold}
 onChange={handleChange}
 className="w-full border border-zinc-800 rounded-xl p-3 font-semibold text-zinc-200 outline-none focus:border-indigo-500"
 />
 </div>
 </div>

 {/* Action Buttons */}
 <div className="flex justify-end items-center gap-4 pt-4">
 <button
 type="button"
 onClick={onClose}
 className="px-6 py-2.5 text-sm font-bold text-zinc-500 hover:text-zinc-200 transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all active:scale-95"
 >
 Save Item
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default AddConsumableModal;
