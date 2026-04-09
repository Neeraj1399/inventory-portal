import React, { useState, useEffect } from "react";
import { X, Loader2, Trash2, Wrench, ShieldCheck } from "lucide-react";
import api from "../../services/api";

const ReturnAssetModal = ({ isOpen, asset, onClose, onRefresh }) => {
  const [returnStatus, setReturnStatus] = useState("READY_TO_DEPLOY");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setReturnStatus("READY_TO_DEPLOY");
  }, [isOpen]);

  const handleReturn = async (e) => {
    e.preventDefault();
    if (loading || !asset?._id) return;

    setLoading(true);
    try {
      await api.patch(`/assets/${asset._id}/return`, {
        returnStatus: returnStatus,
      });

      if (onRefresh) {
        await onRefresh();
      }
      onClose();
    } catch (err) {
      if (err.response?.status === 400) {
        if (onRefresh) await onRefresh();
        onClose();
      } else {
        console.error("Return failed:", err.response?.data);
        alert(err.response?.data?.message || "Error returning asset");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center transition-colors duration-500 bg-bg-tertiary/20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Return <span className="text-accent-primary">Hardware</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
              {asset.model} • {asset.serialNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-text-muted hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleReturn} className="p-8 space-y-8">
          <div className="space-y-6">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
              Item Condition Assessment
            </label>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  id: "READY_TO_DEPLOY",
                  label: "Ready for Reissue",
                  sub: "Optimal operational state",
                  icon: ShieldCheck,
                  color: "text-status-success",
                  border: "peer-checked:border-status-success/50 peer-checked:bg-status-success/5",
                },
                {
                  id: "UNDER_MAINTENANCE",
                  label: "Needs Maintenance",
                  sub: "Requires technical evaluation",
                  icon: Wrench,
                  color: "text-status-warning",
                  border: "peer-checked:border-status-warning/50 peer-checked:bg-status-warning/5",
                },
                {
                  id: "DECOMMISSIONED",
                  label: "Scrap / Broken",
                  sub: "Non-functional / Obsolete",
                  icon: Trash2,
                  color: "text-status-danger",
                  border: "peer-checked:border-status-danger/50 peer-checked:bg-status-danger/5",
                },
              ].map((stat) => (
                <label
                  key={stat.id}
                  className={`relative cursor-pointer group ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <input
                    type="radio"
                    name="returnStatus"
                    value={stat.id}
                    className="peer sr-only"
                    checked={returnStatus === stat.id}
                    disabled={loading}
                    onChange={(e) => setReturnStatus(e.target.value)}
                  />
                  <div
                    className={`flex items-center gap-4 p-5 bg-bg-elevated/50 border-2 border-border rounded-2xl transition-all hover:border-border ${stat.border}`}
                  >
                    <div className={`p-3 rounded-xl bg-bg-secondary border border-border shadow-inner transition-transform group-hover:scale-110 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-base text-text-primary tracking-tight">
                        {stat.label}
                      </div>
                      <div className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60 mt-1">{stat.sub}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-16 font-black uppercase tracking-widest text-[11px] rounded-[1.25rem] flex items-center justify-center gap-3 transition-all text-white shadow-xl hover:shadow-2xl active:scale-95 disabled:grayscale disabled:opacity-50
            ${
              returnStatus === "READY_TO_DEPLOY"
                ? "bg-gradient-to-tr from-status-success to-emerald-600 shadow-status-success/20"
                : returnStatus === "UNDER_MAINTENANCE"
                ? "bg-gradient-to-tr from-status-warning to-amber-600 shadow-status-warning/20"
                : "bg-gradient-to-tr from-status-danger to-rose-600 shadow-status-danger/20"
            }
            `}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              "Complete Logistics Chain"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnAssetModal;
