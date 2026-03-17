import React, { useState, useEffect } from "react";
import { X, Wrench, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import api from "../../hooks/api";

const ConsumableConditionModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    actionType: "MAINTENANCE", // 'MAINTENANCE' or 'SCRAP'
    quantity: 1,
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setFormData({ actionType: "MAINTENANCE", quantity: 1, reason: "" });
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const available = (item.totalQuantity || 0) - (item.assignedQuantity || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.quantity > available) {
      alert("Cannot adjust more than the available stock.");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/consumables/${item._id}/condition`, formData);
      onRefresh();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update item condition.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                <Wrench size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-zinc-50 tracking-tight">
                  Condition
                </h2>
                <p className="text-zinc-500 font-medium text-sm">
                  {item.itemName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-xl transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Action Selector */}
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-zinc-800 rounded-2xl">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, actionType: "MAINTENANCE" })
                }
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                  formData.actionType === "MAINTENANCE"
                    ? "bg-zinc-900 border border-zinc-800 text-amber-400 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                <Wrench size={14} /> MAINTENANCE
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: "SCRAP" })}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                  formData.actionType === "SCRAP"
                    ? "bg-zinc-900 border border-zinc-800 text-rose-400 shadow-sm"
                    : "text-zinc-500"
                }`}
              >
                <Trash2 size={14} /> SCRAP ITEM
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                Quantity to Adjust (Max: {available})
              </label>
              <input
                type="number"
                min="1"
                max={available}
                required
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-zinc-100"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                Reason / Remarks
              </label>
              <textarea
                rows="3"
                placeholder="Describe the issue..."
                className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm text-zinc-200"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            {/* Warning Note */}
            {formData.actionType === "SCRAP" && (
              <div className="flex gap-3 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="text-rose-400 shrink-0" size={18} />
                <p className="text-[11px] font-bold text-rose-400 leading-tight">
                  Scrapping will permanently remove these {formData.quantity}{" "}
                  units from the total inventory count.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || available === 0}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "CONFIRM ADJUSTMENT"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConsumableConditionModal;
