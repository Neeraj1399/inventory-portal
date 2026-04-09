import React, { useState } from "react";
import { X, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import api from "../../services/api";

const RestockConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (quantity < 1) return;

    setLoading(true);
    setError("");
    try {
      await api.patch(`/consumables/${item._id}/restock`, {
        quantity: Number(quantity),
      });
      onRefresh();
      onClose();
      setQuantity(1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restock items");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4 pb-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border w-full max-w-sm rounded-3xl shadow-premium overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Restock Units</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              Replenish Inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full transition-all duration-200 text-text-muted"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Current Info */}
          <div className="p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary shrink-0">
              <PlusCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{item.itemName}</p>
              <p className="text-xs text-text-muted">Current Total: {item.totalQuantity} units</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-status-danger/10 border border-status-danger/20 rounded-xl flex items-center gap-3 text-status-danger text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Input */}
          <div>
            <label className="block text-[10px] font-black uppercase text-text-muted ml-1 mb-1.5 tracking-widest">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              required
              autoFocus
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-base bg-bg-tertiary text-xl font-black text-center"
            />
          </div>

          {/* Action */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-bg-tertiary text-text-muted font-bold hover:bg-bg-tertiary/80 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quantity < 1}
              className="flex-[2] bg-accent-gradient hover:brightness-110 text-white font-bold py-2.5 rounded-2xl shadow-glow-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <PlusCircle size={18} /> Update Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockConsumableModal;
