import React, { useState, useEffect } from "react";
import {
  X,
  Loader2,
  Mail,
  Briefcase,
  Shield,
  Building2,
  Layers,
} from "lucide-react";
import api from "../../hooks/api";

const roles = [
  "Backend Developer",
  "Frontend Developer",
  "Android Developer",
  "iOS Developer",
  "Cloud Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "UI/UX Designer",
  "Data Analyst",
  "Product Manager",
];

const levels = ["Junior", "Mid", "Senior", "Team Lead"];

const departments = [
  "IT",
  "HR",
  "Finance",
  "Admin",
  "Operations",
  "Marketing",
  "Sales",
];

const EditEmployeeModal = ({ isOpen, onClose, employeeData, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "FULL-TIME",
    role: roles[0],
    level: levels[0],
    department: departments[0],
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeeData) {
      setFormData({
        name: employeeData.name || "",
        email: employeeData.email || "",
        type: employeeData.type || "FULL-TIME",
        role: employeeData.role || roles[0],
        level: employeeData.level || levels[0],
        department: employeeData.department || departments[0],
        status: employeeData.status || "ACTIVE",
      });
    }
  }, [employeeData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // MongoDB documents use _id, not id
    const empId = employeeData._id || employeeData.id;

    if (!empId) {
      alert("Error: Employee ID is missing from the record.");
      return;
    }

    setLoading(true);
    try {
      // This matches your backend route: PATCH /api/admin/employeess/:id
      await api.patch(`/employees/${empId}`, formData);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating employee");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Edit Employee</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Work Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Status
              </label>
              <select
                className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="OFFBOARDED">Offboarded</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Employment Type */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Employment Type
              </label>
              <div className="relative flex items-center">
                <Briefcase
                  className="absolute left-3 text-slate-400"
                  size={16}
                />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="FULL-TIME">Full-Time</option>
                  <option value="PART-TIME">Part-Time</option>
                  <option value="INTERN">Intern</option>
                  <option value="CONTRACT">Contract</option>
                </select>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Role
              </label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3 text-slate-400" size={16} />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Level
              </label>
              <div className="relative flex items-center">
                <Layers className="absolute left-3 text-slate-400" size={16} />
                <select
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  {levels.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
              Department
            </label>
            <div className="relative flex items-center">
              <Building2 className="absolute left-3 text-slate-400" size={16} />
              <select
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-500"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Update Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
