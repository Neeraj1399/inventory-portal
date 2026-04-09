import React, { useState, useEffect } from "react";
import {
 X,
 RefreshCcw,
 Trash2,
 AlertTriangle,
 Loader2,
 CheckCircle,
} from "lucide-react";
import api from "../../services/api";

const ConsumableMaintenanceResolveModal = ({
 isOpen,
 item,
 onClose,
 onRefresh,
}) => {
 const [formData, setFormData] = useState({
 action: "RETURN",
 quantity: 1,
 });
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (isOpen && item) {
 setFormData({
 action: "RETURN",
 quantity: item.maintenanceQuantity || 1,
 });
 }
 }, [isOpen, item]);

 if (!isOpen || !item) return null;

 const inMaintenance = item.maintenanceQuantity || 0;

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (formData.quantity > inMaintenance) {
 alert("Quantity exceeds items currently in maintenance.");
 return;
 }

 setLoading(true);
 try {
 await api.patch(`/consumables/${item._id}/resolve-maintenance`, formData);
 onRefresh();
 onClose();
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.message || "Failed to resolve maintenance.");
 } finally {
 setLoading(false);
 }
 };

 const isReturn = formData.action === "RETURN";

 return (
 <div className="fixed inset-0 z-[110] flex items-start justify-center pt-12 px-4 pb-4 bg-bg-primary/80 backdrop-blur-sm">
 <div
 className="absolute inset-0"
 onClick={onClose}
 />

 <div className="relative bg-bg-secondary border border-border w-full max-w-xl rounded-[2rem] shadow-premium overflow-hidden animate-in zoom-in-95 duration-200">
 <div className="p-6">
 {/* Header */}
 <div className="flex justify-between items-start mb-6">
 <div className="flex items-center gap-4">
 <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-2xl border border-accent-primary/20">
 <RefreshCcw size={22} />
 </div>
 <div>
 <h2 className="text-xl font-black text-text-primary tracking-tight">
 Resolve Repair
 </h2>
 <p className="text-text-muted font-medium text-sm">
 {inMaintenance} units of {item.itemName} currently sidelined
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="p-2 hover:bg-bg-tertiary rounded-xl transition-all duration-200"
 >
 <X size={20} className="text-text-muted" />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Resolution Toggle */}
 <div className="grid grid-cols-2 gap-2 p-1.5 bg-bg-tertiary rounded-2xl">
 <button
 type="button"
 onClick={() => setFormData({ ...formData, action: "RETURN" })}
 className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
 isReturn
 ? "bg-bg-secondary border border-border text-status-success shadow-sm"
 : "text-text-muted hover:text-text-secondary"
 }`}
 >
 <CheckCircle size={13} /> RETURN TO STOCK
 </button>
 <button
 type="button"
 onClick={() => setFormData({ ...formData, action: "SCRAP" })}
 className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${
 !isReturn
 ? "bg-bg-secondary border border-border text-status-danger shadow-sm"
 : "text-text-muted hover:text-text-secondary"
 }`}
 >
 <Trash2 size={13} /> SCRAP PERMANENTLY
 </button>
 </div>

 {/* Quantity Input */}
 <div>
 <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 ml-1">
 Quantity to Resolve
 </label>
 <input
 type="number"
 min="1"
 max={inMaintenance}
 required
 className="input-base bg-bg-tertiary font-bold"
 value={formData.quantity}
 onChange={(e) =>
 setFormData({ ...formData, quantity: parseInt(e.target.value) })
 }
 />
 </div>

 {/* Warning Message */}
 <div
 className={`flex gap-3 p-3.5 rounded-2xl border ${
 isReturn
 ? "bg-status-success/10 border-status-success/20"
 : "bg-status-danger/10 border-status-danger/20"
 }`}
 >
 <AlertTriangle
 className={isReturn ? "text-status-success shrink-0" : "text-status-danger shrink-0"}
 size={16}
 />
 <p
 className={`text-xs font-bold leading-tight ${
 isReturn ? "text-status-success" : "text-status-danger"
 }`}
 >
 {isReturn
 ? `These ${formData.quantity} units will be moved back to available warehouse stock.`
 : `These ${formData.quantity} units will be PERMANENTLY deleted from total inventory.`}
 </p>
 </div>

 <button
 type="submit"
 disabled={loading || inMaintenance === 0}
 className="w-full bg-accent-gradient hover:brightness-110 text-white py-3 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-2 transition-all duration-200 shadow-glow-sm disabled:opacity-50 disabled:shadow-none"
 >
 {loading ? (
 <Loader2 className="animate-spin" size={18} />
 ) : (
 "CONFIRM RESOLUTION"
 )}
 </button>
 </form>
 </div>
 </div>
 </div>
 );
};

export default ConsumableMaintenanceResolveModal;
