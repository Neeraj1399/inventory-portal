import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
 Users,
 Monitor, Cpu,
 Activity,
 Wrench,
 Trash2,
 AlertTriangle,
 ChevronDown,
 User,
} from "lucide-react";
import api from "../../hooks/api";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import RestockConsumableModal from "../../components/consumables/RestockConsumableModal";

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
 <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col gap-4 transition-colors hover:bg-zinc-800/80 hover:border-zinc-700 group"
    >
 <div
        className={`p-2.5 rounded-xl w-fit transition-transform group-hover:scale-110 ${variants[variant] || variants.blue}`}
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
 </motion.div>
 );
};

/* ---------------------- AUDIT LOG ITEM ---------------------- */

const AuditLogItem = ({ log }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-2xl hover:bg-white/[0.03] transition-all border border-transparent hover:border-zinc-800 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* 1. Action Badge Column (Fixed Width on Desktop) */}
      <div className="md:w-28 flex-shrink-0">
        <div
          className={`text-center py-1.5 rounded-lg border font-black text-[9px] uppercase tracking-[0.15em] ${
            log.action === "RECOVERED" || log.action === "RETURNED"
              ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
              : log.action === "ALLOCATED" || log.action === "APPROVED"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
              : log.action === "CREATED"
              ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
              : log.action === "DELETED" || log.action === "REJECTED" || log.action === "DECOMMISSIONED"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
              : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400"
          }`}
        >
          {log.action}
        </div>
      </div>

      {/* 2. Content Column (Main info) */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-bold text-zinc-100 truncate group-hover:text-white transition-colors">
          {log.description || "No details provided"}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500 tabular-nums overflow-hidden">
          <span className="font-bold text-zinc-400 truncate max-w-[120px]">
            {log.performedBy || "System"}
          </span>
          
          {log.targetEmployee && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800/50 rounded-md border border-zinc-700/30 whitespace-nowrap">
              <span className="text-zinc-600 font-bold">
                {log.action === "RECOVERED" ? "←" : "→"}
              </span>
              <span className="text-zinc-400 font-medium">{log.targetEmployee}</span>
            </div>
          )}

          <span className="text-zinc-700">•</span>
          <span className="text-zinc-500 truncate lowercase tracking-tight italic">
            {formatDate(log.timestamp || log.time)}
          </span>
        </div>
      </div>

      {/* 3. Detail Toggle Column */}
      <div className="hidden md:flex items-center justify-end w-8">
        <div className={`p-1 rounded-full transition-colors ${expanded ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
          <ChevronDown size={14} className={`transform transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* EXPANDED DETAILS */}
      {expanded && log.details && (
        <div className="w-full md:pl-36 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/30 rounded-full" />
             <pre className="bg-black/40 border border-zinc-800/50 p-4 rounded-2xl text-[11px] font-mono text-indigo-300/60 overflow-x-auto shadow-inner ml-3">
               {JSON.stringify(log.details, null, 2)}
             </pre>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------- ADMIN DASHBOARD ---------------------- */

const AdminDashboard = () => {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

  const [issueItem, setIssueItem] = useState(null);
  const [returnItem, setReturnItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 px-2 sm:px-4 md:px-6 lg:px-0"
    >
 {/* HEADER */}

 <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
 Operations Dashboard
 </h1>
 <p className="text-zinc-400 text-sm">
 Hardware & Inventory Lifecycle Monitoring
 </p>
 </div>

 <div className="text-xs font-bold text-zinc-400 uppercase bg-zinc-800 px-3 py-1 rounded-full border border-zinc-800">
 System Operational Health
 </div>
 </header>

 {/* STATS */}

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
 <StatCard
 title="Active Personnel"
 value={summary.employees}
 icon={<Users />}
 variant="blue"
 />

 <StatCard
 title="Hardware Inventory"
 value={summary.assets.TOTAL}
 icon={<Monitor />}
 variant="indigo"
 />

 <StatCard
 title="Deployed Assets"
 value={summary.assets.ALLOCATED}
 icon={<Activity />}
 variant="green"
 />

 <StatCard
 title="Assets in Repair"
 value={summary.assets.UNDER_MAINTENANCE}
 icon={<Wrench />}
 variant="amber"
 />

 <StatCard
 title="Retired Assets"
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
  Allocate
  </button>

  <button
  onClick={() => setRestockItem(item)}
  className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
  >
  Restock
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

   {restockItem && (
   <RestockConsumableModal
   isOpen={!!restockItem}
   item={restockItem}
   onClose={() => setRestockItem(null)}
   onRefresh={fetchDashboard}
   />
   )}
    </motion.div>
  );
};

export default AdminDashboard;
