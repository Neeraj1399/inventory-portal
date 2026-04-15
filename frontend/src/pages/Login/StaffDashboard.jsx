import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Coffee, ShieldCheck, MessageSquare, RefreshCw } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../../components/common/PageTransition";

const statusLabels = {
  READY_TO_DEPLOY: "Available",
  ALLOCATED: "Allocated",
  UNDER_MAINTENANCE: "Maintenance",
  DECOMMISSIONED: "Retiring",
};

const StatCard = ({ icon, title, value, colorClass }) => (
 <div className="bg-bg-secondary p-6 rounded-2xl border border-border shadow-premium flex items-center gap-5 hover:bg-bg-tertiary/40 transition-all duration-300 group cursor-default relative overflow-hidden">
  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className={`p-3 rounded-2xl transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.3)] shadow-inner ring-1 ring-white/5 ${colorClass}`}>
    {React.cloneElement(icon, { size: 22 })}
  </div>
  <div className="space-y-1">
    <p className="text-[10px] font-black text-text-muted tracking-[0.2em]">{title}</p>
    <p className="text-3xl font-bold text-text-primary tabular-nums tracking-tighter">{value}</p>
  </div>
 </div>
);

const AssetRow = ({ asset }) => (
 <tr className="hover:bg-bg-tertiary/30 transition-all group border-b border-bg-tertiary/50 last:border-0 cursor-default h-[72px]">
  <td className="px-6 py-5">
    <div className="flex flex-col">
      <span className="text-xs font-black text-accent-purple tracking-widest opacity-80 mb-1">{asset.category}</span>
      <span className="text-sm font-bold text-text-primary group-hover:text-white transition-colors tracking-tight">{asset.model}</span>
    </div>
  </td>
  <td className="px-6 py-5 text-sm text-text-muted font-mono tracking-tighter">
  {asset.serialNumber}
  </td>
  <td className="px-6 py-5">
  <span className="px-3 py-1.5 bg-status-success/10 text-status-success border border-status-success/20 text-[9px] font-black rounded-2xl tracking-[0.15em] shadow-sm">
  {statusLabels[asset.status] || asset.status}
  </span>
  </td>
 </tr>
);

const ConsumableCard = ({ c }) => (
 <div className="flex items-center justify-between p-5 bg-bg-secondary rounded-2xl border border-border hover:bg-bg-tertiary/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-premium group h-[88px]">
  <div className="space-y-1">
  <p className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors tracking-tight">{c.name}</p>
  <p className="text-[10px] font-black text-text-muted tracking-widest">Standard Issue</p>
  </div>
  <div className="text-right space-y-0.5">
  <p className="text-2xl font-black text-accent-secondary tracking-tighter">{c.quantity}</p>
  <p className="text-[9px] text-text-disabled font-black tracking-[0.2em]">In Hand</p>
  </div>
 </div>
);

const DashboardSkeleton = () => (
    <div className="space-y-10 animate-pulse pb-12">
      <div className="h-32 w-full bg-bg-secondary rounded-2xl border border-border" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-bg-secondary rounded-2xl border border-border" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[400px] bg-bg-secondary rounded-2xl border border-border" />
        <div className="h-[400px] bg-bg-secondary rounded-2xl border border-border" />
      </div>
    </div>
);

const AssetCard = ({ asset }) => (
    <div className="p-6 bg-bg-secondary rounded-2xl border border-border hover:border-accent-purple/30 transition-all shadow-premium group">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-accent-purple tracking-[0.2em]">{asset.category}</p>
        <span className="px-3 py-1 bg-status-success/10 text-status-success border border-status-success/20 text-[9px] font-black rounded-2xl tracking-[0.15em]">
          {statusLabels[asset.status] || asset.status}
        </span>
      </div>
      <h4 className="text-xl font-bold text-text-primary mb-2 group-hover:text-white transition-colors tracking-tight">{asset.model}</h4>
      <code className="text-xs text-text-muted font-mono bg-bg-elevated px-3 py-1.5 rounded-xl border border-border block w-fit tracking-tighter">
        {asset.serialNumber}
      </code>
    </div>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = useCallback(async (overrides = {}) => {
    try {
      if (!overrides.silent) setLoading(true);
      const res = await api.get("/dashboard/staff", { signal: overrides.signal });
      setData(res.data.data);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error("Failed to load staff dashboard", err);
    } finally {
      // Anti-flicker delay
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStaffData({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchStaffData]);

  return (
    <PageTransition>
      <div className="space-y-10 pb-12">
        <header className="flex items-center justify-between bg-bg-secondary flex-wrap gap-6 p-8 rounded-2xl border border-border shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full -mr-32 -mt-32 blur-[80px] transition-all duration-700 group-hover:bg-accent-purple/10" />
          <div className="relative z-10 space-y-1">
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">
              Welcome back, <span className="text-accent-primary">{user?.name || "Member"}</span>
            </h1>
            <p className="text-text-secondary font-medium text-sm">Hardware & Provisioning Overview</p>
          </div>
          <div className="flex items-center gap-4 relative z-10">
             <Button variant="secondary" size="sm" onClick={() => fetchStaffData()} icon={RefreshCw} className={loading ? "animate-spin" : ""} />
             <Button onClick={() => navigate("/requests")} icon={MessageSquare} className="px-8 py-4 text-[11px] tracking-[0.2em] shadow-glow">
                New Ticket
             </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {loading && !data ? (
            <DashboardSkeleton key="skeleton" />
          ) : !data ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-24 text-center bg-bg-secondary rounded-2xl border border-border">
               <div className="space-y-4">
                  <div className="w-16 h-16 bg-status-danger/10 text-status-danger rounded-full mx-auto flex items-center justify-center border border-status-danger/20"><Monitor size={32}/></div>
                  <p className="text-text-primary font-bold">Failed to synchronize dashboard.</p>
                  <Button variant="secondary" size="sm" onClick={() => fetchStaffData()}>Try Again</Button>
               </div>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard icon={<Monitor size={24} className="text-accent-purple" />} title="Hardware" value={data.allocatedAssets?.length || 0} colorClass="bg-accent-purple/10 text-accent-purple" />
                <StatCard icon={<Coffee size={24} className="text-accent-indigo" />} title="Accessories" value={data.consumables?.length || 0} colorClass="bg-accent-indigo/10 text-accent-indigo" />
                <StatCard icon={<ShieldCheck size={24} className="text-status-success" />} title="Compliance" value="Verified" colorClass="bg-status-success/10 text-status-success" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-bg-secondary/50 p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-text-primary flex items-center gap-3"><Monitor className="text-accent-primary" size={20} /> Serialized Gear</h3>
                    <Badge variant="muted">{data.allocatedAssets?.length || 0} Items</Badge>
                  </div>
                  <div className="hidden md:block bg-bg-secondary rounded-2xl border border-border shadow-premium overflow-hidden">
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-bg-tertiary/50 text-text-muted text-[10px] font-black tracking-[0.2em] border-b border-border">
                          <tr><th className="px-6 py-5">Classification</th><th className="px-6 py-5">S/N</th><th className="px-6 py-5">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.allocatedAssets?.map((asset) => (<AssetRow key={asset._id} asset={asset} />))}
                        </tbody>
                      </table>
                    </div>
                    {(!data.allocatedAssets || data.allocatedAssets.length === 0) && (
                      <div className="p-24 text-center text-text-muted">No hardware assigned.</div>
                    )}
                  </div>
                  <div className="md:hidden space-y-4">
                    {data.allocatedAssets?.map((asset) => (<AssetCard key={asset._id} asset={asset} />))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-bg-secondary/50 p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-text-primary flex items-center gap-3"><Coffee className="text-accent-indigo" size={20} /> Accessories</h3>
                  </div>
                  <div className="bg-bg-secondary rounded-2xl border border-border shadow-premium p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {data.consumables?.map((c) => (<ConsumableCard key={c._id || c.name} c={c} />))}
                      {(!data.consumables || data.consumables.length === 0) && (
                        <div className="col-span-full py-24 text-center text-text-muted border border-dashed border-border rounded-2xl">No accessories listed.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default StaffDashboard;
