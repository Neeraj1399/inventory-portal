import React, { useState, useEffect, useMemo } from "react";
import { X, Undo2, Loader2, AlertTriangle, Trash2, Wrench } from "lucide-react";
import api from "../../hooks/api";
import clsx from "clsx";

const RETURN_STATUSES = [
  {
    id: "AVAILABLE",
    label: "Good",
    icon: Undo2,
    color: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    id: "REPAIR",
    label: "Repair",
    icon: Wrench,
    color: "bg-amber-500 text-white hover:bg-amber-600",
  },
  {
    id: "SCRAPPED",
    label: "Scrap",
    icon: Trash2,
    color: "bg-red-600 text-white hover:bg-red-700",
  },
];

const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("AVAILABLE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Critical: Reset state when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      setEmployeeId("");
      setQuantity(1);
      setStatus("AVAILABLE");
      setError(null);
    }
  }, [isOpen, item?._id]);

  // Derived state: find the specific assignment for the selected employee
  const currentAssignment = useMemo(() => {
    if (!employeeId || !item?.assignments) return null;
    return item.assignments.find(
      (a) => (a.employeeId?._id || a.employeeId) === employeeId,
    );
  }, [employeeId, item]);

  const maxReturnable = currentAssignment?.quantity || 0;
  const hasEmployees = item?.assignments?.some((a) => a.employeeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || quantity < 1 || quantity > maxReturnable) return;

    setLoading(true);
    setError(null);

    try {
      await api.post(`/consumables/${item._id}/return`, {
        employeeId,
        quantity: Number(quantity),
        returnStatus: status,
        isDamaged: status !== "AVAILABLE",
      });
      onRefresh();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const selectedStatusConfig = RETURN_STATUSES.find((s) => s.id === status);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Process Return</h2>
            <p className="text-xs uppercase font-bold text-blue-600 tracking-wider">
              {item.itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* 1. EMPLOYEE SELECT */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
              Issued To
            </label>
            {hasEmployees ? (
              <select
                required
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setQuantity(1); // Reset quantity to 1 when employee changes
                }}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer bg-white"
              >
                <option value="">Select an employee...</option>
                {item.assignments.map((a) => {
                  const emp = a.employeeId;
                  if (!emp) return null;
                  return (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({a.quantity} currently held)
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="py-4 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm italic">
                No active assignments found.
              </div>
            )}
          </div>

          {/* 2. CONDITION SELECTOR */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
              Return Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RETURN_STATUSES.map((s) => {
                const Icon = s.icon;
                const isSelected = status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStatus(s.id)}
                    className={clsx(
                      "rounded-xl p-3 flex flex-col items-center gap-1 text-xs font-bold transition-all border",
                      isSelected
                        ? `${s.color} border-transparent shadow-md scale-105`
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
                    )}
                  >
                    <Icon size={18} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. QUANTITY INPUT */}
          {employeeId && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-tight">
                  Quantity to Return
                </label>
                <span className="text-[10px] font-bold text-slate-500">
                  Max: {maxReturnable}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={maxReturnable}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Number(e.target.value)))
                }
                className={clsx(
                  "w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition",
                  quantity > maxReturnable
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-slate-200 focus:ring-2 focus:ring-blue-500",
                )}
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={
              loading ||
              !employeeId ||
              quantity < 1 ||
              quantity > maxReturnable ||
              !hasEmployees
            }
            className={clsx(
              "w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
              selectedStatusConfig?.color || "bg-slate-800 text-white",
            )}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {selectedStatusConfig?.icon && (
                  <selectedStatusConfig.icon size={20} />
                )}
                Process {selectedStatusConfig?.label} Return
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnConsumableModal;
