import React, { useEffect, useMemo, useState } from 'react';
import { Receipt, Search, Eye, CheckCircle2, Printer, AlertCircle, FileText } from 'lucide-react';
import { apiClient } from '../../api/client';

interface Invoice {
  id: string;
  invoice_number: string;
  subscription_id?: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  company_name?: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  notes?: string;
  paid_at?: string;
  created_at: string;
}

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/invoices');
      setInvoices(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleMarkAsPaid = async (inv: Invoice) => {
    if (!window.confirm(`Mark invoice ${inv.invoice_number} as paid?`)) return;
    try {
      await apiClient.post(`/invoices/${inv.id}/pay`);
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === inv.id) {
        setSelectedInvoice({ ...selectedInvoice, status: 'paid' });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to update invoice payment status.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.customer_name || '').toLowerCase().includes(q) ||
        (inv.customer_email || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated subscription billing, tax invoices, and payment reconciliation.
          </p>
        </div>
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
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center space-x-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-xs font-medium">
              {['all', 'unpaid', 'paid'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-md capitalize transition ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Showing {filtered.length} of {invoices.length} invoices
          </span>
        </div>

        {loading ? (
          <p className="p-12 text-center text-sm text-slate-400">Loading invoices...</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No invoices found</p>
            <p className="text-xs text-slate-400 mt-1">
              Invoices are automatically generated when customer subscriptions are started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Invoice #</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Issued Date</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-mono font-bold text-brand-600">{inv.invoice_number}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{inv.customer_name || 'Customer'}</p>
                      <p className="text-xs text-slate-400">{inv.customer_email || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">{inv.issue_date}</td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-600">{inv.due_date}</td>
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">₹{inv.total_amount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-md transition"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>

                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkAsPaid(inv)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition"
                        >
                          <CheckCircle2 size={14} />
                          <span>Mark Paid</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Detail / Printable View Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <FileText className="text-brand-600 w-5 h-5" />
                <h2 className="text-base font-bold text-slate-900">
                  Tax Invoice: {selectedInvoice.invoice_number}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl font-bold ml-2"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Invoice Printable Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800">
              {/* Brand Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-brand-600 tracking-tight">Brightloop</h1>
                  <p className="text-xs text-slate-500 mt-1">Subscription & Billing Management</p>
                  <p className="text-xs text-slate-500">Karnataka, India</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      selectedInvoice.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-2">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>
              </div>

              {/* Billed To / Dates */}
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.customer_name || 'Customer'}</p>
                  <p className="text-slate-600">{selectedInvoice.customer_email || '—'}</p>
                  {selectedInvoice.company_name && (
                    <p className="text-slate-500 text-xs mt-0.5">{selectedInvoice.company_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Invoice Details</p>
                  <p className="text-slate-700">Issue Date: <span className="font-medium">{selectedInvoice.issue_date}</span></p>
                  <p className="text-slate-700">Due Date: <span className="font-medium">{selectedInvoice.due_date}</span></p>
                  <p className="text-slate-700">Currency: <span className="font-mono font-semibold">{selectedInvoice.currency}</span></p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Description</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        Brightloop Subscription Service
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                        ₹{selectedInvoice.subtotal}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">₹{selectedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax:</span>
                    <span className="font-mono font-medium">₹{selectedInvoice.tax_amount}</span>
                  </div>
                  {selectedInvoice.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono font-medium">-₹{selectedInvoice.discount_amount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="font-mono text-brand-600">₹{selectedInvoice.total_amount}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.paid_at && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Settled & Paid on {new Date(selectedInvoice.paid_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              {selectedInvoice.status !== 'paid' ? (
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(selectedInvoice)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Mark as Paid
                </button>
              ) : <div />}
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
