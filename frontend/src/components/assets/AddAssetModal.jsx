import React, { useEffect, useState } from "react";
import { X, Upload, Loader2, Package } from "lucide-react"; // Changed CheckCircle to Package for a category icon
import api from "../../hooks/api";

const AddAssetModal = ({ isOpen, onClose, onRefresh, asset }) => {
 const [formData, setFormData] = useState({
 category: "",
 model: "",
 serialNumber: "",
 purchaseDate: "",
 purchasePrice: "",
 warrantyMonths: 12,
 });
 const [file, setFile] = useState(null);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (asset && isOpen) {
 setFormData({
 category: asset.category || "",
 model: asset.model || "",
 serialNumber: asset.serialNumber || "",
 purchaseDate: asset.purchaseDate
 ? asset.purchaseDate.split("T")[0]
 : "",
 purchasePrice: asset.purchasePrice || "",
 warrantyMonths: asset.warrantyMonths || 12,
 });
 } else if (isOpen) {
 setFormData({
 category: "",
 model: "",
 serialNumber: "",
 purchaseDate: "",
 purchasePrice: "",
 warrantyMonths: 12,
 });
 setFile(null);
 }
 }, [asset, isOpen]);

 if (!isOpen) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 setLoading(true);

 try {
 const data = new FormData();
 data.append("category", formData.category);
 data.append("model", formData.model);
 data.append("serialNumber", formData.serialNumber);
 data.append("purchaseDate", formData.purchaseDate);
 data.append("purchasePrice", formData.purchasePrice || 0);
 data.append("warrantyMonths", formData.warrantyMonths || 12);

 if (file) {
 data.append("receipt", file);
 }

 if (asset?._id) {
 await api.patch(`/assets/${asset._id}`, data, {
 headers: { "Content-Type": "multipart/form-data" },
 });
 } else {
 await api.post("/assets", data, {
 headers: { "Content-Type": "multipart/form-data" },
 });
 }

 onRefresh();
 onClose();
 } catch (err) {
 alert(err.response?.data?.message || "Error saving asset");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900 ">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
 {/* Header */}
 <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
 <h2 className="text-xl font-bold text-zinc-50">
 {asset ? "Edit Asset Details" : "Register New Asset"}
 </h2>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-4">
 {/* Asset Classification - Now a Manual Text Input */}
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Asset Classification
 </label>
 <div className="relative flex items-center">
 <input
 type="text"
 required
 placeholder="e.g. Laptop, Mobile, Furniture"
 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all"
 value={formData.category}
 onChange={(e) =>
 setFormData({ ...formData, category: e.target.value })
 }
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Model Name
 </label>
 <input
 type="text"
 required
 value={formData.model}
 placeholder="e.g. Sony Monitor"
 className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500/30 outline-none"
 onChange={(e) =>
 setFormData({ ...formData, model: e.target.value })
 }
 />
 </div>

 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Serial Number
 </label>
 <input
 type="text"
 required
 value={formData.serialNumber}
 placeholder="SN-123456"
 className="w-full px-4 py-2 border rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/30 outline-none"
 onChange={(e) =>
 setFormData({ ...formData, serialNumber: e.target.value })
 }
 />
 </div>
 </div>

 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Provisioning Date
 </label>
 <input
 type="date"
 value={formData.purchaseDate}
 className="w-full px-4 py-2 border rounded-xl outline-none"
 onChange={(e) =>
 setFormData({ ...formData, purchaseDate: e.target.value })
 }
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Price ($)
 </label>
 <input
 type="number"
 value={formData.purchasePrice}
 placeholder="1200"
 className="w-full px-4 py-2 border rounded-xl outline-none"
 onChange={(e) =>
 setFormData({
 ...formData,
 purchasePrice: e.target.value,
 })
 }
 />
 </div>
 <div>
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Warranty (Mo)
 </label>
 <input
 type="number"
 value={formData.warrantyMonths}
 className="w-full px-4 py-2 border rounded-xl outline-none"
 onChange={(e) =>
 setFormData({
 ...formData,
 warrantyMonths: e.target.value,
 })
 }
 />
 </div>
 </div>

 <div className="relative group">
 <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
 Receipt Image
 </label>
 <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-zinc-700 rounded-xl cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-500 transition-all">
 <Upload
 size={20}
 className="text-zinc-400 group-hover:text-blue-500 mb-1"
 />
 <span className="text-xs text-zinc-500">
 {file
 ? file.name
 : asset?.receiptUrl
 ? "Update Receipt"
 : "Upload Receipt"}
 </span>
 <input
 type="file"
 className="hidden"
 onChange={(e) => setFile(e.target.files[0])}
 accept="image/*"
 />
 </label>
 </div>
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
 <button
 type="button"
 onClick={onClose}
 className="px-6 py-2 text-zinc-300 font-semibold hover:bg-zinc-800 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={loading}
 className="px-8 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={18} />
 ) : asset ? (
 "Update Changes"
 ) : (
 "Save Asset"
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
};

export default AddAssetModal;