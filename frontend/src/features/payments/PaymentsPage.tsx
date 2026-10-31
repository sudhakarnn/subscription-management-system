import React, { useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, Search, AlertCircle } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name?: string;
  total_amount: number;
  status: string;
}

interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  customer_id: string;
  customer_name?: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payment_date: string;
  notes?: string;
  created_at: string;
}

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    invoice_id: '',
    amount: '',
    payment_method: 'Credit Card',
    transaction_id: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [payRes, invRes] = await Promise.all([
        apiClient.get('/payments/'),
        apiClient.get('/invoices'),
      ]);
      setPayments(payRes.data);
      setInvoices(invRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openRecordModal = () => {
    const firstUnpaid = invoices.find((inv) => inv.status !== 'paid');
    setForm({
      invoice_id: firstUnpaid?.id || invoices[0]?.id || '',
      amount: firstUnpaid ? String(firstUnpaid.total_amount) : '',
      payment_method: 'Credit Card',
      transaction_id: '',
      notes: '',
    });
    setShowModal(true);
  };

  const handleInvoiceSelect = (invId: string) => {
    const inv = invoices.find((i) => i.id === invId);
    setForm({
      ...form,
      invoice_id: invId,
      amount: inv ? String(inv.total_amount) : form.amount,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_id) {
      setError('Please select an invoice for this payment.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      await apiClient.post('/payments/', {
        invoice_id: form.invoice_id,
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        transaction_id: form.transaction_id || null,
        notes: form.notes || null,
      });
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to record payment.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter(
      (p) =>
        (p.invoice_number || '').toLowerCase().includes(q) ||
        (p.customer_name || '').toLowerCase().includes(q) ||
        (p.payment_method || '').toLowerCase().includes(q) ||
        (p.transaction_id || '').toLowerCase().includes(q)
    );
  }, [payments, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Reconcile payments, track transaction IDs, and log settlements.
          </p>
        </div>
        <button
          onClick={openRecordModal}
          disabled={invoices.length === 0}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <Plus size={16} />
          <span>Record Payment</span>
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
              placeholder="Search by invoice, customer or txn ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {payments.length} transactions
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Loading payment ledger...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No payment records found</p>
            <p className="text-xs text-slate-400 mt-1">
              Record a payment against an invoice to reconcile receivables.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Txn / Reference</th>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                      {pay.transaction_id || 'TXN-DIRECT'}
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-brand-600">
                      {pay.invoice_number || 'INV-00'}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {pay.customer_name || 'Customer'}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-600 capitalize">
                      {pay.payment_method}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      ₹{pay.amount}
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">
                      {new Date(pay.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                        {pay.status}
                      </span>
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
              <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
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
                Select Invoice *
              </label>
              <select
                required
                value={form.invoice_id}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="" disabled>Select an invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — ₹{inv.total_amount} ({inv.customer_name || 'Customer'}) [{inv.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Settlement Amount (INR ₹) *
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500 bg-white"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash / Cheque">Cash / Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Reference / Transaction ID
              </label>
              <input
                type="text"
                placeholder="Optional external bank / gateway reference"
                value={form.transaction_id}
                onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="Remarks or payment notes"
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
                {saving ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
