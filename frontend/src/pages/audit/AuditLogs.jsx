// export default AuditLogs;
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   History,
//   User,
//   Clock,
//   Terminal,
//   Search,
//   ChevronDown,
//   ChevronUp,
//   Copy,
//   Download,
// } from "lucide-react";
// import { getAuditLogs } from "../../services/auditService";
// import jsPDF from "jspdf";

// // --- Utility: debounce ---
// const debounce = (fn, delay) => {
//   let timeout;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => fn(...args), delay);
//   };
// };

// // --- Highlight search matches ---
// const Highlight = ({ text = "", query = "" }) => {
//   if (!query) return <>{text}</>;
//   const regex = new RegExp(`(${query})`, "gi");
//   const parts = text.split(regex);
//   return (
//     <>
//       {parts.map((part, idx) =>
//         regex.test(part) ? (
//           <mark key={idx} className="bg-yellow-200 text-yellow-900">
//             {part}
//           </mark>
//         ) : (
//           part
//         ),
//       )}
//     </>
//   );
// };

// // --- Convert logs to CSV ---
// const convertToCSV = (logs) => {
//   if (!logs.length) return "";
//   const headers = [
//     "Action",
//     "Performed By",
//     "Target Employee",
//     "Entity Type",
//     "Entity ID",
//     "Description",
//     "Timestamp",
//     "IP Address",
//   ];
//   const rows = logs.map((log) => [
//     log.action,
//     log.performedBy?.name || "System Auto",
//     log.targetEmployee?.name || "N/A",
//     log.entityType || "N/A",
//     log.entityId || "N/A",
//     `"${log.description || ""}"`,
//     log.timestamp,
//     log.ipAddress || "Internal",
//   ]);
//   return [headers, ...rows].map((r) => r.join(",")).join("\n");
// };

// // --- Generate PDF ---
// const generatePDF = (logs) => {
//   const doc = new jsPDF();
//   doc.setFontSize(10);
//   let y = 10;
//   doc.text("Audit Logs", 10, y);
//   y += 8;
//   logs.forEach((log, idx) => {
//     const performed = log.performedBy?.name || "System Auto";
//     const target = log.targetEmployee?.name || "N/A";
//     const desc = log.description || "";
//     doc.text(
//       `${idx + 1}. [${log.action}] ${performed} → ${target} | ${desc} | ${
//         log.timestamp
//       } | IP: ${log.ipAddress || "Internal"}`,
//       10,
//       y,
//     );
//     y += 6;
//     if (y > 280) {
//       doc.addPage();
//       y = 10;
//     }
//   });
//   doc.save(`audit_logs_${Date.now()}.pdf`);
// };

// const AuditLogs = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [filter, setFilter] = useState("");
//   const [debouncedFilter, setDebouncedFilter] = useState(filter);

//   const [actionFilter, setActionFilter] = useState("");
//   const [userFilter, setUserFilter] = useState("");
//   const [entityFilter, setEntityFilter] = useState("");

//   // --- Fetch logs ---
//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   const fetchLogs = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await getAuditLogs();
//       setLogs(data || []);
//     } catch (err) {
//       console.error("Failed to load audit logs", err);
//       setError(err.response?.data?.message || "Failed to fetch audit logs.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // --- Debounced search ---
//   useEffect(() => {
//     const handler = debounce(() => setDebouncedFilter(filter), 300);
//     handler();
//     return () => {};
//   }, [filter]);

//   // --- Unique filter values ---
//   const actionTypes = useMemo(
//     () => Array.from(new Set(logs.map((l) => l.action).filter(Boolean))),
//     [logs],
//   );
//   const users = useMemo(
//     () =>
//       Array.from(
//         new Set(
//           logs
//             .map(
//               (l) =>
//                 l.performedBy?.name || l.targetEmployee?.name || "System Auto",
//             )
//             .filter(Boolean),
//         ),
//       ),
//     [logs],
//   );
//   const entityTypes = useMemo(
//     () => Array.from(new Set(logs.map((l) => l.entityType).filter(Boolean))),
//     [logs],
//   );

//   // --- Filtered logs ---
//   const filteredLogs = useMemo(() => {
//     const query = debouncedFilter.toLowerCase();
//     return logs.filter((log) => {
//       const performedName = log.performedBy?.name || "System Auto";
//       const targetName = log.targetEmployee?.name || "N/A";

//       return (
//         (!actionFilter || log.action === actionFilter) &&
//         (!userFilter ||
//           performedName === userFilter ||
//           targetName === userFilter) &&
//         (!entityFilter || log.entityType === entityFilter) &&
//         (log.action?.toLowerCase().includes(query) ||
//           log.description?.toLowerCase().includes(query) ||
//           performedName.toLowerCase().includes(query) ||
//           targetName.toLowerCase().includes(query) ||
//           log.ipAddress?.toLowerCase().includes(query))
//       );
//     });
//   }, [logs, debouncedFilter, actionFilter, userFilter, entityFilter]);

//   if (loading)
//     return (
//       <div className="p-8 text-center text-slate-500">
//         Retrieving system history...
//       </div>
//     );
//   if (error)
//     return (
//       <div className="p-8 text-center text-red-500 font-bold">{error}</div>
//     );

//   return (
//     <div className="space-y-6 max-w-6xl mx-auto">
//       {/* Header & Filters */}
//       <header className="flex flex-col sm:flex-row justify-between items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <History className="text-blue-600" /> System Audit Trail
//           </h1>
//           <p className="text-slate-500 text-sm tracking-wide">
//             Immutable record of all administrative actions
//           </p>
//         </div>

//         <div className="flex gap-2 items-center flex-nowrap overflow-x-auto w-full sm:w-auto">
//           {/* Search */}
//           <div className="relative flex-shrink-0">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//               size={16}
//             />
//             <input
//               type="text"
//               placeholder="Search logs..."
//               className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//             />
//           </div>

//           {/* Action Filter */}
//           <select
//             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
//             value={actionFilter}
//             onChange={(e) => setActionFilter(e.target.value)}
//           >
//             <option value="">All Actions</option>
//             {actionTypes.map((a) => (
//               <option key={a} value={a}>
//                 {a}
//               </option>
//             ))}
//           </select>

//           {/* User Filter */}
//           <select
//             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
//             value={userFilter}
//             onChange={(e) => setUserFilter(e.target.value)}
//           >
//             <option value="">All Users</option>
//             {users.map((u) => (
//               <option key={u} value={u}>
//                 {u}
//               </option>
//             ))}
//           </select>

//           {/* Entity Filter */}
//           <select
//             className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
//             value={entityFilter}
//             onChange={(e) => setEntityFilter(e.target.value)}
//           >
//             <option value="">All Entity Types</option>
//             {entityTypes.map((e) => (
//               <option key={e} value={e}>
//                 {e}
//               </option>
//             ))}
//           </select>

//           {/* Download CSV */}
//           <button
//             onClick={() => {
//               const csv = convertToCSV(filteredLogs);
//               const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//               const url = URL.createObjectURL(blob);
//               const link = document.createElement("a");
//               link.href = url;
//               link.download = `audit_logs_${Date.now()}.csv`;
//               document.body.appendChild(link);
//               link.click();
//               document.body.removeChild(link);
//             }}
//             className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm hover:bg-green-100 flex-shrink-0"
//           >
//             <Download size={16} /> CSV
//           </button>

//           {/* Download PDF */}
//           <button
//             onClick={() => generatePDF(filteredLogs)}
//             className="flex items-center gap-1 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm hover:bg-blue-100 flex-shrink-0"
//           >
//             <Download size={16} /> PDF
//           </button>
//         </div>
//       </header>

//       {/* Logs List */}
//       <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
//         <div className="divide-y divide-slate-50">
//           {filteredLogs.length > 0 ? (
//             filteredLogs.map((log, idx) => (
//               <LogItem
//                 key={log._id || idx}
//                 log={log}
//                 isLast={idx === filteredLogs.length - 1}
//                 highlight={debouncedFilter}
//               />
//             ))
//           ) : (
//             <div className="p-8 text-center text-slate-400 italic">
//               No audit logs match your search or filters.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- LogItem with expandable details & copy ---
// const LogItem = ({ log, isLast, highlight }) => {
//   const [expanded, setExpanded] = useState(false);
//   const actionColor = getActionColor(log.action);
//   const timestamp = log.timestamp ? new Date(log.timestamp) : null;

//   const performedName = log.performedBy?.name || "System Auto";
//   const targetName = log.targetEmployee?.name || "N/A";

//   const handleCopy = () => {
//     if (log.changes)
//       navigator.clipboard.writeText(JSON.stringify(log.changes, null, 2));
//   };

//   return (
//     <div className="p-5 hover:bg-slate-50/50 transition-colors flex gap-6 items-start">
//       {/* Timeline Dot */}
//       <div className="flex flex-col items-center">
//         <div
//           className={`p-2 rounded-full flex items-center justify-center ${actionColor}`}
//         >
//           <Terminal size={14} />
//         </div>
//         {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2"></div>}
//       </div>

//       {/* Details */}
//       <div className="flex-1 space-y-1">
//         <div className="flex items-center justify-between">
//           <span className="text-sm font-black uppercase tracking-widest text-slate-400">
//             <Highlight text={log.action || "UNKNOWN"} query={highlight} />
//           </span>
//           <div className="flex items-center gap-1 text-xs text-slate-400">
//             <Clock size={12} /> {timestamp ? timestamp.toLocaleString() : "N/A"}
//           </div>
//         </div>

//         <p className="text-slate-700 font-medium" title={log.description || ""}>
//           <Highlight text={log.description || "No details"} query={highlight} />
//         </p>

//         <div className="flex items-center gap-4 pt-2 flex-wrap">
//           <div
//             className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer"
//             onClick={() => setExpanded(!expanded)}
//           >
//             <User size={12} />
//             <Highlight
//               text={`${performedName} → ${targetName}`}
//               query={highlight}
//             />
//             {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//           </div>

//           <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
//             IP:{" "}
//             <Highlight text={log.ipAddress || "Internal"} query={highlight} />
//           </div>
//         </div>

//         {expanded && log.changes && (
//           <div className="mt-2 p-2 bg-slate-50 rounded-md text-sm font-mono text-slate-600 relative">
//             <pre>{JSON.stringify(log.changes, null, 2)}</pre>
//             <button
//               onClick={handleCopy}
//               className="absolute top-2 right-2 p-1 bg-slate-200 rounded hover:bg-slate-300 text-xs flex items-center gap-1"
//             >
//               <Copy size={12} /> Copy
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Action color helper ---
// const getActionColor = (action) => {
//   const type = action?.toUpperCase() || "";
//   if (type.includes("DELETE")) return "bg-red-100 text-red-600";
//   if (type.includes("CREATE")) return "bg-green-100 text-green-600";
//   if (
//     type.includes("UPDATE") ||
//     type.includes("ASSIGN") ||
//     type.includes("RETURN")
//   )
//     return "bg-blue-100 text-blue-600";
//   return "bg-slate-100 text-slate-600";
// };

// export default AuditLogs;
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
      <mark key={i} className="bg-yellow-200 text-yellow-900">
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

  /* -------- FETCH LOGS -------- */

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const data = await getAuditLogs();
        setLogs(data || []);
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
      <div className="p-8 text-center text-slate-500">
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
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <History className="text-blue-600" />
            System Audit Trail
          </h1>

          <p className="text-slate-500 text-sm">
            Immutable record of all administrative actions
          </p>
        </div>

        {/* FILTERS */}

        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border rounded-xl text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border rounded-xl text-sm"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="">All Actions</option>
            {actionTypes.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded-xl text-sm"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border rounded-xl text-sm"
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
            className="flex items-center gap-1 px-3 py-2 bg-green-50 text-green-700 rounded-xl text-sm hover:bg-green-100"
          >
            <Download size={16} /> CSV
          </button>
        </div>
      </header>

      {/* LOG LIST */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-50">
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
            <div className="p-8 text-center text-slate-400 italic">
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

  // Logic: Show target only if it exists AND the action isn't just CREATED/UPDATED
  const actionType = log.action?.toUpperCase() || "";
  const isCreationOrUpdate =
    actionType.includes("CREATE") || actionType.includes("UPDATE");
  const shouldShowTarget = target && !isCreationOrUpdate;

  const handleCopy = (e) => {
    e.stopPropagation(); // Prevent the accordion from closing when clicking copy
    if (log.changes)
      navigator.clipboard.writeText(JSON.stringify(log.changes, null, 2));
  };

  return (
    <div className="p-5 hover:bg-slate-50 flex gap-6">
      {/* TIMELINE */}
      <div className="flex flex-col items-center">
        <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
          <Terminal size={14} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2" />}
      </div>

      {/* CONTENT */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            <Highlight text={log.action || "UNKNOWN"} query={highlight} />
          </span>

          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            {formatDate(time)}
          </span>
        </div>

        <p className="text-slate-700 font-medium">
          <Highlight text={log.description || "No details"} query={highlight} />
        </p>

        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md cursor-pointer w-fit"
        >
          <User size={12} />
          <span>{performer}</span>

          {/* Conditional Arrow and Target */}
          {shouldShowTarget && (
            <>
              <span className="mx-1 text-slate-400">→</span>
              <span>{target}</span>
            </>
          )}

          <div className="ml-1">
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
        </div>

        {expanded && log.changes && (
          <div className="mt-2 p-3 bg-slate-900 text-blue-300 rounded-lg text-[11px] font-mono relative shadow-inner">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(log.changes, null, 2)}
            </pre>

            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 flex items-center gap-1 bg-slate-700 text-white px-2 py-1 rounded hover:bg-slate-600 transition-colors"
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

  if (a?.includes("DELETE")) return "bg-red-100 text-red-600";
  if (a?.includes("CREATE")) return "bg-green-100 text-green-600";
  if (a?.includes("ASSIGN") || a?.includes("RETURN") || a?.includes("UPDATE"))
    return "bg-blue-100 text-blue-600";

  return "bg-slate-100 text-slate-600";
};

export default AuditLogs;
