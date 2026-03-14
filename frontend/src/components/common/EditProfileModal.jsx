import React, { useState, useEffect } from "react";
import api from "../../hooks/api";

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  // 1. Hooks stay at the top
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Sync form when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setFormData({ name: user.name, email: user.email });
    }
  }, [user, isOpen]);

  // 2. Early return AFTER hooks
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get ID from user object
    const userId = user?._id || user?.id;
    if (!userId) {
      alert("User ID missing. Please refresh.");
      return;
    }

    setIsSaving(true);
    try {
      // 🟢 The actual API call
      const res = await api.patch(`admin/employees/${userId}`, formData);

      // Update global state via the prop passed from UserMenu/Navbar
      onUpdate(res.data.data);

      onClose();
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl animate-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all ${
                isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
