import React, { useState } from "react";
import {
 X,
 Wrench,
 Trash2,
 CheckCircle2,
 Loader2,
 AlertTriangle,
 Layers,
 Lock,
} from "lucide-react";
import api from "../../hooks/api";

const AssetConditionModal = ({
 isOpen,
 asset,
 selectedIds = [],
 onClose,
 onRefresh,
}) => {
 const [loading, setLoading] = useState(false);

 // Determine if we are in bulk mode or single asset mode
 const isBulk = selectedIds.length > 0 && !asset;

 // LOGIC FIX: Check if the current single asset is already scrapped
 const isPermanentlyScrapped = !isBulk && asset?.status === "DECOMMISSIONED";

 if (!isOpen || (!asset && !isBulk)) return null;

 const handleStatusUpdate = async (newStatus) => {
 if (isPermanentlyScrapped) return; // Guard clause

 setLoading(true);
 try {
 if (isBulk) {
 await Promise.all(
 selectedIds.map((id) =>
 api.patch(`/assets/${id}`, { status: newStatus }),
 ),
 );
 } else {
 await api.patch(`/assets/${asset._id}`, { status: newStatus });
 }

 onRefresh();
 onClose();
 } catch (err) {
 alert(
 err.response?.data?.message ||
 `Failed to update ${isBulk ? "assets" : "asset"}`,
 );
 } finally {
 setLoading(false);
 }
 };

 const options = [
 {
 id: "READY_TO_DEPLOY",
 title: "Mark as Ready",
 description: "Items are functional and available for assignment",
 icon: <CheckCircle2 className="text-emerald-500" size={20} />,
 color: "hover:border-emerald-500 hover:bg-emerald-500/100/10",
 hideIf: !isBulk && asset.status === "READY_TO_DEPLOY",
 },
 {
 id: "UNDER_MAINTENANCE",
 title: "Send to Maintenance",
 description: "Items are damaged and need technical attention",
 icon: <Wrench className="text-amber-500" size={20} />,
 color: "hover:border-amber-500 hover:bg-amber-500/10",
 hideIf: !isBulk && asset.status === "UNDER_MAINTENANCE",
 },
 {
 id: "DECOMMISSIONED",
 title: "Decommission / Scrap",
 description: "Beyond repair or obsolete; remove from pool",
 icon: <Trash2 className="text-rose-500" size={20} />,
 color: "hover:border-rose-500 hover:bg-rose-500/10/50",
 hideIf: !isBulk && asset.status === "DECOMMISSIONED",
 },
 ];

 return (
 <div className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900 p-4">
 <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
 {/* Header */}
 <div className="p-8 pb-6 bg-zinc-900 relative border-b border-zinc-800">
 <button
 onClick={onClose}
 className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-300 transition-colors"
 >
 <X size={20} />
 </button>

 <div className="flex items-center gap-3 mb-1">
 {isPermanentlyScrapped ? (
 <Lock size={18} className="text-zinc-400" />
 ) : isBulk ? (
 <Layers size={18} className="text-indigo-400" />
 ) : (
 <AlertTriangle size={18} className="text-amber-500" />
 )}
 <h2 className="text-xl font-bold text-zinc-50">
 {isPermanentlyScrapped
 ? "Decommissioned Asset"
 : isBulk
 ? "Bulk Condition Update"
 : "Manage Condition"}
 </h2>
 </div>

 <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
 {isBulk
 ? `${selectedIds.length} Assets Selected`
 : `${asset.model} • SN-${asset.serialNumber}`}
 </p>
 </div>

 {/* Action Options */}
 <div className="p-8 pt-6 space-y-3">
 {isPermanentlyScrapped ? (
 <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-center space-y-2">
 <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
 <Trash2 className="text-rose-400" size={24} />
 </div>
 <p className="text-sm font-bold text-zinc-200">
 Permanent Status
 </p>
 <p className="text-xs text-zinc-500 leading-relaxed">
 This asset has been scrapped and cannot be returned to the
 active pool. Please contact an administrator if this was a
 mistake.
 </p>
 </div>
 ) : (
 <>
 <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
 Apply New Status
 </h3>

 {options
 .filter((opt) => !opt.hideIf)
 .map((opt) => (
 <button
 key={opt.id}
 onClick={() => handleStatusUpdate(opt.id)}
 disabled={loading}
 className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-zinc-800 transition-all text-left group ${opt.color} disabled:opacity-50`}
 >
 <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm group-hover:shadow-none transition-all">
 {opt.icon}
 </div>
 <div className="flex flex-col">
 <span className="font-bold text-sm text-zinc-200">
 {opt.title}
 </span>
 <span className="text-xs text-zinc-400 leading-tight mt-0.5">
 {opt.description}
 </span>
 </div>
 </button>
 ))}
 </>
 )}

 {loading && (
 <div className="flex flex-col items-center justify-center py-4 gap-2">
 <Loader2 className="animate-spin text-indigo-400" />
 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
 Processing Updates...
 </span>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};

export default AssetConditionModal;
