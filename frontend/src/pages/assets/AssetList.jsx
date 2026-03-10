// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Plus,
//   Search,
//   Trash2,
//   Edit3,
//   UserPlus,
//   Package,
//   RotateCcw,
//   FileText,
//   AlertCircle,
//   Wrench,
//   CheckSquare,
//   Square,
//   X,
// } from "lucide-react";
// import api from "../hooks/api";
// import AddAssetModal from "../components/AddAssetModal";
// import AssignAssetModal from "../components/AssignAssetModal";
// import ReturnAssetModal from "../components/ReturnAssetModal";
// import RepairActionModal from "../components/RepairActionModal";
// import AssetDetailsSidebar from "../components/AssetDetailsSidebar";

// const AssetList = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [selectedIds, setSelectedIds] = useState([]);

//   const [activeModal, setActiveModal] = useState(null);
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const [selectedAsset, setSelectedAsset] = useState(null);

//   useEffect(() => {
//     fetchAssets();
//   }, []);

//   const fetchAssets = async () => {
//     // Prevent overlapping fetches
//     if (loading && assets.length > 0) return;

//     setLoading(true);
//     try {
//       // Your backend logs show t= and _t= parameters.
//       // If your backend handles ETag/304, you might not need the manual timestamp.
//       const res = await api.get(`/assets?category=Laptop,Monitor`);
//       setAssets(res.data.data);
//     } catch (err) {
//       console.error("Error loading assets", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpdateStatus = async (assetId, newStatus) => {
//     try {
//       let endpoint = `/assets/${assetId}`;
//       let payload = {};

//       if (newStatus === "AVAILABLE") {
//         endpoint += "/repair-complete";
//       } else if (newStatus === "REPAIR" || newStatus === "SCRAPPED") {
//         endpoint += "/return";
//         payload = { returnStatus: newStatus };
//       }

//       await api.patch(endpoint, payload);
//       setActiveModal(null);
//       setSelectedAsset(null);
//       fetchAssets();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update status.");
//     }
//   };

//   const handleDelete = async (id) => {
//     // 1. Verify it exists in local state first
//     if (!assets.find((a) => a._id === id)) {
//       console.error("Asset already removed from local state.");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this asset?")) {
//       try {
//         await api.delete(`/assets/${id}`);
//         // 2. Optimistic Update: Remove from UI immediately
//         setAssets((prev) => prev.filter((asset) => asset._id !== id));
//         // 3. Then fetch fresh data
//         fetchAssets();
//       } catch (err) {
//         console.error("Error deleting asset", err);
//         alert("Could not delete. The asset may have already been removed.");
//         fetchAssets(); // Refresh to sync UI
//       }
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (window.confirm(`Delete ${selectedIds.length} assets permanently?`)) {
//       try {
//         // Use allSettled to ensure we know which ones failed
//         const results = await Promise.allSettled(
//           selectedIds.map((id) => api.delete(`/assets/${id}`)),
//         );

//         const failed = results.filter((r) => r.status === "rejected");

//         if (failed.length > 0) {
//           alert(
//             `${failed.length} assets could not be deleted (they might already be gone).`,
//           );
//         }

//         setSelectedIds([]);
//         fetchAssets(); // Force a full sync with the DB
//       } catch (err) {
//         alert("An unexpected error occurred during bulk deletion.");
//       }
//     }
//   };

//   const handleViewReceipt = (e, asset) => {
//     e.stopPropagation();
//     console.log("Asset Data:", asset); // Debugging: check if receiptUrl exists
//     if (asset.receiptUrl) {
//       window.open(asset.receiptUrl, "_blank");
//     } else {
//       alert("No receipt image attached to this asset.");
//     }
//   };

//   const filteredAssets = useMemo(() => {
//     return assets.filter((asset) => {
//       const matchesSearch =
//         asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         statusFilter === "ALL" || asset.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [assets, searchTerm, statusFilter]);

//   const toggleSelectAll = () => {
//     if (selectedIds.length === filteredAssets.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(filteredAssets.map((a) => a._id));
//     }
//   };

//   const toggleSelectOne = (e, id) => {
//     e.stopPropagation();
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
//     );
//   };

//   if (loading)
//     return (
//       <div className="p-8 flex flex-col items-center justify-center space-y-4">
//         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium">Scanning Inventory...</p>
//       </div>
//     );

//   return (
//     <div className="relative space-y-6 pb-24">
//       {/* Floating Bulk Action Bar */}
//       {selectedIds.length > 0 && (
//         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
//           <div className="flex items-center gap-2">
//             <div className="bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
//               {selectedIds.length}
//             </div>
//             <span className="text-sm font-bold tracking-tight">
//               Assets Selected
//             </span>
//           </div>
//           <div className="h-6 w-px bg-slate-700" />
//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleBulkDelete}
//               className="flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors text-sm font-bold"
//             >
//               <Trash2 size={16} /> Bulk Delete
//             </button>
//             <button
//               onClick={() => setSelectedIds([])}
//               className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
//             >
//               <X size={18} />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
//             Hardware Inventory
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Managing {assets.length} items
//           </p>
//         </div>
//         <button
//           onClick={() => setActiveModal("ADD")}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold text-sm"
//         >
//           <Plus size={18} /> Add New Asset
//         </button>
//       </div>

//       {/* Select All Utility */}
//       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
//         <button
//           onClick={toggleSelectAll}
//           className="text-slate-500 hover:text-blue-600 transition-colors"
//         >
//           {selectedIds.length === filteredAssets.length &&
//           filteredAssets.length > 0 ? (
//             <CheckSquare size={20} className="text-blue-600" />
//           ) : (
//             <Square size={20} />
//           )}
//         </button>
//         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
//           Select All Visible
//         </span>
//       </div>

//       {/* List Container */}
//       <div className="space-y-3">
//         {filteredAssets.length > 0 ? (
//           filteredAssets.map((asset) => (
//             <div
//               key={asset._id}
//               onClick={() => {
//                 setSelectedAsset(asset);
//                 setSidebarOpen(true);
//               }}
//               className={`flex items-center bg-white p-4 md:px-6 rounded-2xl border transition-all group cursor-pointer
//                 ${selectedIds.includes(asset._id) ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
//             >
//               {/* Checkbox */}
//               <div
//                 onClick={(e) => toggleSelectOne(e, asset._id)}
//                 className="mr-4 transition-colors"
//               >
//                 {selectedIds.includes(asset._id) ? (
//                   <CheckSquare size={22} className="text-blue-600" />
//                 ) : (
//                   <Square
//                     size={22}
//                     className="text-slate-200 group-hover:text-slate-300"
//                   />
//                 )}
//               </div>

//               <div className="flex-[2] flex items-center gap-4">
//                 <div className="p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                   <Package size={20} />
//                 </div>
//                 <div>
//                   <div className="font-bold text-slate-800 text-lg leading-tight">
//                     {asset.model}
//                   </div>
//                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
//                     {asset.category}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex-1 hidden md:block">
//                 <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
//                   {asset.serialNumber}
//                 </span>
//               </div>

//               <div className="flex-1">
//                 <StatusBadge status={asset.status} />
//               </div>

//               {/* Actions Column */}
//               <div className="flex items-center gap-1">
//                 {/* 1. VIEW RECEIPT */}
//                 <button
//                   onClick={(e) => handleViewReceipt(e, asset)}
//                   className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
//                   title="View Receipt"
//                 >
//                   <FileText size={18} />
//                 </button>

//                 {/* 2. CONTEXTUAL EDIT/REASSIGN */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedAsset(asset);
//                     if (asset.status === "ASSIGNED") setActiveModal("ASSIGN");
//                     else if (asset.status === "REPAIR")
//                       setActiveModal("REPAIR");
//                     else setActiveModal("ADD");
//                   }}
//                   className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
//                   title={
//                     asset.status === "ASSIGNED"
//                       ? "Reassign Asset"
//                       : "Edit Asset"
//                   }
//                 >
//                   <Edit3 size={18} />
//                 </button>

//                 {/* 3. STATUS SPECIFIC ACTION */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedAsset(asset);
//                     if (asset.status === "AVAILABLE") setActiveModal("ASSIGN");
//                     else if (asset.status === "ASSIGNED")
//                       setActiveModal("RETURN");
//                     else if (asset.status === "REPAIR")
//                       setActiveModal("REPAIR");
//                   }}
//                   className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
//                 >
//                   {asset.status === "AVAILABLE" && <UserPlus size={18} />}
//                   {asset.status === "ASSIGNED" && <RotateCcw size={18} />}
//                   {asset.status === "REPAIR" && <Wrench size={18} />}
//                 </button>

//                 {/* 4. DELETE */}
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDelete(asset._id);
//                   }}
//                   className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
//             <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
//             <p className="text-slate-500 font-bold">
//               No assets match your search
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <AddAssetModal
//         isOpen={activeModal === "ADD"}
//         onClose={() => setActiveModal(null)}
//         onRefresh={fetchAssets}
//       />
//       <AssignAssetModal
//         isOpen={activeModal === "ASSIGN"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onRefresh={fetchAssets}
//       />
//       <ReturnAssetModal
//         isOpen={activeModal === "RETURN"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onRefresh={fetchAssets}
//       />
//       <RepairActionModal
//         isOpen={activeModal === "REPAIR"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onAction={handleUpdateStatus}
//       />

//       <AssetDetailsSidebar
//         isOpen={isSidebarOpen}
//         entityId={selectedAsset?._id}
//         type="assets"
//         onClose={() => setSidebarOpen(false)}
//       />
//     </div>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const styles = {
//     AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
//     REPAIR: "bg-amber-100 text-amber-700 border-amber-200",
//     SCRAPPED: "bg-rose-100 text-rose-700 border-rose-200",
//   };
//   return (
//     <span
//       className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${styles[status] || "bg-slate-100 text-slate-700"}`}
//     >
//       {status === "REPAIR" ? "IN REPAIR" : status}
//     </span>
//   );
// };

// export default AssetList;
// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import {
//   Plus,
//   Search,
//   Trash2,
//   Edit3,
//   UserPlus,
//   Package,
//   RotateCcw,
//   FileText,
//   AlertCircle,
//   Wrench,
//   CheckSquare,
//   Square,
//   X,
// } from "lucide-react";
// import api from "../hooks/api";
// import AddAssetModal from "../components/AddAssetModal";
// import AssignAssetModal from "../components/AssignAssetModal";
// import ReturnAssetModal from "../components/ReturnAssetModal";
// import RepairActionModal from "../components/RepairActionModal";
// import AssetDetailsSidebar from "../components/AssetDetailsSidebar";

// const AssetList = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [selectedIds, setSelectedIds] = useState([]);

//   const [activeModal, setActiveModal] = useState(null);
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
//   const [selectedAsset, setSelectedAsset] = useState(null);

//   const filterOptions = ["ALL", "AVAILABLE", "ASSIGNED", "REPAIR", "SCRAPPED"];

//   const fetchAssets = useCallback(async () => {
//     try {
//       const res = await api.get(`/assets?category=Laptop,Monitor`);
//       setAssets(res.data.data);
//     } catch (err) {
//       console.error("Error loading assets", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAssets();
//   }, [fetchAssets]);

//   const handleUpdateStatus = async (assetId, newStatus) => {
//     try {
//       let endpoint = `/assets/${assetId}`;
//       let payload = {};

//       if (newStatus === "AVAILABLE") {
//         endpoint += "/repair-complete";
//       } else if (newStatus === "REPAIR" || newStatus === "SCRAPPED") {
//         endpoint += "/return";
//         payload = { returnStatus: newStatus };
//       }

//       await api.patch(endpoint, payload);
//       setActiveModal(null);
//       setSelectedAsset(null);
//       fetchAssets();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to update status.");
//     }
//   };

//   const handleDelete = async (e, id) => {
//   e.stopPropagation();

//   // 1. Double check the asset exists in local state before even trying
//   const assetToDelete = assets.find((a) => a._id === id);
//   if (!assetToDelete) return;

//   if (window.confirm(`Are you sure you want to delete ${assetToDelete.model}?`)) {
//     const previousAssets = [...assets];

//     // Optimistic Update
//     setAssets((prev) => prev.filter((asset) => asset._id !== id));

//     try {
//       await api.delete(`/assets/${id}`);
//       // Success - no need to do anything, state is already updated
//     } catch (err) {
//       // If it's a 404, the item is already gone, so don't rollback
//       if (err.response?.status === 404) {
//         console.warn("Asset already deleted from server.");
//         return;
//       }

//       // Real error (500, network, etc.) - Rollback
//       console.error("Error deleting asset", err);
//       setAssets(previousAssets);
//       alert("Server error: Could not delete the asset. Please try again.");
//     }
//   }
// };

//   const handleBulkDelete = async () => {
//     if (window.confirm(`Delete ${selectedIds.length} assets permanently?`)) {
//       try {
//         await Promise.allSettled(
//           selectedIds.map((id) => api.delete(`/assets/${id}`)),
//         );
//         setSelectedIds([]);
//         fetchAssets();
//       } catch (err) {
//         alert("An unexpected error occurred during bulk deletion.");
//       }
//     }
//   };

//   const handleViewReceipt = (e, asset) => {
//     e.stopPropagation();
//     if (asset.receiptUrl) {
//       window.open(asset.receiptUrl, "_blank");
//     } else {
//       alert("No receipt image attached to this asset.");
//     }
//   };

//   const filteredAssets = useMemo(() => {
//     return assets.filter((asset) => {
//       const matchesSearch =
//         asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
//       const matchesStatus =
//         statusFilter === "ALL" || asset.status === statusFilter;
//       return matchesSearch && matchesStatus;
//     });
//   }, [assets, searchTerm, statusFilter]);

//   const toggleSelectAll = () => {
//     if (selectedIds.length === filteredAssets.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(filteredAssets.map((a) => a._id));
//     }
//   };

//   const toggleSelectOne = (e, id) => {
//     e.stopPropagation();
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
//     );
//   };

//   if (loading && assets.length === 0)
//     return (
//       <div className="p-8 flex flex-col items-center justify-center space-y-4">
//         <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-slate-500 font-medium">Scanning Inventory...</p>
//       </div>
//     );

//   return (
//     <div className="relative space-y-6 pb-24">
//       {/* Bulk Action Bar */}
//       {selectedIds.length > 0 && (
//         <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
//           <div className="flex items-center gap-2">
//             <div className="bg-blue-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
//               {selectedIds.length}
//             </div>
//             <span className="text-sm font-bold tracking-tight">
//               Assets Selected
//             </span>
//           </div>
//           <div className="h-6 w-px bg-slate-700" />
//           <button
//             onClick={handleBulkDelete}
//             className="flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl transition-colors text-sm font-bold"
//           >
//             <Trash2 size={16} /> Bulk Delete
//           </button>
//           <button
//             onClick={() => setSelectedIds([])}
//             className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
//           >
//             <X size={18} />
//           </button>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
//             Hardware Inventory
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Managing {assets.length} items
//           </p>
//         </div>
//         <button
//           onClick={() => {
//             setSelectedAsset(null); // Clear for Add Mode
//             setActiveModal("ADD");
//           }}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold text-sm"
//         >
//           <Plus size={18} /> Add New Asset
//         </button>
//       </div>

//       {/* SEARCH AND FILTERS */}
//       <div className="flex flex-col md:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             size={18}
//           />
//           <input
//             type="text"
//             placeholder="Search by model or serial..."
//             className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>

//         {/* Status Filter Tabs */}
//         <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
//           {filterOptions.map((opt) => (
//             <button
//               key={opt}
//               onClick={() => setStatusFilter(opt)}
//               className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
//                 statusFilter === opt
//                   ? "bg-white text-blue-600 shadow-sm"
//                   : "text-slate-500 hover:text-slate-700"
//               }`}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 w-fit">
//         <button
//           onClick={toggleSelectAll}
//           className="text-slate-500 hover:text-blue-600"
//         >
//           {selectedIds.length === filteredAssets.length &&
//           filteredAssets.length > 0 ? (
//             <CheckSquare size={20} className="text-blue-600" />
//           ) : (
//             <Square size={20} />
//           )}
//         </button>
//         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
//           Select All Visible
//         </span>
//       </div>

//       <div className="space-y-3">
//         {filteredAssets.length > 0 ? (
//           filteredAssets.map((asset) => (
//             <div
//               key={asset._id}
//               onClick={() => {
//                 setSelectedAsset(asset);
//                 setSidebarOpen(true);
//               }}
//               className={`flex items-center bg-white p-4 md:px-6 rounded-2xl border transition-all group cursor-pointer
//                 ${selectedIds.includes(asset._id) ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-slate-200 hover:border-blue-300 hover:shadow-md"}`}
//             >
//               <div
//                 onClick={(e) => toggleSelectOne(e, asset._id)}
//                 className="mr-4"
//               >
//                 {selectedIds.includes(asset._id) ? (
//                   <CheckSquare size={22} className="text-blue-600" />
//                 ) : (
//                   <Square
//                     size={22}
//                     className="text-slate-200 group-hover:text-slate-300"
//                   />
//                 )}
//               </div>

//               <div className="flex-[2] flex items-center gap-4">
//                 <div className="p-3 bg-slate-100 rounded-xl text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
//                   <Package size={20} />
//                 </div>
//                 <div>
//                   <div className="font-bold text-slate-800 text-lg leading-tight">
//                     {asset.model}
//                   </div>
//                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
//                     {asset.category}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex-1 hidden md:block">
//                 <span className="text-xs font-mono text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
//                   {asset.serialNumber}
//                 </span>
//               </div>

//               <div className="flex-1">
//                 <StatusBadge status={asset.status} />
//               </div>

//               <div
//                 className="flex items-center gap-1"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <button
//                   onClick={(e) => handleViewReceipt(e, asset)}
//                   className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
//                   title="View Receipt"
//                 >
//                   <FileText size={18} />
//                 </button>

//                 <button
//                   onClick={() => {
//                     setSelectedAsset(asset); // SET ASSET for editing
//                     setActiveModal("ADD");
//                   }}
//                   className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
//                   title="Edit Asset"
//                 >
//                   <Edit3 size={18} />
//                 </button>

//                 <button
//                   onClick={() => {
//                     setSelectedAsset(asset);
//                     if (asset.status === "AVAILABLE") setActiveModal("ASSIGN");
//                     else if (asset.status === "ASSIGNED")
//                       setActiveModal("RETURN");
//                     else if (asset.status === "REPAIR")
//                       setActiveModal("REPAIR");
//                   }}
//                   className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
//                 >
//                   {asset.status === "AVAILABLE" && <UserPlus size={18} />}
//                   {asset.status === "ASSIGNED" && <RotateCcw size={18} />}
//                   {asset.status === "REPAIR" && <Wrench size={18} />}
//                 </button>

//                 <button
//                   onClick={(e) => handleDelete(e, asset._id)}
//                   className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
//                 >
//                   <Trash2 size={18} />
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
//             <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
//             <p className="text-slate-500 font-bold">
//               No assets match your search
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       <AddAssetModal
//         isOpen={activeModal === "ADD"}
//         asset={selectedAsset} // Passes the asset for editing, or null for adding
//         onClose={() => {
//           setActiveModal(null);
//           setSelectedAsset(null);
//         }}
//         onRefresh={fetchAssets}
//       />
//       <AssignAssetModal
//         isOpen={activeModal === "ASSIGN"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onRefresh={fetchAssets}
//       />
//       <ReturnAssetModal
//         isOpen={activeModal === "RETURN"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onRefresh={fetchAssets}
//       />
//       <RepairActionModal
//         isOpen={activeModal === "REPAIR"}
//         asset={selectedAsset}
//         onClose={() => setActiveModal(null)}
//         onAction={handleUpdateStatus}
//       />

//       <AssetDetailsSidebar
//         isOpen={isSidebarOpen}
//         entityId={selectedAsset?._id}
//         type="assets"
//         onClose={() => setSidebarOpen(false)}
//       />
//     </div>
//   );
// };

// const StatusBadge = ({ status }) => {
//   const styles = {
//     AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
//     REPAIR: "bg-amber-100 text-amber-700 border-amber-200",
//     SCRAPPED: "bg-rose-100 text-rose-700 border-rose-200",
//   };
//   return (
//     <span
//       className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border shadow-sm ${styles[status] || "bg-slate-100 text-slate-700"}`}
//     >
//       {status === "REPAIR" ? "IN REPAIR" : status}
//     </span>
//   );
// };

// export default AssetList;
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit3,
  UserPlus,
  Package,
  RotateCcw,
  FileText,
  Wrench,
  CheckSquare,
  Square,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../../hooks/api";

// Component Imports
import AddAssetModal from "../../components/assets/AddAssetModal";
import AssignAssetModal from "../../components/assets/AssignAssetModal";
import ReturnAssetModal from "../../components/assets/ReturnAssetModal";
import RepairActionModal from "../../components/assets/RepairActionModal";
import AssetDetailsSidebar from "../../components/assets/AssetDetailsSidebar";

const AssetList = () => {
  // --- State Management ---
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState([]);

  // UI State
  const [activeModal, setActiveModal] = useState(null); // 'ADD', 'ASSIGN', 'RETURN', 'REPAIR'
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const filterOptions = ["ALL", "AVAILABLE", "ASSIGNED", "REPAIR", "SCRAPPED"];

  // --- Data Fetching ---
  const fetchAssets = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get(`/assets`, {
        params: {
          category: "Laptop,Monitor",
          _t: Date.now(),
        },
      });

      const freshData = res.data.data || [];
      setAssets(freshData);

      setSelectedIds((prev) =>
        prev.filter((id) => freshData.some((a) => a._id === id)),
      );
      setError(null);
    } catch (err) {
      setError("Failed to sync with inventory. Check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // --- Action Handlers ---
  const closeAllModals = () => {
    setActiveModal(null);
    setSelectedAsset(null);
  };

  const handleUpdateStatus = async (assetId, newStatus) => {
    try {
      let endpoint = `/assets/${assetId}`;
      let payload = {};

      if (newStatus === "AVAILABLE") endpoint += "/repair-complete";
      else if (newStatus === "REPAIR" || newStatus === "SCRAPPED") {
        endpoint += "/return";
        payload = { returnStatus: newStatus };
      }

      await api.patch(endpoint, payload);
      closeAllModals();
      fetchAssets(true);
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed.");
    }
  };

  const handleDelete = async (e, asset) => {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete ${asset.model}?`)) return;

    const previousAssets = [...assets];
    setAssets((prev) => prev.filter((a) => a._id !== asset._id));

    try {
      await api.delete(`/assets/${asset._id}`);
      setSelectedIds((prev) => prev.filter((id) => id !== asset._id));
    } catch (err) {
      if (err.response?.status !== 404) {
        setAssets(previousAssets);
        alert("Delete failed. Reverting changes.");
      }
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    if (!window.confirm(`Delete ${count} assets permanently?`)) return;

    const previousAssets = [...assets];
    const idsToDelete = [...selectedIds];

    setAssets((prev) => prev.filter((a) => !idsToDelete.includes(a._id)));
    setSelectedIds([]);

    try {
      await Promise.allSettled(
        idsToDelete.map((id) => api.delete(`/assets/${id}`)),
      );
      fetchAssets(true);
    } catch (err) {
      setAssets(previousAssets);
      alert("Bulk delete encountered issues. Refreshing list.");
      fetchAssets();
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch =
        (asset.model?.toLowerCase() || "").includes(searchStr) ||
        (asset.serialNumber?.toLowerCase() || "").includes(searchStr);
      const matchesStatus =
        statusFilter === "ALL" || asset.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchTerm, statusFilter]);

  if (loading && assets.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 font-bold tracking-tight">
          Syncing Inventory...
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pb-32 max-w-7xl mx-auto">
      {/* 1. FLOATING ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 px-2 py-0.5 rounded text-xs font-bold">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold">Selected</span>
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-rose-400 font-bold text-sm"
          >
            <Trash2 size={16} /> Delete
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* 2. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Hardware
          </h1>
          <p className="text-slate-500 font-medium">
            {loading ? "Refreshing..." : `${assets.length} Assets Found`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => fetchAssets()}
            className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setSelectedAsset(null);
              setActiveModal("ADD");
            }}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg font-bold"
          >
            <Plus size={20} /> New Asset
          </button>
        </div>
      </div>

      {/* 3. CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <div className="lg:col-span-4 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search Serial or Model..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="lg:col-span-8 flex gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${statusFilter === opt ? "bg-white text-blue-600 shadow-md" : "text-slate-500 hover:bg-slate-200/50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* 4. ASSET LIST */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 px-2">
          <button
            onClick={() =>
              setSelectedIds(
                selectedIds.length === filteredAssets.length
                  ? []
                  : filteredAssets.map((a) => a._id),
              )
            }
            className="text-slate-400 hover:text-blue-600"
          >
            {selectedIds.length === filteredAssets.length &&
            filteredAssets.length > 0 ? (
              <CheckSquare size={20} className="text-blue-600" />
            ) : (
              <Square size={20} />
            )}
          </button>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Select All Visible
          </span>
        </div>

        {filteredAssets.map((asset) => (
          <div
            key={asset._id}
            onClick={() => {
              setSelectedAsset(asset);
              setSidebarOpen(true);
            }}
            className={`flex flex-wrap md:flex-nowrap items-center bg-white p-5 rounded-3xl border transition-all cursor-pointer group ${selectedIds.includes(asset._id) ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500" : "border-slate-100 hover:border-blue-200 hover:shadow-xl"}`}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIds((prev) =>
                  prev.includes(asset._id)
                    ? prev.filter((i) => i !== asset._id)
                    : [...prev, asset._id],
                );
              }}
              className="mr-5"
            >
              {selectedIds.includes(asset._id) ? (
                <CheckSquare size={22} className="text-blue-600" />
              ) : (
                <Square size={22} className="text-slate-200" />
              )}
            </div>

            <div className="flex-[3] flex items-center gap-5">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Package size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {asset.model}
                </h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
                  {asset.category}
                </p>
              </div>
            </div>

            <div className="flex-[2] hidden md:block">
              <code className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {asset.serialNumber}
              </code>
            </div>

            <div className="flex-[1] min-w-[120px]">
              <StatusBadge status={asset.status} />
            </div>

            <div
              className="flex items-center gap-1 mt-4 md:mt-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionButton
                icon={<FileText size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  if (asset.receiptUrl) window.open(asset.receiptUrl, "_blank");
                  else alert("No receipt found.");
                }}
                color="hover:text-emerald-600 hover:bg-emerald-50"
                title="View Receipt"
              />
              <ActionButton
                icon={<Edit3 size={18} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAsset(asset);
                  setActiveModal("ADD");
                }}
                color="hover:text-blue-600 hover:bg-blue-50"
                title="Edit Details"
              />
              <ActionButton
                icon={
                  asset.status === "AVAILABLE" ? (
                    <UserPlus size={18} />
                  ) : asset.status === "ASSIGNED" ? (
                    <RotateCcw size={18} />
                  ) : (
                    <Wrench size={18} />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAsset(asset);
                  if (asset.status === "AVAILABLE") setActiveModal("ASSIGN");
                  else if (asset.status === "ASSIGNED")
                    setActiveModal("RETURN");
                  else setActiveModal("REPAIR");
                }}
                color="hover:text-indigo-600 hover:bg-indigo-50"
                title="Update Status"
              />
              <ActionButton
                icon={<Trash2 size={18} />}
                onClick={(e) => handleDelete(e, asset)}
                color="hover:text-rose-600 hover:bg-rose-50"
                title="Delete Asset"
              />
            </div>
          </div>
        ))}
      </div>

      {/* 5. MODALS & SIDEBAR */}
      <AddAssetModal
        isOpen={activeModal === "ADD"}
        asset={selectedAsset}
        onClose={closeAllModals}
        onRefresh={() => fetchAssets(true)}
      />
      <AssignAssetModal
        isOpen={activeModal === "ASSIGN"}
        asset={selectedAsset}
        onClose={closeAllModals}
        onRefresh={() => fetchAssets(true)}
      />
      <ReturnAssetModal
        isOpen={activeModal === "RETURN"}
        asset={selectedAsset}
        onClose={closeAllModals}
        onRefresh={() => fetchAssets(true)}
      />
      <RepairActionModal
        isOpen={activeModal === "REPAIR"}
        asset={selectedAsset}
        onClose={closeAllModals}
        onAction={handleUpdateStatus}
      />
      <AssetDetailsSidebar
        isOpen={isSidebarOpen}
        entityId={selectedAsset?._id}
        type="assets"
        onClose={() => {
          setSidebarOpen(false);
          setSelectedAsset(null);
        }}
      />
    </div>
  );
};

// --- Atomic Components ---
const ActionButton = ({ icon, onClick, color, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 text-slate-400 rounded-2xl transition-all duration-200 active:scale-90 ${color}`}
  >
    {icon}
  </button>
);

const StatusBadge = ({ status }) => {
  const themes = {
    AVAILABLE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    ASSIGNED: "bg-blue-100 text-blue-700 border-blue-200",
    REPAIR: "bg-amber-100 text-amber-700 border-amber-200",
    SCRAPPED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase border tracking-tighter shadow-sm ${themes[status] || "bg-slate-100"}`}
    >
      {status === "REPAIR" ? "IN REPAIR" : status}
    </span>
  );
};

export default AssetList;
