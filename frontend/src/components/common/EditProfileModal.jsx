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
 <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4 ">
 <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
 <h2 className="text-xl font-bold mb-6 text-zinc-50">Edit Profile</h2>
 <form onSubmit={handleSubmit} className="space-y-5">
 <div>
 <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2 ml-1">
 Full Name
 </label>
 <input
 type="text"
 required
 className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-50 placeholder-zinc-500 transition-all"
 value={formData.name}
 onChange={(e) =>
 setFormData({ ...formData, name: e.target.value })
 }
 />
 </div>
 <div>
 <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2 ml-1">
 Email Address
 </label>
 <input
 type="email"
 required
 className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-800 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none text-zinc-50 placeholder-zinc-500 transition-all"
 value={formData.email}
 onChange={(e) =>
 setFormData({ ...formData, email: e.target.value })
 }
 />
 </div>

 <div className="flex gap-3 justify-end mt-8">
 <button
 type="button"
 onClick={onClose}
 disabled={isSaving}
 className="px-5 py-3 text-sm font-bold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={isSaving}
 className={`bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-lg shadow-black/20 transition-all ${
 isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-500 hover:-translate-y-0.5"
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
