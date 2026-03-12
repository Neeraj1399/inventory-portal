import React, { useEffect, useState } from "react";
import { Monitor, Coffee, ShieldCheck } from "lucide-react";
import api from "../../hooks/api";

// --- Small Reusable Components ---
const StatCard = ({ icon, title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${colorClass}`}>{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-500 uppercase">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const AssetRow = ({ asset }) => (
  <tr className="hover:bg-slate-50 transition-colors">
    <td className="px-6 py-4 text-sm font-medium text-slate-800">
      {asset.category} - {asset.model}
    </td>
    <td className="px-6 py-4 text-sm text-slate-500 font-mono">
      {asset.serialNumber}
    </td>
    <td className="px-6 py-4">
      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-md uppercase">
        {asset.status}
      </span>
    </td>
  </tr>
);

const ConsumableCard = ({ c }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
    <div>
      <p className="text-sm font-bold text-slate-800">{c.name}</p>
      <p className="text-xs text-slate-500">Standard Issue</p>
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-blue-600">{c.quantity}</p>
      <p className="text-[10px] text-slate-400 uppercase font-bold">In Hand</p>
    </div>
  </div>
);

const StaffDashboard = () => {
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
    return <div className="p-8 text-slate-500">Loading your gear...</div>;

  if (!data)
    return (
      <div className="p-8 text-red-500">Unable to load dashboard data.</div>
    );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome back, {user.name}
          </h1>
          <p className="text-slate-500">
            Here is a summary of the equipment assigned to you.
          </p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Monitor size={24} className="text-blue-600" />}
          title="Hardware"
          value={data.serializedAssets?.length || 0}
          colorClass="bg-blue-100"
        />
        <StatCard
          icon={<Coffee size={24} className="text-purple-600" />}
          title="Consumables"
          value={data.consumables?.length || 0}
          colorClass="bg-purple-100"
        />
        <StatCard
          icon={<ShieldCheck size={24} className="text-slate-600" />}
          title="Policy"
          value="Compliant"
          colorClass="bg-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assets Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">My Serialized Gear</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Category & Model</th>
                  <th className="px-6 py-4">Serial Number</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.serializedAssets?.map((asset) => (
                  <AssetRow key={asset._id} asset={asset} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consumables Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 mb-6">
            Assigned Consumables
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
