import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Info, Loader2, X, CheckCircle } from "lucide-react";

/**
 * A reusable confirmation modal that matches the app's premium aesthetic.
 */
const ConfirmModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info'
  isLoading = false,
  success = false,
  successTitle = "Action Completed",
  successMessage = "The operation was successful."
}) => {
  
  const getIcon = () => {
    if (success) return <CheckCircle size={40} className="text-emerald-500" />;
    switch (type) {
      case "danger": return <Trash2 size={32} />;
      case "warning": return <AlertTriangle size={32} />;
      case "info": return <Info size={32} />;
      default: return <Info size={32} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "danger": return "from-red-500/20 to-rose-500/20 text-rose-500 bg-rose-600 hover:bg-rose-500 shadow-rose-600/40";
      case "warning": return "from-amber-500/20 to-orange-500/20 text-amber-500 bg-amber-600 hover:bg-amber-500 shadow-amber-600/40";
      case "info": return "from-indigo-500/20 to-blue-500/20 text-indigo-500 bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/40";
      default: return "from-zinc-500/20 to-zinc-500/20 text-zinc-500 bg-zinc-600 hover:bg-zinc-500 shadow-zinc-600/40";
    }
  };

  const colors = getColors();
  const [gradient, textColor, btnColor, shadowColor] = colors.split(" ");

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
            onClick={!isLoading ? onCancel : undefined}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              {!isLoading && !success && (
                <button 
                  onClick={onCancel}
                  className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              )}

              <div className="p-10 text-center space-y-6">
                {/* Icon Wrapper */}
                <div className="relative mx-auto w-24 h-24">
                  <motion.div
                    animate={isLoading ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className={`absolute inset-0 bg-gradient-to-tr ${success ? "from-emerald-500/20 to-emerald-500/20" : gradient} rounded-full blur-2xl`}
                  />
                  <div className={`relative bg-zinc-800 border-2 border-zinc-700/50 w-full h-full rounded-[2.5rem] flex items-center justify-center ${success ? "text-emerald-500" : textColor} shadow-inner`}>
                    {isLoading ? (
                      <Loader2 className="animate-spin" size={40} />
                    ) : (
                      getIcon()
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-zinc-50 tracking-tight">
                    {success ? successTitle : title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium px-2">
                    {success ? successMessage : message}
                  </p>
                </div>

                {/* Action Buttons */}
                {!isLoading && !success && (
                  <div className="flex flex-col gap-3 pt-4">
                    <button
                      onClick={onConfirm}
                      className={`w-full py-4 ${btnColor} text-white font-black rounded-[1.5rem] transition-all shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)] shadow-${shadowColor} active:scale-95 text-sm uppercase tracking-widest`}
                    >
                      {confirmText}
                    </button>
                    <button
                      onClick={onCancel}
                      className="w-full py-4 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-400 font-bold rounded-[1.5rem] transition-all active:scale-95 border border-zinc-800 text-sm uppercase tracking-widest"
                    >
                      {cancelText}
                    </button>
                  </div>
                )}

                {/* Loading state indicator */}
                {isLoading && (
                  <div className="pt-8">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className={`h-full ${btnColor}`}
                      />
                    </div>
                  </div>
                )}

                {/* Success state indicator */}
                {success && (
                  <div className="pt-4 text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em] animate-pulse">
                    Processing Complete
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

export default ConfirmModal;
