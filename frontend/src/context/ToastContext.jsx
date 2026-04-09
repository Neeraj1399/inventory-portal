import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    timersRef.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timersRef.current[id];
    }, 4000);
  }, []);

  React.useEffect(() => {
    const handleApiError = (event) => {
      const { message, type } = event.detail;
      addToast(message, type);
    };

    window.addEventListener("api-error", handleApiError);
    return () => window.removeEventListener("api-error", handleApiError);
  }, [addToast]);

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
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
              pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-premium min-w-[300px]
              animate-in slide-in-from-right-8 fade-in duration-300 border
              ${toast.type === "success" ? "bg-status-success/10 border-status-success/30 text-status-success" : ""}
              ${toast.type === "error" ? "bg-status-danger/10 border-status-danger/30 text-status-danger" : ""}
              ${toast.type === "info" ? "bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary" : ""}
              ${toast.type === "warning" ? "bg-status-warning/10 border-status-warning/30 text-status-warning" : ""}
            `}
          >
            {toast.type === "success" && <CheckCircle className="text-status-success min-w-[20px]" size={20} />}
            {toast.type === "error" && <XCircle className="text-status-danger min-w-[20px]" size={20} />}
            {toast.type === "info" && <Info className="text-status-info min-w-[20px]" size={20} />}
            {toast.type === "warning" && <AlertTriangle className="text-status-warning min-w-[20px]" size={20} />}

            <p className="font-semibold text-sm flex-1">{toast.message}</p>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-text-muted hover:text-text-secondary transition-colors duration-200"
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
