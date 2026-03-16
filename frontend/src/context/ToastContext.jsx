import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
 const [toasts, setToasts] = useState([]);

 const addToast = useCallback((message, type = "info") => {
 const id = Date.now().toString();
 setToasts((prev) => [...prev, { id, message, type }]);
 
 setTimeout(() => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, 4000);
 }, []);

 const removeToast = useCallback((id) => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 return (
 <ToastContext.Provider value={{ addToast }}>
 {children}
 <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
 {toasts.map((toast) => (
 <div
 key={toast.id}
 className={`
 pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl min-w-[300px]
 animate-in slide-in-from-right-8 fade-in duration-300 border
 ${toast.type === "success" ? "bg-emerald-500/100/10 border-emerald-500/30 text-emerald-400" : ""}
 ${toast.type === "error" ? "bg-red-500/100/10 border-red-500/30 text-red-400" : ""}
 ${toast.type === "info" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : ""}
 ${toast.type === "warning" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : ""}
 `}
 >
 {toast.type === "success" && <CheckCircle className="text-emerald-500 min-w-[20px]" size={20} />}
 {toast.type === "error" && <XCircle className="text-red-500 min-w-[20px]" size={20} />}
 {toast.type === "info" && <Info className="text-blue-500 min-w-[20px]" size={20} />}
 {toast.type === "warning" && <AlertTriangle className="text-amber-500 min-w-[20px]" size={20} />}
 
 <p className="font-semibold text-sm flex-1">{toast.message}</p>
 
 <button 
 onClick={() => removeToast(toast.id)}
 className="text-zinc-400 hover:text-zinc-300 transition-colors"
 >
 <X size={16} />
 </button>
 </div>
 ))}
 </div>
 </ToastContext.Provider>
 );
};

export const useToast = () => {
 const context = useContext(ToastContext);
 if (!context) {
 throw new Error("useToast must be used within a ToastProvider");
 }
 return context;
};
