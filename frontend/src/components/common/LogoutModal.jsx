import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";

const LogoutModal = ({ isOpen, onConfirm, onCancel, isLoggingOut }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={!isLoggingOut ? onCancel : undefined}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 text-center space-y-6">
                {/* Icon Wrapper */}
                <div className="relative mx-auto w-20 h-20">
                  <motion.div
                    animate={isLoggingOut ? { rotate: 360 } : {}}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-rose-500/20 rounded-full blur-xl"
                  />
                  <div className="relative bg-zinc-800 border-2 border-zinc-700 w-full h-full rounded-3xl flex items-center justify-center text-rose-500 shadow-inner">
                    {isLoggingOut ? (
                      <Loader2 className="animate-spin" size={32} />
                    ) : (
                      <LogOut size={32} />
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-50 tracking-tight">
                    {isLoggingOut ? "Signing Out..." : "Confirm Logout"}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {isLoggingOut 
                      ? "Securely closing your workspace session. Please wait a moment." 
                      : "Are you sure you want to end your current session? You'll need to sign back in to access the portal."}
                  </p>
                </div>

                {/* Action Buttons */}
                {!isLoggingOut && (
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={onConfirm}
                      className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(225,29,72,0.4)] active:scale-95"
                    >
                      Log Out
                    </button>
                    <button
                      onClick={onCancel}
                      className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold rounded-2xl transition-all active:scale-95 border border-zinc-700/50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Progress bar for logging out state */}
                {isLoggingOut && (
                  <div className="pt-4">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      />
                    </div>
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

export default LogoutModal;
