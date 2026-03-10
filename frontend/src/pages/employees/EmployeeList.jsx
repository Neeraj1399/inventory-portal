// import React, { useEffect, useState, useMemo } from "react";
// import {
//   UserPlus,
//   Mail,
//   UserMinus,
//   Laptop,
//   ArrowRight,
//   Plus,
// } from "lucide-react";

// import api from "../../hooks/api";

// import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
// import ManageAssetsModal from "../assets/ManageAssetsModal";

// const EmployeeList = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [viewStatus, setViewStatus] = useState("ACTIVE");
//   const [selectedEmployee, setSelectedEmployee] = useState(null);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const res = await api.get("/employees");
//       setEmployees(res.data.data || []);
//     } catch (err) {
//       console.error("Error fetching employees", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     try {
//       if (currentStatus === "ACTIVE") {
//         if (
//           !window.confirm(
//             "Confirm offboarding? All hardware must be returned first.",
//           )
//         )
//           return;

//         await api.patch(`/employees/${id}/offboard`);
//         alert("Employee offboarded successfully.");
//       } else {
//         if (!window.confirm("Reactivate this employee?")) return;

//         await api.patch(`/employees/${id}`, { status: "ACTIVE" });
//       }

//       fetchEmployees();
//     } catch (err) {
//       alert(err.response?.data?.message || "Operation failed");
//     }
//   };

//   const filteredEmployees = useMemo(() => {
//     return employees.filter((emp) => {
//       const name = (emp.name || "").toLowerCase();
//       const email = (emp.email || "").toLowerCase();

//       const matchesSearch =
//         name.includes(searchTerm.toLowerCase()) ||
//         email.includes(searchTerm.toLowerCase());

//       return matchesSearch && emp.status === viewStatus;
//     });
//   }, [employees, searchTerm, viewStatus]);

//   if (loading) {
//     return (
//       <div className="p-8 text-slate-500 text-center">Loading Directory...</div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 md:p-0">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-800">
//             Employee Directory
//           </h1>
//           <p className="text-slate-500 text-sm">
//             Manage staff and equipment responsibility
//           </p>
//         </div>

//         <button
//           onClick={() => setIsModalOpen(true)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-200 active:scale-95"
//         >
//           <UserPlus size={18} />
//           Add Employee
//         </button>
//       </div>

//       {/* Employee Cards */}

//       {filteredEmployees.length === 0 ? (
//         <div className="text-center py-16 text-slate-400">
//           No employees found
//         </div>
//       ) : (
//         <div className="flex flex-col gap-3">
//           {filteredEmployees.map((emp) => (
//             <div
//               key={emp._id}
//               className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 hover:shadow-md transition-all"
//             >
//               {/* Info */}
//               <div className="flex items-center gap-4 min-w-[280px]">
//                 <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
//                   {emp.name?.charAt(0) || "U"}
//                 </div>

//                 <div className="flex flex-col">
//                   <span className="font-bold text-slate-800">{emp.name}</span>

//                   <span className="text-xs text-slate-500 flex items-center gap-1.5">
//                     <Mail size={12} />
//                     {emp.email}
//                   </span>
//                 </div>
//               </div>

//               {/* Inventory */}
//               <div className="flex flex-col">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase">
//                   Inventory
//                 </span>

//                 <div
//                   className={`flex items-center gap-1.5 text-sm font-medium ${
//                     emp.assignedAssetsCount > 0
//                       ? "text-amber-600"
//                       : "text-slate-400"
//                   }`}
//                 >
//                   <Laptop size={14} />
//                   <span>{emp.assignedAssetsCount || 0} Assets</span>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
//                 {emp.status === "ACTIVE" && (
//                   <>
//                     <button
//                       onClick={() => setSelectedEmployee(emp)}
//                       className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100"
//                     >
//                       <Plus size={14} />
//                       Assign Gear
//                     </button>

//                     <button
//                       onClick={() => handleToggleStatus(emp._id, emp.status)}
//                       className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
//                     >
//                       <UserMinus size={18} />
//                     </button>
//                   </>
//                 )}

//                 <button
//                   onClick={() => setSelectedEmployee(emp)}
//                   className="p-2 text-slate-300 hover:text-blue-600"
//                 >
//                   <ArrowRight size={20} />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Add Employee Modal */}
//       <AddEmployeeModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onRefresh={fetchEmployees}
//       />

//       {/* Manage Assets Modal */}
//       {selectedEmployee && (
//         <ManageAssetsModal
//           employee={selectedEmployee}
//           onClose={() => setSelectedEmployee(null)}
//           onRefresh={fetchEmployees}
//         />
//       )}
//     </div>
//   );
// };

// export default EmployeeList;
import React, { useEffect, useState, useMemo } from "react";
import {
  UserPlus,
  Mail,
  UserMinus,
  Laptop,
  ArrowRight,
  Plus,
  Edit,
} from "lucide-react";

import api from "../../hooks/api";

import AddEmployeeModal from "../../components/employees/AddEmployeeModal";
import EditEmployeeModal from "../../components/employees/EditEmployeeModal";
import ManageAssetsModal from "../assets/ManageAssetsModal";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewStatus, setViewStatus] = useState("ACTIVE");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus === "ACTIVE") {
        if (
          !window.confirm(
            "Confirm offboarding? All hardware must be returned first.",
          )
        )
          return;

        await api.patch(`/employees/${id}/offboard`);
        alert("Employee offboarded successfully.");
      } else {
        if (!window.confirm("Reactivate this employee?")) return;

        await api.patch(`/employees/${id}`, { status: "ACTIVE" });
      }
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const name = (emp.name || "").toLowerCase();
      const email = (emp.email || "").toLowerCase();

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase());

      return matchesSearch && emp.status === viewStatus;
    });
  }, [employees, searchTerm, viewStatus]);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 text-center">Loading Directory...</div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Directory
          </h1>
          <p className="text-slate-500 text-sm">
            Manage staff and equipment responsibility
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-200 active:scale-95"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          No employees found
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEmployees.map((emp) => (
            <div
              key={emp._id}
              className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 hover:shadow-md transition-all"
            >
              {/* Info */}
              <div className="flex items-center gap-4 min-w-[280px]">
                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                  {emp.name?.charAt(0) || "U"}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{emp.name}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail size={12} />
                    {emp.email}
                  </span>
                </div>
              </div>

              {/* Inventory */}
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Inventory
                </span>
                <div
                  className={`flex items-center gap-1.5 text-sm font-medium ${
                    emp.assignedAssetsCount > 0
                      ? "text-amber-600"
                      : "text-slate-400"
                  }`}
                >
                  <Laptop size={14} />
                  <span>{emp.assignedAssetsCount || 0} Assets</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                {emp.status === "ACTIVE" && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        // Open manage assets modal
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100"
                    >
                      <Plus size={14} />
                      Assign Gear
                    </button>

                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsEditModalOpen(true); // Open Edit Modal
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                    >
                      <Edit size={14} />
                      Edit
                    </button>

                    <button
                      disabled={emp.assignedAssetsCount > 0}
                      title={
                        emp.assignedAssetsCount > 0
                          ? "Return all assets before offboarding"
                          : "Offboard employee"
                      }
                      onClick={() => handleToggleStatus(emp._id, emp.status)}
                      className={`p-2 rounded-xl ${
                        emp.assignedAssetsCount > 0
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <UserMinus size={18} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedEmployee(emp)}
                  className="p-2 text-slate-300 hover:text-blue-600"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={fetchEmployees}
      />

      {isEditModalOpen && selectedEmployee && (
        <EditEmployeeModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employeeData={selectedEmployee}
          onRefresh={fetchEmployees}
        />
      )}

      {selectedEmployee && (
        <ManageAssetsModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          onRefresh={fetchEmployees}
        />
      )}
    </div>
  );
};

export default EmployeeList;
