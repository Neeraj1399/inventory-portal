import React, { useState, useRef } from "react";
import { User, ShieldCheck } from "lucide-react";
import EditProfileModal from "./EditProfileModal";

const UserMenu = ({ user, onUpdate }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const btnRef = useRef(null);

  if (!user) {
    return (
      <div className="flex items-center gap-4 px-4 py-2">
        <div className="text-right hidden sm:block space-y-2">
          <div className="h-4 w-24 bg-bg-tertiary rounded-full animate-pulse" />
          <div className="h-3 w-16 bg-bg-tertiary rounded-full animate-pulse ml-auto" />
        </div>
        <div className="h-12 w-12 bg-bg-tertiary rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        ref={btnRef}
        onClick={() => setIsEditModalOpen(true)}
        className="flex items-center gap-4 px-3 py-2 rounded-2xl hover:bg-bg-secondary border border-transparent hover:border-border transition-all group active:scale-[0.98] cursor-pointer"
        title="Account Configuration"
      >
        <div className="text-right hidden sm:block transition-all group-hover:-translate-x-1">
          <p className="text-sm font-black text-text-primary tracking-tight leading-none mb-1 group-hover:text-white transition-colors">
            {user.name}
          </p>
          <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] text-accent-primary font-black uppercase tracking-[0.2em]">
              {user.role || "STAFF"}
            </span>
            {user.roleAccess === "ADMIN" && (
              <ShieldCheck size={10} className="text-accent-primary" />
            )}
          </div>
        </div>

        <div className="h-12 w-12 bg-bg-elevated rounded-2xl flex items-center justify-center border border-border group-hover:border-accent-primary/50 transition-all shadow-premium group-hover:shadow-glow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-accent-primary/0 group-hover:bg-accent-primary/5 transition-colors" />
          <User size={22} className="text-text-muted group-hover:text-accent-primary transition-colors relative z-10" />
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-primary rounded-full shadow-glow animate-pulse" />
        </div>
      </button>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={onUpdate}
        anchorRef={btnRef}
      />
    </div>
  );
};

export default UserMenu;
