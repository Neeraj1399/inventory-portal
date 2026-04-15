import React, { useState, useRef, useEffect } from "react";
import { X, Send, AlertCircle, CheckCircle2, RefreshCw, ClipboardList, Package, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

// Premium Primitives
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";
import Badge from "./Badge";

const RequestModal = ({ isOpen, onClose, item = null, type = "ALLOCATION" }) => {
  const [formData, setFormData] = useState({
    title: item ? `Issue report for ${item.model || item.itemName}` : "",
    type: type,
    requestType: "NEW", // NEW or REPLACEMENT
    category: "Laptop", // Laptop, Monitor, Mobile, Headphones, Keyboard, Others
    priority: "MEDIUM",
    description: "",
    itemCategory: item ? (item.serialNumber ? "Asset" : "Consumable") : null,
    itemId: item ? item._id : null,
  });

  const textareaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isRequestTypeOpen, setIsRequestTypeOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setSuccess(false);
      setError("");
      setFormData({
        title: item ? `Issue report for ${item.model || item.itemName}` : "",
        type: type,
        requestType: "NEW",
        category: "Laptop",
        priority: "MEDIUM",
        description: "",
        itemCategory: item ? (item.serialNumber ? "Asset" : "Consumable") : null,
        itemId: item ? item._id : null,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.description]);

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
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-bg-primary/80 backdrop-blur-xl"
            onClick={!loading ? onClose : undefined} 
          />
          
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-bg-secondary border border-border rounded-2xl overflow-hidden shadow-xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-border flex justify-between items-center bg-bg-elevated/50">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/10">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">
                    {success ? "Submission Success" : "New Service Entry"}
                  </h2>
                  <p className="text-text-muted text-[10px] font-black tracking-widest mt-1 opacity-60">
                    {formData.type === "INCIDENT" ? "Critical Event Reporting" : "Resource Allocation Request"}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 text-text-muted hover:text-white hover:bg-bg-tertiary rounded-2xl transition-all active:scale-95"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-10">
              {success ? (
                <div className="py-20 flex flex-col items-center text-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-status-success/20 rounded-full blur-[40px] animate-pulse" />
                    <div className="relative p-8 bg-bg-elevated border border-border rounded-full text-status-success shadow-inner">
                      <CheckCircle2 size={56} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight">Voucher Transmitted</h3>
                    <p className="text-text-muted text-sm font-medium opacity-80 px-10">
                      Administrative oversight has been notified. Your request sequence is now active.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-5 bg-status-danger/10 border border-status-danger/20 rounded-[1.5rem] flex items-center gap-4 text-status-danger text-xs font-black tracking-widest"
                    >
                      <AlertCircle size={20} />
                      {error}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Logic Pattern</label>
                      <div className="relative">
                        <button type="button" onClick={() => { setIsTypeOpen(o => !o); setIsCategoryOpen(false); setIsRequestTypeOpen(false); setIsPriorityOpen(false); }}
                          className={`w-full flex items-center justify-between px-6 h-14 bg-bg-elevated border rounded-[1.25rem] transition-all text-text-primary ${isTypeOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}>
                          <span className="text-sm font-bold">{{ ALLOCATION: "Allocation", REPLACEMENT: "Replacement", SERVICE: "Maintenance", INCIDENT: "Incident" }[formData.type]}</span>
                          <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isTypeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isTypeOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsTypeOpen(false)} />
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {[{ value: "ALLOCATION", label: "Allocation" }, { value: "REPLACEMENT", label: "Replacement" }, { value: "SERVICE", label: "Maintenance" }, { value: "INCIDENT", label: "Incident" }].map(opt => (
                                <button type="button" key={opt.value} onClick={() => { setFormData({ ...formData, type: opt.value }); setIsTypeOpen(false); }}
                                  className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${formData.type === opt.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                                  {opt.label}
                                  {formData.type === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Entity Cluster</label>
                      <div className="relative">
                        <button type="button" onClick={() => { setIsCategoryOpen(o => !o); setIsTypeOpen(false); setIsRequestTypeOpen(false); setIsPriorityOpen(false); }}
                          className={`w-full flex items-center justify-between px-6 h-14 bg-bg-elevated border rounded-[1.25rem] transition-all text-text-primary ${isCategoryOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}>
                          <span className="text-sm font-bold">{{ Laptop: "Laptop", Monitor: "Monitor", Mobile: "Smartphone", Headphones: "Headphones", Keyboard: "Keyboard", Others: "Others" }[formData.category] || formData.category}</span>
                          <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isCategoryOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsCategoryOpen(false)} />
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {[{ value: "Laptop", label: "Laptop" }, { value: "Monitor", label: "Monitor" }, { value: "Mobile", label: "Smartphone" }, { value: "Headphones", label: "Headphones" }, { value: "Keyboard", label: "Keyboard" }, { value: "Others", label: "Others" }].map(opt => (
                                <button type="button" key={opt.value} onClick={() => { setFormData({ ...formData, category: opt.value }); setIsCategoryOpen(false); }}
                                  className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${formData.category === opt.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                                  {opt.label}
                                  {formData.category === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Acquisition Model</label>
                      <div className="relative">
                        <button type="button" onClick={() => { setIsRequestTypeOpen(o => !o); setIsTypeOpen(false); setIsCategoryOpen(false); setIsPriorityOpen(false); }}
                          className={`w-full flex items-center justify-between px-6 h-14 bg-bg-elevated border rounded-[1.25rem] transition-all text-text-primary ${isRequestTypeOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}>
                          <span className="text-sm font-bold">{{ NEW: "New Provisions", REPLACEMENT: "Hardware Replacement" }[formData.requestType]}</span>
                          <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isRequestTypeOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isRequestTypeOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsRequestTypeOpen(false)} />
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {[{ value: "NEW", label: "New Provisions" }, { value: "REPLACEMENT", label: "Hardware Replacement" }].map(opt => (
                                <button type="button" key={opt.value} onClick={() => { setFormData({ ...formData, requestType: opt.value }); setIsRequestTypeOpen(false); }}
                                  className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${formData.requestType === opt.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                                  {opt.label}
                                  {formData.requestType === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Priority Vector</label>
                      <div className="relative">
                        <button type="button" onClick={() => { setIsPriorityOpen(o => !o); setIsTypeOpen(false); setIsCategoryOpen(false); setIsRequestTypeOpen(false); }}
                          className={`w-full flex items-center justify-between px-6 h-14 bg-bg-elevated border rounded-[1.25rem] transition-all text-text-primary ${isPriorityOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border"}`}>
                          <span className="text-sm font-bold">{{ LOW: "Low", MEDIUM: "Medium", HIGH: "High" }[formData.priority]}</span>
                          <ChevronDown size={16} className={`text-text-disabled shrink-0 transition-transform duration-300 ${isPriorityOpen ? "rotate-180" : ""}`} />
                        </button>
                        {isPriorityOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsPriorityOpen(false)} />
                            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              {[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }].map(opt => (
                                <button type="button" key={opt.value} onClick={() => { setFormData({ ...formData, priority: opt.value }); setIsPriorityOpen(false); }}
                                  className={`w-full text-left px-5 py-3 text-sm font-bold transition-all flex items-center justify-between ${formData.priority === opt.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                                  {opt.label}
                                  {formData.priority === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Identification Header</label>
                    <Input
                      type="text"
                      required
                      placeholder="Enter a descriptive title for this entry..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">Contextual Description</label>
                    <textarea
                      ref={textareaRef}
                      required
                      className="w-full h-32 px-6 py-5 bg-bg-elevated border border-border rounded-[1.5rem] text-sm text-text-primary placeholder-text-disabled focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all resize-none font-medium leading-relaxed shadow-inner custom-scrollbar"
                      placeholder="Provide comprehensive details regarding your request..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  {item && (
                    <div className="p-5 bg-accent-primary/5 border border-accent-primary/10 rounded-[1.5rem] flex items-center gap-5 group">
                      <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary">
                        <Package size={20} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-accent-primary tracking-widest opacity-60">Attached Resource</p>
                        <p className="text-sm text-text-primary font-black tracking-tight">{item.model || item.itemName}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-6">
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={onClose}
                      className="flex-1 h-16 tracking-widest text-[11px]"
                    >
                      Cancel Sequence
                    </Button>
                    <Button
                      type="submit"
                      isLoading={loading}
                      className="flex-[2] h-16 tracking-widest text-[11px]"
                      icon={Send}
                    >
                      Transmit Vitals
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RequestModal;
