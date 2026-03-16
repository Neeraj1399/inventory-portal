import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
 Plus,
 Search,
 Trash2,
 Edit3,
 UserPlus,
 Package,
 RotateCcw,
 FileText,
 Wrench,
 CheckSquare,
 Square,
 X,
 RefreshCw,
 ChevronDown,
 Filter,
  AlertCircle,
} from "lucide-react";
import api from "../../hooks/api";

// Component Imports
import RequestModal from "../../components/common/RequestModal";
import AddAssetModal from "../../components/assets/AddAssetModal";
import AssignAssetModal from "../../components/assets/AssignAssetModal";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import AssetConditionModal from "../../components/assets/AssetConditionModal";
import AssetDetailsSidebar from "../../components/assets/AssetDetailsSidebar";

const AssetList = () => {
  const { user } = useAuth();
 // --- State Management ---
 const [assets, setAssets] = useState([]);
 const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
 const [error, setError] = useState(null);
 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState("ALL");
 const [selectedIds, setSelectedIds] = useState([]);

 // UI State
 const [activeModal, setActiveModal] = useState(null); // 'ADD', 'ASSIGN', 'RETURN', 'CONDITION'
 const [isSidebarOpen, setSidebarOpen] = useState(false);
 const [selectedAsset, setSelectedAsset] = useState(null);
 const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

 const filterOptions = ["ALL", "READY_TO_DEPLOY", "ALLOCATED", "UNDER_MAINTENANCE", "DECOMMISSIONED"];

 // --- Data Fetching ---
 const fetchAssets = useCallback(async (isSilent = false) => {
 if (!isSilent) setLoading(true);
 try {
 const res = await api.get(`/assets`, {
 params: {
 // REMOVED: category: "Laptop,Monitor" (This was hiding your new manual categories!)
 _t: Date.now(),
 },
 });

 const freshData = res.data.data || [];
 setAssets(freshData);

 // Clean up selected IDs if assets were removed
 setSelectedIds((prev) =>
 prev.filter((id) => freshData.some((a) => a._id === id)),
 );
 setError(null);
 } catch (err) {
 setError("Failed to sync with inventory. Check connection.");
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchAssets();
 }, [fetchAssets]);

 // --- Action Handlers ---
 const closeAllModals = () => {
 setActiveModal(null);
 setSelectedAsset(null);
 };

 const handleDelete = async (e, asset) => {
 e.stopPropagation();
 if (!window.confirm(`Permanently delete ${asset.model}?`)) return;

 const previousAssets = [...assets];
 setAssets((prev) => prev.filter((a) => a._id !== asset._id));

 try {
 await api.delete(`/assets/${asset._id}`);
 setSelectedIds((prev) => prev.filter((id) => id !== asset._id));
 } catch (err) {
 if (err.response?.status !== 404) {
 setAssets(previousAssets);
 alert("Delete failed. Reverting changes.");
 }
 }
 };

 const handleBulkDelete = async () => {
 const count = selectedIds.length;
 if (!window.confirm(`Delete ${count} assets permanently?`)) return;

 const previousAssets = [...assets];
 const idsToDelete = [...selectedIds];

 setAssets((prev) => prev.filter((a) => !idsToDelete.includes(a._id)));
 setSelectedIds([]);

 try {
 await Promise.allSettled(
 idsToDelete.map((id) => api.delete(`/assets/${id}`)),
 );
 fetchAssets(true);
 } catch (err) {
 setAssets(previousAssets);
 alert("Bulk delete encountered issues. Refreshing list.");
 fetchAssets();
 }
 };

 const filteredAssets = useMemo(() => {
 return assets.filter((asset) => {
 const searchStr = searchTerm.toLowerCase();
 const matchesSearch =
 (asset.model?.toLowerCase() || "").includes(searchStr) ||
 (asset.serialNumber?.toLowerCase() || "").includes(searchStr);
 const matchesStatus =
 statusFilter === "ALL" || asset.status === statusFilter;
 return matchesSearch && matchesStatus;
 });
 }, [assets, searchTerm, statusFilter]);

 if (loading && assets.length === 0) {
 return (
 <div className="p-20 flex flex-col items-center justify-center animate-pulse">
 <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
 <p className="text-zinc-400 font-bold tracking-tight">
 Syncing Inventory...
 </p>
 </div>
 );
 }

 return (
 <div className="relative space-y-6 pb-32 max-w-7xl mx-auto">
 {/* 1. FLOATING BULK ACTION BAR */}
 {selectedIds.length > 0 && (
 <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-zinc-950 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-300">
 <div className="flex items-center gap-3">
 <span className="bg-indigo-600 px-2 py-0.5 rounded text-xs font-bold">
 {selectedIds.length}
 </span>
 <span className="text-sm font-semibold text-zinc-300">
 Selected
 </span>
 </div>

 <div className="h-6 w-px bg-zinc-700 mx-2" />

 {/* Bulk Update Trigger */}
 <button
 onClick={() => setActiveModal("CONDITION")}
 className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm transition-colors"
 >
 <Wrench size={16} /> Update Condition
 </button>

 <button
 onClick={handleBulkDelete}
 className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold text-sm transition-colors"
 >
 <Trash2 size={16} /> Delete
 </button>

 <button
 onClick={() => setSelectedIds([])}
 className="hover:bg-zinc-800 p-1.5 rounded-lg transition-colors text-zinc-400"
 >
 <X size={20} />
 </button>
 </div>
 )}

 {/* 2. HEADER */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-6">
 <div>
 <h1 className="text-3xl font-black text-zinc-50 tracking-tight">
 Hardware
 </h1>
 <p className="text-zinc-400 font-medium text-sm mt-1">
 {loading ? "Refreshing..." : `${assets.length} Assets Registered`}
 </p>
 </div>
 <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchAssets()}
            className="p-3 bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all shadow-sm "
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {user?.roleAccess === "ADMIN" ? (
            <button
              onClick={() => {
                setSelectedAsset(null);
                setActiveModal("ADD");
              }}
              className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-bold transition-all"
            >
              <Plus size={20} /> New Asset
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedAsset(null);
                setIsRequestModalOpen(true);
              }}
              className="flex-1 sm:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-bold transition-all"
            >
              <AlertCircle size={20} /> Request Allocation
            </button>
          )}
        </div>
 </div>

 {/* 3. CONTROLS (Search & Filter) */}
 <div className="flex flex-col md:flex-row gap-4 items-center">
 <div className="flex-1 relative group w-full">
 <Search
 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400 transition-colors"
 size={18}
 />
 <input
 type="text"
 placeholder="Search Serial or Model..."
 className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none "
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>

 <div className="relative w-full md:w-64">
 <button
 onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
 className={`w-full flex items-center justify-between px-5 py-3 bg-zinc-900 border rounded-2xl transition-all shadow-sm hover:border-slate-600 text-zinc-200 ${
 isFilterDropdownOpen
 ? "border-indigo-500/50 ring-4 ring-indigo-500/10"
 : "border-zinc-800"
 }`}
 >
 <div className="flex items-center gap-3">
 <Filter
 size={16}
 className={
 statusFilter !== "ALL" ? "text-indigo-400" : "text-zinc-400"
 }
 />
 <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
 {statusFilter === "ALL" ? "Filter by Status" : statusFilter}
 </span>
 </div>
 <ChevronDown
 size={18}
 className={`text-zinc-400 transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180" : ""}`}
 />
 </button>

 {isFilterDropdownOpen && (
 <>
 <div
 className="fixed inset-0 z-10"
 onClick={() => setIsFilterDropdownOpen(false)}
 />
 <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-800 rounded-2xl shadow-2xl shadow-slate-900/50 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
 {filterOptions.map((opt) => (
 <button
 key={opt}
 onClick={() => {
 setStatusFilter(opt);
 setIsFilterDropdownOpen(false);
 }}
 className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between ${
 statusFilter === opt
 ? "bg-indigo-500/10 text-indigo-400"
 : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-50"
 }`}
 >
 {opt}
 {statusFilter === opt && (
 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
 )}
 </button>
 ))}
 </div>
 </>
 )}
 </div>
 </div>

 {/* 4. ASSET LIST */}
 <div className="space-y-3">
 {/* Table Header (Desktop Only) */}
 <div className="hidden md:grid grid-cols-[60px_3fr_2fr_120px_240px] gap-6 px-5 py-3 text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 mb-2">
 <div className="flex items-center justify-center">
 <button
 onClick={() =>
 setSelectedIds(
 selectedIds.length === filteredAssets.length
 ? []
 : filteredAssets.map((a) => a._id),
 )
 }
 className="text-zinc-500 hover:text-indigo-400 transition-colors"
 >
 {selectedIds.length === filteredAssets.length &&
 filteredAssets.length > 0 ? (
 <CheckSquare size={18} className="text-indigo-500" />
 ) : (
 <Square size={18} />
 )}
 </button>
 </div>
 <div className="flex items-center">Asset Details</div>
 <div className="flex items-center">Serial Number</div>
 <div className="flex items-center justify-center">Status</div>
 <div className="flex items-center justify-end pr-2">Actions</div>
 </div>

 {/* Mobile select all (Visible only on small screens) */}
 <div className="md:hidden flex items-center gap-3 px-2 mb-2">
 <button
 onClick={() =>
 setSelectedIds(
 selectedIds.length === filteredAssets.length
 ? []
 : filteredAssets.map((a) => a._id),
 )
 }
 className="text-zinc-500 hover:text-indigo-400 transition-colors"
 >
 {selectedIds.length === filteredAssets.length &&
 filteredAssets.length > 0 ? (
 <CheckSquare size={20} className="text-indigo-500" />
 ) : (
 <Square size={20} />
 )}
 </button>
 <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
 Select All Visible
 </span>
 </div>

 {filteredAssets.map((asset) => (
 <div
 key={asset._id}
 onClick={() => {
 setSelectedAsset(asset);
 setSidebarOpen(true);
 }}
 className={`grid grid-cols-[auto_1fr] md:grid-cols-[60px_3fr_2fr_120px_240px] gap-4 md:gap-6 items-center p-5 rounded-3xl border transition-all cursor-pointer group w-full ${
 selectedIds.includes(asset._id)
 ? "border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
 : "border-zinc-800/40 bg-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800 hover:shadow-xl"
 }`}
 >
 <div
 onClick={(e) => {
 e.stopPropagation();
 setSelectedIds((prev) =>
 prev.includes(asset._id)
 ? prev.filter((i) => i !== asset._id)
 : [...prev, asset._id],
 );
 }}
 className="flex items-center justify-center p-1"
 >
 {selectedIds.includes(asset._id) ? (
 <CheckSquare size={22} className="text-indigo-500" />
 ) : (
 <Square size={22} className="text-zinc-300 group-hover:text-zinc-400" />
 )}
 </div>

 <div className="flex flex-row items-center gap-4 truncate">
 <div className="p-3 bg-zinc-700/50 rounded-2xl text-zinc-300 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:text-white transition-all shadow-inner border border-zinc-700 group-hover:border-transparent shrink-0">
 <Package size={22} />
 </div>
 <div className="truncate">
 <h3 className="font-extrabold text-zinc-50 text-lg leading-tight truncate">
 {asset.model}
 </h3>
 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 truncate">
 {asset.category}
 </p>
 </div>
 </div>

 <div className="hidden md:flex items-center truncate">
 <code className="text-[11px] font-bold text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 truncate">
 {asset.serialNumber}
 </code>
 </div>

 <div className="hidden md:flex items-center justify-center">
 <StatusBadge status={asset.status} />
 </div>

 {/* ACTION BUTTONS */}
 <div
 className="col-span-2 md:col-span-1 flex items-center justify-end gap-1.5 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800"
 onClick={(e) => e.stopPropagation()}
 >
 <ActionButton
 icon={<FileText size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 if (asset.receiptUrl) window.open(asset.receiptUrl, "_blank");
 else alert("No receipt found.");
 }}
 color="hover:text-emerald-400 hover:bg-emerald-500/100/10 text-zinc-400"
 title="View Receipt"
 />
 <ActionButton
 icon={<Edit3 size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedAsset(asset);
 setActiveModal("ADD");
 }}
 color="hover:text-indigo-400 hover:bg-indigo-500/10 text-zinc-400"
 title="Edit Details"
 />

 {/* Status-specific Smart Actions */}
 {asset.status === "READY_TO_DEPLOY" && (
 <>
 <ActionButton
 icon={<UserPlus size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedAsset(asset);
 setActiveModal("ASSIGN");
 }}
 color="hover:text-indigo-400 hover:bg-indigo-500/10 text-zinc-400"
 title="Allocate to User"
 />
 <ActionButton
 icon={<Wrench size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedAsset(asset);
 setActiveModal("CONDITION");
 }}
 color="hover:text-amber-400 hover:bg-amber-500/10 text-zinc-400"
 title="Update Condition"
 />
 </>
 )}

 {asset.status === "ALLOCATED" && (
 <ActionButton
 icon={<RotateCcw size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedAsset(asset);
 setActiveModal("RETURN");
 }}
 color="hover:text-purple-400 hover:bg-purple-500/10 text-zinc-400"
 title="Return to Stock"
 />
 )}

 {asset.status === "UNDER_MAINTENANCE" && (
 <ActionButton
 icon={<CheckSquare size={18} />}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedAsset(asset);
 setActiveModal("CONDITION");
 }}
 color="hover:text-emerald-400 hover:bg-emerald-500/100/10 text-zinc-400"
 title="Complete Repair"
 />
 )}

 <ActionButton
 icon={<Trash2 size={18} />}
 onClick={(e) => handleDelete(e, asset)}
 color="hover:text-rose-400 hover:bg-rose-500/10 text-zinc-400"
 title="Delete Asset"
 />
 </div>
 {/* Mobile-only status display, since it's hidden in the grid on small screens */}
 <div className="md:hidden col-span-2 flex items-center justify-between border-t border-zinc-800 pt-2 pb-0">
 <code className="text-[10px] font-bold text-zinc-400 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800 truncate">
 {asset.serialNumber}
 </code>
 <StatusBadge status={asset.status} />
 </div>
 </div>
 ))}
 </div>

 {/* 5. MODALS & SIDEBAR */}
 <AddAssetModal
 isOpen={activeModal === "ADD"}
 asset={selectedAsset}
 onClose={closeAllModals}
 onRefresh={() => fetchAssets(true)}
 />
 <AssignAssetModal
 isOpen={activeModal === "ASSIGN"}
 asset={selectedAsset}
 onClose={closeAllModals}
 onRefresh={() => fetchAssets(true)}
 />
 <ReturnAssetModal
 isOpen={activeModal === "RETURN"}
 asset={selectedAsset}
 onClose={closeAllModals}
 onRefresh={() => fetchAssets(true)}
 />
 <AssetConditionModal
 isOpen={activeModal === "CONDITION"}
 asset={selectedAsset}
 selectedIds={selectedIds} // Pass bulk IDs
 onClose={() => {
 closeAllModals();
 setSelectedIds([]); // Clear selection after bulk update
 }}
 onRefresh={() => fetchAssets(true)}
 />
 <AssetDetailsSidebar
 isOpen={isSidebarOpen}
 entityId={selectedAsset?._id}
 type="assets"
 onClose={() => {
 setSidebarOpen(false);
 setSelectedAsset(null);
 }}
 />
   <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} item={selectedAsset} type={selectedAsset ? "INCIDENT" : "ALLOCATION"} />
    </div>
 );
};

// --- Atomic Components ---
const ActionButton = ({ icon, onClick, color, title }) => (
 <button
 onClick={onClick}
 title={title}
 className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-95 ${color}`}
 >
 {icon}
 </button>
);

const StatusBadge = ({ status }) => {
 const themes = {
 READY_TO_DEPLOY:
 "bg-emerald-500/100/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
 ALLOCATED: 
 "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
 UNDER_MAINTENANCE:
 "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
 DECOMMISSIONED: 
 "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]",
 };

 const labels = {
 UNDER_MAINTENANCE: "Under Maintenance",
 DECOMMISSIONED: "Decommissioned",
 READY_TO_DEPLOY: "Ready to Deploy",
 ALLOCATED: "Allocated",
 };

 return (
 <span
 className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-widest shadow-sm transition-all inline-block truncate max-w-full ${
 themes[status] || "bg-zinc-700/50 text-zinc-300 border-zinc-700"
 }`}
 >
 {labels[status] || status}
 </span>
 );
};

export default AssetList;
