
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { DashboardLayout } from '../layouts/DashboardLayout';
import CustomersPage from '../features/customers_management/CustomersPage';
import LoginPage from '../features/auth/LoginPage';

import {
  Server,
  Database,
  GitBranch,
  Code2,
  FileCheck2,
} from 'lucide-react';

// Dashboard Home
const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome to Brightloop Subscription Management System.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Server className="text-blue-600" size={24} />
            <h3 className="font-semibold">Backend API</h3>
          </div>
          <p className="text-sm text-green-600 mt-3">
            FastAPI configured
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Database className="text-blue-600" size={24} />
            <h3 className="font-semibold">Database</h3>
          </div>
          <p className="text-sm text-green-600 mt-3">
            PostgreSQL configured
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <GitBranch className="text-blue-600" size={24} />
            <h3 className="font-semibold">Git Workflow</h3>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Main branch
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="font-semibold text-lg mb-4">
          Project Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Customer Management',
            'Product Management',
            'Plan Management',
            'Quotations',
            'Subscriptions',
            'Invoice Management',
            'Taxes and Discounts',
            'Payment Management',
            'Analytics and Reports',
          ].map((module) => (
            <div
              key={module}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
            >
              <FileCheck2 size={18} className="text-blue-600" />
              <span className="text-sm text-gray-700">{module}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <h2 className="font-semibold text-blue-900">
          Brightloop
        </h2>
        <p className="text-sm text-blue-800 mt-1">
          Subscription and billing management in one place.
        </p>
      </div>
    </div>
  );
};

// Placeholder for modules not yet implemented
const ModulePlaceholder: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <Code2 size={36} className="mx-auto text-blue-500 mb-3" />

        <h2 className="text-lg font-semibold text-gray-800">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          This module is planned for implementation.
        </p>
      </div>
    </div>
  );
};

// Application Routes
export const AppRoutes: React.FC = () => {
  const token = localStorage.getItem('access_token');

  return (
    <Routes>
      {/* Login Route */}
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          token ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardHome />} />

        {/* Customer Management */}
        <Route
          path="customers"
          element={<CustomersPage />}
        />

        {/* Product Management */}
        <Route
          path="products"
          element={<ModulePlaceholder title="Product Management" />}
        />

        {/* Plan Management */}
        <Route
          path="plans"
          element={<ModulePlaceholder title="Plan Management" />}
        />

        {/* Quotations */}
        <Route
          path="quotations"
          element={<ModulePlaceholder title="Quotations" />}
        />

        {/* Subscriptions */}
        <Route
          path="subscriptions"
          element={<ModulePlaceholder title="Subscription Management" />}
        />

        {/* Invoices */}
        <Route
          path="invoices"
          element={<ModulePlaceholder title="Invoice Management" />}
        />

        {/* Taxes and Discounts */}
        <Route
          path="taxes-discounts"
          element={<ModulePlaceholder title="Taxes and Discounts" />}
        />

        {/* Payments */}
        <Route
          path="payments"
          element={<ModulePlaceholder title="Payment Management" />}
        />

        {/* Analytics */}
        <Route
          path="analytics"
          element={<ModulePlaceholder title="Analytics and Reports" />}
        />

        {/* Unknown dashboard routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Route>

      {/* Unknown URLs */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
