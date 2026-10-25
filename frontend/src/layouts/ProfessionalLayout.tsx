import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  FileCheck,
  Briefcase,
  MessageSquare,
  Calendar,
  IndianRupee,
  Star,
  UserCheck,
  ShieldCheck,
  Settings,
  Wrench,
  Menu,
  X,
  ExternalLink,
  LogOut,
  Radio,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

export function ProfessionalLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/pro/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Matching Problems', path: '/pro/matching-problems', icon: <Search className="w-4 h-4" />, badge: '5 New' },
    { label: 'My Proposals', path: '/pro/proposals', icon: <FileCheck className="w-4 h-4" /> },
    { label: 'Active Jobs', path: '/pro/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Messages', path: '/pro/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Schedule', path: '/pro/schedule', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Earnings', path: '/pro/earnings', icon: <IndianRupee className="w-4 h-4" /> },
    { label: 'Reviews & Reputation', path: '/pro/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Profile', path: '/pro/profile', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Verification', path: '/pro/verification', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Settings', path: '/pro/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const profileMenuItems = [
    { id: '1', label: 'Pro Profile Settings', icon: <Settings className="w-4 h-4" />, onClick: () => alert('Pro Settings') },
    { id: '2', label: 'Switch to Customer Portal', icon: <ExternalLink className="w-4 h-4" />, onClick: () => (window.location.href = '/customer/dashboard') },
    { id: '3', label: 'Sign Out (Demo)', icon: <LogOut className="w-4 h-4" />, variant: 'danger' as const, onClick: () => (window.location.href = '/auth/login') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar with Amber/Emerald Accents */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SolveBid</span>
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200">
            Professional
          </span>
        </div>

        {/* Availability Toggle Pill */}
        <div className="p-3 border-b border-slate-100">
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-full flex items-center justify-between p-2 rounded-lg border text-xs font-semibold transition-all ${
              isAvailable
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Radio className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isAvailable ? 'Available for Jobs' : 'Offline / Busy'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              {isAvailable ? 'Live' : 'Off'}
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Professional Sidebar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-50 text-amber-900 font-semibold border-l-4 border-amber-600 rounded-r-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Professional Mini Info Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 text-xs font-bold">
              AH
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-slate-800 truncate">Arun HVAC</p>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">★ 4.8 (142 jobs)</p>
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
            items={profileMenuItems}
          />
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Professional Workbench
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="verified" />
            <Link
              to="/pro/matching-problems"
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <span>⚡ 5 Matching Jobs Nearby</span>
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
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Outlet for Pro Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
