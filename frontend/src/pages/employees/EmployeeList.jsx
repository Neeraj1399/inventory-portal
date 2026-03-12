import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  UserPlus,
  Mail,
  UserMinus,
  Laptop,
  ArrowRight,
  Plus,
  Edit,
  Package,
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
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [viewStatus, setViewStatus] = useState("ACTIVE");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      // res.data.data should include assignedAssetsCount and assignedConsumablesCount from backend
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus === "ACTIVE") {
        if (
          !window.confirm(
            "Confirm offboarding? All hardware and consumables must be returned first.",
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

  if (loading && employees.length === 0) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading Directory...</p>
      </div>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-blue-200 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      {/* Directory Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
          No employees found
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredEmployees.map((emp) => {
            // Check if employee has ANY company property
            const hasItemsAssigned =
              emp.assignedAssetsCount > 0 || emp.assignedConsumablesCount > 0;

            return (
              <div
                key={emp._id}
                className="group bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
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

                {/* Inventory Status Indicators */}
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Assets
                    </span>
                    <div
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        emp.assignedAssetsCount > 0
                          ? "text-amber-600"
                          : "text-slate-400"
                      }`}
                    >
                      <Laptop size={14} />
                      <span>{emp.assignedAssetsCount || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Consumables
                    </span>
                    <div
                      className={`flex items-center gap-1.5 text-sm font-medium ${
                        // Explicitly check for > 0 to handle null/undefined safely
                        (emp.assignedConsumablesCount || 0) > 0
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      <Package size={14} />
                      {/* Use a fallback of 0 */}
                      <span>{emp.assignedConsumablesCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  {emp.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsAssetModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Plus size={14} />
                        Assign Gear
                      </button>

                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsEditModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                      >
                        <Edit size={14} />
                        Edit
                      </button>

                      <button
                        disabled={hasItemsAssigned}
                        title={
                          hasItemsAssigned
                            ? "Return all assets and consumables before offboarding"
                            : "Offboard employee"
                        }
                        onClick={() => handleToggleStatus(emp._id, emp.status)}
                        className={`p-2 rounded-xl transition-all ${
                          hasItemsAssigned
                            ? "text-slate-200 cursor-not-allowed"
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                        }`}
                      >
                        <UserMinus size={18} />
                      </button>
                    </>
                  )}
                  <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRefresh={fetchEmployees}
      />

      {selectedEmployee && (
        <>
          <EditEmployeeModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
            }}
            employeeData={selectedEmployee}
            onRefresh={fetchEmployees}
          />

          <ManageAssetsModal
            isOpen={isAssetModalOpen}
            employee={selectedEmployee}
            onClose={() => {
              setIsAssetModalOpen(false);
              setSelectedEmployee(null);
            }}
            onRefresh={fetchEmployees}
          />
        </>
      )}
    </div>
  );
};

export default EmployeeList;
