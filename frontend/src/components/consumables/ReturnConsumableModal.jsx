// import React, { useState, useEffect, useMemo } from "react";
// import { X, Undo2, Loader2, AlertTriangle, Trash2, Wrench } from "lucide-react";
// import api from "../../hooks/api";

// const RETURN_STATUSES = [
//   {
//     id: "AVAILABLE",
//     label: "Good",
//     icon: Undo2,
//     buttonColor: "bg-blue-600 hover:bg-blue-700",
//   },
//   {
//     id: "REPAIR",
//     label: "Repair",
//     icon: Wrench,
//     buttonColor: "bg-amber-500 hover:bg-amber-600",
//   },
//   {
//     id: "SCRAPPED",
//     label: "Scrap",
//     icon: Trash2,
//     buttonColor: "bg-red-600 hover:bg-red-700",
//   },
// ];

// const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [employeeId, setEmployeeId] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [status, setStatus] = useState("AVAILABLE");
//   const [loading, setLoading] = useState(false);

//   // Reset modal state when it opens
//   useEffect(() => {
//     if (isOpen) {
//       setEmployeeId("");
//       setQuantity(1);
//       setStatus("AVAILABLE");
//     }
//   }, [isOpen]);

//   // Find current assignment safely
//   const currentAssignment = useMemo(() => {
//     if (!employeeId || !item?.assignments?.length) return null;
//     return item.assignments.find(
//       (a) => (a.employeeId?._id || a.employeeId) === employeeId,
//     );
//   }, [employeeId, item]);

//   const maxReturnable = currentAssignment?.quantity || 0;

//   // Submit return
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!employeeId) return;
//     if (quantity > maxReturnable) return;

//     setLoading(true);
//     try {
//       await api.post(`/consumables/${item._id}/return`, {
//         employeeId,
//         quantity: Number(quantity),
//         returnStatus: status,
//         isDamaged: status !== "AVAILABLE",
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Return failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !item) return null;

//   const selectedStatus = RETURN_STATUSES.find((s) => s.id === status);

//   // Check if there are valid employees
//   const hasEmployees = item.assignments?.some((a) => a.employeeId);

//   return (
//     <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
//         {/* HEADER */}
//         <div className="flex justify-between items-center p-6 border-b bg-slate-50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">Process Return</h2>
//             <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
//               {item.itemName || "Unnamed Item"}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-200 transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* EMPLOYEE SELECT */}
//           <div>
//             <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
//               Select Employee
//             </label>

//             {hasEmployees ? (
//               <select
//                 required
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//               >
//                 <option value="">Choose employee...</option>
//                 {item.assignments.map((a) => {
//                   const emp = a.employeeId;
//                   if (!emp) return null;
//                   return (
//                     <option key={emp._id} value={emp._id}>
//                       {emp.name} • {emp.email} ({a.quantity} issued)
//                     </option>
//                   );
//                 })}
//               </select>
//             ) : (
//               <p className="text-sm text-slate-500 italic">
//                 No employees currently have this item assigned.
//               </p>
//             )}
//           </div>

//           {/* STATUS */}
//           <div>
//             <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
//               Condition
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               {RETURN_STATUSES.map((s) => {
//                 const Icon = s.icon;
//                 return (
//                   <label key={s.id} className="cursor-pointer">
//                     <input
//                       type="radio"
//                       value={s.id}
//                       checked={status === s.id}
//                       onChange={(e) => setStatus(e.target.value)}
//                       className="sr-only peer"
//                     />
//                     <div className="border border-slate-200 rounded-xl p-3 flex flex-col items-center text-slate-500 text-xs font-bold peer-checked:text-white peer-checked:border-transparent peer-checked:bg-slate-900 transition">
//                       <Icon size={16} className="mb-1" />
//                       {s.label}
//                     </div>
//                   </label>
//                 );
//               })}
//             </div>
//           </div>

//           {/* QUANTITY */}
//           {hasEmployees && (
//             <div>
//               <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
//                 Quantity
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   min="1"
//                   max={maxReturnable}
//                   value={quantity}
//                   onChange={(e) => setQuantity(Number(e.target.value))}
//                   className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
//                   required
//                 />
//                 {employeeId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-slate-400 font-bold gap-1">
//                     <AlertTriangle size={12} className="text-amber-500" />
//                     MAX {maxReturnable}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* SUBMIT */}
//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !employeeId ||
//               quantity <= 0 ||
//               quantity > maxReturnable ||
//               !hasEmployees
//             }
//             className={`w-full text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition ${selectedStatus?.buttonColor || "bg-slate-600"}`}
//           >
//             {loading ? (
//               <Loader2 size={18} className="animate-spin" />
//             ) : (
//               <>
//                 {selectedStatus?.icon && <selectedStatus.icon size={18} />}
//                 Confirm {selectedStatus?.label || "Return"}
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ReturnConsumableModal;
// import React, { useState, useEffect, useMemo } from "react";
// import { X, Undo2, Loader2, Trash2, Wrench, AlertTriangle } from "lucide-react";
// import api from "../../hooks/api";
// import clsx from "clsx";

// const RETURN_STATUSES = [
//   {
//     id: "AVAILABLE",
//     label: "Good",
//     icon: Undo2,
//     buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
//   },
//   {
//     id: "REPAIR",
//     label: "Repair",
//     icon: Wrench,
//     buttonColor: "bg-amber-500 text-white hover:bg-amber-600",
//   },
//   {
//     id: "SCRAPPED",
//     label: "Scrap",
//     icon: Trash2,
//     buttonColor: "bg-red-600 text-white hover:bg-red-700",
//   },
// ];

// const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [employeeId, setEmployeeId] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [status, setStatus] = useState("AVAILABLE");
//   const [loading, setLoading] = useState(false);

//   // Reset modal state when opened
//   useEffect(() => {
//     if (isOpen) {
//       setEmployeeId("");
//       setQuantity(1);
//       setStatus("AVAILABLE");
//     }
//   }, [isOpen, item]);

//   // Find selected employee assignment
//   const currentAssignment = useMemo(() => {
//     if (!employeeId || !item?.assignments?.length) return null;
//     return item.assignments.find(
//       (a) => (a.employeeId?._id || a.employeeId) === employeeId,
//     );
//   }, [employeeId, item]);

//   const maxReturnable = currentAssignment?.quantity || 0;

//   const handleReturn = async (e) => {
//     e.preventDefault();
//     if (!employeeId || quantity < 1 || quantity > maxReturnable) return;

//     setLoading(true);
//     try {
//       await api.post(`/consumables/${item._id}/return`, {
//         employeeId,
//         quantity: Number(quantity),
//         returnStatus: status,
//         isDamaged: status !== "AVAILABLE",
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Return failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !item) return null;

//   const selectedStatus = RETURN_STATUSES.find((s) => s.id === status);
//   const hasEmployees = item.assignments?.some((a) => a.employeeId);

//   return (
//     <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
//         {/* Header */}
//         <div className="flex justify-between items-center p-6 border-b bg-slate-50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">Process Return</h2>
//             <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
//               {item.itemName}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-200 transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleReturn} className="p-6 space-y-5">
//           {/* Employee */}
//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//               Select Employee
//             </label>
//             {hasEmployees ? (
//               <select
//                 required
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
//               >
//                 <option value="">Choose employee...</option>
//                 {item.assignments.map((a) => {
//                   const emp = a.employeeId;
//                   if (!emp) return null;
//                   return (
//                     <option key={emp._id} value={emp._id}>
//                       {emp.name} • {emp.email} ({a.quantity} issued)
//                     </option>
//                   );
//                 })}
//               </select>
//             ) : (
//               <p className="text-sm text-slate-500 italic">
//                 No employees currently have this item assigned.
//               </p>
//             )}
//           </div>

//           {/* Status */}
//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//               Condition
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               {RETURN_STATUSES.map((s) => {
//                 const Icon = s.icon;
//                 const isSelected = status === s.id;
//                 return (
//                   <button
//                     type="button"
//                     key={s.id}
//                     onClick={() => setStatus(s.id)}
//                     className={clsx(
//                       "rounded-xl p-3 flex flex-col items-center text-xs font-bold transition transform hover:scale-105",
//                       isSelected
//                         ? s.buttonColor
//                         : "bg-slate-100 text-slate-600",
//                     )}
//                   >
//                     <Icon size={16} className="mb-1" />
//                     {s.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Quantity */}
//           {hasEmployees && (
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//                 Quantity
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   min="1"
//                   max={maxReturnable}
//                   value={quantity}
//                   onChange={(e) => setQuantity(Number(e.target.value))}
//                   className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
//                   required
//                 />
//                 {employeeId && (
//                   <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-xs text-slate-400 font-bold gap-1">
//                     <AlertTriangle size={12} className="text-amber-500" /> MAX{" "}
//                     {maxReturnable}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !employeeId ||
//               quantity < 1 ||
//               quantity > maxReturnable ||
//               !hasEmployees
//             }
//             className={clsx(
//               "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition",
//               selectedStatus?.buttonColor || "bg-slate-600",
//             )}
//           >
//             {loading ? (
//               <Loader2 size={18} className="animate-spin" />
//             ) : (
//               <>
//                 {selectedStatus?.icon && <selectedStatus.icon size={18} />}
//                 Confirm {selectedStatus?.label || "Return"}
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ReturnConsumableModal;
// import React, { useState, useMemo } from "react";
// import { X, Loader2, Undo2, Wrench, Trash2, AlertTriangle } from "lucide-react";
// import api from "../../hooks/api";
// import clsx from "clsx";

// const RETURN_STATUSES = [
//   {
//     id: "AVAILABLE",
//     label: "Good",
//     icon: Undo2,
//     buttonColor: "bg-blue-600 text-white hover:bg-blue-700",
//   },
//   {
//     id: "REPAIR",
//     label: "Repair",
//     icon: Wrench,
//     buttonColor: "bg-amber-500 text-white hover:bg-amber-600",
//   },
//   {
//     id: "SCRAPPED",
//     label: "Scrap",
//     icon: Trash2,
//     buttonColor: "bg-red-600 text-white hover:bg-red-700",
//   },
// ];

// const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [employeeId, setEmployeeId] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [status, setStatus] = useState("AVAILABLE");
//   const [loading, setLoading] = useState(false);

//   if (!isOpen || !item) return null;

//   const currentAssignment = useMemo(() => {
//     if (!employeeId || !item?.assignments?.length) return null;
//     return item.assignments.find(
//       (a) => (a.employeeId?._id || a.employeeId) === employeeId,
//     );
//   }, [employeeId, item]);

//   const maxReturnable = currentAssignment?.quantity || 0;
//   const hasEmployees = item.assignments?.some((a) => a.employeeId);

//   const handleReturn = async (e) => {
//     e.preventDefault();
//     if (!employeeId || quantity < 1 || quantity > maxReturnable) return;

//     setLoading(true);
//     try {
//       await api.post(`/consumables/${item._id}/return`, {
//         employeeId,
//         quantity: Number(quantity),
//         returnStatus: status,
//         isDamaged: status !== "AVAILABLE",
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Return failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedStatus = RETURN_STATUSES.find((s) => s.id === status);

//   return (
//     <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
//         <div className="flex justify-between items-center p-6 border-b bg-slate-50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">Process Return</h2>
//             <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
//               {item.itemName}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 rounded-full hover:bg-slate-200 transition"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         <form onSubmit={handleReturn} className="p-6 space-y-5">
//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//               Select Employee
//             </label>
//             {hasEmployees ? (
//               <select
//                 required
//                 value={employeeId}
//                 onChange={(e) => setEmployeeId(e.target.value)}
//                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
//               >
//                 <option value="">Choose employee...</option>
//                 {item.assignments.map((a) => {
//                   const emp = a.employeeId;
//                   if (!emp) return null;
//                   return (
//                     <option key={emp._id} value={emp._id}>
//                       {emp.name} • {emp.email} ({a.quantity} issued)
//                     </option>
//                   );
//                 })}
//               </select>
//             ) : (
//               <p className="text-sm text-slate-500 italic">
//                 No employees currently have this item assigned.
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//               Condition
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               {RETURN_STATUSES.map((s) => {
//                 const Icon = s.icon;
//                 const isSelected = status === s.id;
//                 return (
//                   <button
//                     key={s.id}
//                     type="button"
//                     onClick={() => setStatus(s.id)}
//                     className={clsx(
//                       "rounded-xl p-3 flex flex-col items-center text-xs font-bold transition transform hover:scale-105",
//                       isSelected
//                         ? s.buttonColor
//                         : "bg-slate-100 text-slate-600",
//                     )}
//                   >
//                     <Icon size={16} className="mb-1" />
//                     {s.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {hasEmployees && (
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 min={1}
//                 max={maxReturnable}
//                 value={quantity}
//                 onChange={(e) => setQuantity(Number(e.target.value))}
//                 className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
//                 required
//               />
//               {employeeId && (
//                 <div className="mt-1 text-xs text-slate-400 font-bold flex items-center gap-1">
//                   <AlertTriangle size={12} className="text-amber-500" /> MAX{" "}
//                   {maxReturnable}
//                 </div>
//               )}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !employeeId ||
//               quantity < 1 ||
//               quantity > maxReturnable ||
//               !hasEmployees
//             }
//             className={clsx(
//               "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition",
//               selectedStatus?.buttonColor || "bg-slate-600",
//             )}
//           >
//             {loading ? (
//               <Loader2 size={18} className="animate-spin" />
//             ) : (
//               `Confirm ${selectedStatus?.label}`
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ReturnConsumableModal;
import React, { useMemo, useState } from "react";
import { X, Loader2, Undo2, Wrench, Trash2, AlertTriangle } from "lucide-react";
import api from "../../hooks/api";
import clsx from "clsx";

const RETURN_STATUSES = [
  {
    id: "AVAILABLE",
    label: "Good",
    icon: Undo2,
    color: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    id: "REPAIR",
    label: "Repair",
    icon: Wrench,
    color: "bg-amber-500 text-white hover:bg-amber-600",
  },
  {
    id: "SCRAPPED",
    label: "Scrap",
    icon: Trash2,
    color: "bg-red-600 text-white hover:bg-red-700",
  },
];

const ReturnConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const [employeeId, setEmployeeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("AVAILABLE");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const currentAssignment = useMemo(() => {
    if (!employeeId || !item?.assignments?.length) return null;
    return item.assignments.find(
      (a) => (a.employeeId?._id || a.employeeId) === employeeId,
    );
  }, [employeeId, item]);

  const maxReturnable = currentAssignment?.quantity || 0;
  const hasEmployees = item.assignments?.some((a) => a.employeeId);

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!employeeId || quantity < 1 || quantity > maxReturnable) return;

    setLoading(true);
    try {
      await api.post(`/consumables/${item._id}/return`, {
        employeeId,
        quantity: Number(quantity),
        returnStatus: status,
        isDamaged: status !== "AVAILABLE",
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Return failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedStatus = RETURN_STATUSES.find((s) => s.id === status);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Process Return</h2>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {item.itemName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleReturn} className="p-6 space-y-5">
          {/* Employee Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Select Employee
            </label>
            {hasEmployees ? (
              <select
                required
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="">Choose employee...</option>
                {item.assignments.map((a) => {
                  const emp = a.employeeId;
                  if (!emp) return null;
                  return (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} • {emp.email} ({a.quantity} issued)
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No employees currently have this item assigned.
              </p>
            )}
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Condition
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RETURN_STATUSES.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setStatus(s.id)}
                    className={clsx(
                      "rounded-xl p-3 flex flex-col items-center text-xs font-bold transition transform hover:scale-105",
                      status === s.id ? s.color : "bg-slate-100 text-slate-600",
                    )}
                  >
                    <Icon size={16} className="mb-1" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          {hasEmployees && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={maxReturnable}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
              {employeeId && quantity > maxReturnable && (
                <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                  <AlertTriangle size={12} /> Max returnable {maxReturnable}
                </p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !employeeId ||
              quantity < 1 ||
              quantity > maxReturnable ||
              !hasEmployees
            }
            className={clsx(
              "w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg transition",
              selectedStatus?.color || "bg-slate-600",
            )}
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {selectedStatus?.icon && <selectedStatus.icon size={18} />}
                Confirm {selectedStatus?.label || "Return"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReturnConsumableModal;
