import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, Coffee, ShieldCheck, MessageSquare } from "lucide-react";
import api from "../../hooks/api";

const StatCard = ({ icon, title, value, colorClass }) => (
 <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm flex items-center gap-4 hover:bg-zinc-800 hover:scale-105 transform transition duration-300 hover:shadow-xl hover:border-zinc-700 cursor-default">
 <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
 <div>
 <p className="text-sm font-medium text-zinc-400 uppercase">{title}</p>
 <p className="text-2xl font-bold text-zinc-50">{value}</p>
 </div>
 </div>
);

const AssetRow = ({ asset }) => (
 <tr className="hover:bg-zinc-700/50 transition-colors border-b border-zinc-800 last:border-0">
 <td className="px-6 py-4 text-sm font-medium text-zinc-200">
 {asset.category} - {asset.model}
 </td>
 <td className="px-6 py-4 text-sm text-zinc-400 font-mono">
 {asset.serialNumber}
 </td>
 <td className="px-6 py-4">
 <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md uppercase">
 {asset.status}
 </span>
 </td>
 </tr>
);

const ConsumableCard = ({ c }) => (
 <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:bg-zinc-800 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:border-purple-500/30">
 <div>
 <p className="text-sm font-bold text-zinc-200">{c.name}</p>
 <p className="text-xs text-zinc-400">Standard Issue</p>
 </div>
 <div className="text-right">
 <p className="text-lg font-black text-indigo-400">{c.quantity}</p>
 <p className="text-[10px] text-zinc-500 uppercase font-bold">In Hand</p>
 </div>
 </div>
);

const StaffDashboard = () => {
  const navigate = useNavigate();
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
  
 const user = JSON.parse(localStorage.getItem("user") || "{}");

 useEffect(() => {
 const fetchStaffData = async () => {
 try {
 const res = await api.get("/dashboard/staff");
 setData(res.data.data);
 } catch (err) {
 console.error("Failed to load personal dashboard", err);
 } finally {
 setLoading(false);
 }
 };
 fetchStaffData();
 }, []);

 if (loading)
 return <div className="p-8 text-zinc-500">Loading your gear...</div>;

 if (!data)
 return (
 <div className="p-8 text-red-500">Unable to load dashboard data.</div>
 );

 return (
 <div className="space-y-8">
 <header className="flex items-center justify-between bg-zinc-900 flex-wrap gap-4 p-4 rounded-3xl border border-zinc-800 shadow-xl">
        <div>
          <h1 className="text-2xl font-black text-zinc-50 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-zinc-400 text-sm">
            Hardware & Provisioning Overview
          </p>
        </div>
        <button 
          onClick={() => navigate("/requests")}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
        >
          <MessageSquare size={18} />
          Report Issue / Request
        </button>
      </header>

 {/* Stats */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <StatCard
 icon={<Monitor size={24} className="text-indigo-400" />}
 title="Hardware"
 value={data.allocatedAssets?.length || 0}
 colorClass="bg-indigo-500/10 border border-indigo-500/20"
 />
 <StatCard
 icon={<Coffee size={24} className="text-purple-400" />}
 title="Accessories"
 value={data.consumables?.length || 0}
 colorClass="bg-purple-500/10 border border-purple-500/20"
 />
 <StatCard
 icon={<ShieldCheck size={24} className="text-emerald-400" />}
 title="Policy"
 value="Compliant"
 colorClass="bg-emerald-500/10 border border-emerald-500/20"
 />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
 {/* Assets Table */}
 <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
 <div className="p-6 border-b border-zinc-800">
 <h3 className="font-bold text-zinc-50">My Serialized Gear</h3>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-zinc-950/40 text-zinc-400 text-xs uppercase font-semibold border-b border-zinc-800">
 <tr>
 <th className="px-6 py-4">Asset Classification & Model</th>
 <th className="px-6 py-4">Serial Number</th>
 <th className="px-6 py-4">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-zinc-800">
 {data.allocatedAssets?.map((asset) => (
 <AssetRow key={asset._id} asset={asset} />
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Consumables Grid */}
 <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm p-6">
 <h3 className="font-bold text-zinc-50 mb-6">
 Allocated Consumables
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {data.consumables?.map((c) => (
 <ConsumableCard key={c._id || c.name} c={c} />
 ))}
 </div>
 </div>
 </div>
   
    </div>
 );
};

export default StaffDashboard;
