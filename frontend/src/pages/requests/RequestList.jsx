import React, { useEffect, useState, useCallback } from "react";
import { 
  ClipboardList, 
  Plus, MessageSquare, 
  Clock, 
  User,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  TrendingUp,
  Filter,
  ChevronDown
} from "lucide-react";
import api from "../../services/api";
import RequestModal from "../../components/common/RequestModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import ReasonModal from "../../components/common/ReasonModal";
import PriorityModal from "../../components/common/PriorityModal";
import { useAuth } from "../../context/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import Pagination from "../../components/common/Pagination";
import { motion, AnimatePresence } from "framer-motion";

// Premium Primitives
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import PageTransition from "../../components/common/PageTransition";

// --- Custom Hooks ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const RequestCardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="h-[420px] bg-bg-secondary/50 border-border relative overflow-hidden">
        <div className="space-y-8 p-1">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
                <div className="h-5 w-16 bg-bg-tertiary rounded-full" />
              </div>
              <div className="h-8 w-2/3 bg-bg-tertiary rounded-lg" />
            </div>
            <div className="h-6 w-20 bg-bg-tertiary rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-bg-tertiary/50 rounded" />
            <div className="h-4 w-5/6 bg-bg-tertiary/50 rounded" />
          </div>
          <div className="h-16 w-full bg-bg-tertiary/30 rounded-2xl" />
          <div className="flex justify-between items-center py-6 border-y border-border">
             <div className="flex gap-8">
                <div className="h-10 w-24 bg-bg-tertiary/40 rounded-xl" />
                <div className="h-10 w-24 bg-bg-tertiary/40 rounded-xl" />
             </div>
          </div>
          <div className="h-14 w-full bg-bg-tertiary/20 rounded-2xl" />
        </div>
      </Card>
    ))}
  </div>
);

const itemsPerPage = 20;

const RequestList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 500);
  const isAdmin = user?.roleAccess === "ADMIN";
  
  // Pagination & Multi-Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [reasonModalMode, setReasonModalMode] = useState("INPUT");
  const [selectedReq, setSelectedReq] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchRequests = useCallback(async (overrides = null) => {
    try {
      const search = overrides?.search !== undefined ? overrides.search : debouncedSearch;
      const status = overrides?.status !== undefined ? overrides.status : statusFilter;
      const page = overrides?.page ?? currentPage;

      if (!overrides?.isSilent) setLoading(true);

      const res = await api.get("/requests", {
        params: {
          page,
          limit: itemsPerPage,
          search,
          status
        }
      });
      if (res.data?.status === "success") {
        setRequests(Array.isArray(res.data.data) ? res.data.data : []);
        setTotalPages(res.data.pages || 1);
        setTotalResults(res.data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setRequests([]);
    } finally {
      // Small delay to prevent flicker
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const handleManualRefresh = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCurrentPage(1);
    fetchRequests({ search: "", status: "", page: 1 });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests();
    return () => controller.abort();
  }, [fetchRequests]);

  const handleStatusUpdate = async (id, status, note = "") => {
    if (status === "REJECTED" && !note && isAdmin) {
      const targetReq = requests.find(r => r._id === id);
      setSelectedReq(targetReq);
      setReasonModalMode("INPUT");
      setIsReasonModalOpen(true);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const targetReq = requests.find(r => r._id === id);
      await api.patch(`/requests/${id}`, { status, adminNote: note });
      addToast(`Ticket "${targetReq?.title || "Update"}" ${status.toLowerCase()} successfully`, "success");
      setIsReasonModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
      addToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePriorityUpdate = async (priority) => {
    if (!selectedReq) return;
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/requests/${selectedReq._id}`, { priority });
      addToast(`Priority updated to ${priority} for "${selectedReq.title}"`, "success");
      setIsPriorityModalOpen(false);
      fetchRequests();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update priority", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
    setIsSuccess(false);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/requests/${deletingId}`);
      setIsSuccess(true);
      fetchRequests();
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setIsSuccess(false);
        setDeletingId(null);
      }, 2000);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete request", "error");
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "PENDING": return "warning";
      case "APPROVED": return "info";
      case "REJECTED": return "danger";
      case "FULFILLED": return "success";
      default: return "muted";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "HIGH": return "danger";
      case "MEDIUM": return "warning";
      case "LOW": return "info";
      default: return "muted";
    }
  };

  return (
    <PageTransition className="space-y-12 max-w-[1600px] mx-auto pb-12 relative z-0">
      <PageHeader 
        title="Ticketing"
        subtitle={loading ? "Synchronizing service records..." : `${totalResults} Total Service Entries`}
        icon={ClipboardList}
        action={
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualRefresh}
              icon={RefreshCw}
              className={loading ? "animate-spin" : ""}
            />
            {isAdmin ? (
              <Link to="/requests/stats">
                <Button variant="secondary" icon={TrendingUp}>Analytics</Button>
              </Link>
            ) : (
              <Button
                onClick={() => setIsAddModalOpen(true)}
                icon={Plus}
              >
                New Ticket
              </Button>
            )}
          </div>
        }
      />

      <Card className="p-6 !overflow-visible">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <Input 
              icon={Search}
              placeholder="Search by ID, title, or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative min-w-[240px]">
            <button
              onClick={() => setIsStatusOpen(o => !o)}
              className={`w-full flex items-center justify-between px-5 h-14 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isStatusOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"}`}
            >
              <div className="flex items-center gap-3">
                <Filter size={16} className={statusFilter ? "text-accent-primary" : "text-text-muted"} />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-text-muted">
                  {statusFilter === "" ? "All Statuses"
                    : statusFilter === "PENDING" ? "Pending Approval"
                    : statusFilter === "APPROVED" ? "Approved"
                    : statusFilter === "FULFILLED" ? "Fulfilled"
                    : statusFilter === "REJECTED" ? "Rejected"
                    : statusFilter}
                </span>
              </div>
              <ChevronDown size={18} className={`text-text-disabled transition-transform duration-300 ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>
            {isStatusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStatusOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    { value: "", label: "All Statuses" },
                    { value: "PENDING", label: "Pending Approval" },
                    { value: "APPROVED", label: "Approved" },
                    { value: "FULFILLED", label: "Fulfilled" },
                    { value: "REJECTED", label: "Rejected" },
                  ].map(({ value, label }) => (
                    <button key={value || "__all"} onClick={() => { setStatusFilter(value); setIsStatusOpen(false); }}
                      className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${statusFilter === value ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                      {label}
                      {statusFilter === value && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {loading && requests.length === 0 ? (
          <RequestCardSkeleton key="skeleton" />
        ) : requests.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="py-32 flex flex-col items-center justify-center space-y-6">
              <div className="p-8 bg-bg-elevated rounded-full text-text-disabled shadow-inner">
                <ClipboardList size={64} />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="text-text-primary font-black text-xl tracking-tight uppercase">No records found</h3>
                <p className="text-text-muted text-sm font-medium">Try adjusting your filters or search criteria.</p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {requests.map((req) => (
              req?._id ? (
                <Card key={req._id} className="group hover:border-accent-primary/30 relative h-full flex flex-col justify-between">
                  <div className="space-y-8 h-full">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getPriorityVariant(req.priority)}>
                            {req.priority || "MEDIUM"}
                          </Badge>
                          <Badge variant="info">
                            {req.category || "General"}
                          </Badge>
                          <Badge variant={req.requestType === 'NEW' ? 'success' : 'warning'}>
                            {req.requestType || "NEW"}
                          </Badge>
                        </div>
                        <h3 className="text-2xl font-black text-text-primary leading-tight group-hover:text-white transition-colors tracking-tight">
                          {req.title}
                        </h3>
                      </div>
                      <Badge variant={getStatusVariant(req.status)} className="px-5 py-2 uppercase font-black tracking-widest text-[10px]">
                        {req.status}
                      </Badge>
                    </div>

                    <p className="text-text-secondary text-sm line-clamp-2 leading-relaxed font-medium">
                      {req.description}
                    </p>

                    <div className="space-y-6">
                      {req.itemId && (
                        <div className="flex items-center gap-5 p-5 bg-bg-elevated/50 rounded-2xl border border-border hover:bg-bg-elevated transition-colors">
                          <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/10">
                            <MessageSquare size={20} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-text-disabled uppercase tracking-widest">Resource Allocation</p>
                            <p className="text-base text-text-primary font-black tracking-tight">{req.itemId?.model || req.itemId?.itemName || "Unknown Resource"}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-6 border-y border-border">
                        <div className="flex flex-wrap items-center gap-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary border border-accent-secondary/10">
                              <User size={18} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-text-disabled uppercase tracking-widest">Requester</p>
                              <p className="text-sm font-bold text-text-primary">{isAdmin ? (req.employeeId?.name || "Unregistered") : "Self"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-bg-tertiary flex items-center justify-center text-text-muted border border-border">
                              <Clock size={18} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-black text-text-disabled uppercase tracking-widest">Submitted</p>
                              <p className="text-sm font-bold text-text-primary">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Date N/A"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {req.status === "REJECTED" && req.adminNote && (
                            <IconButton onClick={() => { setSelectedReq(req); setReasonModalMode("VIEW"); setIsReasonModalOpen(true); }} icon={Eye} variant="secondary" tooltip="View Reason" />
                          )}
                          {(isAdmin || (!isAdmin && req.status === "PENDING")) && (
                            <IconButton onClick={() => handleDelete(req._id)} icon={Trash2} variant="danger" tooltip="Discard" />
                          )}
                        </div>
                      </div>
                    </div>
    
                    {isAdmin && (req.status === "PENDING" || req.status === "APPROVED") && (
                      <div className="space-y-4 pt-4">
                        <Button variant="secondary" onClick={() => { setSelectedReq(req); setIsPriorityModalOpen(true); }} className="w-full h-14 bg-bg-elevated/50 font-black text-[11px]" icon={TrendingUp}>Update Priority</Button>
                        <div className="flex gap-4">
                          {req.status === "PENDING" && (
                            <>
                              <Button onClick={() => handleStatusUpdate(req._id, "APPROVED")} className="flex-1 h-14 uppercase tracking-widest text-[10px] font-black">Approve</Button>
                              <Button variant="secondary" onClick={() => handleStatusUpdate(req._id, "REJECTED")} className="flex-1 h-14 font-black text-[10px] uppercase tracking-widest text-status-danger border-status-danger/30 hover:bg-status-danger hover:text-white shadow-lg active:scale-95 transition-all">Reject</Button>
                            </>
                          )}
                          {req.status === "APPROVED" && (
                            <Button onClick={() => handleStatusUpdate(req._id, "FULFILLED")} className="w-full h-14 bg-gradient-to-tr from-status-success to-emerald-600 border-none font-black text-[11px] uppercase tracking-widest">Mark Fulfilled</Button>
                          )}
                        </div>
                      </div>
                    )}

                    {req.adminNote && (
                      <div className="p-5 bg-accent-primary/5 rounded-2xl border border-accent-primary/20 relative mt-4">
                        <p className="text-[10px] font-black text-accent-primary uppercase tracking-widest mb-1 opacity-80">Admin Note</p>
                        <p className="text-sm text-text-secondary italic">"{req.adminNote}"</p>
                      </div>
                    )}
                  </div>
                </Card>
              ) : null
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />

      <RequestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={() => fetchRequests()} />
      <ConfirmModal isOpen={isDeleteModalOpen} title="Discard Ticket" message="Permanently remove this ticket?" confirmText="Delete" onConfirm={confirmDelete} onCancel={() => setIsDeleteModalOpen(false)} isLoading={isDeleting} type="danger" success={isSuccess} />
      <ReasonModal isOpen={isReasonModalOpen} onClose={() => setIsReasonModalOpen(false)} onConfirm={(note) => handleStatusUpdate(selectedReq?._id, "REJECTED", note)} mode={reasonModalMode} title={reasonModalMode === "INPUT" ? "Resolution Required" : "Ticket Record"} description={reasonModalMode === "INPUT" ? `Reason for rejecting "${selectedReq?.title}".` : `Admin feedback for "${selectedReq?.title}"`} initialValue={selectedReq?.adminNote || ""} isLoading={isUpdatingStatus} />
      <PriorityModal isOpen={isPriorityModalOpen} onClose={() => setIsPriorityModalOpen(false)} onConfirm={handlePriorityUpdate} initialPriority={selectedReq?.priority || "MEDIUM"} isLoading={isUpdatingStatus} />
    </PageTransition>
  );
};

const IconButton = ({ icon: Icon, onClick, variant, tooltip, disabled }) => {
  const styles = {
    primary: "text-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10 border-accent-primary/10",
    secondary: "text-text-muted bg-bg-tertiary hover:bg-bg-tertiary/70 border-border",
    danger: "text-status-danger bg-status-danger/5 hover:bg-status-danger/10 border-status-danger/20",
  };
  return (
    <button onClick={onClick} disabled={disabled} title={tooltip} className={`p-3 rounded-2xl border transition-all active:scale-90 disabled:opacity-20 shadow-sm ${styles[variant]}`}>
      <Icon size={18} />
    </button>
  );
};

export default RequestList;
