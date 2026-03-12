import React from "react";
import api from "../../hooks/api";
import { X, Loader2, Send, AlertCircle } from "lucide-react";
import { useConsumableModal } from "../../hooks/useConsumableModal";

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
      alert(err.response?.data?.message || "Insufficient stock or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Issue Consumable
            </h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Inventory Distribution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleIssue} className="p-6 space-y-6">
          {/* Stock */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              availableStock > 0
                ? "bg-blue-50/50 border-blue-100"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
                availableStock > 0
                  ? "bg-blue-600 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {availableStock}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                {item.itemName}
              </span>
              <span className="text-xs text-slate-500">
                Units currently available in stock
              </span>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
              Recipient Employee
            </label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm cursor-pointer"
            >
              <option value="">Select an active staff member...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={availableStock}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            {quantity > availableStock && (
              <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> Exceeds available stock
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !employeeId ||
              quantity < 1 ||
              quantity > availableStock
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} /> Confirm Issuance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueConsumableModal;
