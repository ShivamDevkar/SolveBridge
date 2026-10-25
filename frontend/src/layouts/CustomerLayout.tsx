import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  PlusCircle,
  FileQuestion,
  Briefcase,
  MessageSquare,
  Star,
  Settings,
  Bell,
  Wrench,
  Menu,
  X,
  User,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { DropdownMenu } from '@/components/ui/DropdownMenu';

export function CustomerLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/customer/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'My Problems', path: '/customer/problems', icon: <FileQuestion className="w-4 h-4" /> },
    { label: 'Active Jobs', path: '/customer/jobs', icon: <Briefcase className="w-4 h-4" /> },
    { label: 'Messages', path: '/customer/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'My Reviews', path: '/customer/reviews', icon: <Star className="w-4 h-4" /> },
    { label: 'Settings', path: '/customer/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const profileMenuItems = [
    { id: '1', label: 'Customer Profile', icon: <User className="w-4 h-4" />, onClick: () => alert('Customer Profile') },
    { id: '2', label: 'Switch to Pro Portal', icon: <ExternalLink className="w-4 h-4" />, onClick: () => (window.location.href = '/pro/dashboard') },
    { id: '3', label: 'Sign Out (Demo)', icon: <LogOut className="w-4 h-4" />, variant: 'danger' as const, onClick: () => (window.location.href = '/auth/login') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Desktop Sidebar with Sapphire Accent */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 select-none shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">SolveBid</span>
          </Link>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            Customer
          </span>
        </div>

        {/* Primary "+ Post a Problem" Button */}
        <div className="p-4 border-b border-slate-100">
          <Link to="/customer/problems/new">
            <Button
              variant="primary"
              size="sm"
              className="w-full shadow-sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Post a Problem
            </Button>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Customer Sidebar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 rounded-r-lg'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Mini Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
              SC
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">Sarthak Customer</p>
              <p className="text-[10px] text-slate-500 truncate">Pune, MH</p>
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
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Toggle navigation menu"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Customer Portal
            </h2>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            <Link
              to="/customer/notifications"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </Link>
            <Link to="/customer/problems/new" className="md:hidden">
              <Button variant="primary" size="sm">
                + Post
              </Button>
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
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Outlet for Customer Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
