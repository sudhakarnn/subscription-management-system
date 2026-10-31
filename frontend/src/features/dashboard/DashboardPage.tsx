import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Repeat,
  Receipt,
  TrendingUp,
  ArrowUpRight,
  Clock,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { apiClient } from '../../api/client';

interface DashboardStats {
  total_customers: number;
  active_customers: number;
  total_subscriptions: number;
  active_subscriptions: number;
  mrr: number;
  total_invoices: number;
  unpaid_invoices: number;
  paid_invoices: number;
  total_revenue: number;
  recent_subscriptions: Array<{
    id: string;
    customer_name: string;
    plan_name: string;
    price: number;
    status: string;
    created_at: string;
  }>;
  recent_invoices: Array<{
    id: string;
    invoice_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    issue_date: string;
  }>;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/analytics/dashboard');
      setStats(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time subscription metrics, monthly recurring revenue, and billing overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/subscriptions"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <PlusCircle size={16} />
            <span>New Subscription</span>
          </Link>
          <Link
            to="/customers"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition"
          >
            <Users size={16} />
            <span>Add Customer</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Recurring (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              ₹{loading ? '...' : (stats?.mrr ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center">
              <ArrowUpRight size={14} /> Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calculated from all active plans</p>
        </div>

        {/* Subscriptions Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Subscriptions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Repeat size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats?.active_subscriptions ?? 0}
            </span>
            <span className="text-xs text-slate-500">
              of {loading ? '...' : stats?.total_subscriptions ?? 0} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Live recurring subscriptions</p>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              {loading ? '...' : stats?.active_customers ?? 0}
            </span>
            <span className="text-xs text-slate-500">
              of {loading ? '...' : stats?.total_customers ?? 0} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Customer accounts in good standing</p>
        </div>

        {/* Total Invoiced Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue Paid</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">
              ₹{loading ? '...' : (stats?.total_revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-amber-600 font-medium">
              {loading ? '...' : stats?.unpaid_invoices ?? 0} pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Across all settled invoices</p>
        </div>
      </div>

      {/* Recent Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Subscriptions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Subscriptions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest subscriptions provisioned</p>
            </div>
            <Link to="/subscriptions" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all &rarr;
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading subscriptions...</p>
            ) : !stats?.recent_subscriptions?.length ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No subscriptions created yet</p>
                <Link to="/subscriptions" className="text-xs text-brand-600 hover:underline mt-1 inline-block">
                  Create your first subscription
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Plan</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent_subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-900">{sub.customer_name || '—'}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.plan_name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-slate-800">₹{sub.price}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            sub.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Invoices</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest generated billings</p>
            </div>
            <Link to="/invoices" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all &rarr;
            </Link>
          </div>
          <div className="p-0">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading invoices...</p>
            ) : !stats?.recent_invoices?.length ? (
              <div className="p-8 text-center">
                <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No invoices issued yet</p>
                <p className="text-xs text-slate-400 mt-1">Invoices appear automatically when subscriptions are created</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Invoice #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent_invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-mono font-medium text-slate-900">{inv.invoice_number}</td>
                        <td className="px-4 py-3 text-slate-600">{inv.customer_name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-slate-800">₹{inv.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            inv.status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
