import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, PieChart, DollarSign, Users, Repeat } from 'lucide-react';
import { apiClient } from '../../api/client';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/analytics/dashboard');
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load business analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const arr = data ? Number(data.mrr) * 12 : 0;
  const settlementRate =
    data && data.total_invoices > 0
      ? Math.round((data.paid_invoices / data.total_invoices) * 100)
      : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Business Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          SaaS financial health, recurring revenue forecasts, and invoice realization.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Revenue Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Recurring Revenue (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">
            ₹{loading ? '...' : (data?.mrr ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2">Active recurring monthly baseline</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Annualized Run Rate (ARR)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">
            ₹{loading ? '...' : arr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-2">Annualized forward revenue forecast (MRR x 12)</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Settlement Realization Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieChart size={18} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">
            {loading ? '...' : `${settlementRate}%`}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {data?.paid_invoices ?? 0} paid of {data?.total_invoices ?? 0} invoices
          </p>
        </div>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-brand-600 w-5 h-5" />
            <span>Customer Health & Churn Risk</span>
          </h2>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Accounts Provisioned:</span>
              <span className="font-bold text-slate-900">{data?.total_customers ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Active Accounts:</span>
              <span className="font-bold text-emerald-600">{data?.active_customers ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Inactive Accounts:</span>
              <span className="font-bold text-slate-500">
                {(data?.total_customers ?? 0) - (data?.active_customers ?? 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Repeat className="text-emerald-600 w-5 h-5" />
            <span>Subscription Portfolio Metrics</span>
          </h2>
          <div className="space-y-3 pt-2">
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Subscriptions Created:</span>
              <span className="font-bold text-slate-900">{data?.total_subscriptions ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Currently Active:</span>
              <span className="font-bold text-emerald-600">{data?.active_subscriptions ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-600">Unpaid Invoice Balance:</span>
              <span className="font-bold text-amber-600">{data?.unpaid_invoices ?? 0} bills</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
