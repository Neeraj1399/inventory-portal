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
} from "lucide-react";
import api from "../../hooks/api";

// Component Imports
import AddAssetModal from "../../components/assets/AddAssetModal";
import AssignAssetModal from "../../components/assets/AssignAssetModal";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import AssetConditionModal from "../../components/assets/AssetConditionModal";
import AssetDetailsSidebar from "../../components/assets/AssetDetailsSidebar";

const AssetList = () => {
  // --- State Management ---
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);

  // UI State
  const [activeModal, setActiveModal] = useState(null); // 'ADD', 'ASSIGN', 'RETURN', 'CONDITION'
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterOptions = ["ALL", "AVAILABLE", "ASSIGNED", "REPAIR", "SCRAPPED"];

  // --- Data Fetching ---
  const fetchAssets = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get(`/assets`, {
        params: {
          category: "Laptop,Monitor",
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-tight">
          Syncing Inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-32 max-w-7xl mx-auto">
      {/* 1. FLOATING BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 px-2 py-0.5 rounded text-xs font-bold">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-slate-300">
              Selected
            </span>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-2" />

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
            className="hover:bg-slate-800 p-1.5 rounded-lg transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* 2. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Hardware
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {loading ? "Refreshing..." : `${assets.length} Assets Registered`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchAssets()}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setSelectedAsset(null);
              setActiveModal("ADD");
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-bold transition-all"
          >
            <Plus size={20} /> New Asset
          </button>
        </div>
      </div>

      {/* 3. CONTROLS (Search & Filter) */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search Serial or Model..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={`w-full flex items-center justify-between px-5 py-3 bg-white border rounded-2xl transition-all shadow-sm hover:border-slate-300 ${
              isFilterDropdownOpen
                ? "border-blue-500 ring-4 ring-blue-500/10"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <Filter
                size={16}
                className={
                  statusFilter !== "ALL" ? "text-blue-600" : "text-slate-400"
                }
              />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                {statusFilter === "ALL" ? "Filter by Status" : statusFilter}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFilterDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsFilterDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-between ${
                      statusFilter === opt
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    {opt}
                    {statusFilter === opt && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
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
        <div className="flex items-center gap-3 px-2">
          <button
            onClick={() =>
              setSelectedIds(
                selectedIds.length === filteredAssets.length
                  ? []
                  : filteredAssets.map((a) => a._id),
              )
            }
            className="text-slate-400 hover:text-blue-600 transition-colors"
          >
            {selectedIds.length === filteredAssets.length &&
            filteredAssets.length > 0 ? (
              <CheckSquare size={20} className="text-blue-600" />
            ) : (
              <Square size={20} />
            )}
          </button>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
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
            className={`flex flex-wrap md:flex-nowrap items-center bg-white p-5 rounded-3xl border transition-all cursor-pointer group ${
              selectedIds.includes(asset._id)
                ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500"
                : "border-slate-100 hover:border-blue-200 hover:shadow-xl"
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
              className="mr-5"
            >
              {selectedIds.includes(asset._id) ? (
                <CheckSquare size={22} className="text-blue-600" />
              ) : (
                <Square size={22} className="text-slate-200" />
              )}
            </div>

            <div className="flex-[3] flex items-center gap-5">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                  {asset.model}
                </h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                  {asset.category}
                </p>
              </div>
            </div>

            <div className="flex-[2] hidden lg:block">
              <code className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {asset.serialNumber}
              </code>
            </div>

            <div className="flex-[1] min-w-[120px]">
              <StatusBadge status={asset.status} />
            </div>

            {/* ACTION BUTTONS */}
            <div
              className="flex items-center gap-1 mt-4 md:mt-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionButton
                icon={<FileText size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (asset.receiptUrl) window.open(asset.receiptUrl, "_blank");
                  else alert("No receipt found.");
                }}
                color="hover:text-emerald-600 hover:bg-emerald-50"
                title="View Receipt"
              />
              <ActionButton
                icon={<Edit3 size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAsset(asset);
                  setActiveModal("ADD");
                }}
                color="hover:text-blue-600 hover:bg-blue-50"
                title="Edit Details"
              />

              {/* Status-specific Smart Actions */}
              {asset.status === "AVAILABLE" && (
                <>
                  <ActionButton
                    icon={<UserPlus size={18} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                      setActiveModal("ASSIGN");
                    }}
                    color="hover:text-indigo-600 hover:bg-indigo-50"
                    title="Assign to User"
                  />
                  <ActionButton
                    icon={<Wrench size={18} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAsset(asset);
                      setActiveModal("CONDITION");
                    }}
                    color="hover:text-amber-600 hover:bg-amber-50"
                    title="Update Condition"
                  />
                </>
              )}

              {asset.status === "ASSIGNED" && (
                <ActionButton
                  icon={<RotateCcw size={18} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAsset(asset);
                    setActiveModal("RETURN");
                  }}
                  color="hover:text-purple-600 hover:bg-purple-50"
                  title="Return to Stock"
                />
              )}

              {asset.status === "REPAIR" && (
                <ActionButton
                  icon={<CheckSquare size={18} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAsset(asset);
                    setActiveModal("CONDITION");
                  }}
                  color="hover:text-emerald-600 hover:bg-emerald-50"
                  title="Complete Repair"
                />
              )}

              <ActionButton
                icon={<Trash2 size={18} />}
                onClick={(e) => handleDelete(e, asset)}
                color="hover:text-rose-600 hover:bg-rose-50"
                title="Delete Asset"
              />
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
    </div>
  );
};

// --- Atomic Components ---
const ActionButton = ({ icon, onClick, color, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 text-slate-400 rounded-2xl transition-all duration-200 active:scale-90 ${color}`}
  >
    {icon}
  </button>
);

const StatusBadge = ({ status }) => {
  const themes = {
    AVAILABLE:
      "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50",
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100/50",
    REPAIR:
      "bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100/50",
    SCRAPPED: "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/50",
  };

  const labels = {
    REPAIR: "IN REPAIR",
    SCRAPPED: "SCRAPPED",
    AVAILABLE: "AVAILABLE",
    ASSIGNED: "ASSIGNED",
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border tracking-widest shadow-sm transition-all ${
        themes[status] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {labels[status] || status}
    </span>
  );
};

export default AssetList;
