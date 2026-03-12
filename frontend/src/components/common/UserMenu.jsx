import React, { useState } from "react";
import { User, Settings, LogOut } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

const UserMenu = ({ user, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  if (!user)
    return <div className="animate-pulse bg-slate-100 h-10 w-32 rounded-lg" />;
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-slate-800">{user.name}</p>
        <p className="text-xs text-slate-500">{user.role}</p>
      </div>

      <button
        onClick={() => setIsEditModalOpen(true)}
        className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 hover:bg-slate-200 transition-colors"
      >
        <User size={20} className="text-slate-600" />
      </button>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default UserMenu;
