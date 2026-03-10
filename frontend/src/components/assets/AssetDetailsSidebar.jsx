import React, { useEffect, useState } from "react";
import { X, Clock, User, History, FileText } from "lucide-react";
import api from "../../hooks/api";

const AssetDetailsSidebar = ({
  isOpen,
  entityId,
  type = "assets",
  onClose,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && entityId) fetchDetails();
  }, [isOpen, entityId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${type}/${entityId}?t=${Date.now()}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Error fetching details", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white shadow-2xl h-full animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {data?.model || data?.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {data?.serialNumber || "Bulk Consumable"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* 1. CURRENT OWNER SECTION */}
            <section>
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                <User size={14} /> Currently Assigned To
              </h4>
              {data?.assignedTo ? (
                <div className="p-4 rounded-xl border-2 border-blue-50 bg-blue-50/30 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {data.assignedTo.name?.[0] || "U"}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {data.assignedTo.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {data.assignedTo.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-sm italic">
                  Currently in Stock
                </div>
              )}
            </section>

            {/* 2. QUICK STATS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Category
                </div>
                <div className="text-sm font-semibold text-slate-700">
                  {data?.category}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Status
                </div>
                <div
                  className={`text-sm font-semibold ${data?.status === "AVAILABLE" ? "text-emerald-600" : "text-blue-600"}`}
                >
                  {data?.status}
                </div>
              </div>
            </div>

            {/* 3. RECEIPT SECTION (Optional Addition) */}
            {data?.receiptUrl && (
              <section className="pt-4 border-t border-slate-100">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                  <FileText size={14} /> Documents
                </h4>
                <a
                  href={data.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                >
                  View Purchase Receipt
                  <FileText size={14} className="text-slate-400" />
                </a>
              </section>
            )}

            {/* 4. ASSIGNMENT HISTORY SECTION */}
            <section className="pt-4 border-t border-slate-100">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">
                <History size={14} /> Assignment History
              </h4>
              <div className="space-y-4">
                {data?.history?.length > 0 ? (
                  data.history.map((log) => (
                    <div
                      key={log._id}
                      className="relative pl-6 border-l-2 border-slate-100 pb-4 last:pb-0"
                    >
                      <div
                        className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 
                        ${log.action === "ASSIGNED" ? "border-blue-500" : "border-emerald-500"}`}
                      />
                      <p className="text-xs font-bold text-slate-700 leading-none mb-1">
                        {log.action}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {log.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No history recorded yet.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsSidebar;
