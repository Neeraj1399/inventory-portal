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

 // /* -------- FETCH LOGS -------- */

 // useEffect(() => {
 // const fetchLogs = async () => {
 // try {
 // setLoading(true);
 // const data = await getAuditLogs();
 // setLogs(data || []);
 // } catch (err) {
 // console.error(err);
 // setError("Failed to load audit logs.");
 // } finally {
 // setLoading(false);
 // }
 // };

 // fetchLogs();
 // }, []);
 /* -------- FETCH LOGS -------- */

 useEffect(() => {
 const fetchLogs = async () => {
 try {
 setLoading(true);
 const response = await getAuditLogs();
 // FIX: Access the 'data' property of the response object
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

 return (
 (!actionFilter || log.action === actionFilter) &&
 (!entityFilter || log.entityType === entityFilter) &&
 (!userFilter || performer === userFilter || target === userFilter) &&
 (log.action?.toLowerCase().includes(q) ||
 log.description?.toLowerCase().includes(q) ||
 performer.toLowerCase().includes(q) ||
 target.toLowerCase().includes(q) ||
 log.ipAddress?.toLowerCase().includes(q))
 );
 });
 }, [logs, search, actionFilter, userFilter, entityFilter]);

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
 <div className="p-8 text-center text-zinc-500">
 Retrieving system history...
 </div>
 );

 if (error)
 return (
 <div className="p-8 text-center text-red-500 font-bold">{error}</div>
 );

 /* -------- UI -------- */

 return (
 <div className="space-y-6 max-w-6xl mx-auto">
 {/* HEADER */}

 <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
 <History className="text-indigo-400" />
 Logs
 </h1>

 <p className="text-zinc-500 text-sm">
 Immutable record of all administrative actions
 </p>
 </div>

 {/* FILTERS */}

 <div className="flex flex-wrap gap-2 items-center">
 <div className="relative">
 <Search
 className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
 size={16}
 />
 <input
 type="text"
 placeholder="Search logs..."
 className="pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 outline-none focus:border-indigo-500 placeholder-zinc-500"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>

 <select
 className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 outline-none focus:border-indigo-500"
 value={actionFilter}
 onChange={(e) => setActionFilter(e.target.value)}
 >
 <option value="">All Actions</option>
 {actionTypes.map((a) => (
 <option key={a}>{a}</option>
 ))}
 </select>

 <select
 className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 outline-none focus:border-indigo-500"
 value={userFilter}
 onChange={(e) => setUserFilter(e.target.value)}
 >
 <option value="">All Users</option>
 {users.map((u) => (
 <option key={u}>{u}</option>
 ))}
 </select>

 <select
 className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-200 outline-none focus:border-indigo-500"
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
 className="flex items-center gap-1 px-3 py-2 bg-emerald-500/100/15 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/100/25 transition-colors"
 >
 <Download size={16} /> CSV
 </button>
 </div>
 </header>

 {/* LOG LIST */}

 <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
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
 <div className="p-8 text-center text-zinc-400 italic">
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

 // Logic: Show target only if it exists AND the action isn't just CREATED/MODIFIED
 const actionType = log.action?.toUpperCase() || "";
 const isCreationOrUpdate =
 actionType.includes("CREATE") || actionType.includes("MODIFY");
 const shouldShowTarget = target && !isCreationOrUpdate;

 const handleCopy = (e) => {
 e.stopPropagation(); // Prevent the accordion from closing when clicking copy
 if (log.changes)
 navigator.clipboard.writeText(JSON.stringify(log.changes, null, 2));
 };

 return (
 <div className="p-5 hover:bg-zinc-900 flex gap-6">
 {/* TIMELINE */}
 <div className="flex flex-col items-center">
 <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
 <Terminal size={14} />
 </div>
 {!isLast && <div className="w-px flex-1 bg-zinc-800 mt-2" />}
 </div>

 {/* CONTENT */}
 <div className="flex-1 space-y-1">
 <div className="flex justify-between items-center">
 <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
 <Highlight text={log.action || "UNKNOWN"} query={highlight} />
 </span>

 <span className="flex items-center gap-1 text-xs text-zinc-400">
 <Clock size={12} />
 {formatDate(time)}
 </span>
 </div>

 <p className="text-zinc-200 font-medium">
 <Highlight text={log.description || "No details"} query={highlight} />
 </p>

 <div
 onClick={() => setExpanded(!expanded)}
 className="flex items-center gap-1 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md cursor-pointer w-fit"
 >
 <User size={12} />
 <span>{performer}</span>

 {/* Conditional Arrow and Target */}
 {shouldShowTarget && (
 <>
 <span className="mx-1 text-zinc-400">{log.action === "RECOVERED" ? "←" : "→"}</span>
 <span>{target}</span>
 </>
 )}

 <div className="ml-1">
 {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
 </div>
 </div>

 {expanded && log.changes && (
 <div className="mt-2 p-3 bg-zinc-950 text-blue-300 rounded-lg text-[11px] font-mono relative shadow-inner">
 <pre className="whitespace-pre-wrap break-all">
 {JSON.stringify(log.changes, null, 2)}
 </pre>

 <button
 onClick={handleCopy}
 className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-700 text-white px-2 py-1 rounded hover:bg-zinc-600 transition-colors"
 >
 <Copy size={12} /> Copy
 </button>
 </div>
 )}
 </div>
 </div>
 );
};

/* ---------------- ACTION COLOR ---------------- */

const getActionColor = (action) => {
 const a = action?.toUpperCase();

 if (a?.includes("DELETE")) return "bg-red-500/100/15 text-red-400";
 if (a?.includes("CREATE")) return "bg-emerald-500/100/15 text-emerald-400";
 if (a?.includes("ASSIGN") || a?.includes("RETURN") || a?.includes("UPDATE"))
 return "bg-indigo-500/15 text-indigo-400";

 return "bg-zinc-800 text-zinc-300";
};

export default AuditLogs;
