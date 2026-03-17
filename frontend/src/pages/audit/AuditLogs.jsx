import React, { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { getAuditLogs } from "../../services/auditService";

/* ---------------- UTIL ---------------- */

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d) ? "N/A" : d.toLocaleString();
};

/* ---------------- HIGHLIGHT ---------------- */

const Highlight = ({ text = "", query = "" }) => {
  if (!query) return text;

  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${safeQuery})`, "gi");

  return text.split(regex).map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-500/20 text-yellow-300">
        {part}
      </mark>
    ) : (
      part
    ),
  );
};

/* ---------------- CSV EXPORT ---------------- */

const convertToCSV = (logs) => {
  if (!logs.length) return "";

  const headers = [
    "Action",
    "Performed By",
    "Target Employee",
    "Entity Type",
    "Description",
    "Timestamp",
    "IP Address",
  ];

  const rows = logs.map((log) => [
    log.action,
    log.performedBy?.name || "System",
    log.targetEmployee?.name || "N/A",
    log.entityType || "N/A",
    `"${log.description || ""}"`,
    log.createdAt || log.timestamp,
    log.ipAddress || "Internal",
  ]);

  return [headers, ...rows].map((r) => r.join(",")).join("\n");
};

/* ---------------- MAIN COMPONENT ---------------- */

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  /* -------- FETCH LOGS -------- */

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await getAuditLogs();
        setLogs(response.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load audit logs.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  /* -------- FILTER VALUES -------- */

  const actionTypes = useMemo(
    () => [...new Set(logs.map((l) => l.action).filter(Boolean))],
    [logs],
  );

  const users = useMemo(
    () => [
      ...new Set(
        logs.map(
          (l) => l.performedBy?.name || l.targetEmployee?.name || "System",
        ),
      ),
    ],
    [logs],
  );

  const entityTypes = useMemo(
    () => [...new Set(logs.map((l) => l.entityType).filter(Boolean))],
    [logs],
  );

  /* -------- FILTER LOGS -------- */

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();

    return logs.filter((log) => {
      const performer = log.performedBy?.name || "System";
      const target = log.targetEmployee?.name || "N/A";
      const timestamp = new Date(log.createdAt || log.timestamp);
      const logDate = timestamp.toISOString().split("T")[0];

      return (
        (!actionFilter || log.action === actionFilter) &&
        (!entityFilter || log.entityType === entityFilter) &&
        (!userFilter || performer === userFilter || target === userFilter) &&
        (!dateFilter || logDate === dateFilter) &&
        (log.action?.toLowerCase().includes(q) ||
          log.description?.toLowerCase().includes(q) ||
          performer.toLowerCase().includes(q) ||
          target.toLowerCase().includes(q) ||
          log.ipAddress?.toLowerCase().includes(q))
      );
    });
  }, [logs, search, actionFilter, userFilter, entityFilter, dateFilter]);

  /* -------- CLEAR FILTERS -------- */

  const clearFilters = () => {
    setSearch("");
    setActionFilter("");
    setUserFilter("");
    setEntityFilter("");
    setDateFilter("");
  };

  const hasActiveFilters = !!(search || actionFilter || userFilter || entityFilter || dateFilter);

  /* -------- CSV EXPORT -------- */

  const downloadCSV = () => {
    const csv = convertToCSV(filteredLogs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `audit_logs_${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* -------- LOADING / ERROR -------- */

  if (loading)
    return (
      <div className="p-8 text-center text-zinc-500 font-medium">
        Retrieving system history...
      </div>
    );

  if (error)
    return (
      <div className="p-8 text-center text-red-500 font-bold">{error}</div>
    );

  /* -------- UI -------- */

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left py-4">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight flex items-center gap-3">
            <History className="text-indigo-500" size={32} />
            Logs
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Immutable record of all administrative actions
          </p>
        </div>

        <button 
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`p-3 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all shadow-xl active:scale-95 ${
            hasActiveFilters 
              ? "text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10" 
              : "text-zinc-600 cursor-not-allowed opacity-50"
          }`}
          title="Clear all filters"
        >
          <RotateCcw size={20} />
        </button>
      </header>

      {/* FILTERS BLOCK */}
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-zinc-950/20 p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm shadow-xl">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            placeholder="Search logs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative min-w-[170px] flex-1 sm:flex-none">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            <input 
              type="date"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all [color-scheme:dark] shadow-sm"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <select 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all cursor-pointer min-w-[140px] flex-1 sm:flex-none"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <select 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all cursor-pointer min-w-[140px] flex-1 sm:flex-none"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          <select 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all cursor-pointer min-w-[140px] flex-1 sm:flex-none"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="">All Entities</option>
            {entityTypes.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>

          <button
            onClick={downloadCSV}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-sm font-bold hover:bg-emerald-500/20 transition-all active:scale-95 whitespace-nowrap shadow-lg flex-1 sm:flex-none"
          >
            <Download size={18} /> CSV
          </button>
        </div>
      </div>

      {/* LOG LIST */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-xl overflow-hidden mt-2">
        <div className="divide-y divide-zinc-800">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, i) => (
              <LogItem
                key={log._id || i}
                log={log}
                isLast={i === filteredLogs.length - 1}
                highlight={search}
              />
            ))
          ) : (
            <div className="p-16 text-center text-zinc-400 italic">
              No audit logs match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- LOG ITEM ---------------- */

const LogItem = ({ log, isLast, highlight }) => {
  const [expanded, setExpanded] = useState(false);

  const performer = log.performedBy?.name || "System";
  const target = log.targetEmployee?.name;
  const time = log.createdAt || log.timestamp;

  const actionType = log.action?.toUpperCase() || "";
  const isGenericAction =
    actionType.includes("CREATE") || 
    actionType.includes("MODIFY");
  const shouldShowTarget = target && !isGenericAction;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (log.changes)
      navigator.clipboard.writeText(JSON.stringify(log.changes, null, 2));
  };

  return (
    <div className="p-6 hover:bg-zinc-950 transition-colors flex gap-6 border-l-2 border-transparent hover:border-indigo-500/50">
      {/* TIMELINE ICON */}
      <div className="flex flex-col items-center">
        <div className={`p-2.5 rounded-full ${getActionColor(log.action)} shadow-sm`}>
          <Terminal size={14} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-zinc-800 mt-2" />}
      </div>

      {/* CONTENT */}
      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            <Highlight text={log.action || "UNKNOWN"} query={highlight} />
          </span>

          <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Clock size={12} />
            {formatDate(time)}
          </span>
        </div>

        <p className="text-zinc-100 font-bold text-base">
          <Highlight text={log.description || "No details available"} query={highlight} />
        </p>

        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-xl cursor-pointer w-fit hover:bg-indigo-500/10 transition-all border border-indigo-500/10 shadow-sm"
        >
          <User size={12} />
          <span className="font-semibold">{performer}</span>

          {shouldShowTarget && (
            <>
              <span className="mx-1 text-zinc-600 font-bold">
                {log.action === "RECOVERED" ? "←" : "→"}
              </span>
              <span className="font-black text-zinc-300">{target}</span>
            </>
          )}

          <div className="ml-1 opacity-70">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>

        {expanded && log.changes && (
          <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-[11px] font-mono relative shadow-inner group/code">
            <pre className="whitespace-pre-wrap break-all text-blue-300 leading-relaxed overflow-x-auto">
              {JSON.stringify(log.changes, null, 2)}
            </pre>

            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-100 px-3 py-1.5 rounded-xl hover:bg-zinc-700 transition-all shadow-lg active:scale-95 text-[10px] font-bold"
            >
              <Copy size={12} /> Copy Output
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- ACTION COLOR ---------------- */

const getActionColor = (action) => {
  const a = action?.toUpperCase() || "";

  // REQUEST STATUSES (Matching RequestList palette)
  if (a.includes("REJECT")) return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  if (a.includes("APPROVE")) return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
  if (a.includes("FULFILL")) return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (a.includes("REQUEST") || a.includes("PENDING")) return "bg-amber-500/10 text-amber-400 border border-amber-500/20";

  // OTHER ACTIONS
  if (a.includes("DELETE") || a.includes("DECOMMISSIONED")) 
    return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  if (a.includes("CREATE") || a.includes("READY")) 
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (a.includes("MAINTENANCE")) 
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  if (a.includes("ASSIGN") || a.includes("RETURN") || a.includes("UPDATE") || a.includes("ALLOCATED"))
    return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";

  return "bg-zinc-800 text-zinc-400 border border-zinc-700";
};

export default AuditLogs;
