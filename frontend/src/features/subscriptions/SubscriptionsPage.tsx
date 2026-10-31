import React, { useEffect, useMemo, useState } from 'react';
import { Repeat, Plus, Search, Trash2, Ban, RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_interval: string;
  is_active: boolean;
}

interface Subscription {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  plan_id: string;
  plan_name?: string;
  status: string;
  start_date: string;
  end_date?: string;
  next_billing_date: string;
  price: number;
  currency: string;
  cancellation_reason?: string;
  created_at: string;
}

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    next_billing_date: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [subsRes, custsRes, plansRes] = await Promise.all([
        apiClient.get('/subscriptions/'),
        apiClient.get('/customers/'),
        apiClient.get('/plans/'),
      ]);
      setSubscriptions(subsRes.data);
      setCustomers(custsRes.data.filter((c: Customer) => c.is_active));
      setPlans(plansRes.data.filter((p: Plan) => p.is_active));
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load subscription data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    setForm({
      customer_id: customers[0]?.id || '',
      plan_id: plans[0]?.id || '',
      start_date: today.toISOString().split('T')[0],
      next_billing_date: nextMonth.toISOString().split('T')[0],
    });
    setShowCreateModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id || !form.plan_id) {
      setError('Please select both a customer and a subscription plan.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      await apiClient.post('/subscriptions/', form);
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to provision subscription.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (sub: Subscription) => {
    const reason = window.prompt('Please enter a cancellation reason:', 'Customer requested cancellation');
    if (!reason) return;
    try {
      await apiClient.post(`/subscriptions/${sub.id}/cancel?reason=${encodeURIComponent(reason)}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to cancel subscription.');
    }
  };

  const handleRenew = async (sub: Subscription) => {
    if (!window.confirm('Renew this subscription for the next billing cycle? (This generates an invoice)')) return;
    try {
      await apiClient.post(`/subscriptions/${sub.id}/renew`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to renew subscription.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription record?')) return;
    try {
      await apiClient.delete(`/subscriptions/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete subscription.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return subscriptions.filter(
      (s) =>
        (s.customer_name || '').toLowerCase().includes(q) ||
        (s.customer_email || '').toLowerCase().includes(q) ||
        (s.plan_name || '').toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)
    );
  }, [subscriptions, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Active customer subscriptions, lifecycle management, renewals and cancellations.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          disabled={customers.length === 0 || plans.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Plus size={16} />
          <span>New Subscription</span>
        </button>
      </div>

      {(customers.length === 0 || plans.length === 0) && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>Make sure you have both active customers and subscription plans before creating subscriptions.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, plan or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {subscriptions.length} subscriptions
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Loading subscriptions...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Repeat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No subscriptions found</p>
            <p className="text-xs text-slate-400 mt-1">Provision a subscription to automatically generate recurring invoices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Next Renewal</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{sub.customer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{sub.customer_email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{sub.plan_name || 'Plan'}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">₹{sub.price}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{sub.next_billing_date}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sub.status === 'cancelled'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-1">
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleRenew(sub)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                          title="Renew subscription cycle"
                        >
                          <RefreshCw size={15} />
                        </button>
                      )}
                      {sub.status === 'active' && (
                        <button
                          onClick={() => handleCancel(sub)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition"
                          title="Cancel subscription"
                        >
                          <Ban size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Provision Subscription</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Customer *
              </label>
              <select
                required
                value={form.customer_id}
                onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="" disabled>Select a customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Plan *
              </label>
              <select
                required
                value={form.plan_id}
                onChange={(e) => {
                  const pid = e.target.value;
                  const selectedPlan = plans.find((p) => p.id === pid);
                  const today = new Date(form.start_date || new Date());
                  const nextDate = new Date(today);
                  if (selectedPlan?.billing_interval === 'yearly') {
                    nextDate.setDate(nextDate.getDate() + 365);
                  } else {
                    nextDate.setDate(nextDate.getDate() + 30);
                  }
                  setForm({
                    ...form,
                    plan_id: pid,
                    next_billing_date: nextDate.toISOString().split('T')[0],
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="" disabled>Select a plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.price}/{p.billing_interval}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Start Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Next Billing Date *
                </label>
                <input
                  required
                  type="date"
                  value={form.next_billing_date}
                  onChange={(e) => setForm({ ...form, next_billing_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              💡 Provisioning automatically triggers the initial billing invoice for this customer.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition"
              >
                {saving ? 'Provisioning...' : 'Provision Subscription'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
