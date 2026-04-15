import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  History,
  User,
  Clock,
  Terminal,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Calendar,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { getAuditLogs } from "../../services/auditService";
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

const AuditLogSkeleton = () => (
  <div className="divide-y divide-border animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-8 flex gap-10">
        <div className="hidden md:flex flex-col items-center w-14 shrink-0 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-bg-tertiary" />
          <div className="w-px flex-1 bg-bg-tertiary mt-10" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-24 bg-bg-tertiary rounded-full" />
              <div className="h-6 w-16 bg-bg-tertiary/50 rounded-full" />
            </div>
            <div className="h-4 w-32 bg-bg-tertiary/30 rounded" />
          </div>
          <div className="h-7 w-3/4 bg-bg-tertiary rounded-lg" />
          <div className="h-12 w-48 bg-bg-tertiary/20 rounded-2xl" />
        </div>
      </div>
    ))}
  </div>
);

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d) ? "N/A" : d.toLocaleString();
};

const escapeCSV = (val) => {
  const str = String(val ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

const convertToCSV = (logs) => {
  if (!logs.length) return "";
  const headers = ["Action", "Performed By", "Target Employee", "Entity Type", "Description", "Timestamp", "IP Address"];
  const rows = logs.map((log) => [
    log.action,
    log.performedBy?.name || "System",
    log.targetEmployee?.name || "N/A",
    log.entityType || "N/A",
    log.description || "",
    log.createdAt || log.timestamp,
    log.ipAddress || "Internal",
  ]);
  return [headers, ...rows].map((r) => r.map(escapeCSV).join(",")).join("\n");
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isEntityOpen, setIsEntityOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 50;
  
  const debouncedSearch = useDebounce(search, 500);

  const fetchLogs = useCallback(async (overrides = null) => {
    try {
      const s = overrides?.search !== undefined ? overrides.search : debouncedSearch;
      const action = overrides?.action !== undefined ? overrides.action : actionFilter;
      const user = overrides?.user !== undefined ? overrides.user : userFilter;
      const entityType = overrides?.entityType !== undefined ? overrides.entityType : entityFilter;
      const date = overrides?.date !== undefined ? overrides.date : dateFilter;
      const page = overrides?.page ?? currentPage;

      if (!overrides?.isSilent) setLoading(true);

      const response = await getAuditLogs(page, itemsPerPage, {
        search: s,
        action: action,
        user: user,
        entityType: entityType,
        date: date
      });
      
      if (response) {
        setLogs(response.data || []);
        setTotalPages(response.pages || 1);
        setTotalResults(response.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // Small artificial delay to prevent flicker
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [currentPage, debouncedSearch, actionFilter, userFilter, entityFilter, dateFilter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs();
    return () => controller.abort();
  }, [fetchLogs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, actionFilter, userFilter, entityFilter, dateFilter]);

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setUserFilter("");
    setEntityFilter("");
    setDateFilter("");
    setCurrentPage(1);
    fetchLogs({ search: "", action: "", user: "", entityType: "", date: "", page: 1 });
  };

  const hasActiveFilters = !!(search || actionFilter || userFilter || entityFilter || dateFilter);

  const downloadCSV = () => {
    const csv = convertToCSV(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_ledger_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PageTransition className="space-y-12 max-w-[1600px] mx-auto pb-12 relative z-0">
      <PageHeader 
        title="Audit Ledger"
        subtitle={loading ? "Synchronizing immutable records..." : `${totalResults} System Events Recorded`}
        icon={History}
        action={
          <div className="flex items-center gap-4">
            <button
              onClick={clearFilters}
              className="p-3.5 bg-bg-secondary border border-border rounded-2xl text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all shadow-premium active:scale-95"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <Button variant="secondary" onClick={downloadCSV} icon={Download}>Export CSV</Button>
          </div>
        }
      />

      <Card className="p-6 !overflow-visible">
        <div className="space-y-4">
          <div className="w-full">
            <Input icon={Search} placeholder="Search by activity, user, or description..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 h-14 bg-bg-elevated border border-border rounded-2xl px-4 transition-all focus-within:border-accent-primary">
            <Calendar size={16} className="text-text-muted shrink-0 cursor-pointer hover:text-accent-primary transition-colors" onClick={(e) => e.currentTarget.closest('div').querySelector('input')?.showPicker?.()} />
            <input type="date" className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none [color-scheme:dark] min-w-0" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
          <div className="relative">
            <button
              onClick={() => { setIsActionOpen(o => !o); setIsUserOpen(false); setIsEntityOpen(false); }}
              className={`w-full flex items-center justify-between px-5 h-14 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isActionOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"}`}
            >
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-text-muted">
                {actionFilter || "All Actions"}
              </span>
              <ChevronDown size={18} className={`text-text-disabled transition-transform duration-300 ${isActionOpen ? "rotate-180" : ""}`} />
            </button>
            {isActionOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsActionOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-y-auto max-h-[205px] custom-scrollbar">
                    {["", ...Array.from(new Set(logs.map(l => l.action))).filter(Boolean)].map(a => (
                      <button key={a || "__all"} onClick={() => { setActionFilter(a); setIsActionOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black tracking-widest transition-all flex items-center justify-between ${actionFilter === a ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                        {a || "All Actions"}
                        {actionFilter === a && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setIsUserOpen(o => !o); setIsActionOpen(false); setIsEntityOpen(false); }}
              className={`w-full flex items-center justify-between px-5 h-14 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isUserOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"}`}
            >
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-text-muted">
                {userFilter || "All Users"}
              </span>
              <ChevronDown size={18} className={`text-text-disabled transition-transform duration-300 ${isUserOpen ? "rotate-180" : ""}`} />
            </button>
            {isUserOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsUserOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-y-auto max-h-[205px] custom-scrollbar">
                    {["", ...Array.from(new Set(logs.map(l => l.performedBy?.name).filter(Boolean)))].map(u => (
                      <button key={u || "__all"} onClick={() => { setUserFilter(u); setIsUserOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black tracking-widest transition-all flex items-center justify-between ${userFilter === u ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                        {u || "All Users"}
                        {userFilter === u && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => { setIsEntityOpen(o => !o); setIsActionOpen(false); setIsUserOpen(false); }}
              className={`w-full flex items-center justify-between px-5 h-14 bg-bg-elevated border rounded-2xl transition-all text-text-primary ${isEntityOpen ? "border-accent-primary/50 ring-4 ring-accent-primary/10" : "border-border hover:border-border"}`}
            >
              <span className="text-[10px] sm:text-xs font-black tracking-widest text-text-muted">
                {entityFilter || "All Entities"}
              </span>
              <ChevronDown size={18} className={`text-text-disabled transition-transform duration-300 ${isEntityOpen ? "rotate-180" : ""}`} />
            </button>
            {isEntityOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsEntityOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-bg-secondary border border-border rounded-2xl shadow-premium z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="overflow-y-auto max-h-[205px] custom-scrollbar">
                    {["", ...Array.from(new Set(logs.map(l => l.entityType))).filter(Boolean)].map(e => (
                      <button key={e || "__all"} onClick={() => { setEntityFilter(e); setIsEntityOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black tracking-widest transition-all flex items-center justify-between ${entityFilter === e ? "bg-accent-primary/10 text-accent-primary" : "text-text-muted hover:bg-bg-tertiary hover:text-text-primary"}`}>
                        {e || "All Entities"}
                        {entityFilter === e && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary shadow-glow" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden relative">
        <div className="divide-y divide-border min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading && logs.length === 0 ? (
              <AuditLogSkeleton key="skeleton" />
            ) : logs.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-32 text-center space-y-6">
                <div className="p-8 bg-bg-elevated rounded-full text-text-disabled shadow-inner inline-block"><History size={64} /></div>
                <div className="space-y-2">
                  <p className="text-text-primary font-black tracking-widest text-xl">Clean Slate</p>
                  <p className="text-text-muted text-sm font-medium">No system events matching your filters were found.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {logs.map((log, i) => (
                  <LogItem key={log._id || i} log={log} isLast={i === logs.length - 1} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalResults} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
    </PageTransition>
  );
};

const LogItem = ({ log, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const performer = log.performedBy?.name || "System";
  const target = log.targetEmployee?.name;
  const time = log.createdAt || log.timestamp;
  const actionType = log.action?.toUpperCase() || "";
  const shouldShowTarget = target && !actionType.includes("CREATE");

  return (
    <div className="p-8 hover:bg-bg-tertiary/20 transition-all duration-300 flex gap-10 border-l-4 border-transparent hover:border-accent-primary group">
      <div className="hidden md:flex flex-col items-center w-14 shrink-0 pt-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-premium ${getActionColor(log.action)}`}>
          <Terminal size={24} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border-subtle mt-10" />}
      </div>
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Badge variant={getActionVariant(log.action)} className="font-black tracking-widest text-[10px] px-4 py-1.5">{log.action || "EVENT"}</Badge>
            <Badge variant="muted" className="text-[10px]">{log.entityType || "Audit"}</Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-text-disabled font-black tracking-widest">
            <Clock size={16} className="opacity-50" /> {formatDate(time)}
          </div>
        </div>
        <h3 className="text-text-primary font-black text-xl tracking-tight leading-snug group-hover:text-white transition-colors">{log.description || "No specific details logged."}</h3>
        <div className="flex items-center gap-4">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-4 text-sm text-text-primary bg-bg-elevated px-6 py-3 rounded-2xl hover:bg-bg-tertiary transition-all border border-border active:scale-95 shadow-premium group/performer">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary border border-accent-primary/10 group-hover/performer:shadow-glow"><User size={16} /></div>
            <span className="font-black tracking-tight">{performer}</span>
            {shouldShowTarget && (
              <div className="flex gap-4 border-l border-border pl-6 ml-2">
                <span className="text-text-disabled opacity-50">&rarr;</span>
                <span className="font-black text-accent-secondary tracking-tight">{target}</span>
              </div>
            )}
            <div className="ml-4 text-text-disabled">{expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
          </button>
        </div>
        <AnimatePresence>
          {expanded && log.changes && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-8 p-10 bg-bg-elevated border border-border rounded-2xl text-xs font-mono relative shadow-inner">
                 <button onClick={() => navigator.clipboard.writeText(JSON.stringify(log.changes, null, 2))} className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors font-black tracking-widest text-[10px] flex items-center gap-2"><Copy size={14}/> Copy Data</button>
                 <pre className="whitespace-pre-wrap break-all text-accent-secondary/80 leading-relaxed overflow-x-auto max-h-[600px] custom-scrollbar pt-4">{JSON.stringify(log.changes, null, 2)}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const getActionVariant = (action) => {
  const a = (action || "").toUpperCase();
  if (a.includes("REJECT") || a.includes("DELETE") || a.includes("OFFBOARD")) return "danger";
  if (a.includes("APPROVE") || a.includes("CREATE") || a.includes("REACTIVATED")) return "success";
  if (a.includes("REQUEST") || a.includes("PENDING") || a.includes("MAINTENANCE")) return "warning";
  if (a.includes("FULFILL") || a.includes("ALLOCATED") || a.includes("ISSUE")) return "info";
  return "muted";
};

const getActionColor = (action) => {
  const a = (action || "").toUpperCase();
  if (a.includes("REJECT") || a.includes("DELETE") || a.includes("OFFBOARD")) return "bg-status-danger/10 text-status-danger border-status-danger/20";
  if (a.includes("APPROVE") || a.includes("CREATE") || a.includes("REACTIVATED")) return "bg-status-success/10 text-status-success border-status-success/20";
  if (a.includes("REQUEST") || a.includes("PENDING") || a.includes("MAINTENANCE")) return "bg-status-warning/10 text-status-warning border-status-warning/20";
  if (a.includes("FULFILL") || a.includes("ALLOCATED") || a.includes("ISSUE")) return "bg-status-info/10 text-status-info border-status-info/20";
  return "bg-bg-tertiary text-text-muted border-border";
};

export default AuditLogs;
