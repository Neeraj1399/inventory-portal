import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Monitor, 
  Smartphone, 
  Headphones, 
  Keyboard, 
  Laptop,
  ArrowRight,
  Download,
  CheckCircle2,
  Clock,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

// Premium Primitives
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import PageTransition from "../../components/common/PageTransition";

const IntelligenceSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-44 bg-bg-secondary rounded-3xl border border-border" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="h-[500px] bg-bg-secondary rounded-3xl border border-border" />
      <div className="h-[500px] bg-bg-secondary rounded-3xl border border-border" />
    </div>
  </div>
);

const RequestDashboard = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const categoryIcons = {
    Laptop: <Laptop size={20} />,
    Monitor: <Monitor size={20} />,
    Mobile: <Smartphone size={20} />,
    Headphones: <Headphones size={20} />,
    Keyboard: <Keyboard size={20} />,
    Others: <Package size={20} />
  };

  const fetchStats = useCallback(async (overrides = {}) => {
    try {
      if (!overrides.silent) setLoading(true);
      const { data } = await api.get("/requests/stats", { signal: overrides.signal });
      setStats(data.data || []);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      addToast("Intelligence synchronization failed", "error");
    } finally {
      // Anti-flicker delay
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [addToast]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats({ signal: controller.signal });
    return () => controller.abort();
  }, [fetchStats]);

  const handleExport = () => {
    if (stats.length === 0) {
      addToast("No data available for export", "warning");
      return;
    }
    try {
      let csvContent = "Category,Total Requests,Pending Approval,Immediate Attention,New Units,Replacement\n";
      stats.forEach(cat => {
        const newUnits = cat.breakdown.find(b => b.type === "NEW")?.count || 0;
        const replacements = cat.breakdown.find(b => b.type === "REPLACEMENT")?.count || 0;
        csvContent += `"${cat._id}",${cat.total},${cat.pending},${cat.immediate},${newUnits},${replacements}\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `intelligence_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast("Export sequence complete", "success");
    } catch (err) {
      addToast("Export operation failed", "error");
    }
  };

  const totalRequests = stats.reduce((acc, curr) => acc + curr.total, 0);
  const totalImmediate = stats.reduce((acc, curr) => acc + (curr.immediate || 0), 0);
  const highestDemand = stats[0]?._id && stats[0]._id !== "None" ? stats[0]._id : (stats[1]?._id || stats[0]?._id || "None");
  const bulkSuggestions = stats.filter(s => s.pending >= 3);

  return (
    <PageTransition className="space-y-12 max-w-[1600px] mx-auto pb-12">
      <PageHeader 
        title="Request Intelligence"
        subtitle={loading ? "Analyzing procurement vectors..." : "Strategic analysis of asset demand and logistics."}
        icon={BarChart3}
        onBack={() => navigate("/requests")}
        action={
          <Button variant="secondary" onClick={handleExport} icon={Download}>Export CSV</Button>
        }
      />

      <AnimatePresence mode="wait">
        {loading && stats.length === 0 ? (
          <IntelligenceSkeleton key="skeleton" />
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
          >
            {/* Summary Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StatCard title="Lifetime Total" value={totalRequests} icon={Package} variant="info" description="Aggregate service entries recorded" />
              <StatCard title="Critical Queue" value={totalImmediate} icon={Clock} variant="danger" description="High-priority resolution required" />
              <StatCard title="Primary Demand" value={highestDemand} icon={TrendingUp} variant="primary" description="Most active resource category" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Procurement Foresight */}
              <Card className="p-8 relative overflow-hidden group min-h-[500px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full -mr-32 -mt-32 blur-[80px]" />
                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <div className="p-3 bg-accent-primary/10 rounded-xl text-accent-primary border border-accent-primary/10"><TrendingUp size={24} /></div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Procurement Foresight</h2>
                </div>

                <div className="space-y-4 relative z-10">
                  {bulkSuggestions.length > 0 ? (
                    bulkSuggestions.map((s, idx) => (
                      <div key={idx} className="p-6 bg-bg-elevated border border-border rounded-2xl flex items-center justify-between group/insight hover:bg-bg-tertiary transition-all shadow-inner">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-accent-primary/10 text-accent-primary rounded-2xl flex items-center justify-center font-black text-xl border border-accent-primary/10 group-hover/insight:scale-110 transition-transform shadow-premium">{s.pending}</div>
                          <div className="space-y-1">
                            <p className="text-text-primary font-black text-lg tracking-tight">Bulk Capacity: {s._id}</p>
                            <p className="text-text-muted text-[10px] font-black tracking-widest opacity-60">Scale resolution required</p>
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-text-disabled group-hover/insight:text-accent-primary group-hover/insight:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center space-y-6">
                      <div className="p-8 bg-bg-elevated rounded-full text-status-success/40 shadow-inner"><CheckCircle2 size={48} /></div>
                      <p className="text-text-muted text-sm font-black tracking-widest opacity-60">No procurement alerts detected</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Distribution Matrix */}
              <Card className="p-8 relative group min-h-[500px]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-accent-secondary/10 rounded-xl text-accent-secondary border border-accent-secondary/10"><BarChart3 size={24} /></div>
                  <h2 className="text-xl font-black text-text-primary tracking-tight">Category Distribution</h2>
                </div>
                <div className="space-y-8">
                  {stats.map((s, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-3 text-[10px] font-black tracking-widest text-text-muted">
                          <div className="p-1.5 bg-bg-elevated rounded-lg text-accent-secondary border border-border">{categoryIcons[s._id] || <Package size={14} />}</div>
                          {s._id}
                        </span>
                        <span className="text-xs font-black text-text-primary">{s.total} TOTAL</span>
                      </div>
                      <div className="h-5 bg-bg-elevated rounded-full overflow-hidden flex border border-border shadow-inner p-0.5">
                        {s.breakdown.map((b, bIdx) => (
                          <div key={bIdx} style={{ width: `${(b.count / s.total) * 100}%` }} className={`${b.type === "NEW" ? "bg-accent-primary" : "bg-accent-secondary"} h-full first:rounded-l-full last:rounded-r-full hover:brightness-125 transition-all shadow-glow-sm`} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-8 pt-6 border-t border-border">
                    <div className="flex items-center gap-3"><div className="w-3 h-3 bg-accent-primary rounded-full shadow-glow-sm" /><span className="text-[10px] font-black tracking-widest text-text-disabled">Acquisitions</span></div>
                    <div className="flex items-center gap-3"><div className="w-3 h-3 bg-accent-secondary rounded-full shadow-glow-sm" /><span className="text-[10px] font-black tracking-widest text-text-disabled">Maintenance</span></div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Exploration Grid */}
            <div className="space-y-8">
              <h2 className="text-xl font-black text-text-primary tracking-tight px-1">Resource Clusters</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stats.map((cat, idx) => (
                  <Card key={idx} className="p-8 group hover:border-accent-primary/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 -rotate-12 group-hover:rotate-0">
                      {React.cloneElement(categoryIcons[cat._id] || <Package />, { size: 180 })}
                    </div>
                    <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="p-4 bg-bg-elevated border border-border rounded-2xl text-accent-primary group-hover:scale-110 group-hover:shadow-glow transition-all shadow-premium">{categoryIcons[cat._id] || <Package size={28} />}</div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-text-disabled tracking-widest opacity-60 mb-1">Aggregate</p>
                        <p className="text-4xl font-black text-text-primary tracking-tighter group-hover:text-white transition-colors">{cat.total}</p>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-8 tracking-tight group-hover:text-white transition-colors relative z-10">{cat._id}</h3>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center py-4 border-b border-border">
                        <span className="text-text-secondary text-sm font-bold">Unresolved Queue</span>
                        <Badge variant={cat.pending > 0 ? "warning" : "muted"} className="font-black px-4">{cat.pending}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-4 border-b border-border">
                        <span className="text-text-secondary text-sm font-bold">Resolution Mix</span>
                        <span className="text-text-primary font-black text-xs tracking-tight">
                          {cat.breakdown.find(b => b.type === "NEW")?.count || 0} ACQ <span className="text-text-disabled mx-2 opacity-30">|</span> {cat.breakdown.find(b => b.type === "REPLACEMENT")?.count || 0} MAINT
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/requests?search=${encodeURIComponent(cat._id)}`)} variant="secondary" className="w-full mt-10 h-14" icon={ArrowRight}>Analyze Cluster</Button>
                  </Card>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

const StatCard = ({ title, value, icon: Icon, variant, description }) => {
  const variants = {
    primary: "from-accent-primary/20 bg-accent-primary/5 border-accent-primary/20 text-accent-primary shadow-accent-primary/10",
    info: "from-status-info/20 bg-status-info/5 border-status-info/20 text-status-info shadow-status-info/10",
    danger: "from-status-danger/20 bg-status-danger/5 border-status-danger/20 text-status-danger shadow-status-danger/10",
  };
  return (
    <Card className={`bg-gradient-to-br ${variants[variant]} p-8 group hover:brightness-110 shadow-2xl overflow-hidden relative`}>
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-black tracking-[0.2em] opacity-60 mb-2">{title}</p>
          <h4 className="text-4xl font-black text-text-primary tracking-tighter group-hover:text-white transition-colors">{value}</h4>
        </div>
        <div className={`p-4 bg-bg-elevated/40 rounded-2xl border border-border shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-premium`}><Icon size={32} /></div>
      </div>
      <p className="mt-6 text-text-muted text-xs font-black tracking-widest opacity-40 leading-relaxed max-w-[200px] relative z-10">{description}</p>
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-bg-tertiary rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
    </Card>
  );
};

export default RequestDashboard;
