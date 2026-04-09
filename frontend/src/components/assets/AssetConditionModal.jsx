import React, { useState } from "react";
import {
  X,
  Wrench,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Layers,
  Lock,
} from "lucide-react";
import api from "../../services/api";

const AssetConditionModal = ({
  isOpen,
  asset,
  selectedIds = [],
  onClose,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);

  // Determine if we are in bulk mode or single asset mode
  const isBulk = selectedIds.length > 0 && !asset;

  // LOGIC FIX: Check if the current single asset is already scrapped
  const isPermanentlyScrapped = !isBulk && asset?.status === "DECOMMISSIONED";

  if (!isOpen || (!asset && !isBulk)) return null;

  const handleStatusUpdate = async (newStatus) => {
    if (isPermanentlyScrapped) return;

    setLoading(true);
    try {
      if (isBulk) {
        await Promise.all(
          selectedIds.map((id) =>
            api.patch(`/assets/${id}`, { status: newStatus }),
          ),
        );
      } else {
        await api.patch(`/assets/${asset._id}`, { status: newStatus });
      }

      onRefresh();
      onClose();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        `Failed to update ${isBulk ? "assets" : "asset"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const options = [
    {
      id: "READY_TO_DEPLOY",
      title: "Make Available",
      description: "Functional and available for assignment",
      icon: <CheckCircle2 className="text-status-success" size={20} />,
      border: "hover:border-status-success/50 hover:bg-status-success/5",
      hideIf: !isBulk && asset.status === "READY_TO_DEPLOY",
    },
    {
      id: "UNDER_MAINTENANCE",
      title: "Move to Maintenance",
      description: "Damaged and requires technical attention",
      icon: <Wrench className="text-status-warning" size={20} />,
      border: "hover:border-status-warning/50 hover:bg-status-warning/5",
      hideIf: !isBulk && asset.status === "UNDER_MAINTENANCE",
    },
    {
      id: "DECOMMISSIONED",
      title: "Retire Asset",
      description: "Beyond repair; permanent pool removal",
      icon: <Trash2 className="text-status-danger" size={20} />,
      border: "hover:border-status-danger/50 hover:bg-status-danger/5",
      hideIf: !isBulk && asset.status === "DECOMMISSIONED",
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 pb-8 bg-bg-tertiary/20 relative border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-bg-secondary border border-border rounded-2xl shadow-inner">
              {isPermanentlyScrapped ? (
                <Lock size={22} className="text-text-disabled" />
              ) : isBulk ? (
                <Layers size={22} className="text-accent-secondary" />
              ) : (
                <AlertTriangle size={22} className="text-status-warning" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {isPermanentlyScrapped
                  ? "Status Locked"
                  : isBulk
                  ? "Bulk Migration"
                  : "State Engineering"}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
                {isBulk
                  ? `${selectedIds.length} Fleet Units Selected`
                  : `${asset.model} • SN-${asset.serialNumber}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="p-8 space-y-4">
          {isPermanentlyScrapped ? (
            <div className="bg-bg-elevated/50 p-8 rounded-2xl text-center space-y-4 border border-border">
              <div className="w-16 h-16 bg-bg-secondary border border-border rounded-[1.25rem] flex items-center justify-center mx-auto shadow-inner">
                <Trash2 className="text-status-danger" size={32} />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-text-primary tracking-tight">
                  Permanent Decommission
                </p>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  This hardware has been fully scrapped. State modifications are disabled for finalized assets.
                </p>
              </div>
            </div>
          ) : (
            <>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1">
                Transition Protocol
              </label>

              <div className="space-y-3">
                {options
                  .filter((opt) => !opt.hideIf)
                  .map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleStatusUpdate(opt.id)}
                      disabled={loading}
                      className={`w-full flex items-center gap-5 p-5 bg-bg-elevated/50 rounded-2xl border-2 border-border transition-all text-left group ${opt.border} disabled:opacity-50 active:scale-95`}
                    >
                      <div className="p-3 bg-bg-secondary border border-border rounded-xl shadow-inner transition-transform group-hover:scale-110">
                        {opt.icon}
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-black text-base text-text-primary tracking-tight">
                          {opt.title}
                        </span>
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
                          {opt.description}
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-6 gap-3 animate-in fade-in">
              <Loader2 className="animate-spin text-accent-primary" size={28} />
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em]">
                Synchronizing State...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetConditionModal;
