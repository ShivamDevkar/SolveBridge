import { useState, type ReactNode } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileQuestion,
  Briefcase,
  ShieldAlert,
  FolderTree,
  ScrollText,
  Settings,
  Wrench,
  Menu,
  X,
  LogOut,
  Bell,
  ExternalLink,
} from "lucide-react";
import { DropdownMenu } from "@/components/ui/DropdownMenu";
import { useAuth } from "@/context/AuthContext";

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const displayName =
    (typeof user?.user_metadata?.name === "string" && user.user_metadata.name) ||
    (typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
    user?.email ||
    "System Admin";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      window.location.href = "/auth/login";
    }
  };

  const navItems: Array<{
    label: string;
    path: string;
    icon: ReactNode;
  }> = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Professionals Directory",
      path: "/admin/professionals",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "Verification Queue",
      path: "/admin/verification",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      label: "Problems Oversight",
      path: "/admin/problems",
      icon: <FileQuestion className="w-4 h-4" />,
    },
    {
      label: "Jobs Monitor",
      path: "/admin/jobs",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      label: "Disputes Center",
      path: "/admin/disputes",
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      label: "Categories & Skills",
      path: "/admin/categories",
      icon: <FolderTree className="w-4 h-4" />,
    },
    {
      label: "User Directory",
      path: "/admin/users",
      icon: <Users className="w-4 h-4" />,
    },
    // {
    //   label: "Content Reports",
    //   path: "/admin/reports",
    //   icon: <Flag className="w-4 h-4" />,
    // },
    // {
    //   label: "Market Analytics",
    //   path: "/admin/analytics",
    //   icon: <BarChart3 className="w-4 h-4" />,
    // },
    {
      label: "Audit Logs",
      path: "/admin/audit-logs",
      icon: <ScrollText className="w-4 h-4" />,
    },
    // {
    //   label: "Platform Settings",
    //   path: "/admin/settings",
    //   icon: <Settings className="w-4 h-4" />,
    // },
  ];

  const adminMenuItems = [
    // {
    //   id: "1",
    //   label: "Admin Security",
    //   icon: <Settings className="w-4 h-4" />,
    //   onClick: () => alert("Admin Security"),
    // },
    {
      id: "1",
      label: "Customer Portal Preview",
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: () => (window.location.href = "/customer/dashboard"),
    },
    {
      id: "2",
      label: "Sign Out",
      icon: <LogOut className="w-4 h-4" />,
      variant: "danger" as const,
      onClick: () => {
        void signOut().then(({ error }) => {
          if (!error) {
            window.location.href = "/auth/login";
          }
        });
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* High-Density Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link
            to="/"
            className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">
              SolveBridge
            </span>
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            Admin
          </span>
        </div>

        {/* Quick System Health Pill */}
        <div className="p-3 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Market Status</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
              ● 100% Operational
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          className="flex-1 p-3 space-y-0.5 overflow-y-auto"
          aria-label="Admin Navigation"
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-purple-50 text-purple-900 font-semibold border-l-4 border-purple-600 rounded-r-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={isActive ? "text-purple-600" : "text-slate-400"}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                
              </Link>
            );
          })}
        </nav>

        {/* Admin User Mini Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">
                System Admin
              </p>
              <p className="text-[10px] text-purple-700 font-mono truncate">
                Governance Role
              </p>
            </div>
          </div>
          <DropdownMenu
            trigger={
              <button
                aria-label="User Options Menu"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <Settings className="w-4 h-4" />
              </button>
            }
            items={adminMenuItems}
          />
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Platform Administration Console
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hidden sm:inline-flex items-center gap-1.5">
              <span>⚠ 3 Pending Verifications</span>
            </span> */}
            <Link
              to="/admin/audit-logs"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="View Audit Logs"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-600" />
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                
              </Link>
            ))}

            {/* Mobile User Profile & Sign Out */}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <div className="flex items-center gap-2.5 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full mt-1 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Outlet for Admin Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
