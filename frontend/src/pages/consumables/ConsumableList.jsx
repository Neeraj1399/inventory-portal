// import React, { useEffect, useState } from "react";
// import { Package, Plus, UserPlus, AlertCircle, Search } from "lucide-react";
// import api from "../hooks/api";
// import IssueConsumableModal from "../components/IssueConsumableModal";
// import AddConsumableModal from "../components/AddConsumableModal";

// const ConsumableList = () => {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [isIssueModalOpen, setIssueModalOpen] = useState(false);
//   const [isAddModalOpen, setAddModalOpen] = useState(false);

//   useEffect(() => {
//     fetchConsumables();
//   }, []);

//   const fetchConsumables = async () => {
//     try {
//       const res = await api.get("/consumables");
//       setItems(res.data.data);
//     } catch (err) {
//       console.error("Failed to fetch consumables", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredItems = items.filter((item) =>
//     item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
//   );

//   if (loading)
//     return (
//       <div className="p-8 text-slate-500 text-center">
//         Checking stock levels...
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">
//             Consumables Inventory
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Bulk items and office supplies tracking
//           </p>
//         </div>
//         <button
//           onClick={() => setAddModalOpen(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all font-medium"
//         >
//           <Plus size={18} /> Add new
//         </button>
//       </div>

//       <div className="relative max-w-md">
//         <Search
//           className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//           size={18}
//         />
//         <input
//           type="text"
//           placeholder="Search items..."
//           className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredItems.map((item) => {
//           const available = item.totalQuantity - item.assignedQuantity;
//           const isLowStock = available < (item.lowStockThreshold || 5);

//           return (
//             <div
//               key={item._id}
//               className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 group"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <div
//                   className={`p-3 rounded-xl ${isLowStock ? "bg-amber-100 text-amber-600" : "bg-blue-50 text-blue-600"}`}
//                 >
//                   <Package size={24} />
//                 </div>
//                 {isLowStock && (
//                   <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
//                     <AlertCircle size={12} /> Low Stock
//                   </span>
//                 )}
//               </div>

//               <h3 className="text-lg font-bold text-slate-800 mb-1">
//                 {item.itemName}
//               </h3>
//               <p className="text-xs text-slate-400 uppercase font-semibold mb-4">
//                 {item.category}
//               </p>

//               <div className="flex items-end justify-between border-t border-slate-50 pt-4 mt-4">
//                 <div>
//                   <p className="text-2xl font-black text-slate-900 leading-none">
//                     {available}
//                   </p>
//                   <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
//                     Available / {item.totalQuantity}
//                   </p>
//                 </div>
//                 <button
//                   disabled={available === 0}
//                   onClick={() => {
//                     setSelectedItem(item);
//                     setIssueModalOpen(true);
//                   }}
//                   className="bg-slate-900 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors"
//                 >
//                   <UserPlus size={18} />
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* --- ADD THESE MODAL COMPONENTS AT THE END --- */}

//       <AddConsumableModal
//         isOpen={isAddModalOpen}
//         onClose={() => setAddModalOpen(false)}
//         onRefresh={fetchConsumables}
//       />

//       <IssueConsumableModal
//         isOpen={isIssueModalOpen}
//         item={selectedItem}
//         onClose={() => {
//           setIssueModalOpen(false);
//           setSelectedItem(null);
//         }}
//         onRefresh={fetchConsumables}
//       />
//     </div>
//   );
// };

// export default ConsumableList;
// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import {
//   Package,
//   Plus,
//   UserPlus,
//   RotateCcw,
//   AlertCircle,
//   Search,
//   RefreshCw,
// } from "lucide-react";

// import api from "../../hooks/api";

// import AddConsumableModal from "../../components/consumables/AddConsumableModal";
// import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
// import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";

// const ConsumableList = () => {
//   /* ---------------- STATE ---------------- */

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [searchTerm, setSearchTerm] = useState("");

//   const [selectedItem, setSelectedItem] = useState(null);
//   const [activeModal, setActiveModal] = useState(null); // ADD | ISSUE | RETURN

//   /* ---------------- FETCH DATA ---------------- */

//   const fetchConsumables = useCallback(async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);

//       const res = await api.get("/consumables", {
//         params: { _t: Date.now() },
//       });

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

//   /* ---------------- FILTER ---------------- */

//   const filteredItems = useMemo(() => {
//     const search = searchTerm.toLowerCase();

//     return items.filter((item) =>
//       item.itemName?.toLowerCase().includes(search),
//     );
//   }, [items, searchTerm]);

//   /* ---------------- MODAL HANDLING ---------------- */

//   const openModal = (type, item = null) => {
//     setSelectedItem(item);
//     setActiveModal(type);
//   };

//   const closeModal = () => {
//     setSelectedItem(null);
//     setActiveModal(null);
//   };

//   /* ---------------- LOADING UI ---------------- */

//   if (loading && items.length === 0) {
//     return (
//       <div className="p-20 flex flex-col items-center justify-center animate-pulse">
//         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
//         <p className="text-slate-400 font-bold tracking-tight">
//           Checking stock levels...
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 pb-32 max-w-7xl mx-auto">
//       {/* ERROR */}

//       {error && (
//         <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
//           {error}
//         </div>
//       )}

//       {/* HEADER */}

//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">
//             Consumables
//           </h1>

//           <p className="text-slate-500 font-medium">
//             {loading ? "Refreshing..." : `${items.length} Items`}
//           </p>
//         </div>

//         <div className="flex gap-2 w-full sm:w-auto">
//           <button
//             disabled={loading}
//             onClick={() => fetchConsumables()}
//             className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
//           >
//             <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
//           </button>

//           <button
//             onClick={() => openModal("ADD")}
//             className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold"
//           >
//             <Plus size={20} />
//             Add Item
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
//           className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* GRID */}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredItems.length > 0 ? (
//           filteredItems.map((item) => {
//             const available =
//               (item.totalQuantity || 0) - (item.assignedQuantity || 0);

//             const isLowStock = available <= (item.lowStockThreshold || 5);

//             return (
//               <div
//                 key={item._id}
//                 className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
//               >
//                 {/* ICON */}

//                 <div className="flex justify-between items-start mb-4">
//                   <div
//                     className={`p-4 rounded-2xl ${
//                       isLowStock
//                         ? "bg-amber-100 text-amber-600"
//                         : "bg-blue-50 text-blue-600"
//                     }`}
//                   >
//                     <Package size={24} />
//                   </div>

//                   {isLowStock && (
//                     <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
//                       <AlertCircle size={12} />
//                       Low Stock
//                     </span>
//                   )}
//                 </div>

//                 {/* ITEM */}

//                 <h3 className="text-lg font-extrabold text-slate-800">
//                   {item.itemName}
//                 </h3>

//                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1">
//                   {item.category}
//                 </p>

//                 {/* STOCK */}

//                 <div className="flex items-end justify-between border-t border-slate-50 pt-4 mt-4">
//                   <div>
//                     <p className="text-3xl font-black text-slate-900 leading-none">
//                       {available}
//                     </p>

//                     <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
//                       Available / {item.totalQuantity}
//                     </p>
//                   </div>

//                   {/* ACTIONS */}

//                   <div className="flex gap-2">
//                     {/* ISSUE */}

//                     <button
//                       disabled={available === 0}
//                       onClick={() => openModal("ISSUE", item)}
//                       className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-30"
//                     >
//                       <UserPlus size={18} />
//                     </button>

//                     {/* RETURN */}

//                     <button
//                       onClick={() => openModal("RETURN", item)}
//                       className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
//                     >
//                       <RotateCcw size={18} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="col-span-full py-24 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
//             <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />

//             <h4 className="text-xl font-bold text-slate-400">No Items Found</h4>

//             <p className="text-slate-400 max-w-xs mx-auto text-sm mt-2">
//               Try adjusting your search or add new consumables.
//             </p>
//           </div>
//         )}
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
} from "lucide-react";

import api from "../../hooks/api";

import AddConsumableModal from "../../components/consumables/AddConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";

const ConsumableList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // ADD | ISSUE | RETURN

  const fetchConsumables = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const res = await api.get("/consumables", { params: { _t: Date.now() } });
      setItems(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch consumables inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsumables();
  }, [fetchConsumables]);

  const filteredItems = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return items.filter((item) =>
      item.itemName?.toLowerCase().includes(search),
    );
  }, [items, searchTerm]);

  const openModal = (type, item = null) => {
    setSelectedItem(item);
    setActiveModal(type);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setActiveModal(null);
  };

  if (loading && items.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-tight">
          Checking stock levels...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 max-w-7xl mx-auto">
      {/* ERROR */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Consumables
          </h1>
          <p className="text-slate-500 font-medium">
            {loading ? "Refreshing..." : `${items.length} Items`}
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            disabled={loading}
            onClick={() => fetchConsumables()}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => openModal("ADD")}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 font-bold"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="max-w-md relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Search consumables..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const available =
              (item.totalQuantity || 0) - (item.assignedQuantity || 0);
            const isLowStock = available <= (item.lowStockThreshold || 5);
            const assignedEmployees =
              item.assignments?.filter((a) => a.employeeId) || [];

            // Format assigned employees: show max 3, then "+X more"
            const displayEmployees = assignedEmployees
              .slice(0, 3)
              .map((a) => a.employeeId.name);
            const remainingCount =
              assignedEmployees.length - displayEmployees.length;

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all p-6"
              >
                {/* ICON */}
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`p-4 rounded-2xl ${
                      isLowStock
                        ? "bg-amber-100 text-amber-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Package size={24} />
                  </div>

                  {isLowStock && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">
                      <AlertCircle size={12} />
                      Low Stock
                    </span>
                  )}
                </div>

                {/* ITEM */}
                <h3 className="text-lg font-extrabold text-slate-800">
                  {item.itemName}
                </h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em] mt-1">
                  Category: {item.category}
                </p>

                {/* ASSIGNED EMPLOYEES */}
                {assignedEmployees.length > 0 && (
                  <div className="mt-2 text-[11px] text-slate-600">
                    <span className="font-bold">Assigned To:</span>{" "}
                    {displayEmployees.join(", ")}
                    {remainingCount > 0 && ` +${remainingCount} more`}
                  </div>
                )}

                {/* STOCK */}
                <div className="flex items-end justify-between border-t border-slate-50 pt-4 mt-4">
                  <div>
                    <p className="text-3xl font-black text-slate-900 leading-none">
                      {available}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      Available: {available} / {item.totalQuantity}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex gap-2">
                    <button
                      disabled={available === 0}
                      onClick={() => openModal("ISSUE", item)}
                      className="bg-slate-900 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-30"
                    >
                      <UserPlus size={18} />
                    </button>

                    <button
                      onClick={() => openModal("RETURN", item)}
                      className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700"
                    >
                      <RotateCcw size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-24 text-center bg-slate-50 rounded-[40px] border-4 border-dashed border-slate-200">
            <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-xl font-bold text-slate-400">No Items Found</h4>
            <p className="text-slate-400 max-w-xs mx-auto text-sm mt-2">
              Try adjusting your search or add new consumables.
            </p>
          </div>
        )}
      </div>

      {/* MODALS */}
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
    </div>
  );
};

export default ConsumableList;
