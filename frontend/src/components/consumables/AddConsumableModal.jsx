import React, { useState } from "react";
import { X, Package, Layers, Hash, DollarSign, AlertCircle, Plus, LayoutGrid } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Input from "../common/Input";
import Button from "../common/Button";

const AddConsumableModal = ({ isOpen, onClose, onRefresh }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    totalQuantity: "",
    unitCost: "",
    lowStockThreshold: 5,
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        totalQuantity: Number(formData.totalQuantity) || 0,
        unitCost: Number(formData.unitCost) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 0,
        maintenanceQuantity: 0,
        assignedQuantity: 0,
      };

      await api.post("/consumables", payload);
      onRefresh();

      setFormData({
        itemName: "",
        category: "",
        totalQuantity: "",
        unitCost: "",
        lowStockThreshold: 5,
      });
      addToast("Resource initialized in inventory.", "success");
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to initialize resource.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-border flex justify-between items-center bg-bg-tertiary/20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">New <span className="text-accent-primary">Resource</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-secondary mt-1">
              Consumable Inventory Intake
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all text-text-muted hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                Resource Descriptor
              </label>
              <Input
                icon={Package}
                required
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Wireless Mouse G502"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                  Classification
                </label>
                <Input
                  icon={LayoutGrid}
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Peripheral"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                  Unit Valuation ($)
                </label>
                <Input
                  icon={DollarSign}
                  type="number"
                  step="0.01"
                  required
                  name="unitCost"
                  value={formData.unitCost}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                  Intake Volume
                </label>
                <Input
                  icon={Hash}
                  type="number"
                  required
                  name="totalQuantity"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-disabled ml-1 shadow-sm">
                  Critical Threshold
                </label>
                <Input
                  icon={AlertCircle}
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-4 pt-4 border-t border-border">
            <Button variant="secondary" onClick={onClose} className="px-8 flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="px-8 flex-1">
              Commit Stock
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddConsumableModal;
