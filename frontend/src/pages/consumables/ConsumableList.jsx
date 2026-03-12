// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import {
//   Package,
//   Plus,
//   UserPlus,
//   RotateCcw,
//   AlertCircle,
//   Search,
//   RefreshCw,
//   Trash2,
// } from "lucide-react";

// import api from "../../hooks/api";

// import AddConsumableModal from "../../components/consumables/AddConsumableModal";
// import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
// import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";

// const ConsumableList = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [activeModal, setActiveModal] = useState(null);

//   const fetchConsumables = useCallback(async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       const res = await api.get("/consumables", { params: { _t: Date.now() } });
//       setItems(res.data?.data || []);
//       setError(null);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch consumables inventory.");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchConsumables();
//   }, [fetchConsumables]);

//   const handleDelete = async (item) => {
//     const confirmDelete = window.confirm(
//       `Permanently remove ${item.itemName} from inventory?`,
//     );
//     if (!confirmDelete) return;

//     try {
//       await api.delete(`/consumables/${item._id}`);
//       fetchConsumables(true);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete item.");
//     }
//   };

//   const filteredItems = useMemo(() => {
//     const search = searchTerm.toLowerCase();
//     return items.filter((item) =>
//       item.itemName?.toLowerCase().includes(search),
//     );
//   }, [items, searchTerm]);

//   const openModal = (type, item = null) => {
//     setSelectedItem(item);
//     setActiveModal(type);
//   };

//   const closeModal = () => {
//     setSelectedItem(null);
//     setActiveModal(null);
//   };

//   if (loading && items.length === 0) {
//     return (
//       <div className="p-20 flex flex-col items-center justify-center animate-pulse">
//         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-slate-400 font-bold tracking-tight">
//           Updating inventory...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-32 max-w-7xl mx-auto px-4">
//       {/* HEADER */}
//       <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//             Consumables
//           </h1>
//           <p className="text-slate-500 font-medium">
//             Manage stock levels and distributions
//           </p>
//         </div>

//         <div className="flex gap-2 w-full sm:w-auto">
//           <button
//             onClick={() => fetchConsumables()}
//             className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
//           >
//             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
//           </button>
//           <button
//             onClick={() => openModal("ADD")}
//             className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold transition-all"
//           >
//             <Plus size={20} /> Add Item
//           </button>
//         </div>
//       </div>

//       {/* SEARCH */}
//       <div className="max-w-md relative">
//         <Search
//           className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//           size={18}
//         />
//         <input
//           type="text"
//           placeholder="Search consumables..."
//           className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredItems.map((item) => {
//           const available =
//             (item.totalQuantity || 0) - (item.assignedQuantity || 0);
//           const isLowStock = available <= (item.lowStockThreshold || 5);

//           // Check if any units are currently assigned
//           const hasActiveAssignments = (item.assignedQuantity || 0) > 0;

//           const assignedTo =
//             item.assignments
//               ?.filter((a) => a.employeeId)
//               .map((a) => a.employeeId.name) || [];

//           return (
//             <div
//               key={item._id}
//               className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col relative group"
//             >
//               {/* TRASH ICON - TOP RIGHT */}
//               <button
//                 onClick={() => handleDelete(item)}
//                 disabled={hasActiveAssignments} // Disable if assigned to someone
//                 className={`absolute top-6 right-6 p-2 rounded-xl transition-all
//             ${
//               hasActiveAssignments
//                 ? "text-slate-200 cursor-not-allowed opacity-50" // Locked state
//                 : "text-slate-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100" // Active state
//             }`}
//                 title={
//                   hasActiveAssignments
//                     ? "Cannot delete: Item is currently assigned"
//                     : "Permanently remove"
//                 }
//               >
//                 <Trash2 size={18} />
//               </button>
//               {/* CARD ICON */}
//               <div className="mb-6">
//                 <div
//                   className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLowStock ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}
//                 >
//                   <Package size={28} />
//                 </div>
//               </div>

//               {/* CONTENT */}
//               <div className="flex-1">
//                 <h3 className="text-xl font-black text-slate-800 uppercase leading-tight">
//                   {item.itemName}
//                 </h3>
//                 <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">
//                   CATEGORY: {item.category}
//                 </p>

//                 {assignedTo.length > 0 && (
//                   <div className="mt-4 flex flex-wrap gap-1">
//                     <span className="text-[11px] font-bold text-slate-500 uppercase">
//                       Assigned To:
//                     </span>
//                     <span className="text-[11px] font-medium text-slate-600">
//                       {assignedTo.slice(0, 2).join(", ")}
//                       {assignedTo.length > 2 &&
//                         ` +${assignedTo.length - 2} more`}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* FOOTER */}
//               <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
//                 <div>
//                   <div className="text-4xl font-black text-slate-900 leading-none">
//                     {available}
//                   </div>
//                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
//                     Available: {available} / {item.totalQuantity}
//                   </p>
//                 </div>

//                 <div className="flex gap-2">
//                   <button
//                     disabled={available === 0}
//                     onClick={() => openModal("ISSUE", item)}
//                     className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-20 transition-all shadow-md"
//                   >
//                     <UserPlus size={20} />
//                   </button>
//                   <button
//                     onClick={() => openModal("RETURN", item)}
//                     className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-md"
//                   >
//                     <RotateCcw size={20} />
//                   </button>
//                 </div>
//               </div>

//               {isLowStock && (
//                 <div className="absolute top-6 right-16">
//                   <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase border border-amber-100">
//                     <AlertCircle size={12} /> Low Stock
//                   </span>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* MODALS */}
//       <AddConsumableModal
//         isOpen={activeModal === "ADD"}
//         onClose={closeModal}
//         onRefresh={() => fetchConsumables(true)}
//       />
//       <IssueConsumableModal
//         isOpen={activeModal === "ISSUE"}
//         item={selectedItem}
//         onClose={closeModal}
//         onRefresh={() => fetchConsumables(true)}
//       />
//       <ReturnConsumableModal
//         isOpen={activeModal === "RETURN"}
//         item={selectedItem}
//         onClose={closeModal}
//         onRefresh={() => fetchConsumables(true)}
//       />
//     </div>
//   );
// };

// export default ConsumableList;
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Package,
  Plus,
  UserPlus,
  RotateCcw,
  AlertCircle,
  Search,
  RefreshCw,
  Trash2,
  Filter,
  ChevronDown,
  Wrench,
  CheckCircle,
} from "lucide-react";

import api from "../../hooks/api";

// Modals
import AddConsumableModal from "../../components/consumables/AddConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import ConsumableConditionModal from "../../components/consumables/ConsumableConditionModal";
import ConsumableMaintenanceResolveModal from "../../components/consumables/ConsumableMaintenanceResolveModal";

const ConsumableList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const filterOptions = ["ALL", "AVAILABLE", "LOW STOCK", "ASSIGNED", "REPAIR"];

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
      if (statusFilter === "ASSIGNED")
        matchesStatus = (item.assignedQuantity || 0) > 0;
      if (statusFilter === "AVAILABLE") matchesStatus = available > 0;
      if (statusFilter === "REPAIR") matchesStatus = inMaintenance > 0;

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
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Consumables
          </h1>
          <p className="text-slate-500 font-medium">
            Manage stock levels, assignments, and repairs
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchConsumables()}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => openModal("ADD")}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold transition-all"
          >
            <Plus size={20} /> Add Item
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600"
            size={18}
          />
          <input
            type="text"
            placeholder="Search inventory..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="w-full flex items-center justify-between px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
          >
            <span className="text-xs font-black uppercase tracking-wider">
              {statusFilter === "ALL" ? "View All" : statusFilter}
            </span>
            <ChevronDown
              size={18}
              className={`transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 overflow-hidden">
              {filterOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setStatusFilter(opt);
                    setIsFilterDropdownOpen(false);
                  }}
                  className={`w-full text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest ${statusFilter === opt ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
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
          const available =
            (item.totalQuantity || 0) -
            (item.assignedQuantity || 0) -
            inMaintenance;
          const isLowStock = available <= (item.lowStockThreshold || 5);

          return (
            <div
              key={item._id}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col relative group"
            >
              <div className="mb-6 flex justify-between items-start">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isLowStock ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                >
                  <Package size={28} />
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {isLowStock && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 uppercase">
                      <AlertCircle size={10} /> Low Stock
                    </span>
                  )}
                  {inMaintenance > 0 && (
                    <span className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 uppercase">
                      <Wrench size={10} /> {inMaintenance} in Repair
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-tight">
                  {item.itemName}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {item.category}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-4xl font-black text-slate-900 leading-none">
                    {available}
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">
                    Available Warehouse Stock
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Resolve Repair Button - Only shows if items are in maintenance */}
                  {inMaintenance > 0 && (
                    <button
                      onClick={() => openModal("RESOLVE", item)}
                      className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Finish Repair"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => openModal("CONDITION", item)}
                    className="p-3 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-md"
                    title="Maintenance / Scrap"
                  >
                    <Wrench size={20} />
                  </button>
                  <button
                    disabled={available === 0}
                    onClick={() => openModal("ISSUE", item)}
                    className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-20 transition-all shadow-md"
                  >
                    <UserPlus size={20} />
                  </button>
                  <button
                    onClick={() => openModal("RETURN", item)}
                    className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all shadow-sm"
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
    </div>
  );
};

export default ConsumableList;
