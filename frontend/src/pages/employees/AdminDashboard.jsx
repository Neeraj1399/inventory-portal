import React, { useState, useEffect } from "react";
import {
  Users,
  Monitor,
  Cpu,
  Activity,
  Wrench,
  Trash2,
  AlertTriangle,
  ChevronDown,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import api from "../../services/api";
import PageTransition from "../../components/common/PageTransition";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import RestockConsumableModal from "../../components/consumables/RestockConsumableModal";
import Skeleton from "../../components/common/Skeleton";

/* ---------------------- UTIL ---------------------- */

const formatDate = (date) => {
  if (!date) return "N/A";
  const d = new Date(date);
  return isNaN(d) ? "N/A" : d.toLocaleString();
};

/* ---------------------- STAT CARD ---------------------- */

const StatCard = ({ title, value, icon, variant }) => {
  const variants = {
    blue: "bg-status-info/10 text-status-info shadow-status-info/20",
    indigo: "bg-accent-indigo/10 text-accent-indigo shadow-accent-indigo/20",
    green: "bg-status-success/10 text-status-success shadow-status-success/20",
    amber: "bg-status-warning/10 text-status-warning shadow-status-warning/20",
    red: "bg-status-danger/10 text-status-danger shadow-status-danger/20",
    rose: "bg-status-danger/10 text-status-danger shadow-status-danger/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-premium flex flex-col gap-6 transition-all hover:bg-bg-tertiary/40 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div
        className={`p-3 rounded-2xl w-fit transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] shadow-inner ring-1 ring-white/5 ${
          variants[variant] || variants.blue
        }`}
      >
        {React.cloneElement(icon, { size: 22 })}
      </div>
      
      <div className="space-y-1">
        <p className="text-[10px] font-black text-text-muted tracking-[0.2em]">
          {title}
        </p>
        <p className="text-3xl font-bold text-text-primary tabular-nums tracking-tighter">
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
      className="group flex flex-col md:flex-row md:items-center gap-4 md:gap-8 p-4 rounded-2xl hover:bg-bg-tertiary/40 transition-all border border-transparent hover:border-border cursor-pointer relative"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="md:w-28 flex-shrink-0">
        <div
          className={`text-center py-2 rounded-2xl border font-black text-[9px] tracking-[0.2em] shadow-sm transition-all ${
            log.action === "RECOVERED" || log.action === "RETURNED"
              ? "bg-status-warning/10 border-status-warning/20 text-status-warning"
              : log.action === "ALLOCATED" ||
                log.action === "APPROVED" ||
                log.action === "REPLENISHED"
              ? "bg-status-success/10 border-status-success/20 text-status-success"
              : log.action === "CREATED"
              ? "bg-accent-purple/10 border-accent-purple/20 text-accent-purple"
              : log.action === "DELETED" ||
                log.action === "REJECTED" ||
                log.action === "DECOMMISSIONED"
              ? "bg-status-danger/10 border-status-danger/20 text-status-danger"
              : "bg-bg-tertiary/50 border-border text-text-muted"
          }`}
        >
          {log.action === "READY_TO_DEPLOY"
            ? "Available"
            : log.action === "ALLOCATED"
            ? "Allocated"
            : log.action === "UNDER_MAINTENANCE"
            ? "Maintenance"
            : log.action === "DECOMMISSIONED"
            ? "Retiring"
            : log.action}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-bold text-text-secondary truncate group-hover:text-text-primary transition-colors tracking-tight">
          {(log.description || "No details provided")
            .replace(/READY_TO_DEPLOY/g, "Available")
            .replace(/ALLOCATED/g, "Allocated")
            .replace(/UNDER_MAINTENANCE/g, "Maintenance")
            .replace(/DECOMMISSIONED/g, "Retiring")}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-text-muted tabular-nums overflow-hidden font-medium">
          <span className="font-black text-text-primary px-2 py-0.5 bg-bg-tertiary rounded-lg border border-border truncate max-w-[120px]">
            {log.performedBy || "System"}
          </span>
 
          {log.targetEmployee && (
            <div className="flex items-center gap-2 px-2.5 py-0.5 bg-accent-purple/10 rounded-2xl border border-accent-purple/20 text-accent-purple whitespace-nowrap font-bold">
              <span className="opacity-70">
                {log.action === "RECOVERED" ? "←" : "→"}
              </span>
              <span>
                {log.targetEmployee}
              </span>
            </div>
          )}
 
          <span className="text-text-disabled font-black">/</span>
          <span className="truncate lowercase tracking-tight italic opacity-80">
            {formatDate(log.timestamp || log.time)}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end w-10">
        <div
          className={`p-2 rounded-full transition-all duration-300 ${
            expanded ? "bg-accent-primary/20 text-accent-primary shadow-glow" : "text-text-disabled group-hover:text-text-muted"
          }`}
        >
          <ChevronDown
            size={16}
            className={`transform transition-transform duration-500 ease-out ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {expanded && log.details && (
        <div className="w-full md:pl-32 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-primary to-transparent rounded-full opacity-50" />
            <pre className="bg-bg-elevated border border-border p-5 rounded-2xl text-[11px] font-mono text-accent-primary/80 overflow-x-auto shadow-inner ml-4 custom-scrollbar">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardSkeleton = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="space-y-12 max-w-[1600px] mx-auto pb-12"
  >
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-3">
        <div className="h-10 w-64 bg-bg-tertiary rounded-2xl animate-pulse" />
        <div className="h-4 w-80 bg-bg-tertiary/50 rounded-2xl animate-pulse" />
      </div>
      <div className="h-8 w-40 bg-bg-tertiary/50 rounded-full animate-pulse" />
    </div>
 
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-40 w-full bg-bg-secondary border border-border rounded-2xl animate-pulse" />
      ))}
    </div>
 
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 h-[600px] bg-bg-secondary border border-border rounded-2xl animate-pulse" />
      <div className="h-[600px] bg-bg-secondary border border-border rounded-2xl animate-pulse" />
    </div>
  </motion.div>
);

/* ---------------------- ADMIN DASHBOARD ---------------------- */

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [issueItem, setIssueItem] = useState(null);
  const [returnItem, setReturnItem] = useState(null);
  const [restockItem, setRestockItem] = useState(null);

  const [highlightedItemId, setHighlightedItemId] = useState(null);

  const fetchDashboard = async (signal) => {
    try {
      const res = await api.get("/dashboard/admin", { signal });
      setData(res.data.data);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("Dashboard fetch failed", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Safe destructuring
  const summary = data?.summary || { employees: 0, assets: { TOTAL: 0, ALLOCATED: 0, UNDER_MAINTENANCE: 0, DECOMMISSIONED: 0 } };
  const recentActivity = data?.recentActivity || [];
  const lowStockItems = data?.lowStockItems || [];

  return (
    <PageTransition className="relative z-0">
      <AnimatePresence mode="wait">
        {loading || !data ? (
          <DashboardSkeleton key="skeleton" />
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="max-w-[1600px] mx-auto pb-12 space-y-12 px-2 sm:px-4 md:px-6 lg:px-0"
          >
            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                  Operations <span className="text-accent-primary">Dashboard</span>
                </h1>
                <p className="text-text-secondary font-medium">
                  Hardware & Inventory Lifecycle Monitoring
                </p>
              </div>
       
              <div className="text-[10px] font-black text-accent-primary bg-accent-primary/10 px-4 py-1.5 rounded-full border border-accent-primary/20 shadow-glow text-center tracking-widest">
                System Operational Health
              </div>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
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
                title="Allocated Assets"
                value={summary.assets.ALLOCATED}
                icon={<Activity />}
                variant="green"
              />
              <StatCard
                title="Assets in Maintenance"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* RECENT LOGS */}
              <div className="lg:col-span-2 bg-bg-secondary p-8 rounded-2xl border border-border shadow-premium">
                <h3 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-3">
                   <Activity className="text-accent-primary" size={20} />
                   Recent Audit Logs
                </h3>

                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((log, index) => (
                      <AuditLogItem key={log._id || `log-${index}`} log={log} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-text-muted italic">
                      No recent activity available
                    </div>
                  )}
                </div>
              </div>

              {/* LOW STOCK */}
              <div className="bg-bg-secondary p-8 rounded-2xl border border-border shadow-premium">
                <div className="flex items-center gap-3 mb-8">
                  <AlertTriangle size={20} className="text-status-warning" />
                  <h3 className="text-lg font-bold text-text-primary">Inventory Alerts</h3>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-hide">
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
                            className={`p-5 border rounded-2xl flex justify-between items-center transition-all hover:-translate-y-0.5 ${
                              highlightedItemId === item._id
                                ? "bg-status-success/10 border-status-success/30 shadow-status-success/10"
                                : isTopCritical
                                ? "bg-status-danger/10 border-status-danger/30 hover:bg-status-danger/15 shadow-status-danger/5"
                                : "bg-status-warning/10 border-status-warning/30 hover:bg-status-warning/15 shadow-status-warning/5"
                            }`}
                          >
                            <div>
                              <p
                                className={`text-sm font-black tracking-tight ${
                                  isTopCritical ? "text-status-danger" : "text-status-warning"
                                }`}
                              >
                                {item.itemName}
                              </p>

                              <p className={`text-[10px] font-black tracking-widest mt-1 ${isTopCritical ? "text-status-danger/60" : "text-status-warning/60"}`}>
                                Current Stock: <span className="text-text-primary">{item.currentStock}</span> <span className="mx-1">/</span> {item.totalQuantity}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setRestockItem(item)}
                                className="text-[10px] tracking-widest px-4 py-2 rounded-xl bg-status-success text-white font-black hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-status-success/20"
                              >
                                Restock
                              </button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8 text-text-muted italic">
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
                onRefresh={() => fetchDashboard()}
              />
            )}
            {returnItem && (
              <ReturnConsumableModal
                isOpen={!!returnItem}
                item={returnItem}
                onClose={() => setReturnItem(null)}
                onRefresh={() => fetchDashboard()}
              />
            )}
            {restockItem && (
              <RestockConsumableModal
                isOpen={!!restockItem}
                item={restockItem}
                onClose={() => setRestockItem(null)}
                onRefresh={() => fetchDashboard()}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default AdminDashboard;
