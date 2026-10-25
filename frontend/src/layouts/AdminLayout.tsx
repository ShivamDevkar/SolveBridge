import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileQuestion,
  Briefcase,
  ShieldAlert,
  FolderTree,
  Flag,
  BarChart3,
  ScrollText,
  Settings,
  Wrench,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Bell,
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

export function AdminLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Professionals Directory', path: '/admin/professionals', icon: <Users className="w-4 h-4" /> },
    { label: 'Verification Queue', path: '/admin/verification', icon: <ShieldCheck className="w-4 h-4" />, alert: '3' },
    { label: 'Problems Oversight', path: '/admin/problems', icon: <FileQuestion className="w-4 h-4" /> },
    { label: 'Jobs Monitor', path: '/admin/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Disputes Center', path: '/admin/disputes', icon: <ShieldAlert className="w-4 h-4" />, alert: '1' },
    { label: 'Categories & Skills', path: '/admin/categories', icon: <FolderTree className="w-4 h-4" /> },
    { label: 'User Directory', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'Content Reports', path: '/admin/reports', icon: <Flag className="w-4 h-4" /> },
    { label: 'Market Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: <ScrollText className="w-4 h-4" /> },
    { label: 'Platform Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const adminMenuItems = [
    { id: '1', label: 'Admin Security', icon: <Settings className="w-4 h-4" />, onClick: () => alert('Admin Security') },
    { id: '2', label: 'Customer Portal Preview', icon: <ExternalLink className="w-4 h-4" />, onClick: () => (window.location.href = '/customer/dashboard') },
    { id: '3', label: 'Sign Out (Demo)', icon: <LogOut className="w-4 h-4" />, variant: 'danger' as const, onClick: () => (window.location.href = '/auth/login') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* High-Density Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-purple-500 rounded-lg p-1">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SolveBid</span>
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
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-50 text-purple-900 font-semibold border-l-4 border-purple-600 rounded-r-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-purple-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.alert && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {item.alert}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin User Mini Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold">
              AD
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">System Admin</p>
              <p className="text-[10px] text-purple-700 font-mono truncate">Governance Role</p>
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
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Platform Administration Console
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hidden sm:inline-flex items-center gap-1.5">
              <span>⚠ 3 Pending Verifications</span>
            </span>
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
                {item.alert && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-800">
                    {item.alert}
                  </span>
                )}
              </Link>
            ))}
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
