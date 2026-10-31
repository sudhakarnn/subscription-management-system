import React, { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Plus, Search, AlertCircle, ArrowRightCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  plan_id?: string;
  plan_name?: string;
  subscription_id?: string;
  issue_date: string;
  valid_until: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  notes?: string;
}

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_id: '',
    plan_id: '',
    subtotal: '',
    tax_amount: '0',
    discount_amount: '0',
    valid_until: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [qRes, cRes, pRes] = await Promise.all([
        apiClient.get('/quotations/'),
        apiClient.get('/customers/'),
        apiClient.get('/plans/'),
      ]);
      setQuotations(qRes.data);
      setCustomers(cRes.data);
      setPlans(pRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load quotations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    const validDate = new Date();
    validDate.setDate(validDate.getDate() + 15);
    setForm({
      customer_id: customers[0]?.id || '',
      plan_id: plans[0]?.id || '',
      subtotal: plans[0] ? String(plans[0].price) : '',
      tax_amount: '0',
      discount_amount: '0',
      valid_until: validDate.toISOString().split('T')[0],
      notes: '',
    });
    setShowModal(true);
  };

  const handlePlanSelect = (pid: string) => {
    const plan = plans.find((p) => p.id === pid);
    setForm({
      ...form,
      plan_id: pid,
      subtotal: plan ? String(plan.price) : form.subtotal,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_id) {
      setError('Please select a customer.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      await apiClient.post('/quotations/', {
        customer_id: form.customer_id,
        plan_id: form.plan_id || null,
        subtotal: parseFloat(form.subtotal),
        tax_amount: parseFloat(form.tax_amount || '0'),
        discount_amount: parseFloat(form.discount_amount || '0'),
        valid_until: form.valid_until,
        notes: form.notes || null,
      });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to create quotation.');
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async (q: Quotation) => {
    if (!window.confirm(`Convert quotation ${q.quotation_number} into a live subscription?`)) return;
    try {
      await apiClient.post(`/quotations/${q.id}/convert`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to convert quotation.');
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return quotations.filter(
      (q) =>
        q.quotation_number.toLowerCase().includes(term) ||
        (q.customer_name || '').toLowerCase().includes(term) ||
        (q.plan_name || '').toLowerCase().includes(term)
    );
  }, [quotations, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations & Proposals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate formal quotes and convert accepted proposals directly into active subscriptions.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={customers.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Plus size={16} />
          <span>New Quotation</span>
        </button>
      </div>

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
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {quotations.length} quotes
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Loading quotations...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No quotations found</p>
            <p className="text-xs text-slate-400 mt-1">
              Create a proposal quote for prospective customers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Quote #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Valid Until</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-brand-600">{q.quotation_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{q.customer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{q.customer_email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{q.plan_name || 'Custom'}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">{q.valid_until}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">₹{q.total_amount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          q.status === 'converted'
                            ? 'bg-purple-50 text-purple-700'
                            : q.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {q.status !== 'converted' && q.plan_id ? (
                        <button
                          onClick={() => handleConvert(q)}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition"
                          title="Convert to live subscription"
                        >
                          <ArrowRightCircle size={14} />
                          <span>Convert to Sub</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">Completed</span>
                      )}
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
              <h2 className="text-lg font-bold text-slate-900">New Quotation</h2>
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
                Target Plan
              </label>
              <select
                value={form.plan_id}
                onChange={(e) => handlePlanSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="">Custom Quotation (No Plan)</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Subtotal *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.subtotal}
                  onChange={(e) => setForm({ ...form, subtotal: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tax (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.tax_amount}
                  onChange={(e) => setForm({ ...form, tax_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Discount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.discount_amount}
                  onChange={(e) => setForm({ ...form, discount_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Valid Until *
              </label>
              <input
                required
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Proposal Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Valid for Q4 promotion"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
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
                {saving ? 'Creating...' : 'Create Quotation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QuotationsPage;
