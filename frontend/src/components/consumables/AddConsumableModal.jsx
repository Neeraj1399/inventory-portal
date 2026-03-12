import React, { useState } from "react";
import api from "../../hooks/api";

const AddConsumableModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Peripheral",
    totalQuantity: "",
    unitCost: "", // 🟢 Added cost field
    lowStockThreshold: 5,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        totalQuantity: Number(formData.totalQuantity) || 0,
        unitCost: Number(formData.unitCost) || 0, // 🟢 Convert to number
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
      };

      await api.post("/consumables", payload);
      onRefresh();
      setFormData({
        itemName: "",
        category: "Peripheral",
        totalQuantity: "",
        unitCost: "",
        lowStockThreshold: 5,
      });
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add consumable");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-slate-800 mb-6">
          New Consumable
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
              Item Name
            </label>
            <input
              required
              name="itemName"
              value={formData.itemName}
              className="w-full border border-slate-200 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
              placeholder="e.g. Logitech Mouse"
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                className="w-full border border-slate-200 rounded-xl p-3 font-bold outline-none"
                onChange={handleChange}
              >
                <option value="Peripheral">Peripheral</option>
                <option value="Cables">Cables</option>
                <option value="Stationery">Stationery</option>
              </select>
            </div>
            {/* 🟢 Unit Cost Input */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Unit Cost
              </label>
              <input
                type="number"
                step="0.01"
                required
                name="unitCost"
                value={formData.unitCost}
                placeholder="0.00"
                className="w-full border border-slate-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Total Quantity
              </label>
              <input
                type="number"
                required
                name="totalQuantity"
                value={formData.totalQuantity}
                className="w-full border border-slate-200 rounded-xl p-3 font-bold outline-none"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Low Stock Alert
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                className="w-full border border-slate-200 rounded-xl p-3 font-bold outline-none"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-blue-600 shadow-lg transition-all"
            >
              SAVE ITEM
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConsumableModal;
