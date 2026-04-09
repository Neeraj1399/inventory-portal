import React, { useState, useEffect } from "react";
import { User, Mail, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

// Premium Primitives
import Button from "./Button";
import Input from "./Input";

const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && isOpen) {
      setFormData({ name: user.name, email: user.email });
      setError("");
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) {
      setError("Identity synchronization failure. Please re-authenticate.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const res = await api.patch(`/admin/employees/${userId}`, formData);
      onUpdate(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update identity parameters.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bg-primary/85 backdrop-blur-xl"
            onClick={!isSaving ? onClose : undefined}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm bg-bg-tertiary border border-accent-primary/20 rounded-[2.5rem] overflow-hidden shadow-glow z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!isSaving && (
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-3 text-text-muted hover:text-white hover:bg-bg-tertiary rounded-2xl transition-all active:scale-95 z-10"
              >
                <X size={20} />
              </button>
            )}

            <div className="p-10 text-center space-y-10">
              {/* Header Icon */}
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-[40px] animate-pulse" />
                <div className="relative bg-bg-elevated border border-border w-full h-full rounded-3xl flex items-center justify-center text-accent-primary shadow-inner">
                  <User size={40} />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-text-primary tracking-tight">Identity Settings</h3>
                <p className="text-text-muted text-[10px] uppercase font-black tracking-widest opacity-60">Manage your authenticated profile</p>
              </div>

              {error && (
                <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-2xl text-status-danger text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest px-1">Full Name</label>
                  <Input
                    icon={User}
                    type="text"
                    required
                    placeholder="Identity Label"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-disabled uppercase tracking-widest px-1">Email Address</label>
                  <Input
                    icon={Mail}
                    type="email"
                    required
                    placeholder="Identity Link"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-14 uppercase tracking-widest text-[11px]"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isSaving}
                    className="flex-[2] h-14 uppercase tracking-widest text-[11px]"
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
