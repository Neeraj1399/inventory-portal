// import React, { useState, useEffect, useRef } from "react";
// import { X, Send, Loader2, AlertCircle } from "lucide-react";
// import api from "../../hooks/api";

// const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const modalRef = useRef(null);
//   const firstInputRef = useRef(null);

//   // Reset state and fetch employees when modal opens
//   useEffect(() => {
//     if (isOpen && item) {
//       setSelectedEmployee("");
//       setQuantity(1);
//       setError("");
//       api
//         .get("/employees?status=ACTIVE")
//         .then((res) => setEmployees(res.data.data))
//         .catch((err) => console.error("Failed to load employees", err));
//     }
//   }, [isOpen, item]);

//   // Focus first input on open
//   useEffect(() => {
//     if (isOpen) {
//       setTimeout(() => firstInputRef.current?.focus(), 100);
//     }
//   }, [isOpen]);

//   // Close modal on Escape key
//   useEffect(() => {
//     const handleKey = (e) => {
//       if (e.key === "Escape") onClose();
//     };
//     if (isOpen) window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [isOpen, onClose]);

//   if (!isOpen || !item) return null;

//   const availableStock = item.totalQuantity - item.assignedQuantity;

//   const handleQuantityChange = (e) => {
//     let value = Number(e.target.value);
//     if (isNaN(value) || value < 1) value = 1;
//     if (value > availableStock) value = availableStock;
//     setQuantity(value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedEmployee || quantity < 1 || quantity > availableStock) return;

//     setLoading(true);
//     setError("");
//     try {
//       await api.post(`/consumables/${item._id}/assign`, {
//         employeeId: selectedEmployee,
//         quantity,
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       setError(err.response?.data?.message || "Insufficient stock or error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       ref={modalRef}
//       className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
//       role="dialog"
//       aria-modal="true"
//     >
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//         {/* Header */}
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               Issue Consumable
//             </h2>
//             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
//               Inventory Distribution
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-200 rounded-full transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* Stock Display */}
//           <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
//             <div
//               className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
//                 availableStock > 0
//                   ? "bg-blue-600 text-white"
//                   : "bg-red-100 text-red-600"
//               }`}
//             >
//               {availableStock}
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm font-bold text-slate-900">
//                 {item.itemName}
//               </span>
//               <span className="text-xs text-slate-500">
//                 Units available in stock
//               </span>
//             </div>
//           </div>

//           {/* Inline Error */}
//           {error && (
//             <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
//               <AlertCircle size={12} /> {error}
//             </p>
//           )}

//           <div className="space-y-4">
//             {/* Employee Select */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//                 Recipient Employee
//               </label>
//               <select
//                 required
//                 ref={firstInputRef}
//                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-sm"
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//               >
//                 <option value="">Select an active staff member...</option>
//                 {employees.map((emp) => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name} — {emp.department}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Quantity Input */}
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//                 Quantity
//               </label>
//               <div className="relative">
//                 <input
//                   type="number"
//                   value={quantity}
//                   onChange={handleQuantityChange}
//                   min={1}
//                   max={availableStock}
//                   required
//                   placeholder="0"
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm
//                     [&::-webkit-inner-spin-button]:appearance-none
//                     [&::-webkit-outer-spin-button]:appearance-none
//                     [-moz-appearance]:textfield"
//                 />
//                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">
//                   Units
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !selectedEmployee ||
//               quantity < 1 ||
//               quantity > availableStock
//             }
//             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin" size={20} />
//             ) : (
//               <>
//                 <Send size={18} /> Confirm Issuance
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default IssueConsumableModal;
// import React, { useState, useEffect } from "react";
// import { X, Send, Loader2, AlertCircle } from "lucide-react";
// import api from "../../hooks/api";

// const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       setSelectedEmployee("");
//       setQuantity(1);
//       api
//         .get("/employees?status=ACTIVE")
//         .then((res) => setEmployees(res.data.data))
//         .catch((err) => console.error("Failed to load employees", err));
//     }
//   }, [isOpen, item]);

//   const availableStock = item ? item.totalQuantity - item.assignedQuantity : 0;

//   const handleIssue = async (e) => {
//     e.preventDefault();
//     if (!selectedEmployee || quantity < 1 || quantity > availableStock) return;
//     setLoading(true);
//     try {
//       await api.post(`/consumables/${item._id}/assign`, {
//         employeeId: selectedEmployee,
//         quantity: Number(quantity),
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Insufficient stock or error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen || !item) return null;

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               Issue Consumable
//             </h2>
//             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
//               Inventory Distribution
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-200 rounded-full transition"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <form onSubmit={handleIssue} className="p-6 space-y-6">
//           <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
//             <div
//               className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${availableStock > 0 ? "bg-blue-600 text-white" : "bg-red-100 text-red-600"}`}
//             >
//               {availableStock}
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm font-bold text-slate-900">
//                 {item.itemName}
//               </span>
//               <span className="text-xs text-slate-500">
//                 Units currently available in stock
//               </span>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//                 Recipient Employee
//               </label>
//               <select
//                 required
//                 value={selectedEmployee}
//                 onChange={(e) => setSelectedEmployee(e.target.value)}
//                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer text-sm"
//               >
//                 <option value="">Select an active staff member...</option>
//                 {employees.map((emp) => (
//                   <option key={emp._id} value={emp._id}>
//                     {emp.name} — {emp.department}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//                 Quantity
//               </label>
//               <input
//                 type="number"
//                 min="1"
//                 max={availableStock}
//                 required
//                 value={quantity}
//                 onChange={(e) => setQuantity(e.target.value)}
//                 className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
//               />
//               {quantity > availableStock && (
//                 <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
//                   <AlertCircle size={12} /> Exceeds available stock
//                 </p>
//               )}
//             </div>
//           </div>
//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !selectedEmployee ||
//               quantity < 1 ||
//               quantity > availableStock
//             }
//             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin" size={20} />
//             ) : (
//               <>
//                 <Send size={18} /> Confirm Issuance
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default IssueConsumableModal;
// import React, { useState, useEffect } from "react";
// import { X, Loader2, AlertCircle } from "lucide-react";
// import api from "../../hooks/api";
// import { useActiveEmployees } from "../../hooks/useActiveEmployees";

// const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [quantity, setQuantity] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const employees = useActiveEmployees(isOpen);

//   useEffect(() => {
//     if (isOpen) {
//       setSelectedEmployee("");
//       setQuantity(1);
//     }
//   }, [isOpen, item]);

//   if (!isOpen || !item) return null;

//   const availableStock = item.totalQuantity - item.assignedQuantity;

//   const handleIssue = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await api.post(`/consumables/${item._id}/assign`, {
//         employeeId: selectedEmployee,
//         quantity: Number(quantity),
//       });
//       onRefresh();
//       onClose();
//     } catch (err) {
//       alert(err.response?.data?.message || "Insufficient stock or error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//       <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               Issue Consumable
//             </h2>
//             <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
//               {item.itemName}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-200 rounded-full"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleIssue} className="p-6 space-y-6">
//           {/* Stock */}
//           <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
//             <div
//               className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
//                 availableStock > 0
//                   ? "bg-blue-600 text-white"
//                   : "bg-red-100 text-red-600"
//               }`}
//             >
//               {availableStock}
//             </div>
//             <div className="flex flex-col">
//               <span className="text-sm font-bold text-slate-900">
//                 {item.itemName}
//               </span>
//               <span className="text-xs text-slate-500">
//                 Units currently available
//               </span>
//             </div>
//           </div>

//           {/* Employee */}
//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//               Recipient Employee
//             </label>
//             <select
//               required
//               value={selectedEmployee}
//               onChange={(e) => setSelectedEmployee(e.target.value)}
//               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none text-sm cursor-pointer"
//             >
//               <option value="">Select an active staff...</option>
//               {employees.map((emp) => (
//                 <option key={emp._id} value={emp._id}>
//                   {emp.name} — {emp.department}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Quantity */}
//           <div>
//             <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
//               Quantity
//             </label>
//             <input
//               type="number"
//               min={1}
//               max={availableStock}
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition text-sm"
//               required
//             />
//             {quantity > availableStock && (
//               <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
//                 <AlertCircle size={12} /> Exceeds available stock
//               </p>
//             )}
//           </div>

//           <button
//             type="submit"
//             disabled={
//               loading ||
//               !selectedEmployee ||
//               quantity < 1 ||
//               quantity > availableStock
//             }
//             className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
//           >
//             {loading ? (
//               <Loader2 className="animate-spin" size={20} />
//             ) : (
//               "Confirm Issuance"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default IssueConsumableModal;
import React from "react";
import { X, Loader2, Send, AlertCircle } from "lucide-react";
import { useConsumableModal } from "../../hooks/useConsumableModal";

const IssueConsumableModal = ({ isOpen, item, onClose, onRefresh }) => {
  const {
    employeeId,
    setEmployeeId,
    quantity,
    setQuantity,
    loading,
    setLoading,
    employees,
  } = useConsumableModal(isOpen, item);

  if (!isOpen || !item) return null;

  const availableStock = item.totalQuantity - item.assignedQuantity;

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!employeeId || quantity < 1 || quantity > availableStock) return;

    setLoading(true);
    try {
      await api.post(`/consumables/${item._id}/assign`, {
        employeeId,
        quantity: Number(quantity),
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Insufficient stock or error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Issue Consumable
            </h2>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Inventory Distribution
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleIssue} className="p-6 space-y-6">
          {/* Stock */}
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border ${
              availableStock > 0
                ? "bg-blue-50/50 border-blue-100"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold shadow-sm ${
                availableStock > 0
                  ? "bg-blue-600 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {availableStock}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900">
                {item.itemName}
              </span>
              <span className="text-xs text-slate-500">
                Units currently available in stock
              </span>
            </div>
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
              Recipient Employee
            </label>
            <select
              required
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm cursor-pointer"
            >
              <option value="">Select an active staff member...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 ml-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max={availableStock}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            {quantity > availableStock && (
              <p className="mt-2 text-[10px] text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle size={12} /> Exceeds available stock
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading ||
              !employeeId ||
              quantity < 1 ||
              quantity > availableStock
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Send size={18} /> Confirm Issuance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueConsumableModal;
