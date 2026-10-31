import React, { useEffect, useState } from 'react';
import { Percent, Plus, Trash2, Tag, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Tax {
  id: string;
  name: string;
  percentage: number;
  description?: string;
  is_active: boolean;
  created_at: string;
}

interface Discount {
  id: string;
  code: string;
  description?: string;
  discount_type: string;
  value: number;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export const TaxesDiscountsPage: React.FC = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [taxForm, setTaxForm] = useState({
    name: '',
    percentage: '',
    description: '',
  });

  const [discountForm, setDiscountForm] = useState({
    code: '',
    discount_type: 'percentage',
    value: '',
    description: '',
    valid_until: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [tRes, dRes] = await Promise.all([
        apiClient.get('/taxes/'),
        apiClient.get('/discounts/'),
      ]);
      setTaxes(tRes.data);
      setDiscounts(dRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load taxes or discounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post('/taxes/', {
        name: taxForm.name,
        percentage: parseFloat(taxForm.percentage),
        description: taxForm.description || null,
        is_active: true,
      });
      setShowTaxModal(false);
      setTaxForm({ name: '', percentage: '', description: '' });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save tax.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTax = async (id: string) => {
    if (!window.confirm('Delete this tax rate?')) return;
    try {
      await apiClient.delete(`/taxes/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete tax.');
    }
  };

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiClient.post('/discounts/', {
        code: discountForm.code,
        discount_type: discountForm.discount_type,
        value: parseFloat(discountForm.value),
        description: discountForm.description || null,
        valid_until: discountForm.valid_until || null,
        is_active: true,
      });
      setShowDiscountModal(false);
      setDiscountForm({ code: '', discount_type: 'percentage', value: '', description: '', valid_until: '' });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save discount code.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!window.confirm('Delete this discount code?')) return;
    try {
      await apiClient.delete(`/discounts/${id}`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete discount.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Taxes & Discounts</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure statutory sales tax rates and marketing discount vouchers.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taxes Column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Percent className="w-5 h-5 text-brand-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Tax Jurisdictions</h2>
                <p className="text-xs text-slate-500">Applicable sales taxes (e.g. GST, VAT)</p>
              </div>
            </div>
            <button
              onClick={() => setShowTaxModal(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-lg transition"
            >
              <Plus size={14} />
              <span>Add Tax</span>
            </button>
          </div>

          <div className="p-0 flex-1">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading taxes...</p>
            ) : taxes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-600">No tax rates defined</p>
                <p className="text-xs text-slate-400 mt-1">Add a tax rate like GST (18%) to apply to billings.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Tax Name</th>
                    <th className="px-5 py-3">Rate</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {taxes.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{t.name}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-brand-600">{t.percentage}%</td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{t.description || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteTax(t.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Discounts Column */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="font-semibold text-slate-900">Discount Coupons</h2>
                <p className="text-xs text-slate-500">Promotional discount codes & waivers</p>
              </div>
            </div>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition"
            >
              <Plus size={14} />
              <span>Add Coupon</span>
            </button>
          </div>

          <div className="p-0 flex-1">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Loading coupons...</p>
            ) : discounts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-slate-600">No discount coupons found</p>
                <p className="text-xs text-slate-400 mt-1">Create promotional codes for customers to apply.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Discount</th>
                    <th className="px-5 py-3">Valid Until</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{d.code}</td>
                      <td className="px-5 py-3.5 text-xs font-mono font-semibold text-emerald-700">
                        {d.discount_type === 'percentage' ? `${d.value}% OFF` : `₹${d.value} FLAT`}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                        {d.valid_until || 'No expiry'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteDiscount(d.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Tax Modal */}
      {showTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTax}
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Tax Rate</h2>
              <button
                type="button"
                onClick={() => setShowTaxModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tax Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. GST (Goods & Services Tax)"
                value={taxForm.name}
                onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Rate Percentage (%) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g. 18.00"
                value={taxForm.percentage}
                onChange={(e) => setTaxForm({ ...taxForm, percentage: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Standard GST Rate"
                value={taxForm.description}
                onChange={(e) => setTaxForm({ ...taxForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTaxModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Tax'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateDiscount}
            className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Discount Code</h2>
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Coupon Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. EARLY20, STARTUP50"
                value={discountForm.code}
                onChange={(e) => setDiscountForm({ ...discountForm, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 font-mono uppercase"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Type *
                </label>
                <select
                  value={discountForm.discount_type}
                  onChange={(e) => setDiscountForm({ ...discountForm, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Value *
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 20"
                  value={discountForm.value}
                  onChange={(e) => setDiscountForm({ ...discountForm, value: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={discountForm.valid_until}
                onChange={(e) => setDiscountForm({ ...discountForm, valid_until: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDiscountModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-semibold disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TaxesDiscountsPage;
