import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Product {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billing_interval: 'monthly' | 'yearly';
  interval_count: number;
  trial_days: number;
  is_active: boolean;
  created_at: string;
}

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    product_id: '',
    name: '',
    description: '',
    price: '',
    currency: 'INR',
    billing_interval: 'monthly' as 'monthly' | 'yearly',
    interval_count: 1,
    trial_days: 0,
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [plansRes, prodsRes] = await Promise.all([
        apiClient.get('/plans/'),
        apiClient.get('/products/'),
      ]);
      setPlans(plansRes.data);
      setProducts(prodsRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load plans or products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      product_id: products[0]?.id || '',
      name: '',
      description: '',
      price: '',
      currency: 'INR',
      billing_interval: 'monthly',
      interval_count: 1,
      trial_days: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setForm({
      product_id: p.product_id,
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      currency: p.currency,
      billing_interval: p.billing_interval,
      interval_count: p.interval_count,
      trial_days: p.trial_days,
      is_active: p.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) {
      setError('Please select a product for this plan.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      product_id: form.product_id,
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      currency: form.currency,
      billing_interval: form.billing_interval,
      interval_count: Number(form.interval_count),
      trial_days: Number(form.trial_days),
      is_active: form.is_active,
    };

    try {
      if (editingPlan) {
        await apiClient.put(`/plans/${editingPlan.id}`, payload);
      } else {
        await apiClient.post('/plans/', payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save subscription plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    try {
      await apiClient.delete(`/plans/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete plan.');
    }
  };

  const productMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (productMap.get(p.product_id) || '').toLowerCase().includes(q) ||
        p.billing_interval.toLowerCase().includes(q)
    );
  }, [plans, search, productMap]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Define recurring billing rates, billing intervals, and trial periods.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={products.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Plus size={16} />
          <span>Add Plan</span>
        </button>
      </div>

      {products.length === 0 && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>You need at least one active product before creating subscription plans.</span>
          <a href="/products" className="font-semibold underline ml-2">Create Product &rarr;</a>
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
              placeholder="Search plans by name, product or interval..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {plans.length} plans
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Loading subscription plans...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarRange className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No subscription plans found</p>
            <p className="text-xs text-slate-400 mt-1">Configure pricing plans for customers to subscribe to.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Plan Name</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Price & Cycle</th>
                  <th className="px-5 py-3">Trial Days</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{plan.name}</p>
                      {plan.description && (
                        <p className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">{plan.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-medium">
                      {productMap.get(plan.product_id) || 'General'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-slate-900">₹{plan.price}</span>
                      <span className="text-xs text-slate-500 capitalize"> / {plan.billing_interval}</span>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      {plan.trial_days > 0 ? `${plan.trial_days} days` : 'No trial'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          plan.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-md transition"
                        title="Edit plan"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete plan"
                      >
                        <Trash2 size={16} />
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Product *
              </label>
              <select
                required
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="" disabled>Select a product</option>
                {products.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Plan Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Pro Monthly, Starter Annual"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Price (INR ₹) *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 1999.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Billing Cycle *
                </label>
                <select
                  value={form.billing_interval}
                  onChange={(e) => setForm({ ...form, billing_interval: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Trial Period (Days)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 14"
                value={form.trial_days}
                onChange={(e) => setForm({ ...form, trial_days: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description / Features
              </label>
              <textarea
                rows={2}
                placeholder="Features included in this plan..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="plan_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="plan_active" className="text-sm font-medium text-slate-700">
                Active for subscription
              </label>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition"
              >
                {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
