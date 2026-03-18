import React, { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Check } from "lucide-react";
import api from "../../hooks/api";

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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
          <div>
            <h2 className="text-xl font-bold text-zinc-50">
              Allocate Hardware
            </h2>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
              Inventory Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAssign} className="p-6 space-y-6">
          {/* Target Asset Info */}
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm text-indigo-400">
              <Check size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-50">{asset.model}</p>
              <p className="text-[11px] text-zinc-500 font-mono uppercase">
                {asset.serialNumber}
              </p>
            </div>
          </div>

          {/* Recipient Selection - Standardized Select */}
          <div>
            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2 px-1 tracking-widest">
              Recipient Employee
            </label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-zinc-100 appearance-none"
            >
              <option value="" className="text-zinc-500">Select an active staff member...</option>
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/20 disabled:opacity-30 disabled:bg-zinc-800"
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
