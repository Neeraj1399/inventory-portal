// import React, { useState, useEffect } from "react";
// import {
//   Users,
//   Cpu,
//   Activity,
//   Wrench,
//   Trash2,
//   AlertTriangle,
//   Loader2,
// } from "lucide-react";
// import api from "../../hooks/api";
// import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
// import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";

// // --- Stat Card Component ---
// const StatCard = ({ title, value, icon, variant }) => {
//   const variants = {
//     blue: "bg-blue-50 text-blue-600",
//     indigo: "bg-indigo-50 text-indigo-600",
//     green: "bg-emerald-50 text-emerald-600",
//     amber: "bg-amber-50 text-amber-600",
//     red: "bg-rose-50 text-rose-600",
//     rose: "bg-pink-50 text-pink-600",
//   };

//   return (
//     <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:scale-105 transform transition duration-150">
//       <div
//         className={`p-2.5 rounded-xl w-fit ${variants[variant] || variants.blue}`}
//       >
//         {React.cloneElement(icon, { size: 20 })}
//       </div>
//       <div>
//         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
//           {title}
//         </p>
//         <p className="text-2xl font-bold text-slate-900 tabular-nums">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// };

// // --- Audit Log Item ---
// const AuditLogItem = ({ log }) => {
//   const [expanded, setExpanded] = useState(false);
//   return (
//     <div
//       className="flex flex-col md:flex-row md:items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
//       onClick={() => setExpanded(!expanded)}
//     >
//       <div
//         className={`p-2 rounded-lg font-bold text-[10px] uppercase tracking-tighter flex-shrink-0 ${
//           log.action === "RETURNED"
//             ? "bg-orange-100 text-orange-600"
//             : log.action === "ASSIGNED"
//               ? "bg-green-100 text-green-600"
//               : "bg-slate-100 text-slate-600"
//         }`}
//       >
//         {log.action}
//       </div>
//       <div className="flex-1">
//         <p className="text-sm font-medium text-slate-800 leading-snug">
//           {log.description || "No details provided"}
//         </p>
//         <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-2">
//           <span className="font-semibold text-slate-500">{log.user}</span>
//           {log.targetEmployee && (
//             <span className="font-medium text-slate-500">
//               → {log.targetEmployee}
//             </span>
//           )}
//           • {log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
//         </p>
//         {expanded && log.details && (
//           <pre className="mt-2 bg-slate-50 p-2 rounded-md text-xs font-mono text-slate-600 overflow-x-auto">
//             {JSON.stringify(log.details, null, 2)}
//           </pre>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- Admin Dashboard ---
// const AdminDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [issueItem, setIssueItem] = useState(null);
//   const [returnItem, setReturnItem] = useState(null);

//   const fetchDashboard = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/dashboard/admin");
//       setData(res.data.data);
//     } catch (err) {
//       console.error("Dashboard fetch failed", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboard();
//   }, []);

//   if (loading || !data)
//     return (
//       <div className="flex items-center justify-center h-64 text-slate-500 font-medium animate-pulse">
//         Gathering Analytics...
//       </div>
//     );

//   const { summary, lowStockItems, recentActivity } = data;

//   return (
//     <div className="space-y-8 animate-in fade-in duration-500 px-2 sm:px-4 md:px-6 lg:px-0">
//       {/* Header */}
//       <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
//             System Overview
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Real-time inventory, maintenance, and staff health
//           </p>
//         </div>
//         <div className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
//           Live Status
//         </div>
//       </header>

//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//         <StatCard
//           title="Active Staff"
//           value={summary.employees}
//           icon={<Users />}
//           variant="blue"
//         />
//         <StatCard
//           title="Total Assets"
//           value={summary.assets.TOTAL}
//           icon={<Cpu />}
//           variant="indigo"
//         />
//         <StatCard
//           title="Assigned"
//           value={summary.assets.ASSIGNED}
//           icon={<Activity />}
//           variant="green"
//         />
//         <StatCard
//           title="In Repair"
//           value={summary.assets.REPAIR}
//           icon={<Wrench />}
//           variant="amber"
//         />
//         <StatCard
//           title="Scrapped"
//           value={summary.assets.SCRAPPED}
//           icon={<Trash2 />}
//           variant="red"
//         />
//         <StatCard
//           title="Low Stock"
//           value={lowStockItems.length}
//           icon={<AlertTriangle />}
//           variant="rose"
//         />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Recent Audit Logs */}
//         <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="font-bold text-slate-800">Recent Audit Logs</h3>
//           </div>
//           <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
//             {recentActivity.length > 0 ? (
//               recentActivity.map((log) => (
//                 <AuditLogItem key={log.id} log={log} />
//               ))
//             ) : (
//               <div className="text-center py-8 text-slate-400 italic">
//                 No recent activity available
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Low Stock Alerts */}
//         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
//           <div className="flex items-center gap-2 mb-6">
//             <AlertTriangle size={18} className="text-amber-500" />
//             <h3 className="font-bold text-slate-800">Inventory Alerts</h3>
//           </div>
//           <div className="space-y-3 max-h-[480px] overflow-y-auto">
//             {lowStockItems.length > 0 ? (
//               // Sort items by criticality (lowest stock percentage first)
//               [...lowStockItems]
//                 .sort(
//                   (a, b) =>
//                     a.currentStock / a.totalQuantity -
//                     b.currentStock / b.totalQuantity,
//                 )
//                 .map((item, index) => {
//                   const isTopCritical = index < 3; // highlight top 3
//                   return (
//                     <div
//                       key={item._id}
//                       className={`p-4 border rounded-xl flex justify-between items-center transition-colors ${
//                         highlightedItemId === item._id
//                           ? "bg-green-100/60 border-green-300"
//                           : isTopCritical
//                             ? "bg-red-50/70 border-red-300 hover:bg-red-50"
//                             : "bg-amber-50/50 border-amber-100 hover:bg-amber-50"
//                       }`}
//                     >
//                       <div>
//                         <p
//                           className={`text-sm font-bold ${isTopCritical ? "text-red-700" : "text-amber-900"}`}
//                         >
//                           {item.itemName}
//                         </p>
//                         <p className="text-xs text-amber-700">
//                           Current Stock: {item.currentStock} /{" "}
//                           {item.totalQuantity}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setIssueItem(item)}
//                           className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
//                         >
//                           Issue
//                         </button>
//                         <button
//                           onClick={() => setReturnItem(item)}
//                           className="text-xs px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
//                         >
//                           Return
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })
//             ) : (
//               <div className="text-center py-8 text-slate-400 italic">
//                 All stock levels healthy
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {issueItem && (
//         <IssueConsumableModal
//           isOpen={!!issueItem}
//           item={issueItem}
//           onClose={() => setIssueItem(null)}
//           onRefresh={fetchDashboard}
//         />
//       )}
//       {returnItem && (
//         <ReturnConsumableModal
//           isOpen={!!returnItem}
//           item={returnItem}
//           onClose={() => setReturnItem(null)}
//           onRefresh={fetchDashboard}
//         />
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect } from "react";
import {
  Users,
  Cpu,
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
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-rose-50 text-rose-600",
    rose: "bg-pink-50 text-pink-600",
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 hover:scale-105 transform transition duration-150">
      <div
        className={`p-2.5 rounded-xl w-fit ${variants[variant] || variants.blue}`}
      >
        {React.cloneElement(icon, { size: 20 })}
      </div>

      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 tabular-nums">
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
      className="flex flex-col md:flex-row md:items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Action Badge */}
      <div
        className={`p-2 rounded-lg font-bold text-[10px] uppercase tracking-tighter flex-shrink-0 ${
          log.action === "RETURNED"
            ? "bg-orange-100 text-orange-600"
            : log.action === "ASSIGNED"
              ? "bg-green-100 text-green-600"
              : "bg-slate-100 text-slate-600"
        }`}
      >
        {log.action}
      </div>

      {/* Log Details */}
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-800 leading-snug">
          {log.description || "No details provided"}
        </p>

        <p className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-2">
          <span className="font-semibold text-slate-500">
            {log.user || "System"}
          </span>
          {log.targetEmployee && (
            <span className="font-medium text-slate-500">
              → {log.targetEmployee}
            </span>
          )}
          • {formatDate(log.timestamp)}
        </p>

        {expanded && log.details && (
          <pre className="mt-2 bg-slate-50 p-2 rounded-md text-xs font-mono text-slate-600 overflow-x-auto">
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
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium animate-pulse">
        Gathering Analytics...
      </div>
    );

  const { summary, lowStockItems, recentActivity } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-2 sm:px-4 md:px-6 lg:px-0">
      {/* HEADER */}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            System Overview
          </h1>
          <p className="text-slate-500 text-sm">
            Real-time inventory, maintenance, and staff health
          </p>
        </div>

        <div className="text-xs font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
          Live Status
        </div>
      </header>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          title="Active Staff"
          value={summary.employees}
          icon={<Users />}
          variant="blue"
        />

        <StatCard
          title="Total Assets"
          value={summary.assets.TOTAL}
          icon={<Cpu />}
          variant="indigo"
        />

        <StatCard
          title="Assigned"
          value={summary.assets.ASSIGNED}
          icon={<Activity />}
          variant="green"
        />

        <StatCard
          title="In Repair"
          value={summary.assets.REPAIR}
          icon={<Wrench />}
          variant="amber"
        />

        <StatCard
          title="Scrapped"
          value={summary.assets.SCRAPPED}
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

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Recent Audit Logs</h3>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
            {recentActivity.length > 0 ? (
              recentActivity.map((log, index) => (
                <AuditLogItem key={log._id || `log-${index}`} log={log} />
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 italic">
                No recent activity available
              </div>
            )}
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">Inventory Alerts</h3>
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
                          ? "bg-green-100/60 border-green-300"
                          : isTopCritical
                            ? "bg-red-50/70 border-red-300 hover:bg-red-50"
                            : "bg-amber-50/50 border-amber-100 hover:bg-amber-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isTopCritical ? "text-red-700" : "text-amber-900"
                          }`}
                        >
                          {item.itemName}
                        </p>

                        <p className="text-xs text-amber-700">
                          Current Stock: {item.currentStock} /{" "}
                          {item.totalQuantity}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setIssueItem(item)}
                          className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Issue
                        </button>

                        <button
                          onClick={() => setReturnItem(item)}
                          className="text-xs px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8 text-slate-400 italic">
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
