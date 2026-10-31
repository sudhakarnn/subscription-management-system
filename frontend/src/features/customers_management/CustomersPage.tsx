
import React, { useEffect, useMemo, useState } from "react";

type Customer = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  created_at?: string;
};

const API = "http://127.0.0.1:8000/api/v1";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    company_name: "",
    billing_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  const token = localStorage.getItem("access_token");

  async function loadCustomers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/customers/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "Please log in with an Admin or Staff account."
            : "Unable to load customers."
        );
      }

      setCustomers(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase();
    return customers.filter((customer) =>
      [
        customer.full_name,
        customer.email,
        customer.company_name,
        customer.city,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [customers, search]);

  async function createCustomer(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`${API}/customers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.detail || "Could not create customer. Please check the form."
        );
      }

      setShowForm(false);
      setForm({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        company_name: "",
        billing_address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
      });

      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(customer: Customer) {
    try {
      const response = await fetch(
        `${API}/customers/${customer.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: !customer.is_active }),
        }
      );

      if (!response.ok) throw new Error("Could not update customer status.");
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    }
  }

  const activeCount = customers.filter((c) => c.is_active).length;

  return (
    <div className="min-h-screen space-y-6 bg-[#F6F7FA] p-6 text-[#18243A]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#748096]">Workspace / Customers</p>
          <h1 className="mt-1 text-2xl font-bold">Customers</h1>
          <p className="mt-1 text-sm text-[#748096]">
            Manage your customer profiles and billing information.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-[#4969E8] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#3858D6]"
        >
          + Add Customer
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat title="Total Customers" value={customers.length} />
        <Stat title="Active Customers" value={activeCount} />
        <Stat title="Inactive Customers" value={customers.length - activeCount} />
      </div>

      <div className="rounded-2xl border border-[#E8EBF1] bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">All Customers</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="w-full rounded-xl border border-[#E8EBF1] px-4 py-2.5 text-sm outline-none focus:border-[#4969E8] sm:w-72"
          />
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="py-10 text-center text-sm text-[#748096]">
            Loading customers...
          </p>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-medium">No customers found</p>
            <p className="mt-1 text-sm text-[#748096]">
              Add a customer to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-[#E8EBF1] text-xs uppercase text-[#748096]">
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Company</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-[#F0F1F5] last:border-0 hover:bg-[#FAFBFD]"
                  >
                    <td className="px-3 py-4">
                      <p className="font-semibold">{customer.full_name}</p>
                      <p className="mt-1 text-xs text-[#748096]">
                        {customer.email}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      {customer.company_name || "—"}
                    </td>
                    <td className="px-3 py-4">
                      {[customer.city, customer.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          customer.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {customer.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() => toggleStatus(customer)}
                        className="text-xs font-semibold text-[#4969E8] hover:underline"
                      >
                        {customer.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101B32]/50 p-4">
          <form
            onSubmit={createCustomer}
            className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Add Customer</h2>
                <p className="mt-1 text-sm text-[#748096]">
                  Enter customer and billing details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xl text-[#748096]"
              >
                ×
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Password" required>
                <input required type="password" minLength={9} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Field>
              <Field label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Company">
                <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              </Field>
              <Field label="Billing Address">
                <input value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} />
              </Field>
              <Field label="City">
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
              <Field label="State">
                <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </Field>
              <Field label="Postal Code">
                <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
              </Field>
              <Field label="Country">
                <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
              </Field>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#E8EBF1] px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl bg-[#4969E8] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Create Customer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#E8EBF1] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#748096]">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
      {React.cloneElement(children as React.ReactElement, {
        className:
          "w-full rounded-xl border border-[#E8EBF1] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#4969E8]",
      })}
    </label>
  );
}
