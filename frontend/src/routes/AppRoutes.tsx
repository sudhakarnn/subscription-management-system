import React from 'react';
import { Routes, Route, useOutletContext } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import {
  Server,
  Database,
  GitBranch,
  ExternalLink,
  Code2,
  FileCheck2,
} from 'lucide-react';

interface ContextType {
  backendStatus: 'checking' | 'connected' | 'disconnected';
  backendMeta: any;
}

const DashboardHome: React.FC = () => {
  const { backendStatus, backendMeta } = useOutletContext<ContextType>();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 bg-blue-50 text-brand-700 text-xs font-semibold rounded-md mb-2">
            <span>Hackathon Milestone</span>
            <span>•</span>
            <span>Project Foundation Ready</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Brightloop Subscription & Billing Management
          </h2>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Modular Monolith foundation initialized for 4 remote developers collaborating on a single shared main branch.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="http://localhost:8000/api/v1/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>FastAPI Docs</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Backend Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">FastAPI Backend</span>
            <div className="p-2 rounded-lg bg-blue-50 text-brand-600">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {backendStatus === 'connected' ? 'Running' : 'Offline'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {backendStatus === 'connected'
              ? `v${backendMeta?.version || '0.1.0'} on http://localhost:8000`
              : 'Start backend via uvicorn'}
          </p>
        </div>

        {/* Database Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PostgreSQL</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {backendMeta?.database?.status === 'connected' ? 'Connected' : 'Ready (Docker)'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Port 5432 • brightloop_db
          </p>
        </div>

        {/* Currency & Arithmetic */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monetary Standard</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <span className="text-sm font-bold font-mono">₹</span>
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            INR (₹) / NUMERIC
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exact Decimal Arithmetic (14, 2)
          </p>
        </div>

        {/* Git Workflow */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Git Workflow</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <GitBranch className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900">
            Single Main Branch
          </div>
          <p className="text-xs text-slate-500 mt-1">
            git pull --rebase origin main
          </p>
        </div>
      </div>

      {/* Developer Module Ownership Board */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Team Module Ownership (4 Remote Developers)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Isolated vertical slices to avoid merge collisions on main</p>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
            <Code2 className="w-4 h-4 text-brand-600" />
            <span>4 Independent Slices</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dev 1 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">DEV 1: Core, Auth & Customers</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-blue-100 text-blue-800">
                app/modules/customers
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Owns Auth, Password Reset (9+ chars), Staff Creation (Admin-only), and exclusive Customer profiles/billing addresses.
            </p>
          </div>

          {/* Dev 2 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">DEV 2: Products, Plans & Subscriptions</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-100 text-emerald-800">
                app/modules/subscriptions
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Owns Product catalog & variants (Admin-only cost margins), Plans (Daily/Weekly/Monthly/Yearly), and Multi-line Subscriptions.
            </p>
          </div>

          {/* Dev 3 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">DEV 3: Quotes, Invoices, Taxes & Discounts</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-purple-100 text-purple-800">
                app/modules/invoices
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Owns Quotation templates, Snapshot-safe Invoices, Tax configuration (Admin-only), and Line-Item Discounts.
            </p>
          </div>

          {/* Dev 4 */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900">DEV 4: Payments, Analytics & Customer Portal</span>
              <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-amber-100 text-amber-800">
                app/modules/payments
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Owns Concurrency-safe payment settlement (SELECT FOR UPDATE), Partial payments tracking, Recharts Analytics, and Customer Portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModulePlaceholderProps {
  title: string;
  owner: string;
  backendPath: string;
  description: string;
}

const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  title,
  owner,
  backendPath,
  description,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded font-mono text-xs font-medium bg-slate-100 text-slate-700 mb-2">
              <span>Owner: {owner}</span>
              <span>•</span>
              <span>Backend: {backendPath}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Foundation Ready
          </span>
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {description}
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            <span>Architecture & Routing Contract</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-1.5 font-mono">
            <li>• Backend Slice: {backendPath} (models.py, schemas.py, services.py, routes.py)</li>
            <li>• Frontend Slice: src/features/{title.toLowerCase().replace(/[^a-z0-9]/g, '_')}</li>
            <li>• Database standard: NUMERIC(14, 2) / Synchronous SQLAlchemy 2.0 / PostgreSQL</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route
          path="customers"
          element={
            <ModulePlaceholder
              title="Customers Management"
              owner="DEV 1"
              backendPath="app/modules/customers"
              description="Customer profile management, billing address structures, and customer portal identity bindings. Enforces backend customer data ownership."
            />
          }
        />
        <Route
          path="products"
          element={
            <ModulePlaceholder
              title="Products & Variants"
              owner="DEV 2"
              backendPath="app/modules/products"
              description="Product catalog management with product variants and custom attributes. Restricts product authoring and cost-price access strictly to Admin."
            />
          }
        />
        <Route
          path="plans"
          element={
            <ModulePlaceholder
              title="Subscription Plans"
              owner="DEV 2"
              backendPath="app/modules/plans"
              description="Configurable plans with Daily, Weekly, Monthly, and Yearly frequencies, base INR prices, and ON DELETE RESTRICT product relationships."
            />
          }
        />
        <Route
          path="quotations"
          element={
            <ModulePlaceholder
              title="Quotations"
              owner="DEV 3"
              backendPath="app/modules/quotations"
              description="Reusable quotation templates, configurable validity days, itemized pricing, and seamless conversion into confirmed subscriptions."
            />
          }
        />
        <Route
          path="subscriptions"
          element={
            <ModulePlaceholder
              title="Subscriptions"
              owner="DEV 2"
              backendPath="app/modules/subscriptions"
              description="Multi-item subscription contracts with Draft → Quotation → Confirmed → Active → Closed lifecycles, plus pause, resume, and renewal operations."
            />
          }
        />
        <Route
          path="invoices"
          element={
            <ModulePlaceholder
              title="Invoices & Billing"
              owner="DEV 3"
              backendPath="app/modules/invoices"
              description="Automated & manual billing with immutable historical snapshots of prices, taxes, and discounts. Protected by unique billing period constraints."
            />
          }
        />
        <Route
          path="taxes-discounts"
          element={
            <ModulePlaceholder
              title="Taxes & Discounts"
              owner="DEV 3"
              backendPath="app/modules/taxes & app/modules/discounts"
              description="Admin-managed tax rates and line-item coupon discounts with start/end dates, usage limits, and minimum thresholds."
            />
          }
        />
        <Route
          path="payments"
          element={
            <ModulePlaceholder
              title="Payments & Settlement"
              owner="DEV 4"
              backendPath="app/modules/payments"
              description="Concurrency-safe payment recording with SELECT FOR UPDATE row locking, partial payments tracking, and atomic balance reconciliation."
            />
          }
        />
        <Route
          path="analytics"
          element={
            <ModulePlaceholder
              title="Reports & Analytics"
              owner="DEV 4"
              backendPath="app/modules/analytics"
              description="Financial metrics dashboard featuring MRR, ARR, churn tracking, and Recharts visualization in INR."
            />
          }
        />
      </Route>
    </Routes>
  );
};
