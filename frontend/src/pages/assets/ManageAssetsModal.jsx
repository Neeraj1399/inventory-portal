import React, { useState, useEffect, useCallback } from "react";
import {
 X,
 Laptop,
 RefreshCcw,
 PlusCircle,
 Loader2,
 Wrench,
} from "lucide-react";
import api from "../../services/api";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import AssetConditionModal from "../../components/assets/AssetConditionModal";

const ManageAssetsModal = ({ isOpen, employee, onClose, onRefresh }) => {
 const [assignedAssets, setAssignedAssets] = useState([]);
 const [availableAssets, setAvailableAssets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // UI State for sub-modals
 const [assetToReturn, setAssetToReturn] = useState(null);
 const [assetToUpdate, setAssetToUpdate] = useState(null);

 const fetchData = useCallback(async () => {
  if (!employee?._id) return;
  if (assignedAssets.length === 0) setLoading(true);
 setIsRefreshing(true);

 try {
 const timestamp = new Date().getTime();
 const [assignedRes, availableRes] = await Promise.all([
 api.get(`/assets?allocatedTo=${employee._id}&t=${timestamp}`),
 api.get(`/assets?status=READY_TO_DEPLOY&t=${timestamp}`),
 ]);

 setAssignedAssets(assignedRes.data.data);
 setAvailableAssets(availableRes.data.data);
 } catch (err) {
 console.error("Failed to load assets", err);
 } finally {
 setLoading(false);
 setIsRefreshing(false);
 }
  }, [employee?._id]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleAssign = async (assetId) => {
  if (!employee?._id || actionLoading || isRefreshing) return;
  setActionLoading(true);
 try {
 await api.patch(`/assets/${assetId}/assign`, {
 employeeId: employee._id,
 });
 await fetchData();
 onRefresh();
 } catch (err) {
 alert(err.response?.data?.message || "Assignment failed");
 } finally {
 setActionLoading(false);
 }
 };

  if (!isOpen || !employee) return null;

 return (
 <>
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
  <div
  className={`bg-bg-secondary border border-border rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 transition-opacity ${isRefreshing ? "opacity-75" : "opacity-100"}`}
  >
 {/* Header */}
  <div className="p-8 border-b border-border flex justify-between items-center bg-bg-tertiary/20">
  <div>
  <h2 className="text-2xl font-black text-white tracking-tight">
  Hardware <span className="text-accent-primary">Logistics</span>
  </h2>
  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
  {employee.name} • {employee.department || "Staff"}
  </p>
  </div>
  <button
  onClick={onClose}
  disabled={actionLoading || isRefreshing}
  className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all disabled:opacity-50 text-text-muted hover:text-white"
  >
  <X size={24} />
  </button>
 </div>

 <div className="p-6 overflow-y-auto space-y-8 relative">
 {isRefreshing && !loading && (
 <div className="absolute top-2 right-6">
 <Loader2 size={16} className="animate-spin text-accent-primary" />
 </div>
 )}

 {loading ? (
 <div className="flex flex-col items-center py-12 text-text-muted">
 <Loader2 className="animate-spin mb-2" />
 <p className="text-sm font-medium">
 Synchronizing inventory...
 </p>
 </div>
 ) : (
 <>
 {/* Section: Currently Allocated */}
  <section>
  <h3 className="text-[10px] font-black text-text-disabled uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
  <div className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-glow" />
  Active Allocations
  </h3>
 <div className="space-y-2">
 {assignedAssets.length > 0 ? (
 assignedAssets.map((asset) => (
  <div
  key={asset._id}
  className="flex items-center justify-between p-4 bg-bg-elevated/50 rounded-2xl border border-border group hover:bg-bg-elevated transition-colors"
  >
  <div className="flex items-center gap-4">
  <div className="p-3 bg-accent-primary/10 border border-accent-primary/10 rounded-xl shadow-inner">
  <Laptop className="text-accent-primary" size={20} />
  </div>
  <div className="flex flex-col">
  <span className="text-base font-black text-text-primary tracking-tight">
  {asset.model}
  </span>
  <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
  SN: {asset.serialNumber}
  </span>
  </div>
  </div>
  <button
  onClick={() => setAssetToReturn(asset)}
  disabled={actionLoading || isRefreshing}
  className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/20 transition-all flex items-center gap-2 disabled:opacity-50"
  >
  <RefreshCcw size={14} /> Return
  </button>
  </div>
 ))
 ) : (
 <div className="text-center py-4 border-2 border-dashed border-border rounded-2xl">
 <p className="text-sm text-text-muted italic">
 No equipment currently allocated.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* Section: Available to Allocate */}
  <section>
  <h3 className="text-[10px] font-black text-text-disabled uppercase tracking-[0.2em] mb-6 flex items-center gap-2 mt-4">
  <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full shadow-glow" />
  Deployment Ready
  </h3>
 <div className="grid grid-cols-1 gap-2">
 {availableAssets.length > 0 ? (
 availableAssets
 .filter((available) => {
 const isCurrentlyAssigned = assignedAssets.some(
 (asgn) => asgn._id === available._id,
 );
 const isPendingReturn =
 assetToReturn?._id === available._id;
 return !isCurrentlyAssigned && !isPendingReturn;
 })
 .map((asset) => (
  <div
  key={asset._id}
  className="flex items-center justify-between p-4 bg-bg-elevated/20 border border-border rounded-2xl hover:border-accent-primary/50 transition-all group"
  >
  <div className="flex flex-col">
  <span className="text-[9px] font-black text-accent-secondary uppercase tracking-[0.2em] mb-1">
  {asset.category || "LAPTOP"}
  </span>
  <span className="text-base font-black text-text-primary tracking-tight group-hover:text-white transition-colors">
  {asset.model}
  </span>
  <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
  {asset.serialNumber}
  </span>
  </div>
  <div className="flex items-center gap-2">
  <button
  onClick={() => setAssetToUpdate(asset)}
  disabled={actionLoading || isRefreshing}
  title="Update Condition"
  className="text-text-muted hover:text-status-warning hover:bg-status-warning/10 p-3 rounded-2xl transition-all disabled:opacity-50 border border-transparent hover:border-status-warning/20"
  >
  <Wrench size={20} />
  </button>
 
  <button
  onClick={() => handleAssign(asset._id)}
  disabled={actionLoading || isRefreshing}
  title="Allocate to Employee"
  className="text-accent-primary hover:bg-accent-primary/10 p-3 rounded-2xl transition-all disabled:opacity-50 border border-transparent hover:border-accent-primary/20"
  >
  {actionLoading ? (
  <Loader2 size={24} className="animate-spin" />
  ) : (
  <PlusCircle size={24} />
  )}
  </button>
  </div>
  </div>
 ))
 ) : (
 <div className="text-center py-4 bg-bg-secondary rounded-2xl">
 <p className="text-sm text-text-muted">
 All inventory is currently deployed.
 </p>
 </div>
 )}
 </div>
 </section>
 </>
 )}
 </div>
 </div>
 </div>

 <ReturnAssetModal
 isOpen={!!assetToReturn}
 asset={assetToReturn}
 onClose={() => setAssetToReturn(null)}
 onRefresh={async () => {
 setAssetToReturn(null);
 await fetchData();
 onRefresh();
 }}
 />

 {/* Integrated Condition Modal */}
 <AssetConditionModal
 isOpen={!!assetToUpdate}
 asset={assetToUpdate}
 onClose={() => setAssetToUpdate(null)}
 onRefresh={async () => {
 setAssetToUpdate(null);
 await fetchData();
 onRefresh();
 }}
 />
 </>
 );
};

export default ManageAssetsModal;
