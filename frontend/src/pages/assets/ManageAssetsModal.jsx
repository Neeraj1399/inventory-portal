import React, { useState, useEffect, useCallback } from "react";
import {
 X,
 Laptop,
 RefreshCcw,
 PlusCircle,
 Loader2,
 Wrench,
} from "lucide-react";
import api from "../../hooks/api";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import AssetConditionModal from "../../components/assets/AssetConditionModal";

const ManageAssetsModal = ({ employee, onClose, onRefresh }) => {
 const [assignedAssets, setAssignedAssets] = useState([]);
 const [availableAssets, setAvailableAssets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);
 const [isRefreshing, setIsRefreshing] = useState(false);

 // UI State for sub-modals
 const [assetToReturn, setAssetToReturn] = useState(null);
 const [assetToUpdate, setAssetToUpdate] = useState(null);

 const fetchData = useCallback(async () => {
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
 }, [employee._id]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleAssign = async (assetId) => {
 if (actionLoading || isRefreshing) return;
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
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900 p-4">
 <div
 className={`bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 transition-opacity ${isRefreshing ? "opacity-75" : "opacity-100"}`}
 >
 {/* Header */}
 <div className="p-6 border-b flex justify-between items-center">
 <div>
 <h2 className="text-xl font-bold text-zinc-50">
 Manage Assets
 </h2>
 <p className="text-sm text-zinc-500">
 {employee.name} • {employee.department || "Staff"}
 </p>
 </div>
 <button
 onClick={onClose}
 disabled={actionLoading || isRefreshing}
 className="p-2 hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
 >
 <X size={20} />
 </button>
 </div>

 <div className="p-6 overflow-y-auto space-y-8 relative">
 {isRefreshing && !loading && (
 <div className="absolute top-2 right-6">
 <Loader2 size={16} className="animate-spin text-blue-500" />
 </div>
 )}

 {loading ? (
 <div className="flex flex-col items-center py-12 text-zinc-400">
 <Loader2 className="animate-spin mb-2" />
 <p className="text-sm font-medium">
 Synchronizing inventory...
 </p>
 </div>
 ) : (
 <>
 {/* Section: Currently Allocated */}
 <section>
 <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
 Allocated Gear
 </h3>
 <div className="space-y-2">
 {assignedAssets.length > 0 ? (
 assignedAssets.map((asset) => (
 <div
 key={asset._id}
 className="flex items-center justify-between p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"
 >
 <div className="flex items-center gap-3">
 <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm">
 <Laptop className="text-indigo-400" size={18} />
 </div>
 <div className="flex flex-col">
 <span className="text-sm font-bold text-zinc-200">
 {asset.model}
 </span>
 <span className="text-[10px] text-zinc-500 font-mono">
 SN: {asset.serialNumber}
 </span>
 </div>
 </div>
 <button
 onClick={() => setAssetToReturn(asset)}
 disabled={actionLoading || isRefreshing}
 className="text-xs font-bold text-red-400 hover:bg-red-500/100/10 px-3 py-2 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
 >
 <RefreshCcw size={14} /> Return
 </button>
 </div>
 ))
 ) : (
 <div className="text-center py-4 border-2 border-dashed border-zinc-800 rounded-2xl">
 <p className="text-sm text-zinc-400 italic">
 No equipment currently allocated.
 </p>
 </div>
 )}
 </div>
 </section>

 {/* Section: Available to Allocate */}
 <section>
 <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">
 Allocate New Equipment
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
 className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 border border-zinc-800 rounded-2xl hover:border-indigo-500 transition-all group"
 >
 <div className="flex flex-col">
 <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">
 {asset.category || "LAPTOP"}
 </span>
 <span className="text-sm font-bold text-zinc-200">
 {asset.model}
 </span>
 <span className="text-[10px] text-zinc-400 font-mono">
 {asset.serialNumber}
 </span>
 </div>
 <div className="flex items-center gap-2">
 {/* New Condition/Repair Button */}
 <button
 onClick={() => setAssetToUpdate(asset)}
 disabled={actionLoading || isRefreshing}
 title="Update Condition"
 className="text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 p-2 rounded-xl transition-all disabled:opacity-50"
 >
 <Wrench size={20} />
 </button>

 <button
 onClick={() => handleAssign(asset._id)}
 disabled={actionLoading || isRefreshing}
 title="Allocate to Employee"
 className="text-indigo-400 hover:bg-indigo-500/10 p-2 rounded-xl transition-all disabled:opacity-50"
 >
 {actionLoading ? (
 <Loader2 size={22} className="animate-spin" />
 ) : (
 <PlusCircle size={22} />
 )}
 </button>
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-4 bg-zinc-900 rounded-2xl">
 <p className="text-sm text-zinc-400">
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
