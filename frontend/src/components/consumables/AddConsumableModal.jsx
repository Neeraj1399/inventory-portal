import React, { useState } from "react";
import api from "../../hooks/api";

const AddConsumableModal = ({ isOpen, onClose, onRefresh }) => {
  // 1. Initial State
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Peripheral",
    totalQuantity: "",
    lowStockThreshold: 5,
  });

  if (!isOpen) return null;

  // 2. Optimized Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 3. Robust Payload Conversion
      const payload = {
        ...formData,
        totalQuantity: Number(formData.totalQuantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
      };

      await api.post("/consumables", payload);
      onRefresh();
      setFormData({
        itemName: "",
        category: "Peripheral",
        totalQuantity: "",
        lowStockThreshold: 5,
      }); // Reset form
      onClose();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to add consumable";
      alert(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Add New Consumable
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Item Name
            </label>
            <input
              required
              name="itemName" // 🟢 Added name attribute
              value={formData.itemName} // 🟢 Controlled value
              className="w-full border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Logitech Mouse"
              onChange={handleChange}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Category
            </label>
            <select
              name="category" // 🟢 Added name attribute
              value={formData.category} // 🟢 Controlled value
              className="w-full border border-slate-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
            >
              <option value="Peripheral">Peripheral</option>
              <option value="Cables">Cables</option>
              <option value="Stationery">Stationery</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                required
                name="totalQuantity" // 🟢 Added name attribute
                value={formData.totalQuantity} // 🟢 Controlled value
                className="w-full border border-slate-200 rounded-lg p-2"
                onChange={handleChange}
              />
            </div>
            {/* Threshold */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-1">
                Low Stock Alert
              </label>
              <input
                type="number"
                name="lowStockThreshold" // 🟢 Added name attribute
                value={formData.lowStockThreshold} // 🟢 Controlled value
                className="w-full border border-slate-200 rounded-lg p-2"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-slate-500 font-medium hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConsumableModal;
