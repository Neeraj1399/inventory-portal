import { useAuth } from "../../context/AuthContext";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
 Keyboard, Package,
 Plus,
 UserPlus,
 RotateCcw,
 AlertCircle,
 Search,
 RefreshCw,
 Trash2,
 ChevronDown,
 Wrench,
 CheckCircle,
} from "lucide-react";

import api from "../../hooks/api";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
 Keyboard, Package,
 Plus,
 UserPlus,
 RotateCcw,
 AlertCircle,
 Search,
 RefreshCw,
 Trash2,
 ChevronDown,
 Wrench,
 CheckCircle,
 PlusCircle,
} from "lucide-react";

import api from "../../hooks/api";

// Modals
import RequestModal from "../../components/common/RequestModal";
import AddConsumableModal from "../../components/consumables/AddConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import ConsumableConditionModal from "../../components/consumables/ConsumableConditionModal";
import ConsumableMaintenanceResolveModal from "../../components/consumables/ConsumableMaintenanceResolveModal";
import RestockConsumableModal from "../../components/consumables/RestockConsumableModal";

const ConsumableList = () => {
  const { user } = useAuth();
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState("");
 const [statusFilter, setStatusFilter] = useState("ALL");
 const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

 const [selectedItem, setSelectedItem] = useState(null);
 const [activeModal, setActiveModal] = useState(null);
  const [selectedConsumable, setSelectedConsumable] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

 const filterOptions = ["ALL", "READY_TO_DEPLOY", "LOW STOCK", "ALLOCATED", "UNDER_MAINTENANCE", "RESTOCK"];

 const fetchConsumables = useCallback(async (silent = false) => {
 try {
 if (!silent) setLoading(true);
 const res = await api.get("/consumables", { params: { _t: Date.now() } });
 setItems(res.data?.data || []);
 } catch (err) {
 console.error("Fetch error:", err);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchConsumables();
 }, [fetchConsumables]);

 const handleDelete = async (id, name, allocated) => {
 if (allocated > 0) {
 alert(
 `Cannot delete "${name}" because ${allocated} units are currently allocated to employees.`,
 );
 return;
 }

 if (
 window.confirm(
 `Are you sure you want to permanently delete "${name}" from the inventory?`,
 )
 ) {
 try {
 await api.delete(`/consumables/${id}`);
 fetchConsumables(true);
 } catch (err) {
 alert(err.response?.data?.message || "Failed to delete item.");
 }
 }
 };

 const filteredItems = useMemo(() => {
 const search = searchTerm.toLowerCase();
 return items.filter((item) => {
 const matchesSearch = item.itemName?.toLowerCase().includes(search);

 const inMaintenance = item.maintenanceQuantity || 0;
 const available =
 (item.totalQuantity || 0) -
 (item.assignedQuantity || 0) -
 inMaintenance;

 let matchesStatus = true;
 if (statusFilter === "LOW STOCK")
 matchesStatus = available <= (item.lowStockThreshold || 5);
 if (statusFilter === "ALLOCATED")
 matchesStatus = (item.assignedQuantity || 0) > 0;
 if (statusFilter === "READY_TO_DEPLOY") matchesStatus = available > 0;
 if (statusFilter === "UNDER_MAINTENANCE") matchesStatus = inMaintenance > 0;

 return matchesSearch && matchesStatus;
 });
 }, [items, searchTerm, statusFilter]);

 const openModal = (type, item = null) => {
 setSelectedItem(item);
 setActiveModal(type);
 };

 const closeModal = () => {
 setSelectedItem(null);
 setActiveModal(null);
 };

 return (
 <div className="space-y-6 pb-32 max-w-7xl mx-auto px-4">
 {/* HEADER SECTION */}
 <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-zinc-800/60 pb-6">
 <div>
 <h1 className="text-3xl font-black text-zinc-50 tracking-tight">
 Consumables
 </h1>
 <p className="text-zinc-400 font-medium">
 Manage stock levels, allocations, and repairs
 </p>
 </div>

 <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchConsumables()}
            className="p-3 bg-zinc-800 border border-zinc-800 rounded-xl hover:bg-zinc-700 hover:text-white transition-colors shadow-sm text-zinc-300"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {user?.roleAccess === "ADMIN" ? (
            <button
              onClick={() => openModal("ADD")}
              className="flex-1 sm:flex-none bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 font-bold transition-all"
            >
              <Plus size={20} /> Add Consumable
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedConsumable(null);
                setIsRequestModalOpen(true);
              }}
              className="flex-1 sm:flex-none bg-gradient-to-tr from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-black/20 font-bold transition-all"
            >
              <AlertCircle size={20} /> Request Supplies
            </button>
          )}
        </div>
 </div>

 {/* SEARCH & FILTERS */}
 <div className="flex flex-col md:flex-row gap-4 items-center">
 <div className="flex-1 relative group w-full">
 <Search
 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-400"
 size={18}
 />
 <input
 type="text"
 placeholder="Search inventory..."
 className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>

 <div className="relative w-full md:w-64">
 <button
 onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
 className="w-full flex items-center justify-between px-5 py-3 bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl shadow-sm hover:border-slate-600 transition-all"
 >
 <span className="text-xs font-black uppercase tracking-wider">
 {statusFilter === "ALL" ? "Global Filter" : (statusFilter === "READY_TO_DEPLOY" ? "Ready to Deploy" : statusFilter)}
 </span>
 <ChevronDown
 size={18}
 className={`transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`}
 />
 </button>

 {isFilterDropdownOpen && (
 <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-800 rounded-2xl shadow-2xl z-20 overflow-hidden shadow-slate-900/50">
 {filterOptions.map((opt) => (
 <button
 key={opt}
 onClick={() => {
 setStatusFilter(opt);
 setIsFilterDropdownOpen(false);
 }}
 className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${statusFilter === opt ? "bg-indigo-500/10 text-indigo-400" : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-50"}`}
 >
 {opt}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* INVENTORY GRID */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredItems.map((item) => {
 const inMaintenance = item.maintenanceQuantity || 0;
 const assignedQty = item.assignedQuantity || 0;
 const totalQty = item.totalQuantity || 0;
 const available = totalQty - assignedQty - inMaintenance;
 const isLowStock = available <= (item.lowStockThreshold || 5);
 const unitCost = item.unitCost || 0;

 return (
 <div
 key={item._id}
 className="bg-zinc-800/40 rounded-[2.5rem] border border-zinc-800 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col relative group hover:border-zinc-700 hover:bg-zinc-800"
 >
 <button
 onClick={() =>
 handleDelete(item._id, item.itemName, assignedQty)
 }
 className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
 title="Delete Consumable"
 >
 <Trash2 size={18} />
 </button>

 <div className="mb-6 flex justify-between items-start">
 <div
 className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLowStock ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"}`}
 >
 <Package size={28} />
 </div>

 <div className="flex flex-col gap-1 items-end mr-8">
 {/* Status Badges */}
 {isLowStock && (
 <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase">
 <AlertCircle size={10} /> Low Stock
 </span>
 )}
 {inMaintenance > 0 && (
 <span className="flex items-center gap-1 text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20 uppercase">
 <Wrench size={10} /> {inMaintenance} Under Service
 </span>
 )}

 {/* FINANCIAL OVERLAY */}
 <div className="mt-2 text-right">
 <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.15em] leading-none mb-1">
 Asset Inventory Valuation
 </p>
 <p className="text-sm font-black text-emerald-400 leading-none">
 $
 {(unitCost * totalQty).toLocaleString(undefined, {
 minimumFractionDigits: 2,
 })}
 </p>
 </div>
 </div>
 </div>

 <div className="flex-1">
 <h3 className="text-xl font-black text-zinc-50 uppercase tracking-tight leading-tight">
 {item.itemName}
 </h3>
 <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">
 {item.category} • ${unitCost.toFixed(2)} / unit
 </p>
 </div>

 <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
 <div>
 <div className="text-4xl font-black text-zinc-50 leading-none">
 {available}
 </div>
 <p className="text-[10px] font-bold text-zinc-500 uppercase mt-2">
 Available Warehouse Stock
 </p>
 </div>

 <div className="flex gap-2">
 {inMaintenance > 0 && (
 <button
 onClick={() => openModal("RESOLVE", item)}
 className="p-3 bg-emerald-500/100/10 text-emerald-400 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/100 hover:text-white transition-all shadow-sm"
 title="Finish Repair"
 >
 <CheckCircle size={20} />
 </button>
 )}
 <button
 onClick={() => openModal("CONDITION", item)}
 className="p-3 bg-amber-500/100/20 text-amber-400 border border-amber-500/30 rounded-2xl hover:bg-amber-500/100 hover:text-white transition-all shadow-md"
 title="Maintenance / Scrap"
 >
 <Wrench size={20} />
 </button>
 <button
 disabled={available === 0}
 onClick={() => openModal("ISSUE", item)}
 className="p-3 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-2xl hover:bg-indigo-600 hover:text-white disabled:opacity-20 transition-all shadow-md"
 title="Allocate to Employee"
 >
 <UserPlus size={20} />
 </button>
  <button
  onClick={() => openModal("RESTOCK", item)}
  className="p-3 bg-zinc-950 border border-zinc-800 text-emerald-400 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-md"
  title="Restock Inventory"
  >
  <PlusCircle size={20} />
  </button>
 <button
 onClick={() => openModal("RETURN", item)}
 className="p-3 bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-2xl hover:bg-zinc-700 hover:text-white transition-all shadow-sm"
 title="Return Units"
 >
 <RotateCcw size={20} />
 </button>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* MODAL LAYER */}
 <AddConsumableModal
 isOpen={activeModal === "ADD"}
 onClose={closeModal}
 onRefresh={() => fetchConsumables(true)}
 />
 <IssueConsumableModal
 isOpen={activeModal === "ISSUE"}
 item={selectedItem}
 onClose={closeModal}
 onRefresh={() => fetchConsumables(true)}
 />
 <ReturnConsumableModal
 isOpen={activeModal === "RETURN"}
 item={selectedItem}
 onClose={closeModal}
 onRefresh={() => fetchConsumables(true)}
 />
 <ConsumableConditionModal
 isOpen={activeModal === "CONDITION"}
 item={selectedItem}
 onClose={closeModal}
 onRefresh={() => fetchConsumables(true)}
 />
 <ConsumableMaintenanceResolveModal
 isOpen={activeModal === "RESOLVE"}
 item={selectedItem}
 onClose={closeModal}
 onRefresh={() => fetchConsumables(true)}
 />
  <RestockConsumableModal
  isOpen={activeModal === "RESTOCK"}
  item={selectedItem}
  onClose={closeModal}
  onRefresh={() => fetchConsumables(true)}
  />
   <RequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} item={selectedConsumable} type={selectedConsumable ? "ALLOCATION" : "ALLOCATION"} />
    </div>
 );
};

export default ConsumableList;
