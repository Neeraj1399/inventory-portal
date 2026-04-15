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
import api from "../../services/api";
import UserMenu from "../common/UserMenu";
import LogoutModal from "../common/LogoutModal";
import PageTransition from "../common/PageTransition";

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
    { name: "Assets", path: "/assets", icon: Monitor, roles: ["ADMIN"] },
    { name: "Tickets", path: "/requests", icon: ClipboardList, roles: ["ADMIN", "STAFF"], badge: pendingCount > 0 && user?.roleAccess === "ADMIN" ? pendingCount : null },
    {
      name: "Consumables",
      path: "/consumables",
      icon: Keyboard,
      roles: ["ADMIN"],
    },
    { name: "Employees", path: "/employees", icon: Users, roles: ["ADMIN"] },
    {
      name: "Audits",
      path: "/audit-logs",
      icon: ShieldAlert,
      roles: ["ADMIN"],
    },
  ];

  const filteredNav = navItems.filter((item) =>
    item.roles.includes(user?.roleAccess),
  );

  return (
    <div className="flex min-h-screen w-full bg-bg-primary text-text-secondary font-sans selection:bg-accent-primary/30">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-bg-primary/80 z-40 lg:hidden backdrop-blur-xl transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fix height to screen and stick it */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-bg-secondary border-r border-border
          transform transition-transform duration-200 ease-out
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          w-64 md:w-20 lg:w-64 flex-shrink-0 shadow-md
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <div className="h-20 flex items-center gap-4 px-6 border-b border-border flex-shrink-0">
            <div className="bg-accent-gradient p-2.5 rounded-2xl text-white flex-shrink-0 shadow-glow-sm ring-1 ring-accent-primary/20">
              <Package size={22} />
            </div>
            <span className="font-bold text-xl text-text-primary tracking-tight whitespace-nowrap overflow-hidden md:hidden lg:block transition-all duration-200 ease-out">
              Inventory<span className="text-accent-primary">.</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 custom-scrollbar">
            {filteredNav.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 ease-out group
                    ${
                      isActive
                        ? "bg-bg-tertiary text-text-primary shadow-sm border border-border"
                        : "text-text-muted hover:bg-bg-tertiary/50 hover:text-text-primary hover:-translate-y-0.5"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon 
                      size={20} 
                      className={`transition-all duration-200 ease-out ${isActive ? "text-accent-primary scale-110" : "group-hover:text-accent-primary"}`} 
                    />
                    <span className="md:hidden lg:block whitespace-nowrap transition-all duration-200 ease-out">
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <span title="Pending" className="md:hidden lg:block bg-accent-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-widest shadow-glow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Section */}
          <div className="p-4 border-t border-border bg-bg-primary/30">
            <button
              onClick={triggerLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-text-muted hover:text-status-danger hover:bg-status-danger/15 rounded-2xl transition-all duration-200 ease-out text-sm font-semibold group active:scale-95"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform duration-200 ease-out flex-shrink-0" />
              <span className="md:hidden lg:block whitespace-nowrap transition-all duration-200 ease-out">Logout</span>
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

      {/* Main Content Area - No internal scrollbars here */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header - Sticky with glass effect */}
        <header className="h-20 sticky top-0 z-30 flex items-center justify-between px-6 sm:px-8 lg:px-12 bg-bg-primary/80 backdrop-blur-xl border-b border-border flex-shrink-0 transition-colors duration-200 ease-out">
          <button
            className="md:hidden p-2.5 rounded-2xl bg-bg-secondary text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-all duration-200 ease-out active:scale-95"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="ml-auto">
            <UserMenu user={user} onUpdate={handleUserUpdate} />
          </div>
        </header>

        <main className="flex-1 flex flex-col px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex-1">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
          
          <footer className="mt-12 py-10 border-t border-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-muted font-bold tracking-[0.2em] gap-6">
            <p>&copy; {new Date().getFullYear()} Inventory Portal <span className="text-accent-primary font-black">System</span></p>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-text-primary transition-all duration-200 ease-out hover:-translate-y-0.5">Privacy Policy</a>
              <a href="#" className="hover:text-text-primary transition-all duration-200 ease-out hover:-translate-y-0.5">Terms of Service</a>
              <a href="#" className="hover:text-text-primary transition-all duration-200 ease-out hover:-translate-y-0.5">Technical Support</a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
