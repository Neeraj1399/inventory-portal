import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Check } from "lucide-react";
import api from "../../services/api";

const AssignAssetModal = ({ isOpen, onClose, asset, onRefresh }) => {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setEmployeeId("");
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
            <p className="text-[10px] font-black text-status-info uppercase tracking-widest">
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
              <p className="text-[11px] text-text-muted font-mono uppercase">
                {asset.serialNumber}
              </p>
            </div>
          </div>

          {/* Recipient Selection */}
          <div>
            <label className="block text-[10px] font-black uppercase text-text-muted mb-2 px-1 tracking-widest">
              Recipient Employee
            </label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="select-base px-5 py-3 rounded-2xl font-bold"
            >
              <option value="" className="text-text-muted">Select an active staff member...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
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
                <UserPlus size={18} /> CONFIRM ALLOCATION
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignAssetModal;
