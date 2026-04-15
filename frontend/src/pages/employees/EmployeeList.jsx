import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  UserPlus,
  Mail,
  Laptop,
  Edit3,
  Package,
  ShieldCheck,
  Ban,
  RefreshCw,
  Search
} from "lucide-react";

import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";

import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../../components/employees/EditEmployeeModal";
import ManageAssetsModal from "../assets/ManageAssetsModal";
import ManageConsumablesModal from "../consumables/ManageConsumablesModal";
import ConfirmModal from "../../components/common/ConfirmModal";
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

const EmployeeTableSkeleton = () => (
  <tbody className="divide-y divide-border animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <tr key={i} className="border-b border-border last:border-0 h-[92px]">
        <td className="px-8 py-5">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 bg-bg-tertiary rounded-2xl" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-bg-tertiary rounded-md" />
              <div className="h-3 w-32 bg-bg-tertiary/50 rounded-md" />
            </div>
          </div>
        </td>
        <td className="px-8 py-5">
          <div className="h-6 w-12 bg-bg-tertiary/50 rounded-md" />
        </td>
        <td className="px-8 py-5">
          <div className="h-6 w-12 bg-bg-tertiary/50 rounded-md" />
        </td>
        <td className="px-8 py-5 text-right pr-12">
          <div className="flex justify-end gap-2">
             <div className="w-10 h-10 bg-bg-tertiary/50 rounded-2xl" />
             <div className="w-10 h-10 bg-bg-tertiary/50 rounded-2xl" />
             <div className="w-10 h-10 bg-bg-tertiary/50 rounded-2xl" />
          </div>
        </td>
      </tr>
    ))}
  </tbody>
);

const itemsPerPage = 25;

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewStatus, setViewStatus] = useState("ACTIVE");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isConsumableModalOpen, setIsConsumableModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    title: "",
    message: "",
    confirmText: "",
    type: "info",
    onConfirm: () => {},
  });
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [resetRequests, setResetRequests] = useState([]);
  const { addToast } = useToast();

  const fetchEmployees = useCallback(async (signal, overrides = null) => {
    try {
      const search = overrides?.search !== undefined ? overrides.search : debouncedSearch;
      const status = overrides?.status !== undefined ? overrides.status : viewStatus;
      const page = overrides?.page ?? currentPage;

      if (!overrides?.isSilent) setLoading(true);

      const res = await api.get("admin/employees", { 
        signal,
        params: {
          page,
          limit: itemsPerPage,
          search,
          status
        }
      });
      
      if (res.data?.status === "success") {
        setEmployees(res.data.data || []);
        setTotalPages(res.data.pages || 1);
        setTotalResults(res.data.total || 0);
      }
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Error fetching employees", err);
    } finally {
      // Artificial delay to prevent skeleton flicker
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [currentPage, debouncedSearch, viewStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, viewStatus]);

  const fetchResetRequests = useCallback(async (signal) => {
    try {
      const res = await api.get("admin/reset-requests", { signal });
      if (res.data?.status === "success") {
        setResetRequests(res.data.data || []);
      }
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Error fetching reset requests", err);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEmployees(controller.signal);
    fetchResetRequests(controller.signal);
    return () => controller.abort();
  }, [fetchEmployees, fetchResetRequests]);

  const handleManualRefresh = () => {
    setSearchTerm("");
    setViewStatus("ACTIVE");
    setCurrentPage(1);
    fetchEmployees(null, { search: "", status: "ACTIVE", page: 1 });
  };

  const handleToggleStatus = (id, currentStatus) => {
    if (currentStatus === "ACTIVE") {
      setConfirmConfig({
        title: "Initiate Offboarding?",
        message: "Deactivate employee. Verify all assets are returned first.",
        confirmText: "Offboard",
        type: "danger",
        onConfirm: async () => {
          try {
            await api.patch(`admin/employees/${id}/offboard`);
            addToast("Offboarded.", "success");
            fetchEmployees();
          } catch (err) {
            addToast("Failed to offboard.", "error");
          }
          setIsConfirmOpen(false);
        },
      });
    } else {
      setConfirmConfig({
        title: "Reactivate?",
        message: "Restore system access?",
        confirmText: "Reactivate",
        type: "info",
        onConfirm: async () => {
          try {
            await api.patch(`admin/employees/${id}`, { status: "ACTIVE" });
            addToast("Reactivated.", "success");
            fetchEmployees();
          } catch (err) {
            addToast("Failed to reactivate.", "error");
          }
          setIsConfirmOpen(false);
        },
      });
    }
    setIsConfirmOpen(true);
  };

  const handleApproveReset = (email) => {
    setConfirmConfig({
      title: "Approve Reset?",
      message: `Send reset link to ${email}?`,
      confirmText: "Approve",
      type: "warning",
      onConfirm: async () => {
        try {
          await api.post("admin/forgot-password", { email });
          addToast("Reset link sent.", "success");
          fetchResetRequests();
        } catch (err) {
          addToast("Failed to approve.", "error");
        }
        setIsConfirmOpen(false);
      },
    });
    setIsConfirmOpen(true);
  };

  const handleRejectReset = (id) => {
    setConfirmConfig({
      title: "Reject Request?",
      message: "Clear this security exception?",
      confirmText: "Reject",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.patch(`admin/reset-requests/${id}/reject`);
          addToast("Rejected.", "success");
          fetchResetRequests();
        } catch (err) {
          addToast("Failed to reject.", "error");
        }
        setIsConfirmOpen(false);
      },
    });
    setIsConfirmOpen(true);
  };

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const openEditModal = (emp) => { setSelectedEmployee(emp); setIsEditModalOpen(true); };
  const closeEditModal = () => { setSelectedEmployee(null); setIsEditModalOpen(false); };
  const openAssetModal = (emp) => { setSelectedEmployee(emp); setIsAssetModalOpen(true); };
  const closeAssetModal = () => { setSelectedEmployee(null); setIsAssetModalOpen(false); };
  const openConsumableModal = (emp) => { setSelectedEmployee(emp); setIsConsumableModalOpen(true); };
  const closeConsumableModal = () => { setSelectedEmployee(null); setIsConsumableModalOpen(false); };

  return (
    <PageTransition>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 pb-8 border-b border-bg-tertiary text-sans">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Employee <span className="text-accent-primary">Directory</span>
            </h1>
            <p className="text-text-secondary font-medium text-sm">Organization directory and lifecycle management</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleManualRefresh}
                className="p-3.5 shrink-0 bg-bg-secondary border border-border rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-premium active:scale-95"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              </button>
              <div className="relative flex-1 sm:w-72 group">
                <input
                  type="text"
                  placeholder="Lookup Name or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-secondary border border-border rounded-2xl px-5 py-3.5 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary transition-all pl-12 shadow-premium"
                />
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary" />
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-tr from-accent-primary to-accent-secondary text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-3 font-bold active:scale-[0.97] transition-all border border-border shadow-glow text-[11px] tracking-[0.2em]"
            >
              <UserPlus size={20} /> Add Employee
            </button>
          </div>
        </div>

        {/* Reset Requests Section */}
        <AnimatePresence>
          {resetRequests.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-bg-secondary border border-border rounded-2xl p-8 mb-4 shadow-premium relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-status-warning/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
              <div className="flex items-center gap-5 mb-8 relative">
                <div className="p-4 bg-status-warning/10 text-status-warning ring-1 ring-status-warning/20 rounded-2xl shadow-glow">
                  <ShieldCheck size={28} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight">Pending <span className="text-status-warning">Security Approvals</span></h2>
                  <p className="text-text-secondary font-medium">{resetRequests.length} recovery requests pending</p>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 relative font-sans">
                {resetRequests.map((req) => (
                  <div key={req._id} className="bg-bg-tertiary/40 border border-border rounded-2xl p-6 flex flex-col justify-between hover:bg-bg-tertiary/60 transition-all group/card">
                    <div className="mb-6">
                      <div className="font-bold text-text-primary text-xl tracking-tight group-hover/card:text-white">{req.name}</div>
                      <div className="text-sm text-text-muted mb-4">{req.email}</div>
                      <div className="flex gap-2">
                        <span className="bg-bg-tertiary text-[9px] font-black text-accent-primary px-2.5 py-1.5 rounded-xl border border-border tracking-widest">{req.role}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleApproveReset(req.email)} className="flex-1 bg-status-warning/10 hover:bg-status-warning text-status-warning hover:text-white font-black py-3 rounded-2xl text-[10px] tracking-widest active:scale-95 transition-all">Approve</button>
                      <button onClick={() => handleRejectReset(req._id)} className="px-5 bg-bg-secondary border border-border text-text-muted hover:text-status-danger transition-all py-3 rounded-2xl text-[10px] font-black tracking-widest">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Directory Table */}
        <div className="bg-bg-secondary rounded-2xl border border-border shadow-premium overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-bg-tertiary/50 border-b border-border text-[10px] font-black tracking-[0.2em] text-text-muted">
                <tr>
                  <th className="px-8 py-6">Identity & Authorization</th>
                  <th className="px-8 py-6">Hardware</th>
                  <th className="px-8 py-6">Inventory</th>
                  <th className="px-8 py-6 text-right pr-12">Controls</th>
                </tr>
              </thead>
              <AnimatePresence mode="wait">
                {loading && employees.length === 0 ? (
                  <EmployeeTableSkeleton key="skeleton" />
                ) : employees.length === 0 ? (
                  <motion.tbody 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="divide-y divide-border"
                  >
                    <tr>
                      <td colSpan="4" className="py-24 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-bg-tertiary rounded-3xl mx-auto flex items-center justify-center text-text-disabled/20 ring-1 ring-white/5">
                            <Search size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-text-primary font-bold text-lg">Empty Directory</p>
                            <p className="text-text-muted text-sm max-w-xs mx-auto">No employees found matching your criteria.</p>
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
                    className="divide-y divide-border"
                  >
                    {employees.map((emp) => {
                      const hasItemsAssigned = (emp.assignedAssetsCount || 0) > 0 || (emp.assignedConsumablesCount || 0) > 0;
                      return (
                        <tr key={emp._id} className="group hover:bg-bg-tertiary/20 transition-all border-b border-border last:border-0 h-[92px]">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 bg-bg-tertiary ring-1 ring-white/10 text-accent-primary rounded-2xl flex items-center justify-center font-bold text-xl transition-all duration-300 group-hover:shadow-glow group-hover:scale-105">
                                {emp.name?.charAt(0) || "U"}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-text-primary group-hover:text-white transition-colors tracking-tight text-lg">{emp.name}</span>
                                  {emp.roleAccess === "ADMIN" && <span className="text-[9px] bg-accent-primary/10 text-accent-primary ring-1 ring-accent-primary/20 px-2.5 py-1 rounded-2xl font-black tracking-widest">Admin</span>}
                                </div>
                                <div className="text-xs font-medium text-text-muted flex items-center gap-2">
                                  <Mail size={12} className="text-accent-primary opacity-60" />
                                  {emp.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className={`flex items-center group-hover:scale-110 transition-transform gap-3 text-lg font-black tabular-nums tracking-tighter ${emp.assignedAssetsCount > 0 ? "text-status-warning" : "text-text-disabled"}`}>
                               <Laptop size={18} /> <span>{emp.assignedAssetsCount || 0}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                             <div className={`flex items-center group-hover:scale-110 transition-transform gap-3 text-lg font-black tabular-nums tracking-tighter ${emp.assignedConsumablesCount > 0 ? "text-status-success" : "text-text-disabled"}`}>
                               <Package size={18} /> <span>{emp.assignedConsumablesCount || 0}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-right pr-12">
                            <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                              {emp.status === "ACTIVE" && (
                                <>
                                  <button onClick={() => openAssetModal(emp)} className="p-3 rounded-2xl text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 transition-all active:scale-90 border border-accent-primary/20 shadow-sm" title="Assets"><Laptop size={16} /></button>
                                  <button onClick={() => openConsumableModal(emp)} className="p-3 rounded-2xl text-status-success bg-status-success/10 hover:bg-status-success/20 transition-all active:scale-90 border border-status-success/20 shadow-sm" title="Items"><Package size={16} /></button>
                                  <button onClick={() => openEditModal(emp)} className="p-3 rounded-2xl text-text-muted bg-bg-tertiary border border-border active:scale-90 transition-all hover:text-text-primary" title="Edit"><Edit3 size={16} /></button>
                                  <button disabled={hasItemsAssigned} onClick={() => handleToggleStatus(emp._id, emp.status)} className={`p-3 rounded-2xl transition-all border active:scale-90 ${hasItemsAssigned ? "border-border text-text-disabled bg-bg-tertiary opacity-50 cursor-not-allowed" : "text-status-danger bg-status-danger/10 border-status-danger/20 hover:bg-status-danger hover:text-white"}`} title="Offboard"><Ban size={16} /></button>
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
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Modals */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={closeAddModal} onRefresh={() => fetchEmployees(null)} />
      <EditEmployeeModal isOpen={isEditModalOpen} onClose={closeEditModal} employeeData={selectedEmployee} onRefresh={() => fetchEmployees(null)} />
      <ManageAssetsModal isOpen={isAssetModalOpen} employee={selectedEmployee} onClose={closeAssetModal} onRefresh={() => fetchEmployees(null)} />
      <ManageConsumablesModal isOpen={isConsumableModalOpen} employee={selectedEmployee} onClose={closeConsumableModal} onRefresh={() => fetchEmployees(null)} />
      <ConfirmModal isOpen={isConfirmOpen} onConfirm={confirmConfig.onConfirm} onCancel={() => setIsConfirmOpen(false)} title={confirmConfig.title} message={confirmConfig.message} confirmText={confirmConfig.confirmText} type={confirmConfig.type} />
    </PageTransition>
  );
};

export default EmployeeList;
