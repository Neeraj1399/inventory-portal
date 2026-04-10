import React, { useState, useEffect } from "react";
import { X, Wrench, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import api from "../../services/api";

const ConsumableConditionModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    actionType: "MAINTENANCE",
    quantity: 1,
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ actionType: "MAINTENANCE", quantity: 1, reason: "" });
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const available = (item.totalQuantity || 0) - (item.assignedQuantity || 0);
  const isMaintenance = formData.actionType === "MAINTENANCE";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative bg-bg-secondary border border-border w-full max-w-xl rounded-[2rem] shadow-premium overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-status-warning/10 text-status-warning rounded-2xl border border-status-warning/20">
                <Wrench size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-primary tracking-tight">
                  Condition
                </h2>
                <p className="text-text-muted font-medium text-sm">
                  {item.itemName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-tertiary rounded-xl transition-all duration-200"
            >
              <X size={18} className="text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-bg-tertiary rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: "MAINTENANCE" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                  isMaintenance
                    ? "bg-bg-secondary border border-border text-status-warning shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Wrench size={13} /> MAINTENANCE
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, actionType: "SCRAP" })}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
                  !isMaintenance
                    ? "bg-bg-secondary border border-border text-status-danger shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <Trash2 size={13} /> SCRAP ITEM
              </button>
            </div>

            {/* Quantity Input */}
            <div>
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Quantity to Adjust (Max: {available})
              </label>
              <input
                type="number"
                min="1"
                max={available}
                required
                className="input-base bg-bg-tertiary font-bold"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) })
                }
              />
            </div>

            {/* Reason Input */}
            <div>
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">
                Reason / Remarks
              </label>
              <textarea
                rows="2"
                placeholder="Describe the issue..."
                className="input-base bg-bg-tertiary font-medium text-sm resize-none"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>

            {/* Warning Note */}
            {!isMaintenance && (
              <div className="flex gap-3 p-3.5 bg-status-danger/10 rounded-2xl border border-status-danger/20">
                <AlertTriangle className="text-status-danger shrink-0" size={16} />
                <p className="text-xs font-bold text-status-danger leading-tight">
                  Scrapping will permanently remove these {formData.quantity} units from the total inventory count.
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || available === 0}
              className="w-full bg-accent-gradient hover:brightness-110 text-white py-3 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-glow-sm disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
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
