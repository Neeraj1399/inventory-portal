import React from "react";
import api from "../../services/api";
import { X, Loader2, Send, AlertCircle, PackageCheck } from "lucide-react";
import { useConsumableModal } from "../../hooks/useConsumableModal";
import clsx from "clsx";

const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const {
    employeeId,
    setEmployeeId,
    quantity,
    setQuantity,
    loading,
    setLoading,
    employees,
  } = useConsumableModal(isOpen, item);

  if (!isOpen || !item) return null;

  const availableStock = item.totalQuantity - item.assignedQuantity;
  const isStockCritical = availableStock <= (item.minStockLevel || 5);

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!employeeId || quantity < 1 || quantity > availableStock) return;

    setLoading(true);
    try {
      await api.post(`/consumables/${item._id}/assign`, {
        employeeId,
        quantity: Number(quantity),
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Logistics error: Insufficient stock or server timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-bg-tertiary/20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Stock <span className="text-accent-primary">Allocation</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
              {item.itemName} — Outbound Distribution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all text-text-muted hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleIssue} className="p-8 space-y-8">
          {/* Stock Metrics */}
          <div
            className={clsx(
              "flex items-center gap-6 p-6 rounded-2xl border transition-all duration-500",
              availableStock > 0
                ? "bg-bg-elevated/50 border-border"
                : "bg-status-danger/10 border-status-danger/20"
            )}
          >
            <div
              className={clsx(
                "h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner border transition-all duration-500",
                availableStock > 0
                  ? "bg-bg-secondary text-accent-primary border-accent-primary/20 shadow-glow-sm"
                  : "bg-status-danger text-white border-none"
              )}
            >
              {availableStock}
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-base font-black text-text-primary tracking-tight">
                Available Inventory
              </span>
              <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
                Units currently registered in warehouse
              </span>
            </div>
            {isStockCritical && (
              <div className="text-status-warning animate-pulse">
                <AlertCircle size={20} />
              </div>
            )}
          </div>

          {/* Recipient Selection */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
              Target Personnel
            </label>
            <div className="relative">
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-14 bg-bg-elevated border border-border rounded-2xl px-6 text-sm text-text-primary focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all appearance-none cursor-pointer font-bold"
              >
                <option value="">Select recipient account...</option>
                {employees.map((emp) => {
                  const existing = item.assignments?.find(
                    (a) => (a.employeeId?._id || a.employeeId)?.toString() === emp._id.toString()
                  );
                  return (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} — {emp.department}{existing ? ` · ${existing.quantity} held` : ""}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none">
                <PackageCheck size={18} />
              </div>
            </div>
          </div>

          {/* Quantity Specification */}
          <div className="space-y-3">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled shadow-sm">
                Payload Volume
              </label>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-secondary">
                Warehouse Limit: {availableStock}
              </span>
            </div>
            <input
              type="number"
              min="1"
              max={availableStock}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={clsx(
                "w-full h-14 bg-bg-elevated border rounded-2xl px-6 text-sm font-black text-text-primary outline-none transition-all",
                quantity > availableStock
                  ? "border-status-danger ring-4 ring-status-danger/10 shadow-status-danger/20"
                  : "border-border focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10",
              )}
            />
          </div>

          {/* Execution Button */}
          <button
            type="submit"
            disabled={
              loading ||
              !employeeId ||
              quantity < 1 ||
              quantity > availableStock
            }
            className="w-full h-16 bg-gradient-to-tr from-accent-primary to-accent-secondary hover:brightness-110 disabled:grayscale disabled:opacity-50 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.25rem] flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent-primary/20 active:scale-95 border border-border"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Send size={18} /> Execute Distribution
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueConsumableModal;
