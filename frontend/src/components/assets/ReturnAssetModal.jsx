import React, { useState, useEffect } from "react";
import { X, Loader2, Trash2, Wrench, ShieldCheck } from "lucide-react";
import api from "../../hooks/api";

const ReturnAssetModal = ({ isOpen, asset, onClose, onRefresh }) => {
 const [returnStatus, setReturnStatus] = useState("READY_TO_DEPLOY");
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (isOpen) setReturnStatus("READY_TO_DEPLOY");
 }, [isOpen]);

 const handleReturn = async (e) => {
 e.preventDefault();
 if (loading || !asset?._id) return;

 setLoading(true);
 try {
 await api.patch(`/assets/${asset._id}/return`, {
 returnStatus: returnStatus,
 });

 // Force a fresh fetch by passing a 'force' flag if your onRefresh supports it,
 // or just ensure it completes before closing.
 if (onRefresh) {
 await onRefresh();
 }
 onClose();
 } catch (err) {
 if (err.response?.status === 400) {
 console.warn("Asset already returned, forcing UI sync...");
 if (onRefresh) await onRefresh();
 onClose();
 } else {
 // Log the actual error for better debugging
 console.error("Return failed:", err.response?.data);
 alert(err.response?.data?.message || "Error returning asset");
 }
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen || !asset) return null;

 const getThemeColor = () => {
 if (returnStatus === "DECOMMISSIONED")
 return "bg-red-500/10 border-red-500/20 text-red-400";
 if (returnStatus === "UNDER_MAINTENANCE")
 return "bg-amber-500/10 border-amber-500/20 text-amber-400";
 return "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
 };

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900 ">
 <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
 {/* Header */}
 <div
 className={`p-6 border-b flex justify-between items-center transition-colors duration-500 ${getThemeColor()}`}
 >
 <div>
 <h2 className="text-xl font-bold text-zinc-50">Return Hardware</h2>
 <p className="text-xs font-bold uppercase tracking-widest opacity-70">
 {asset.model} • {asset.serialNumber}
 </p>
 </div>
 <button
 onClick={onClose}
 disabled={loading}
 className="p-2 hover:bg-black/5 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
 >
 <X size={20} className="text-zinc-500" />
 </button>
 </div>

 <form onSubmit={handleReturn} className="p-6 space-y-6">
 <div className="space-y-4">
 <label className="block text-[11px] font-black uppercase text-zinc-400 tracking-wider">
 Item Condition on Return
 </label>

 <div className="grid grid-cols-1 gap-3">
 {[
 {
 id: "READY_TO_DEPLOY",
 label: "Ready for Reissue",
 sub: "Clean & functional",
 icon: ShieldCheck,
 activeClass:
 "peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 text-emerald-400",
 },
 {
 id: "UNDER_MAINTENANCE",
 label: "Needs Maintenance",
 sub: "Damaged but fixable",
 icon: Wrench,
 activeClass:
 "peer-checked:border-amber-500 peer-checked:bg-amber-500/10 text-amber-400",
 },
 {
 id: "DECOMMISSIONED",
 label: "Scrap / Broken",
 sub: "Beyond repair",
 icon: Trash2,
 activeClass:
 "peer-checked:border-red-500 peer-checked:bg-red-500/10 text-red-400",
 },
 ].map((stat) => (
 <label
 key={stat.id}
 className={`relative cursor-pointer group ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
 >
 <input
 type="radio"
 name="returnStatus"
 value={stat.id}
 className="peer sr-only"
 checked={returnStatus === stat.id}
 disabled={loading}
 onChange={(e) => setReturnStatus(e.target.value)}
 />
 <div
 className={`flex items-center gap-4 p-4 border-2 border-zinc-800 rounded-2xl transition-all hover:border-zinc-800 ${stat.activeClass}`}
 >
 <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm border border-zinc-800">
 <stat.icon size={20} />
 </div>
 <div>
 <div className="font-bold text-sm text-zinc-50">
 {stat.label}
 </div>
 <div className="text-xs text-zinc-500">{stat.sub}</div>
 </div>
 </div>
 </label>
 ))}
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-white shadow-lg disabled:grayscale disabled:opacity-70
 ${
 returnStatus === "READY_TO_DEPLOY"
 ? "bg-emerald-600 shadow-none"
 : returnStatus === "UNDER_MAINTENANCE"
 ? "bg-amber-500/100 shadow-none"
 : "bg-red-600 shadow-none"
 }
 `}
 >
 {loading ? (
 <Loader2 className="animate-spin" size={22} />
 ) : (
 "Complete Return Process"
 )}
 </button>
 </form>
 </div>
 </div>
 );
};

export default ReturnAssetModal;
