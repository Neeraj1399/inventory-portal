import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Keyboard, Package,
  Plus,
  UserPlus,
  RotateCcw,
  AlertCircle,
  Search,
  RefreshCw,
  Trash2,
  ChevronDown,
  Laptop,
  Monitor,
  Smartphone,
  Printer,
  Headphones,
  MousePointer,
  Zap,
  Battery,
  PenTool,
  Wrench,
  CheckCircle,
  PlusCircle,
} from "lucide-react";

import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";

// Modals
import RequestModal from "../../components/common/RequestModal";
import AddConsumableModal from "../../components/consumables/AddConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import ConsumableConditionModal from "../../components/consumables/ConsumableConditionModal";
import ConsumableMaintenanceResolveModal from "../../components/consumables/ConsumableMaintenanceResolveModal";
import RestockConsumableModal from "../../components/consumables/RestockConsumableModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/common/Pagination";

// --- Custom Hooks ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    if (value === debouncedValue) return;
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay, debouncedValue]);
  return debouncedValue;
};

const ConsumableTableSkeleton = () => (
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
        <td className="px-8 py-5">
          <div className="h-5 w-24 bg-bg-tertiary/50 rounded-xl" />
        </td>
        <td className="px-8 py-5 border-x-0">
          <div className="flex flex-col items-center gap-1">
            <div className="h-6 w-8 bg-bg-tertiary rounded" />
            <div className="h-2 w-12 bg-bg-tertiary/30 rounded" />
          </div>
        </td>
        <td className="px-8 py-5">
          <div className="flex justify-center">
            <div className="h-6 w-24 bg-bg-tertiary/30 rounded-full" />
          </div>
        </td>
        <td className="px-8 py-5 text-right pr-10">
          <div className="flex justify-end gap-2">
             <div className="w-10 h-10 bg-bg-tertiary/50 rounded-2xl" />
             <div className="w-10 h-10 bg-bg-tertiary/50 rounded-2xl" />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

const itemsPerPage = 25;

const ConsumableList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // New states for custom confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [consumableToDelete, setConsumableToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const filterRef = useRef(null);

  const filterOptions = ["ALL", "READY_TO_DEPLOY", "LOW STOCK", "ALLOCATED", "UNDER_MAINTENANCE", "RESTOCK"];
  const statusLabels = {
    ALL: "All Statuses",
    READY_TO_DEPLOY: "Available",
    "LOW STOCK": "Low Stock",
    ALLOCATED: "Allocated",
    UNDER_MAINTENANCE: "Maintenance",
    RESTOCK: "Restock",
  };

  const fetchConsumables = useCallback(async (isSilent = false, signal, overrides = null) => {
    try {
      const search = overrides?.search !== undefined ? overrides.search : debouncedSearch;
      const status = overrides?.status !== undefined ? overrides.status : statusFilter;
      const page = overrides?.page ?? currentPage;

      if (!isSilent) setLoading(true);
      
      const res = await api.get("/consumables", { 
        signal,
        params: {
          page,
          limit: itemsPerPage,
          search,
          status
        }
      });

      if (res.data?.status === "success") {
        setItems(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotalResults(res.data.total || 0);
      }
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Fetch error:", err);
    } finally {
      // Small artificial delay to prevent skeleton flicker on fast networks
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchConsumables(false, controller.signal);
    return () => controller.abort();
  }, [fetchConsumables]);

  const handleManualRefresh = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setCurrentPage(1);
    fetchConsumables(false, null, { search: "", status: "ALL", page: 1 });
  };

  const handleDeleteClick = (item, allocated) => {
    if (allocated > 0) {
      addToast(`Cannot delete "${item.itemName}" while units are allocated to employees.`, "warning");
      return;
    }
    setConsumableToDelete(item);
    setIsConfirmOpen(true);
    setIsSuccess(false);
  };

  const handleConfirmDelete = async () => {
    if (!consumableToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/consumables/${consumableToDelete._id}`);
      setIsSuccess(true);
      setTimeout(() => {
        setIsConfirmOpen(false);
        fetchConsumables(true);
        setConsumableToDelete(null);
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete item.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items;

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);

  const openIssueModal = (item) => {
    setSelectedItem(item);
    setIsIssueModalOpen(true);
  };
  const closeIssueModal = () => {
    setSelectedItem(null);
    setIsIssueModalOpen(false);
  };

  const openReturnModal = (item) => {
    setSelectedItem(item);
    setIsReturnModalOpen(true);
  };
  const closeReturnModal = () => {
    setSelectedItem(null);
    setIsReturnModalOpen(false);
  };

  const openConditionModal = (item) => {
    setSelectedItem(item);
    setIsConditionModalOpen(true);
  };
  const closeConditionModal = () => {
    setSelectedItem(null);
    setIsConditionModalOpen(false);
  };

  const openResolveModal = (item) => {
    setSelectedItem(item);
    setIsResolveModalOpen(true);
  };
  const closeResolveModal = () => {
    setSelectedItem(null);
    setIsResolveModalOpen(false);
  };

  const openRestockModal = (item) => {
    setSelectedItem(item);
    setIsRestockModalOpen(true);
  };
  const closeRestockModal = () => {
    setSelectedItem(null);
    setIsRestockModalOpen(false);
  };

  const openRequestModal = (item) => {
    setSelectedItem(item);
    setIsRequestModalOpen(true);
  };
  const closeRequestModal = () => {
    setSelectedItem(null);
    setIsRequestModalOpen(false);
  };

  return (
    <PageTransition>
      <div className="flex flex-col w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-bg-tertiary">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Consumable <span className="text-accent-primary">Directory</span>
            </h1>
            <p className="text-text-secondary font-medium">
              Manage stock levels, allocations, and repairs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleManualRefresh}
              className="p-3.5 bg-bg-secondary border border-border rounded-2xl hover:bg-bg-tertiary hover:text-text-primary transition-all shadow-premium text-text-muted shrink-0 active:scale-95"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            {user?.roleAccess === "ADMIN" ? (
              <button
                onClick={openAddModal}
                className="flex-1 md:flex-none bg-gradient-to-tr from-accent-primary to-accent-secondary hover:brightness-110 text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-[0.97] transition-all whitespace-nowrap border border-border shadow-glow text-[11px] uppercase tracking-[0.2em]"
              >
                <Plus size={20} /> Add Item
              </button>
            ) : (
              <button
                onClick={openRequestModal}
                className="flex-1 md:flex-none bg-gradient-to-tr from-accent-primary to-accent-secondary hover:brightness-110 text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold active:scale-[0.97] transition-all whitespace-nowrap border border-border shadow-glow text-[11px] uppercase tracking-[0.2em]"
              >
                <AlertCircle size={20} /> Request
              </button>
            )}
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 w-full">
          <div className="flex-1 relative group w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or category..."
              className="w-full pl-12 pr-4 py-3.5 bg-bg-secondary border border-border rounded-2xl text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10 outline-none transition-all shadow-premium text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full md:w-auto shrink-0 min-w-[220px]" ref={filterRef}>
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`w-full flex items-center justify-between px-6 py-3.5 bg-bg-secondary border rounded-2xl transition-all shadow-premium text-text-primary ${
                isFilterDropdownOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate mr-2 text-text-muted">
                {statusLabels[statusFilter] || statusFilter}
              </span>
              <ChevronDown
                size={18}
                className={`transition-transform duration-300 text-text-disabled ${isFilterDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isFilterDropdownOpen && (
              <div className="absolute top-[calc(100%+10px)] right-0 w-full md:w-64 bg-bg-secondary border border-bg-tertiary rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 backdrop-blur-xl">
                {filterOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setStatusFilter(opt);
                      setIsFilterDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group ${
                      statusFilter === opt 
                        ? "bg-accent-primary/10 text-accent-primary" 
                        : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"
                    }`}
                  >
                    {statusLabels[opt] || opt}
                    {statusFilter === opt ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-text-disabled transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* INVENTORY LIST */}
        <div className="bg-bg-secondary rounded-2xl border border-border shadow-premium overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-bg-tertiary/50 border-b border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-8 py-6">Consumable Specifications</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6 text-center">In Stock</th>
                  <th className="px-8 py-6 text-center">Status Indicators</th>
                  <th className="px-8 py-6 text-right pr-12">Controls</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                {loading && items.length === 0 ? (
                  <ConsumableTableSkeleton key="skeleton" />
                ) : filteredItems.length === 0 ? (
                  <motion.tbody 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-border"
                  >
                    <tr>
                      <td colSpan="5" className="py-24 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-bg-tertiary rounded-3xl mx-auto flex items-center justify-center text-text-disabled/20 ring-1 ring-white/5">
                            <Search size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-text-primary font-bold text-lg">No items match your search</p>
                            <p className="text-text-muted text-sm max-w-xs mx-auto">Try refining your filters or search terms.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </motion.tbody>
                ) : (
                  <motion.tbody 
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-border relative"
                  >
                    {filteredItems.map((item) => {
                      const inMaintenance = item.maintenanceQuantity || 0;
                      const assignedQty = item.assignedQuantity || 0;
                      const totalQty = item.totalQuantity || 0;
                      const available = totalQty - assignedQty - inMaintenance;
                      const isLowStock = available <= (item.lowStockThreshold || 5);
                      const unitCost = item.unitCost || 0;

                      return (
                        <tr key={item._id} className="group hover:bg-bg-tertiary/20 transition-all border-b border-border last:border-0 cursor-default h-[88px]">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className={`p-3 rounded-2xl border transition-all duration-300 ${isLowStock ? "bg-status-warning/10 text-status-warning border-status-warning/20 shadow-glow" : "bg-bg-tertiary text-text-muted border-border shadow-inner group-hover:bg-accent-primary group-hover:text-white group-hover:border-transparent"}`}>
                                <CategoryIcon category={item.category} name={item.itemName} />
                              </div>
                              <div className="space-y-1">
                                <div className="font-bold text-text-primary group-hover:text-white transition-colors tracking-tight text-sm">{item.itemName}</div>
                                <div className="text-[9px] font-black text-status-success uppercase tracking-[0.2em]">
                                  ${unitCost.toFixed(0)} / per unit
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-[9px] font-black text-accent-secondary bg-accent-secondary/10 px-3.5 py-1.5 rounded-2xl border border-accent-secondary/20 uppercase tracking-[0.15em]">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`text-2xl font-black tabular-nums tracking-tighter ${isLowStock ? "text-status-warning" : "text-text-primary group-hover:text-white transition-colors"}`}>
                                {available}
                              </span>
                              <span className="text-[8px] font-black text-text-disabled uppercase tracking-[0.2em]">Inventory</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex justify-center gap-2">
                              {isLowStock && (
                                <span className="flex items-center gap-1.5 text-[8px] font-bold text-status-warning bg-status-warning/10 px-2.5 py-1.5 rounded-2xl border border-status-warning/20 uppercase tracking-widest">
                                  <AlertCircle size={10} /> Low
                                </span>
                              )}
                              {inMaintenance > 0 && (
                                <span className="flex items-center gap-1.5 text-[8px] font-bold text-accent-primary bg-accent-primary/10 px-2.5 py-1.5 rounded-2xl border border-accent-primary/20 uppercase tracking-widest">
                                  <Wrench size={10} /> {inMaintenance} Under Repair
                                </span>
                              )}
                              {!isLowStock && inMaintenance === 0 && (
                                <span className="flex items-center gap-1.5 text-[8px] font-bold text-status-success bg-status-success/10 px-2.5 py-1.5 rounded-2xl border border-status-success/20 uppercase tracking-widest">
                                  <CheckCircle size={10} /> Perfect
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right pr-10">
                            <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                              {user?.roleAccess === "ADMIN" && (
                                <>
                                  {inMaintenance > 0 && (
                                    <button onClick={() => openResolveModal(item)} className="p-3 rounded-2xl text-status-success bg-status-success/10 hover:bg-status-success/20 border border-status-success/20 active:scale-95 transition-all">
                                      <CheckCircle size={16} />
                                    </button>
                                  )}
                                  <button onClick={() => openConditionModal(item)} className="p-3 rounded-2xl text-status-warning bg-status-warning/10 hover:bg-status-warning/20 border border-status-warning/20 active:scale-95 transition-all">
                                    <Wrench size={16} />
                                  </button>
                                  <button disabled={available === 0} onClick={() => openIssueModal(item)} className="p-3 rounded-2xl text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 active:scale-95 transition-all disabled:opacity-20">
                                    <UserPlus size={16} />
                                  </button>
                                  <button onClick={() => openRestockModal(item)} className="p-3 rounded-2xl text-accent-secondary bg-accent-secondary/10 hover:bg-accent-secondary/20 border border-accent-secondary/20 active:scale-95 transition-all">
                                    <PlusCircle size={16} />
                                  </button>
                                  <button onClick={() => handleDeleteClick(item, assignedQty)} className="p-3 rounded-2xl text-status-danger bg-status-danger/10 hover:bg-status-danger hover:text-white border border-status-danger/30 active:scale-95 transition-all">
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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

        {/* MODAL LAYER */}
        <AddConsumableModal isOpen={isAddModalOpen} onClose={closeAddModal} onRefresh={() => fetchConsumables(true)} />
        <IssueConsumableModal isOpen={isIssueModalOpen} item={selectedItem} onClose={closeIssueModal} onRefresh={() => fetchConsumables(true)} />
        <ReturnConsumableModal isOpen={isReturnModalOpen} item={selectedItem} onClose={closeReturnModal} onRefresh={() => fetchConsumables(true)} />
        <ConsumableConditionModal isOpen={isConditionModalOpen} item={selectedItem} onClose={closeConditionModal} onRefresh={() => fetchConsumables(true)} />
        <ConsumableMaintenanceResolveModal isOpen={isResolveModalOpen} item={selectedItem} onClose={closeResolveModal} onRefresh={() => fetchConsumables(true)} />
        <RestockConsumableModal isOpen={isRestockModalOpen} item={selectedItem} onClose={closeRestockModal} onRefresh={() => fetchConsumables(true)} />
        <RequestModal isOpen={isRequestModalOpen} onClose={closeRequestModal} item={selectedItem} type="ALLOCATION" />

        <ConfirmModal 
          isOpen={isConfirmOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => !isDeleting && setIsConfirmOpen(false)}
          title="Delete Consumable"
          message={`Permanently delete "${consumableToDelete?.itemName}"?`}
          confirmText="Delete"
          isLoading={isDeleting}
          success={isSuccess}
        />
      </div>
    </PageTransition>
  );
};

const CategoryIcon = ({ category, name }) => {
  const cat = (category || "").toUpperCase();
  const itemName = (name || "").toUpperCase();
  const props = { size: 20 };
  if (cat.includes("LAPTOP") || itemName.includes("LAPTOP")) return <Laptop {...props} />;
  if (cat.includes("MONITOR") || itemName.includes("MONITOR")) return <Monitor {...props} />;
  if (cat.includes("MOBILE") || itemName.includes("PHONE")) return <Smartphone {...props} />;
  if (cat.includes("KEYBOARD")) return <Keyboard {...props} />;
  if (cat.includes("MOUSE")) return <MousePointer {...props} />;
  if (cat.includes("CABLE") || itemName.includes("CABLE")) return <Zap {...props} />;
  return <Package {...props} />;
};

export default ConsumableList;
