import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import api from "../../hooks/api";

const ConsumableMaintenanceResolveModal = ({
  isOpen,
  item,
  onClose,
  onRefresh,
}) => {
  const [formData, setFormData] = useState({
    action: "RETURN", // 'RETURN' (to stock) or 'SCRAP' (permanent delete)
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setFormData({
        action: "RETURN",
        quantity: item.maintenanceQuantity || 1,
      });
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const inMaintenance = item.maintenanceQuantity || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.quantity > inMaintenance) {
      alert("Quantity exceeds items currently in maintenance.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/consumables/${item._id}/resolve-maintenance`, formData);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to resolve maintenance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <RefreshCcw size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Resolve Repair
                </h2>
                <p className="text-slate-500 font-medium text-sm">
                  {inMaintenance} units of {item.itemName} currently sidelined
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Resolution Toggle */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, action: "RETURN" })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                  formData.action === "RETURN"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <CheckCircle size={14} /> RETURN TO STOCK
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, action: "SCRAP" })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                  formData.action === "SCRAP"
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <Trash2 size={14} /> SCRAP PERMANENTLY
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                Quantity to Resolve
              </label>
              <input
                type="number"
                min="1"
                max={inMaintenance}
                required
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Warning Message */}
            <div
              className={`flex gap-3 p-4 rounded-2xl border ${
                formData.action === "RETURN"
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-rose-50 border-rose-100"
              }`}
            >
              <AlertTriangle
                className={
                  formData.action === "RETURN"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }
                size={18}
              />
              <p
                className={`text-[11px] font-bold leading-tight ${
                  formData.action === "RETURN"
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {formData.action === "RETURN"
                  ? `These ${formData.quantity} units will be moved back to available warehouse stock.`
                  : `These ${formData.quantity} units will be PERMANENTLY deleted from total inventory.`}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || inMaintenance === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "CONFIRM RESOLUTION"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsumableMaintenanceResolveModal;
