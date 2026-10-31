import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  CalendarRange,
  FileSpreadsheet,
  Repeat,
  Receipt,
  Percent,
  CreditCard,
  BarChart3,
  Menu,
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { checkBackendHealth } from '../api/client';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  owner: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, owner: 'Core' },
  { name: 'Customers', path: '/customers', icon: Users, owner: 'Dev 1' },
  { name: 'Products & Variants', path: '/products', icon: Package, owner: 'Dev 2' },
  { name: 'Subscription Plans', path: '/plans', icon: CalendarRange, owner: 'Dev 2' },
  { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet, owner: 'Dev 3' },
  { name: 'Subscriptions', path: '/subscriptions', icon: Repeat, owner: 'Dev 2' },
  { name: 'Invoices & Billing', path: '/invoices', icon: Receipt, owner: 'Dev 3' },
  { name: 'Taxes & Discounts', path: '/taxes-discounts', icon: Percent, owner: 'Dev 3' },
  { name: 'Payments', path: '/payments', icon: CreditCard, owner: 'Dev 4' },
  { name: 'Reports & Analytics', path: '/analytics', icon: BarChart3, owner: 'Dev 4' },
];

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendMeta, setBackendMeta] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    async function probeBackend() {
      const data = await checkBackendHealth();
      if (!mounted) return;
      if (data?.success) {
        setBackendStatus('connected');
        setBackendMeta(data.data);
      } else {
        setBackendStatus('disconnected');
        setBackendMeta(null);
      }
    }

    probeBackend();
    const interval = setInterval(probeBackend, 15000); // Probe every 15s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Dark Navy (#0F172A) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-navy-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md shadow-brand-600/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Brightloop</span>
              <span className="block text-[10px] font-medium text-slate-400 uppercase tracking-widest">SaaS Billing</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    isActive
                      ? 'bg-blue-700/60 text-blue-100'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.owner}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="p-4 border-t border-slate-800 bg-navy-950/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Backend API</span>
            <div className="flex items-center space-x-1.5">
              {backendStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-semibold text-[11px]">Online</span>
                </>
              ) : backendStatus === 'checking' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-amber-300 font-semibold text-[11px]">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-400 font-semibold text-[11px]">Offline</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-mono flex justify-between">
            <span>Currency: INR (₹)</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Currency Chip */}
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200">
              <span className="text-slate-500">Base Currency:</span>
              <span className="font-mono font-semibold text-slate-900">INR (₹)</span>
            </div>

            {/* Backend Health Badge */}
            <div
              className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                backendStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {backendStatus === 'connected' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>API Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>API Disconnected</span>
                </>
              )}
            </div>

            {/* Admin Role Chip */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-navy-900 text-white rounded-md text-xs font-semibold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Admin</span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('brightloop_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md border border-slate-200 transition"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-canvas">
          <Outlet context={{ backendStatus, backendMeta }} />
        </main>
      </div>
    </div>
  );
};
