import React, { useState } from "react";
import { X, PlusCircle, Loader2, AlertCircle } from "lucide-react";
import api from "../../hooks/api";

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-50">Restock Units</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              Replenish Inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Info */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
              <PlusCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-100">{item.itemName}</p>
              <p className="text-xs text-zinc-500">Current Total: {item.totalQuantity} units</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Input */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-widest">
              Quantity to Add
            </label>
            <input
              type="number"
              min="1"
              required
              autoFocus
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all text-xl font-black text-center text-zinc-100"
            />
          </div>

          {/* Action */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-4 rounded-2xl bg-zinc-800 text-zinc-400 font-bold hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || quantity < 1}
              className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <PlusCircle size={20} /> Update Stock
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
