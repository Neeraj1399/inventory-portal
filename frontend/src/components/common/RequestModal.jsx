import React, { useState } from "react";
import { X, Send, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import api from "../../hooks/api";

const RequestModal = ({ isOpen, onClose, item = null, type = "ALLOCATION" }) => {
  const [formData, setFormData] = useState({
    title: item ? `Issue report for ${item.model || item.itemName}` : "",
    type: type,
    priority: "MEDIUM",
    description: "",
    itemCategory: item ? (item.serialNumber ? "Asset" : "Consumable") : null,
    itemId: item ? item._id : null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/requests", formData);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({ ...formData, description: "" });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-50 tracking-tight">
              {success ? "Success!" : "New Service Ticket"}
            </h2>
            <p className="text-zinc-500 text-xs mt-0.5">
              {formData.type === "INCIDENT" ? "Report a spill or damage" : "Request inventory action"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="p-12 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-xl font-bold text-emerald-400">Request Sent</h3>
            <p className="text-zinc-400 text-sm">Administration has been notified. We will update you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Request Type</label>
              <select
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-all"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="ALLOCATION">Request New Allocation</option>
                <option value="REPLACEMENT">Request Replacement (Faulty Item)</option>
                <option value="SERVICE">Maintenance / Service</option>
                <option value="INCIDENT">Report Incident (Spill/Drop)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Title</label>
              <input
                type="text"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-all"
                placeholder="Brief summary of your request"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Priority</label>
                <select
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-all pointer"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Related Item</label>
                <div className="w-full bg-zinc-800/50 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-500 italic">
                  {item ? (item.model || item.itemName) : "None (Global Request)"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-1">Description</label>
              <textarea
                required
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 outline-none focus:border-indigo-500 transition-all resize-none"
                placeholder="Provide details (e.g., 'Coffee spilled on left side of laptop' or 'Need a noise-canceling headset')"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} /> Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestModal;
