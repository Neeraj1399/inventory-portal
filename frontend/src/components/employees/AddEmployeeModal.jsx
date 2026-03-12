import React, { useState } from "react";
import {
  X,
  UserPlus,
  Loader2,
  Mail,
  Briefcase,
  Shield,
  Lock,
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

const AddEmployeeModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    type: "FULL-TIME",
    role: roles[0],
    level: levels[0],
    department: departments[0],
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/employees", formData);
      onRefresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Add New Team Member
            </h2>
          </div>
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
              placeholder="John Doe"
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
                  placeholder="john@athiva.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5 ml-1">
                Temp Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 ml-1 leading-tight">
                10+ chars: 1 Upper, 1 Lower, 1 Number, 1 Special (!@#$%^&*)
              </p>
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500"
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

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 mt-2">
            <p className="text-xs text-amber-700 leading-tight">
              <strong>Note:</strong> Assign hardware from the Asset Management
              tab after employee creation.
            </p>
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
                "Create Employee"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
