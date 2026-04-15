import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Check, ChevronDown } from "lucide-react";
import api from "../../services/api";

const AssignAssetModal = ({ isOpen, onClose, asset, onRefresh }) => {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmpOpen, setIsEmpOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setEmployeeId("");
      setIsEmpOpen(false);
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`admin/employees?t=${Date.now()}`);
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    setLoading(true);
    try {
      await api.patch(`/assets/${asset._id}/assign`, {
        employeeId,
      });
      onRefresh();
      onClose();
    } catch (err) {
      if (err.response?.status === 400) {
        await onRefresh();
        onClose();
      } else {
        alert(
          "Assignment failed: " +
            (err.response?.data?.message || "Server error"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-16 px-4 pb-4 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-secondary border border-border w-full max-w-xl rounded-3xl shadow-premium overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Allocate Asset
            </h2>
            <p className="text-[10px] font-black text-status-info tracking-widest">
              Inventory Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-tertiary rounded-full text-text-muted transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-5 space-y-5">
          {/* Target Asset Info */}
          <div className="p-4 bg-accent-primary/10 rounded-2xl border border-accent-primary/20 flex items-center gap-4">
            <div className="p-3 bg-bg-tertiary border border-border rounded-xl shadow-sm text-accent-primary shrink-0">
              <Check size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{asset.model}</p>
              <p className="text-[11px] text-text-muted font-mono">
                {asset.serialNumber}
              </p>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-[10px] font-black text-text-muted mb-2 px-1 tracking-widest">
              Recipient Employee
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsEmpOpen(o => !o)}
                className={`w-full flex items-center justify-between px-5 h-12 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isEmpOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}
              >
                <span className="text-sm font-bold truncate">
                  {employeeId ? (employees.find(e => e._id === employeeId)?.name + " — " + employees.find(e => e._id === employeeId)?.department) : <span className="text-text-muted">Select an active staff member...</span>}
                </span>
                <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isEmpOpen ? "rotate-180" : ""}`} />
              </button>
              {isEmpOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsEmpOpen(false)} />
                  <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="overflow-y-auto max-h-[200px] custom-scrollbar">
                      {employees.map((emp) => (
                        <button type="button" key={emp._id} onClick={() => { setEmployeeId(emp._id); setIsEmpOpen(false); }}
                          className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${employeeId === emp._id ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                          {emp.name} — {emp.department}
                          {employeeId === emp._id && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !employeeId}
            className="w-full bg-accent-primary hover:brightness-110 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-glow-sm disabled:opacity-30 disabled:bg-bg-tertiary disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <UserPlus size={18} /> Confirm Allocation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignAssetModal;
