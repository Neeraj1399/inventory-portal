import React from "react";
import { CheckCircle, Trash2, X, AlertTriangle } from "lucide-react";

const RepairActionModal = ({ isOpen, asset, onClose, onAction }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Resolve Repair</h2>
            <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">
              {asset.model} • {asset.serialNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500 mb-2">
            What is the final outcome of this repair?
          </p>

          {/* Restore Option */}
          <button
            onClick={() => onAction(asset._id, "AVAILABLE")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
          >
            <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-800">Fixed & Ready</div>
              <div className="text-xs text-slate-500">
                Return to available inventory
              </div>
            </div>
          </button>

          {/* Scrap Option */}
          <button
            onClick={() => onAction(asset._id, "SCRAPPED")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-rose-100 bg-rose-50/30 hover:border-rose-500 hover:bg-rose-50 transition-all group text-left"
          >
            <div className="p-3 bg-white rounded-xl text-rose-600 shadow-sm group-hover:scale-110 transition-transform">
              <Trash2 size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-800">Unfixable / Scrap</div>
              <div className="text-xs text-slate-500">
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
