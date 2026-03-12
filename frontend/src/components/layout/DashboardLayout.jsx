import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  History,
  LogOut,
  Menu,
  Cpu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../hooks/api";
import UserMenu from "../common/UserMenu";

const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, setUser } = useAuth(); // Assume setUser is available in AuthContext to update global state
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Server-side logout skipped or failed");
    } finally {
      logout();
    }
  };

  // Helper to update the user data in global context after profile edit
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
    { name: "Assets", path: "/assets", icon: Cpu, roles: ["ADMIN", "STAFF"] },
    {
      name: "Consumables",
      path: "/consumables",
      icon: Package,
      roles: ["ADMIN"],
    },
    { name: "Employees", path: "/employees", icon: Users, roles: ["ADMIN"] },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: History,
      roles: ["ADMIN"],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.roleAccess),
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Package size={20} />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              Inventory
            </span>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                  ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Updated Header with UserMenu */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
          <button
            className="lg:hidden text-slate-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          {/* This replaces the old static div/avatar logic */}
          <div className="ml-auto">
            <UserMenu user={user} onUpdate={handleUserUpdate} />
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
