import React, { useEffect, useState } from "react";
import { X, Clock, User, History, FileText } from "lucide-react";
import api from "../../hooks/api";

const AssetDetailsSidebar = ({
 isOpen,
 entityId,
 type = "assets",
 onClose,
}) => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (isOpen && entityId) fetchDetails();
 }, [isOpen, entityId]);

 const fetchDetails = async () => {
 setLoading(true);
 try {
 const res = await api.get(`/${type}/${entityId}?t=${Date.now()}`);
 setData(res.data.data);
 } catch (err) {
 console.error("Error fetching details", err);
 } finally {
 setLoading(false);
 }
 };

 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-[100] flex justify-end">
 <div
 className="absolute inset-0 bg-zinc-950/40 "
 onClick={onClose}
 />

 <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 shadow-2xl h-full animate-in slide-in-from-right duration-300">
 <div className="flex flex-col h-full">
 {/* Header */}
 <div className="p-6 border-b flex justify-between items-center bg-zinc-900">
 <div>
 <h3 className="text-lg font-bold text-zinc-50">
 {data?.model || data?.name}
 </h3>
 <p className="text-xs text-zinc-500 font-mono">
 {data?.serialNumber || "Bulk Consumable"}
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-6 space-y-8">
 {/* 1. CURRENT OWNER SECTION */}
 <section>
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">
 <User size={14} /> Currently Allocated Recipient
 </h4>
 {data?.allocatedTo ? (
 <div className="p-4 rounded-xl border-2 border-indigo-500/20 bg-indigo-500/10 flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
 {data.allocatedTo.name?.[0] || "U"}
 </div>
 <div>
 <div className="font-bold text-zinc-50">
 {data.allocatedTo.name}
 </div>
 <div className="text-xs text-zinc-500">
 {data.allocatedTo.email}
 </div>
 </div>
 </div>
 ) : (
 <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-400 text-sm italic">
 Currently in Stock
 </div>
 )}
 </section>

 {/* 2. QUICK STATS */}
 <div className="grid grid-cols-2 gap-4">
 <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
 <div className="text-[10px] font-bold text-zinc-400 uppercase">
 Asset Classification
 </div>
 <div className="text-sm font-semibold text-zinc-200">
 {data?.category}
 </div>
 </div>
 <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
 <div className="text-[10px] font-bold text-zinc-400 uppercase">
 Status
 </div>
 <div
 className={`text-sm font-semibold ${data?.status === "READY_TO_DEPLOY" ? "text-emerald-400" : "text-indigo-400"}`}
 >
 {data?.status}
 </div>
 </div>
 </div>

 {/* 3. RECEIPT SECTION (Optional Addition) */}
 {data?.receiptUrl && (
 <section className="pt-4 border-t border-zinc-800">
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">
 <FileText size={14} /> Documents
 </h4>
 <a
 href={data.receiptUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-colors text-xs font-medium text-zinc-300"
 >
 View Purchase Receipt
 <FileText size={14} className="text-zinc-400" />
 </a>
 </section>
 )}

 {/* 4. ASSIGNMENT HISTORY SECTION */}
 <section className="pt-4 border-t border-zinc-800">
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">
 <History size={14} /> Assignment History
 </h4>
 <div className="space-y-4">
 {data?.history?.length > 0 ? (
 data.history.map((log) => (
 <div
 key={log._id}
 className="relative pl-6 border-l-2 border-zinc-800 pb-4 last:pb-0"
 >
 <div
 className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-zinc-900 border border-zinc-800 border-2 
 ${log.action === "ALLOCATED" ? "border-indigo-500/200" : "border-emerald-500"}`}
 />
 <p className="text-xs font-bold text-zinc-200 leading-none mb-1">
 {log.action}
 </p>
 <p className="text-[11px] text-zinc-500">
 {log.description}
 </p>
 <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
 <Clock size={10} />{" "}
 {new Date(log.createdAt).toLocaleDateString()}
 </p>
 </div>
 ))
 ) : (
 <p className="text-xs text-zinc-400 italic">
 No history recorded yet.
 </p>
 )}
 </div>
 </section>
 </div>
 </div>
 </div>
 </div>
 );
};

export default AssetDetailsSidebar;
