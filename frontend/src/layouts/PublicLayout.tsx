import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, X, ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Main Public Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-0.5">
                SolveBid
                <span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] text-slate-500 -mt-1 hidden sm:inline font-medium">
                Problem-First Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Call To Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/auth/register">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex sm:hidden items-center gap-2">
            <Link to="/auth/register">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg">
            <nav className="flex flex-col gap-1" aria-label="Mobile Navigation">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-600 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900 text-sm">SolveBid</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Describe the problem. Compare the solutions. Get it solved. The problem-first marketplace for verified local professionals.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Strict Provider Verification & Audit Logs</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Marketplace Portals</h4>
            <ul className="space-y-1.5">
              <li><Link to="/auth/login" className="text-slate-600 hover:text-blue-600 transition-colors">Customer Portal (Sign In)</Link></li>
              <li><Link to="/auth/login" className="text-slate-600 hover:text-amber-700 transition-colors">Professional Workbench (Sign In)</Link></li>
              <li><Link to="/auth/login" className="text-slate-600 hover:text-purple-700 transition-colors">Admin Governance (Sign In)</Link></li>
              <li><Link to="/about#user-journeys" className="text-slate-600 hover:text-slate-900 transition-colors">Customer & Pro Journeys</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Service Domains</h4>
            <ul className="space-y-1.5 text-slate-600">
              <li>Home Services (HVAC, Plumbing, Electrical)</li>
              <li>Vehicle Breakdown & Servicing</li>
              <li>Technology & Hardware Repair</li>
              <li>Business Facility Maintenance</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Platform & Governance</h4>
            <ul className="space-y-1.5">
              <li><Link to="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About SolveBid</Link></li>
              <li><Link to="/about#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors">Problem-to-Resolution Workflow</Link></li>
              <li><Link to="/about#trust-safety" className="text-slate-600 hover:text-slate-900 transition-colors">Trust & Privacy Architecture</Link></li>
              <li><Link to="/auth/login" className="text-slate-600 hover:text-blue-600 transition-colors">Get Started / Log In</Link></li>
              <li className="text-slate-400 text-[11px] pt-2">© 2026 SolveBid. All rights reserved.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
