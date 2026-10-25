import { Outlet, Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg p-1">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-base font-bold text-slate-900">SolveBid</span>
        </Link>
        <Link
          to="/"
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-2 py-1"
        >
          ← Back to Homepage
        </Link>
      </header>

      {/* Main Centered Container */}
      <main className="w-full max-w-lg mx-auto my-8">
        {/* Outlet for Auth Pages (Login, Register, Forgot Password) */}
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="text-center text-xs text-slate-500 py-3">
        <p>© 2026 SolveBid. Problem-First Service Marketplace.</p>
      </footer>
    </div>
  );
}
