import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { DashboardLayout } from '../layouts/DashboardLayout';
import CustomersPage from '../features/customers_management/CustomersPage';
import LoginPage from '../features/auth/LoginPage';
import DashboardPage from '../features/dashboard/DashboardPage';
import ProductsPage from '../features/products/ProductsPage';
import PlansPage from '../features/plans/PlansPage';
import SubscriptionsPage from '../features/subscriptions/SubscriptionsPage';
import InvoicesPage from '../features/invoices/InvoicesPage';
import PaymentsPage from '../features/payments/PaymentsPage';
import QuotationsPage from '../features/quotations/QuotationsPage';
import TaxesDiscountsPage from '../features/taxes_discounts/TaxesDiscountsPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';

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
        <Route index element={<DashboardPage />} />

        {/* Customer Management */}
        <Route path="customers" element={<CustomersPage />} />

        {/* Product Management */}
        <Route path="products" element={<ProductsPage />} />

        {/* Plan Management */}
        <Route path="plans" element={<PlansPage />} />

        {/* Quotations */}
        <Route path="quotations" element={<QuotationsPage />} />

        {/* Subscriptions */}
        <Route path="subscriptions" element={<SubscriptionsPage />} />

        {/* Invoices */}
        <Route path="invoices" element={<InvoicesPage />} />

        {/* Taxes and Discounts */}
        <Route path="taxes-discounts" element={<TaxesDiscountsPage />} />

        {/* Payments */}
        <Route path="payments" element={<PaymentsPage />} />

        {/* Analytics */}
        <Route path="analytics" element={<AnalyticsPage />} />

        {/* Unknown dashboard routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Unknown URLs */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
