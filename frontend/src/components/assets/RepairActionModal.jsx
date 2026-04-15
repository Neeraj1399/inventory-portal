import React from "react";
import { CheckCircle, Trash2, X } from "lucide-react";

const RepairActionModal = ({ isOpen, asset, onClose, onAction }) => {
 if (!isOpen || !asset) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4 bg-bg-primary/80 backdrop-blur-sm">
 <div className="bg-bg-secondary border border-border rounded-3xl w-full max-w-xl overflow-hidden shadow-premium animate-in fade-in zoom-in duration-200">
 {/* Header */}
 <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-status-warning/10">
 <div>
 <h2 className="text-xl font-bold text-text-primary">Resolve Repair</h2>
 <p className="text-xs text-status-warning font-bold tracking-wider">
 {asset.model} • {asset.serialNumber}
 </p>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-bg-tertiary rounded-full transition-all duration-200"
 >
 <X size={20} className="text-text-muted" />
 </button>
 </div>

 {/* Options */}
 <div className="p-5 space-y-3">
 <p className="text-sm text-text-muted mb-1">
 What is the final outcome of this repair?
 </p>

 {/* Restore Option */}
 <button
 onClick={() => onAction(asset._id, "READY_TO_DEPLOY")}
 className="w-full flex items-center gap-4 p-4 rounded-2xl border border-status-success/20 bg-status-success/5 hover:border-status-success/50 hover:bg-status-success/10 transition-all duration-200 group text-left"
 >
 <div className="p-3 bg-bg-tertiary border border-border rounded-xl text-status-success shadow-sm group-hover:scale-110 transition-transform duration-200 shrink-0">
 <CheckCircle size={22} />
 </div>
 <div>
 <div className="font-bold text-text-primary">Fixed & Ready</div>
 <div className="text-xs text-text-muted">
 Return to available inventory
 </div>
 </div>
 </button>

 {/* Scrap Option */}
 <button
 onClick={() => onAction(asset._id, "DECOMMISSIONED")}
 className="w-full flex items-center gap-4 p-4 rounded-2xl border border-status-danger/20 bg-status-danger/5 hover:border-status-danger/50 hover:bg-status-danger/10 transition-all duration-200 group text-left"
 >
 <div className="p-3 bg-bg-tertiary border border-border rounded-xl text-status-danger shadow-sm group-hover:scale-110 transition-transform duration-200 shrink-0">
 <Trash2 size={22} />
 </div>
 <div>
 <div className="font-bold text-text-primary">Unfixable / Scrap</div>
 <div className="text-xs text-text-muted">
 Permanently remove from active stock
 </div>
 </div>
 </button>
 </div>
 </div>
 </div>
 );
};

export default RepairActionModal;
