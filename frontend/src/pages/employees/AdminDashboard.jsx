import React, { useState, useEffect } from "react";
import {
 Users,
 Monitor, Cpu,
 Activity,
 Wrench,
 Trash2,
 AlertTriangle,
} from "lucide-react";
import api from "../../hooks/api";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";

/* ---------------------- UTIL ---------------------- */

const formatDate = (date) => {
 if (!date) return "N/A";
 const d = new Date(date);
 return isNaN(d) ? "N/A" : d.toLocaleString();
};

/* ---------------------- STAT CARD ---------------------- */

const StatCard = ({ title, value, icon, variant }) => {
 const variants = {
 blue: "bg-indigo-500/10 text-indigo-400",
 indigo: "bg-indigo-500/10 text-indigo-400",
 green: "bg-emerald-500/100/10 text-emerald-400",
 amber: "bg-amber-500/10 text-amber-400",
 red: "bg-rose-500/10 text-rose-400",
 rose: "bg-pink-500/10 text-pink-400",
 };

 return (
 <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col gap-4 hover:scale-105 transform transition duration-150 hover:bg-zinc-800 hover:border-zinc-700">
 <div
 className={`p-2.5 rounded-xl w-fit ${variants[variant] || variants.blue}`}
 >
 {React.cloneElement(icon, { size: 20 })}
 </div>

 <div>
 <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
 {title}
 </p>
 <p className="text-2xl font-bold text-zinc-50 tabular-nums">
 {value}
 </p>
 </div>
 </div>
 );
};

/* ---------------------- AUDIT LOG ITEM ---------------------- */

const AuditLogItem = ({ log }) => {
 const [expanded, setExpanded] = useState(false);

 return (
 <div
 className="flex flex-col md:flex-row md:items-start gap-4 p-3 rounded-xl hover:bg-zinc-700/50 transition-colors border border-transparent hover:border-zinc-700 cursor-pointer"
 onClick={() => setExpanded(!expanded)}
 >
 {/* Action Badge */}
 <div
 className={`p-2 rounded-lg font-bold text-[10px] uppercase tracking-tighter flex-shrink-0 ${
 log.action === "RECOVERED"
 ? "bg-amber-500/100/15 text-amber-400"
 : log.action === "ALLOCATED"
 ? "bg-emerald-500/100/15 text-emerald-400"
 : "bg-zinc-800 text-zinc-400"
 }`}
 >
 {log.action}
 </div>

 {/* Log Details */}
 <div className="flex-1">
 <p className="text-sm font-medium text-zinc-200 leading-snug">
 {log.description || "No details provided"}
 </p>

 <p className="text-[11px] text-zinc-400 mt-1 flex flex-wrap gap-2">
 <span className="font-semibold text-zinc-500">
 {/* {log.user || "System"} */}
 {log.performedBy || "System"}
 </span>
 {log.targetEmployee && (
 <span className="font-medium text-zinc-500">
 {log.action === "RECOVERED" ? "←" : "→"} {log.targetEmployee}
 </span>
 )}
 • {formatDate(log.timestamp || log.time)}
 </p>

 {expanded && log.details && (
 <pre className="mt-2 bg-zinc-900 border border-zinc-800 p-2 rounded-md text-xs font-mono text-zinc-400 overflow-x-auto">
 {JSON.stringify(log.details, null, 2)}
 </pre>
 )}
 </div>
 </div>
 );
};

/* ---------------------- ADMIN DASHBOARD ---------------------- */

const AdminDashboard = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

 const [issueItem, setIssueItem] = useState(null);
 const [returnItem, setReturnItem] = useState(null);

 const [highlightedItemId, setHighlightedItemId] = useState(null);

 const fetchDashboard = async () => {
 setLoading(true);
 try {
 const res = await api.get("/dashboard/admin");
 setData(res.data.data);
 } catch (err) {
 console.error("Dashboard fetch failed", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchDashboard();
 }, []);

 if (loading || !data)
 return (
 <div className="flex items-center justify-center h-64 text-zinc-500 font-medium animate-pulse">
 Gathering Analytics...
 </div>
 );

 const { summary, lowStockItems, recentActivity } = data;

 return (
 <div className="space-y-8 animate-in fade-in duration-500 px-2 sm:px-4 md:px-6 lg:px-0">
 {/* HEADER */}

 <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
 Inventory Analytics Hub
 </h1>
 <p className="text-zinc-400 text-sm">
 Infrastructure & Equipment Monitoring
 </p>
 </div>

 <div className="text-xs font-bold text-zinc-400 uppercase bg-zinc-800 px-3 py-1 rounded-full border border-zinc-800">
 System Operational Health
 </div>
 </header>

 {/* STATS */}

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
 <StatCard
 title="Workforce Directory"
 value={summary.employees}
 icon={<Users />}
 variant="blue"
 />

 <StatCard
 title="Enterprise Infrastructure"
 value={summary.assets.TOTAL}
 icon={<Monitor />}
 variant="indigo"
 />

 <StatCard
 title="Active Deployments"
 value={summary.assets.ALLOCATED}
 icon={<Activity />}
 variant="green"
 />

 <StatCard
 title="Maintenance Pipeline"
 value={summary.assets.UNDER_MAINTENANCE}
 icon={<Wrench />}
 variant="amber"
 />

 <StatCard
 title="Scrapped"
 value={summary.assets.DECOMMISSIONED}
 icon={<Trash2 />}
 variant="red"
 />

 <StatCard
 title="Low Stock"
 value={lowStockItems.length}
 icon={<AlertTriangle />}
 variant="rose"
 />
 </div>

 {/* MAIN GRID */}

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* RECENT LOGS */}

 <div className="lg:col-span-2 bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
 <h3 className="font-bold text-zinc-50 mb-6">Recent Audit Logs</h3>

 <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
 {recentActivity.length > 0 ? (
 recentActivity.map((log, index) => (
 <AuditLogItem key={log._id || `log-${index}`} log={log} />
 ))
 ) : (
 <div className="text-center py-8 text-zinc-400 italic">
 No recent activity available
 </div>
 )}
 </div>
 </div>

 {/* LOW STOCK */}

 <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
 <div className="flex items-center gap-2 mb-6">
 <AlertTriangle size={18} className="text-amber-500" />
 <h3 className="font-bold text-zinc-50">Inventory Alerts</h3>
 </div>

 <div className="space-y-3 max-h-[480px] overflow-y-auto">
 {lowStockItems.length > 0 ? (
 [...lowStockItems]
 .sort(
 (a, b) =>
 a.currentStock / a.totalQuantity -
 b.currentStock / b.totalQuantity,
 )
 .map((item, index) => {
 const isTopCritical = index < 3;

 return (
 <div
 key={item._id || `low-stock-${index}`}
 className={`p-4 border rounded-xl flex justify-between items-center transition-colors ${
 highlightedItemId === item._id
 ? "bg-green-500/10 border-green-500/30"
 : isTopCritical
 ? "bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20"
 : "bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/100/20"
 }`}
 >
 <div>
 <p
 className={`text-sm font-bold ${
 isTopCritical ? "text-rose-400" : "text-amber-400"
 }`}
 >
 {item.itemName}
 </p>

 <p className="text-xs text-amber-400">
 Current Stock: {item.currentStock} /{" "}
 {item.totalQuantity}
 </p>
 </div>

 <div className="flex gap-2">
 <button
 onClick={() => setIssueItem(item)}
 className="text-xs px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
 >
 Provision
 </button>

 <button
 onClick={() => setReturnItem(item)}
 className="text-xs px-3 py-1 rounded-lg bg-amber-500/100 text-white hover:bg-amber-600"
 >
 Return
 </button>
 </div>
 </div>
 );
 })
 ) : (
 <div className="text-center py-8 text-zinc-400 italic">
 All stock levels healthy
 </div>
 )}
 </div>
 </div>
 </div>

 {/* MODALS */}

 {issueItem && (
 <IssueConsumableModal
 isOpen={!!issueItem}
 item={issueItem}
 onClose={() => setIssueItem(null)}
 onRefresh={fetchDashboard}
 />
 )}

 {returnItem && (
 <ReturnConsumableModal
 isOpen={!!returnItem}
 item={returnItem}
 onClose={() => setReturnItem(null)}
 onRefresh={fetchDashboard}
 />
 )}
 </div>
 );
};

export default AdminDashboard;
