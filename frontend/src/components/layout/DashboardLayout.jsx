import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Keyboard, Package,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  Monitor, ClipboardList,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../hooks/api";
import UserMenu from "../common/UserMenu";
import LogoutModal from "../common/LogoutModal";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, setUser } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.roleAccess === "ADMIN") {
        try {
          const res = await api.get("/requests");
          const count = (res.data?.data || []).filter(r => r.status === "PENDING").length;
          setPendingCount(count);
        } catch (err) {
          console.error("Failed to fetch pending requests", err);
        }
      }
    };
    
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const triggerLogout = () => setShowLogoutModal(true);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Server-side logout skipped or failed");
    } finally {
      // Small delay to let the animation show
      setTimeout(() => {
        logout();
        setIsLoggingOut(false);
        setShowLogoutModal(false);
      }, 1500);
    }
  };

  const handleUserUpdate = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      roles: ["ADMIN", "STAFF"],
    },
    { name: "Hardware Assets", path: "/assets", icon: Monitor, roles: ["ADMIN"] },
    { name: "Service Tickets", path: "/requests", icon: ClipboardList, roles: ["ADMIN", "STAFF"], badge: pendingCount > 0 && user?.roleAccess === "ADMIN" ? pendingCount : null },
    {
      name: "Consumable Stock",
      path: "/consumables",
      icon: Keyboard,
      roles: ["ADMIN"],
    },
    { name: "Employee Directory", path: "/employees", icon: Users, roles: ["ADMIN"] },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: ShieldAlert,
      roles: ["ADMIN"],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.roleAccess),
  );

  return (
    <div className="flex h-screen overflow-hidden text-zinc-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800
          transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
            <div className="bg-emerald-500 p-2.5 rounded-xl text-white">
              <Package size={20} />
            </div>
            <span className="font-bold text-lg text-zinc-50 tracking-tight">
              Inventory
            </span>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${
                    location.pathname === item.path
                      ? "bg-zinc-800 text-zinc-50"
                      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className={location.pathname === item.path ? "text-emerald-400" : ""} />
                  {item.name}
                </div>
                {item.badge && (
                  <span title="Pending" className="bg-amber-500 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <button
              onClick={triggerLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Widget/Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        isLoggingOut={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>

          <div className="ml-auto">
            <UserMenu user={user} onUpdate={handleUserUpdate} />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 flex flex-col justify-between">
          <div className="mb-auto">
            <Outlet />
          </div>
          
          {/* Footer */}
          <footer className="mt-12 py-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Inventory Portal. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a>
              <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
              <a href="#" className="hover:text-zinc-300 transition-colors">Support</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
