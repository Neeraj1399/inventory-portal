import React, { useEffect, useState } from "react";
import { X, Upload, Loader2, Package, Tag, Layers, Hash, Calendar, DollarSign, ShieldAlert } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import Input from "../common/Input";
import Button from "../common/Button";

const AddAssetModal = ({ isOpen, onClose, onRefresh, asset }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    category: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyMonths: 12,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (asset && isOpen) {
      setFormData({
        category: asset.category || "",
        model: asset.model || "",
        serialNumber: asset.serialNumber || "",
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.split("T")[0] : "",
        purchasePrice: asset.purchasePrice || "",
        warrantyMonths: asset.warrantyMonths || 12,
      });
    } else if (isOpen) {
      setFormData({
        category: "",
        model: "",
        serialNumber: "",
        purchaseDate: "",
        purchasePrice: "",
        warrantyMonths: 12,
      });
      setFile(null);
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("category", formData.category);
      data.append("model", formData.model);
      data.append("serialNumber", formData.serialNumber);
      data.append("purchaseDate", formData.purchaseDate);
      data.append("purchasePrice", formData.purchasePrice || 0);
      data.append("warrantyMonths", formData.warrantyMonths || 12);

      if (file) {
        data.append("receipt", file);
      }

      if (asset?._id) {
        await api.patch(`/assets/${asset._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("Fleet intelligence updated.", "success");
      } else {
        await api.post("/assets", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        addToast("New unit registered in registry.", "success");
      }

      onRefresh();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "Registry update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
      <div className="bg-bg-secondary border border-border w-full max-w-2xl rounded-2xl shadow-premium overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight">
              {asset ? "Update Unit" : "Register Unit"}
            </h2>
            <p className="text-[10px] font-black tracking-[0.2em] text-accent-primary mt-0.5">
              Hardware Resource Management
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-bg-tertiary rounded-xl transition-all duration-200 text-text-muted hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                  Category
                </label>
                <Input
                  icon={Layers}
                  required
                  placeholder="e.g. Workstation"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                  Model
                </label>
                <Input
                  icon={Tag}
                  required
                  placeholder="e.g. Precision 5570"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                  Serial Number
                </label>
                <Input
                  icon={Hash}
                  required
                  placeholder="SN-XXXX-XXXX"
                  className="font-mono"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                  Acquisition Date
                </label>
                <Input
                  icon={Calendar}
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                    Cost
                  </label>
                  <Input
                    icon={DollarSign}
                    type="number"
                    placeholder="0.00"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                    Warranty (Mo)
                  </label>
                  <Input
                    icon={ShieldAlert}
                    type="number"
                    value={formData.warrantyMonths}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black tracking-[0.2em] text-text-disabled ml-1 mb-1.5">
                  Receipt
                </label>
                <label className="flex flex-col items-center justify-center w-full h-[72px] border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-bg-elevated hover:border-accent-primary/50 transition-all duration-200 group">
                  <Upload size={16} className="text-text-disabled group-hover:text-accent-primary mb-1 transition-colors" />
                  <span className="text-[10px] font-black tracking-widest text-text-disabled group-hover:text-text-primary transition-colors">
                    {file ? file.name : asset?.receiptUrl ? "Replace" : "Attach Receipt"}
                  </span>
                  <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    if (selected && selected.size > 10 * 1024 * 1024) {
                      addToast("File too large. Maximum size is 10MB.", "error");
                      e.target.value = "";
                      return;
                    }
                    setFile(selected || null);
                  }}
                />
                </label>
              </div>
            </div>
          </div>

          </div>
          <div className="px-5 py-4 border-t border-border flex justify-end gap-3 shrink-0">
            <Button variant="secondary" onClick={onClose} className="px-8">
              Discard
            </Button>
            <Button type="submit" isLoading={loading} className="px-8 min-w-[160px]">
              {asset ? "Synchronize Changes" : "Commit to Registry"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
