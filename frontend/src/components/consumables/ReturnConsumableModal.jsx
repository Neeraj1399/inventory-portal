import React, { useState, useEffect, useMemo } from "react";
import { X, Undo2, Loader2, AlertTriangle, Trash2, Wrench, ChevronDown } from "lucide-react";
import api from "../../services/api";
import clsx from "clsx";

const RETURN_STATUSES = [
  {
    id: "READY_TO_DEPLOY",
    label: "Optimal",
    sub: "Ready for Reissue",
    icon: Undo2,
    color: "text-status-success",
    border: "peer-checked:border-status-success/50 peer-checked:bg-status-success/5",
  },
  {
    id: "UNDER_MAINTENANCE",
    label: "Damaged",
    sub: "Requires Technical Attention",
    icon: Wrench,
    color: "text-status-warning",
    border: "peer-checked:border-status-warning/50 peer-checked:bg-status-warning/5",
  },
  {
    id: "DECOMMISSIONED",
    label: "Scrap",
    sub: "Beyond Operational Recovery",
    icon: Trash2,
    color: "text-status-danger",
    border: "peer-checked:border-status-danger/50 peer-checked:bg-status-danger/5",
  },
];

const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("READY_TO_DEPLOY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEmpOpen, setIsEmpOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmployeeId("");
      setQuantity(1);
      setStatus("READY_TO_DEPLOY");
      setError(null);
      setIsEmpOpen(false);
    }
  }, [isOpen, item?._id]);

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
        isDamaged: status !== "READY_TO_DEPLOY",
      });
      onRefresh();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Logistics sequence failed. Please verify credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const currentStatusConfig = RETURN_STATUSES.find((s) => s.id === status);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-bg-tertiary/20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Consumable <span className="text-accent-primary">Return</span></h2>
            <p className="text-[10px] font-black tracking-[0.2em] text-accent-secondary mt-1">
              {item.itemName} — Reverse Logistics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all text-text-muted hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-status-danger/10 border border-status-danger/20 text-status-danger text-[10px] font-black tracking-widest flex items-center gap-3">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          {/* 1. EMPLOYEE SELECT */}
          <div className="space-y-3">
            <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
              Origin Account
            </label>
            {hasEmployees ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsEmpOpen(o => !o)}
                  className={`w-full flex items-center justify-between px-5 h-14 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isEmpOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}
                >
                  <span className="text-sm font-bold truncate">
                    {employeeId ? (() => {
                      const a = item.assignments.find(a => (a.employeeId?._id || a.employeeId) === employeeId);
                      const emp = a?.employeeId;
                      return emp ? `${emp.name} — Holding ${a.quantity} Units` : employeeId;
                    })() : <span className="text-text-muted">Select active personnel...</span>}
                  </span>
                  <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isEmpOpen ? "rotate-180" : ""}`} />
                </button>
                {isEmpOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsEmpOpen(false)} />
                    <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="overflow-y-auto max-h-[200px] custom-scrollbar">
                        {item.assignments.map((a) => {
                          const emp = a.employeeId;
                          if (!emp) return null;
                          const val = emp._id || emp;
                          return (
                            <button type="button" key={val} onClick={() => { setEmployeeId(val); setQuantity(1); setIsEmpOpen(false); }}
                              className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${employeeId === val ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                              {emp.name} — Holding {a.quantity} Units
                              {employeeId === val && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl text-text-disabled text-xs font-black tracking-widest opacity-40">
                No active assignments detected
              </div>
            )}
          </div>

          {/* 2. CONDITION SELECTOR */}
          <div className="space-y-3">
            <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
              Condition Assessment
            </label>
            <div className="grid grid-cols-1 gap-3">
              {RETURN_STATUSES.map((stat) => (
                <label
                  key={stat.id}
                  className={`relative cursor-pointer group ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="returnStatus"
                    value={stat.id}
                    className="peer sr-only"
                    checked={status === stat.id}
                    disabled={loading}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <div
                    className={`flex items-center gap-4 p-4 bg-bg-elevated/50 border-2 border-border rounded-2xl transition-all hover:border-border ${stat.border}`}
                  >
                    <div className={`p-3 rounded-xl bg-bg-secondary border border-border shadow-inner transition-transform group-hover:scale-110 ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-sm text-text-primary tracking-tight">
                        {stat.label} State
                      </div>
                      <div className="text-[9px] text-text-muted font-black tracking-widest opacity-60 mt-0.5">{stat.sub}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. QUANTITY INPUT */}
          {employeeId && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black tracking-[0.2em] text-text-disabled shadow-sm">
                  Return Volume
                </label>
                <span className="text-[10px] font-black tracking-[0.2em] text-accent-secondary">
                  Max Limit: {maxReturnable}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={maxReturnable}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className={clsx(
                  "w-full h-14 bg-bg-elevated border rounded-2xl px-6 text-sm font-black text-text-primary outline-none transition-all",
                  quantity > maxReturnable
                    ? "border-status-danger ring-4 ring-status-danger/10"
                    : "border-border focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10",
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
              "w-full h-16 rounded-[1.25rem] flex items-center justify-center gap-3 font-black text-[11px] tracking-[0.2em] transition-all active:scale-95 disabled:grayscale disabled:opacity-50 text-white shadow-xl",
              status === "READY_TO_DEPLOY" ? "bg-gradient-to-tr from-status-success to-emerald-600 shadow-status-success/20" : 
              status === "UNDER_MAINTENANCE" ? "bg-gradient-to-tr from-status-warning to-amber-600 shadow-status-warning/20" :
              "bg-gradient-to-tr from-status-danger to-rose-600 shadow-status-danger/20"
            )}
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                {currentStatusConfig?.icon && <currentStatusConfig.icon size={20} />}
                Confirm {currentStatusConfig?.label} Protocol
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnConsumableModal;
