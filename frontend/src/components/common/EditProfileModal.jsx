import React, { useState, useEffect } from "react";
import { User, Mail, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

import Button from "./Button";
import Input from "./Input";

const EditProfileModal = ({ isOpen, onClose, user, onUpdate, anchorRef }) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: document.documentElement.clientWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

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
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[200]"
            onClick={!isSaving ? onClose : undefined}
          />
          <motion.div
            style={{ top: pos.top, right: pos.right }}
            className="fixed z-[201] w-80 bg-bg-secondary border border-border rounded-2xl shadow-premium overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border bg-bg-tertiary/40">
              <p className="text-[10px] font-black text-text-muted tracking-widest">
                Edit Profile
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-[10px] font-black tracking-widest">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">
                  Full Name
                </label>
                <Input
                  icon={User}
                  type="text"
                  required
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-disabled tracking-widest px-1">
                  Email Address
                </label>
                <Input
                  icon={Mail}
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={onClose}
                  className="flex-1 tracking-widest text-[10px]"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSaving}
                  className="flex-[2] tracking-widest text-[10px]"
                  icon={Save}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditProfileModal;
