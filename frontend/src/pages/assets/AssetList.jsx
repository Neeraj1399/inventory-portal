import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  X,
  RefreshCw,
  ChevronDown,
  Filter,
  AlertCircle,
  MoreVertical,
  Laptop,
  Monitor,
  Smartphone,
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";

import RequestModal from "../../components/common/RequestModal";
import AddAssetModal from "../../components/assets/AddAssetModal";
import AssignAssetModal from "../../components/assets/AssignAssetModal";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import AssetConditionModal from "../../components/assets/AssetConditionModal";
import AssetDetailsSidebar from "../../components/assets/AssetDetailsSidebar";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/common/Pagination";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const AssetTableSkeleton = () => (
  <tbody className="divide-y divide-border animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i} className="border-b border-border last:border-0 h-[88px]">
        <td className="px-8 py-5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-bg-tertiary rounded-2xl" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-bg-tertiary rounded-md" />
              <div className="h-3 w-16 bg-bg-tertiary/50 rounded-md" />
            </div>
          </div>
        </td>
        <td className="px-8 py-5"><div className="h-5 w-24 bg-bg-tertiary/50 rounded-xl" /></td>
        <td className="px-8 py-5"><div className="flex justify-center"><div className="h-6 w-20 bg-bg-tertiary/30 rounded-full" /></div></td>
        <td className="px-8 py-5 text-right pr-10"><div className="flex justify-end"><div className="h-10 w-28 bg-bg-tertiary/50 rounded-2xl" /></div></td>
      </tr>
    ))}
  </tbody>
);

const AssetList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [categories, setCategories] = useState([]);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const debouncedCategory = useDebounce(categoryFilter, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 25;

  const [activeModal, setActiveModal] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Action dropdown state
  const [actionMenuAsset, setActionMenuAsset] = useState(null);
  const [actionMenuPos, setActionMenuPos] = useState({ top: 0, right: 0 });
  const actionMenuRef = useRef(null);

  const filterOptions = ["ALL", "READY_TO_DEPLOY", "ALLOCATED", "UNDER_MAINTENANCE", "DECOMMISSIONED"];

  const fetchAssets = useCallback(async (isSilent = false, signal, overrides = null) => {
    if (!isSilent) setLoading(true);
    try {
      const search = overrides?.search !== undefined ? overrides.search : debouncedSearch;
      const category = overrides?.category !== undefined ? (overrides.category === "ALL" ? "" : overrides.category) : (debouncedCategory === "ALL" ? "" : debouncedCategory);
      const status = overrides?.status !== undefined ? (overrides.status === "ALL" ? "" : overrides.status) : (statusFilter === "ALL" ? "" : statusFilter);
      const page = overrides?.page ?? currentPage;

      const res = await api.get(`/assets`, {
        signal,
        params: { page, limit: itemsPerPage, search, status, category },
      });

      if (res.data.status === "success") {
        setAssets(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.totalResults || 0);
        setError(null);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setError(err.response?.data?.message || "Failed to fetch assets");
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [currentPage, debouncedSearch, statusFilter, debouncedCategory]);

  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, debouncedCategory]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAssets(false, controller.signal);
    return () => controller.abort();
  }, [fetchAssets]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/assets/categories");
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuAsset(null);
      }
    };
    if (actionMenuAsset) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [actionMenuAsset]);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  const closeAllModals = () => { setActiveModal(null); setSelectedAsset(null); };

  const handleDelete = (e, asset) => {
    e?.stopPropagation();
    setAssetToDelete(asset);
    setIsConfirmOpen(true);
    setActionMenuAsset(null);
  };

  const executeDelete = async () => {
    if (assetToDelete) {
      const previousAssets = [...assets];
      setAssets((prev) => prev.filter((a) => a._id !== assetToDelete._id));
      try {
        await api.delete(`/assets/${assetToDelete._id}`);
        addToast(`Asset ${assetToDelete.serialNumber} deleted.`, "success");
      } catch (err) {
        if (err.response?.status !== 404) {
          setAssets(previousAssets);
          addToast(err.response?.data?.message || "Delete failed.", "error");
        }
      }
    }
    setIsConfirmOpen(false);
    setAssetToDelete(null);
  };

  const handleManualRefresh = () => {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);
    fetchAssets(false, null, { search: "", category: "ALL", status: "ALL", page: 1 });
  };

  const openActionMenu = (e, asset) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenuPos({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setActionMenuAsset(actionMenuAsset?._id === asset._id ? null : asset);
    setSelectedAsset(asset);
  };

  return (
    <>
      <PageTransition>
        <div className="max-w-[1600px] mx-auto pb-12 space-y-12">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 border-b border-bg-tertiary pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                Hardware <span className="text-accent-primary">Inventory</span>
              </h1>
              <p className="text-text-secondary font-medium text-sm">
                {loading ? "Refreshing..." : `${totalResults} Assets Registered`}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleManualRefresh}
                className="p-3.5 bg-bg-secondary border border-border rounded-2xl text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all shadow-premium active:scale-95"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
              {user?.roleAccess === "ADMIN" ? (
                <button
                  onClick={() => { setSelectedAsset(null); setActiveModal("ADD"); }}
                  className="flex-1 sm:flex-none bg-gradient-to-tr from-accent-primary to-accent-secondary hover:brightness-110 text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-[0.97] transition-all whitespace-nowrap border border-border shadow-glow text-[11px] uppercase tracking-[0.2em]"
                >
                  <Plus size={20} /> Add Asset
                </button>
              ) : (
                <button
                  onClick={() => { setSelectedAsset(null); setIsRequestModalOpen(true); }}
                  className="flex-1 sm:flex-none bg-gradient-to-tr from-accent-primary to-accent-secondary hover:brightness-110 text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-[0.97] transition-all whitespace-nowrap border border-border shadow-glow text-[11px] uppercase tracking-[0.2em]"
                >
                  <AlertCircle size={20} /> Request Allocation
                </button>
              )}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search Serial or Model..."
                className="w-full pl-12 pr-4 py-3.5 bg-bg-secondary border border-border rounded-2xl text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 transition-all outline-none text-sm shadow-premium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative w-full lg:w-64 group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Filter Category..."
                  className="w-full pl-12 pr-10 py-3.5 bg-bg-secondary border border-border rounded-2xl text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all shadow-premium text-sm"
                  value={categoryFilter === "ALL" ? "" : categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value || "ALL")}
                />
              </div>

              <div className="relative w-full lg:w-64">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 bg-bg-secondary border rounded-2xl transition-all shadow-premium text-text-primary ${isFilterDropdownOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"}`}
                >
                  <div className="flex items-center gap-3">
                    <Filter size={16} className={statusFilter !== "ALL" ? "text-accent-primary" : "text-text-muted"} />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-muted">
                      {statusFilter === "ALL" ? "Status"
                        : statusFilter === "READY_TO_DEPLOY" ? "Available"
                        : statusFilter === "ALLOCATED" ? "Allocated"
                        : statusFilter === "UNDER_MAINTENANCE" ? "Maintenance"
                        : statusFilter === "DECOMMISSIONED" ? "Retiring"
                        : statusFilter.replace(/_/g, " ")}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-text-disabled transition-transform duration-300 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isFilterDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
                    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {filterOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => { setStatusFilter(opt); setIsFilterDropdownOpen(false); }}
                          className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${statusFilter === opt ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}
                        >
                          {opt === "READY_TO_DEPLOY" ? "Available" : opt === "ALLOCATED" ? "Allocated" : opt === "UNDER_MAINTENANCE" ? "Maintenance" : opt === "DECOMMISSIONED" ? "Retiring" : opt.replace(/_/g, " ")}
                          {statusFilter === opt && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ASSET TABLE */}
          <div className="bg-bg-secondary rounded-2xl border border-border shadow-premium overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead className="bg-bg-tertiary/50 border-b border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                  <tr>
                    <th className="px-8 py-6">Asset Specification</th>
                    <th className="px-8 py-6">Identity</th>
                    <th className="px-8 py-6 text-center">Status</th>
                    <th className="px-8 py-6 text-right pr-12">Control</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <AssetTableSkeleton key="skeleton" />
                  ) : assets.length === 0 ? (
                    <motion.tbody key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-border">
                      <tr>
                        <td colSpan="4" className="py-24 text-center">
                          <div className="space-y-4">
                            <div className="w-16 h-16 bg-bg-tertiary rounded-3xl mx-auto flex items-center justify-center text-text-disabled/20 ring-1 ring-white/5">
                              <Search size={32} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-text-primary font-bold text-lg">No assets match your search</p>
                              <p className="text-text-muted text-sm max-w-xs mx-auto">Try refining your filters or search terms.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </motion.tbody>
                  ) : (
                    <motion.tbody key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-border">
                      {assets.map((asset) => (
                        <tr
                          key={asset._id}
                          onClick={() => { setSelectedAsset(asset); setSidebarOpen(true); }}
                          className="group cursor-pointer hover:bg-bg-tertiary/20 transition-all border-b border-border last:border-0 h-[88px]"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className="p-3 bg-bg-tertiary ring-1 ring-white/5 rounded-2xl text-text-muted group-hover:bg-accent-primary group-hover:text-white transition-all duration-300">
                                <CategoryIcon category={asset.category} />
                              </div>
                              <div className="space-y-1">
                                <div className="font-bold text-text-primary group-hover:text-white transition-colors text-sm">{asset.model}</div>
                                <div className="text-[9px] font-black text-accent-primary uppercase tracking-[0.2em]">{asset.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[11px] font-bold text-text-muted">{asset.serialNumber}</td>
                          <td className="px-8 py-5">
                            <div className="flex justify-center">
                              <StatusBadge status={asset.status} />
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right pr-10">
                            <button
                              onClick={(e) => openActionMenu(e, asset)}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-2xl transition-all active:scale-[0.97] font-black text-[10px] uppercase tracking-[0.2em] shadow-premium group/btn ${
                                actionMenuAsset?._id === asset._id
                                  ? "bg-accent-primary/10 border-accent-primary/40 text-accent-primary"
                                  : "bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary border-border"
                              }`}
                            >
                              <span>Actions</span>
                              <ChevronDown size={13} className={`transition-transform duration-200 ${actionMenuAsset?._id === asset._id ? "rotate-180 text-accent-primary" : "text-text-disabled"}`} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </motion.tbody>
                  )}
                </AnimatePresence>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalResults}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </PageTransition>

      {/* ── ALL MODALS & OVERLAYS OUTSIDE PageTransition ── */}

      {/* Action dropdown — anchored to the clicked button */}
      {actionMenuAsset && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setActionMenuAsset(null)} />
          <motion.div
            ref={actionMenuRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            style={{ top: actionMenuPos.top, right: actionMenuPos.right }}
            className="fixed z-[151] w-52 bg-bg-secondary border border-border rounded-2xl shadow-premium overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border bg-bg-tertiary/30">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate">{actionMenuAsset.model}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <MenuOption icon={<FileText size={15} />} label="View Receipt" onClick={() => { if (actionMenuAsset.receiptUrl) window.open(actionMenuAsset.receiptUrl, "_blank"); else addToast("No receipt found", "info"); setActionMenuAsset(null); }} />
              <MenuOption icon={<Edit3 size={15} />} label="Edit Details" onClick={() => { setSelectedAsset(actionMenuAsset); setActiveModal("ADD"); setActionMenuAsset(null); }} />
              <div className="h-px bg-border mx-2 my-1" />
              {actionMenuAsset.status === "READY_TO_DEPLOY" && (
                <>
                  <MenuOption icon={<UserPlus size={15} />} label="Allocate" onClick={() => { setSelectedAsset(actionMenuAsset); setActiveModal("ASSIGN"); setActionMenuAsset(null); }} color="text-accent-primary" />
                  <MenuOption icon={<Wrench size={15} />} label="Condition" onClick={() => { setSelectedAsset(actionMenuAsset); setActiveModal("CONDITION"); setActionMenuAsset(null); }} color="text-status-warning" />
                </>
              )}
              {actionMenuAsset.status === "ALLOCATED" && (
                <MenuOption icon={<RotateCcw size={15} />} label="Return" onClick={() => { setSelectedAsset(actionMenuAsset); setActiveModal("RETURN"); setActionMenuAsset(null); }} color="text-accent-secondary" />
              )}
              {actionMenuAsset.status === "UNDER_MAINTENANCE" && (
                <MenuOption icon={<Wrench size={15} />} label="Resolve Repair" onClick={() => { setSelectedAsset(actionMenuAsset); setActiveModal("CONDITION"); setActionMenuAsset(null); }} color="text-status-warning" />
              )}
              <div className="h-px bg-border mx-2 my-1" />
              <MenuOption icon={<Trash2 size={15} />} label="Delete" onClick={(e) => handleDelete(e, actionMenuAsset)} color="text-status-danger" />
            </div>
          </motion.div>
        </>
      )}

      <AddAssetModal isOpen={activeModal === "ADD"} asset={selectedAsset} onClose={closeAllModals} onRefresh={() => fetchAssets(true)} />
      <AssignAssetModal isOpen={activeModal === "ASSIGN"} asset={selectedAsset} onClose={closeAllModals} onRefresh={() => fetchAssets(true)} />
      <ReturnAssetModal isOpen={activeModal === "RETURN"} asset={selectedAsset} onClose={closeAllModals} onRefresh={() => fetchAssets(true)} />
      <AssetConditionModal isOpen={activeModal === "CONDITION"} asset={selectedAsset} onClose={closeAllModals} onRefresh={() => fetchAssets(true)} />
      <AssetDetailsSidebar isOpen={isSidebarOpen} entityId={selectedAsset?._id} type="assets" onClose={() => { setSidebarOpen(false); setSelectedAsset(null); }} />
      <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} item={selectedAsset} type={selectedAsset ? "INCIDENT" : "ALLOCATION"} />
      <ConfirmModal isOpen={isConfirmOpen} onConfirm={executeDelete} onCancel={() => setIsConfirmOpen(false)} title="Delete Asset" message={`Permanently delete this ${assetToDelete?.model}?`} confirmText="Delete Asset" />
    </>
  );
};

const CategoryIcon = ({ category }) => {
  const cat = (category || "").toUpperCase();
  const props = { size: 20 };
  if (cat.includes("LAPTOP")) return <Laptop {...props} />;
  if (cat.includes("MONITOR")) return <Monitor {...props} />;
  if (cat.includes("MOBILE")) return <Smartphone {...props} />;
  return <Package {...props} />;
};

const StatusBadge = ({ status }) => {
  const themes = {
    READY_TO_DEPLOY: "bg-status-success/10 text-status-success border-status-success/20",
    ALLOCATED: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    UNDER_MAINTENANCE: "bg-status-warning/10 text-status-warning border-status-warning/20",
    DECOMMISSIONED: "bg-status-danger/10 text-status-danger border-status-danger/20",
  };
  const labels = {
    READY_TO_DEPLOY: "Available",
    ALLOCATED: "Allocated",
    UNDER_MAINTENANCE: "Maintenance",
    DECOMMISSIONED: "Retiring",
  };
  return (
    <span className={`px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase border tracking-widest ${themes[status] || "bg-bg-tertiary text-text-disabled"}`}>
      {labels[status] || status}
    </span>
  );
};

const MenuOption = ({ icon, label, onClick, color = "text-text-primary" }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg-tertiary transition-all duration-150 text-left group"
  >
    <span className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${color}`}>{icon}</span>
    <span className={`text-[11px] font-bold tracking-wide ${color === "text-text-primary" ? "text-text-secondary group-hover:text-text-primary" : color}`}>
      {label}
    </span>
  </button>
);

export default AssetList;
