import React, { useEffect, useState } from "react";
import {
  X, Clock, User, History, FileText,
  Laptop, Monitor, Smartphone, Tablet,
  Tv, Printer, Headphones, MousePointer,
  Keyboard, Armchair, Package, Zap, Battery, PenTool
} from "lucide-react";
import api from "../../services/api";

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
 className="absolute inset-0 bg-bg-primary/40"
 onClick={onClose}
 />

 <div className="relative w-full max-w-full sm:max-w-md bg-bg-secondary border-l border-border shadow-2xl h-full animate-in slide-in-from-right duration-300">
 <div className="flex flex-col h-full">
 {/* Header */}
  <div className="p-5 border-b border-border flex justify-between items-center bg-bg-secondary shrink-0">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-bg-tertiary border border-border rounded-2xl text-text-muted shadow-inner">
        <CategoryIcon category={data?.category} name={data?.model || data?.name} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-text-primary leading-tight">
          {data?.model || data?.name}
        </h3>
        <p className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] mt-0.5">
          {data?.serialNumber || "Bulk Consumable"}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-2 hover:bg-bg-tertiary rounded-full transition-all duration-200 shrink-0"
    >
      <X size={20} />
    </button>
  </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
 {/* 1. CURRENT OWNER SECTION */}
 <section>
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest">
 <User size={14} /> Currently ALLOCATED Recipient
 </h4>
 {data?.ALLOCATEDTo ? (
 <div className="p-4 rounded-xl border border-accent-primary/20 bg-accent-primary/10 flex items-center gap-4">
 <div className="h-10 w-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold shrink-0">
 {data.ALLOCATEDTo.name?.[0] || "U"}
 </div>
 <div>
 <div className="font-bold text-text-primary">
 {data.ALLOCATEDTo.name}
 </div>
 <div className="text-xs text-text-muted">
 {data.ALLOCATEDTo.email}
 </div>
 </div>
 </div>
 ) : (
 <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-muted text-sm italic">
 READY_TO_DEPLOY
 </div>
 )}
 </section>

 {/* 2. QUICK STATS */}
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 bg-bg-tertiary rounded-lg border border-border">
 <div className="text-[10px] font-bold text-text-muted uppercase">
 Asset Classification
 </div>
 <div className="text-sm font-semibold text-text-secondary mt-0.5">
 {data?.category}
 </div>
 </div>
 <div className="p-3 bg-bg-tertiary rounded-lg border border-border">
 <div className="text-[10px] font-bold text-text-muted uppercase">
 Status
 </div>
 <div
 className={`text-sm font-semibold mt-0.5 ${data?.status === "READY_TO_DEPLOY" ? "text-status-success" : "text-accent-primary"}`}
 >
 {data?.status === "READY_TO_DEPLOY" ? "Available" : data?.status === "ALLOCATED" ? "Allocated" : data?.status === "UNDER_MAINTENANCE" ? "Maintenance" : data?.status === "DECOMMISSIONED" ? "Retiring" : data?.status}
 </div>
 </div>
 </div>

 {/* 3. RECEIPT SECTION (Optional Addition) */}
 {data?.receiptUrl && (
 <section className="pt-4 border-t border-border">
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest">
 <FileText size={14} /> Documents
 </h4>
 <a
 href={data.receiptUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-bg-tertiary transition-all duration-200 text-xs font-medium text-text-secondary"
 >
 View Purchase Receipt
 <FileText size={14} className="text-text-muted" />
 </a>
 </section>
 )}

 {/* 4. ASSIGNMENT HISTORY SECTION */}
 <section className="pt-4 border-t border-border">
 <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted mb-4 tracking-widest">
 <History size={14} /> Assignment History
 </h4>
 <div className="space-y-4">
 {data?.history?.length > 0 ? (
 data.history.map((log) => (
 <div
 key={log._id}
 className="relative pl-6 border-l-2 border-border pb-4 last:pb-0"
 >
 <div
 className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-bg-secondary border-2
 ${log.action === "ALLOCATED" ? "border-accent-primary/60" : "border-status-success"}`}
 />
 <p className="text-xs font-bold text-text-secondary leading-none mb-1">
 {log.action}
 </p>
 <p className="text-[11px] text-text-muted">
 {log.description}
 </p>
 <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
 <Clock size={10} />{" "}
 {new Date(log.createdAt).toLocaleDateString()}
 </p>
 </div>
 ))
 ) : (
 <p className="text-xs text-text-muted italic">
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

const CategoryIcon = ({ category, name }) => {
  const cat = (category || "").toUpperCase();
  const itemName = (name || "").toUpperCase();
  const props = { size: 24 };

  if (cat.includes("LAPTOP") || itemName.includes("LAPTOP")) return <Laptop {...props} />;
  if (cat.includes("MONITOR") || itemName.includes("MONITOR") || cat.includes("SCREEN") || itemName.includes("SCREEN")) return <Monitor {...props} />;
  if (cat.includes("MOBILE") || cat.includes("PHONE") || itemName.includes("PHONE")) return <Smartphone {...props} />;
  if (cat.includes("TABLET") || itemName.includes("TABLET")) return <Tablet {...props} />;
  if (cat.includes("TV") || itemName.includes("TV")) return <Tv {...props} />;
  if (cat.includes("KEYBOARD") || itemName.includes("KEYBOARD")) return <Keyboard {...props} />;
  if (cat.includes("MOUSE") || itemName.includes("MOUSE")) return <MousePointer {...props} />;
  if (cat.includes("HEADSET") || cat.includes("HEADPHONE") || itemName.includes("HEADSET")) return <Headphones {...props} />;
  if (cat.includes("PRINTER") || itemName.includes("PRINTER")) return <Printer {...props} />;
  if (cat.includes("BATTERY") || itemName.includes("BATTERY")) return <Battery {...props} />;
  if (cat.includes("CABLE") || cat.includes("ADAPTER") || itemName.includes("CABLE")) return <Zap {...props} />;
  if (cat.includes("STATIONERY") || cat.includes("PEN") || itemName.includes("PEN")) return <PenTool {...props} />;
  if (cat.includes("CHAIR") || cat.includes("DESK") || cat.includes("FURNITURE")) return <Armchair {...props} />;

  return <Package {...props} />;
};

export default AssetDetailsSidebar;
