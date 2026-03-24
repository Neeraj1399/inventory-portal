import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Send, CheckCircle2 } from "lucide-react";

/**
 * ReasonModal: Used for inputting a reason (Admin) or viewing a reason (Staff).
 */
const ReasonModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Rejection Reason",
  description = "Please provide a reason for rejecting this request.",
  initialValue = "",
  mode = "INPUT", // 'INPUT' or 'VIEW'
  isLoading = false
}) => {
  const [reason, setReason] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setReason(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={!isLoading ? onClose : undefined}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!isLoading && (
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              )}

              <div className="p-10 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${mode === "INPUT" ? "bg-rose-500/10 text-rose-500" : "bg-indigo-500/10 text-indigo-500"}`}>
                    {mode === "INPUT" ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-50 tracking-tight">
                      {title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-medium">
                      {description}
                    </p>
                  </div>
                </div>

                {mode === "INPUT" ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                      <textarea
                        autoFocus
                        required
                        placeholder="Type the reason here..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full h-32 px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none font-medium leading-relaxed"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading || !reason.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Confirm Rejection
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-2xl italic text-zinc-300 leading-relaxed font-medium">
                      "{reason || "No specific reason provided."}"
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-2xl active:scale-95 transition-all"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReasonModal;
