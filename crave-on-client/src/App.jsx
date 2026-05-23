import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';                    // ← add this
import { useAuthStore } from '@/store/authStore';     // ← add this

import { CustomerLayout }  from '@/components/layout/CustomerLayout';
import { AdminLayout }     from '@/components/layout/AdminLayout';
import { ProtectedRoute, AdminRoute, GuestRoute }
  from '@/components/layout/ProtectedRoute';

import LoginPage    from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

import HomePage     from '@/pages/customer/HomePage';
import MenuPage     from '@/pages/customer/MenuPage';
import CartPage     from '@/pages/customer/CartPage';
import CheckoutPage from '@/pages/customer/CheckoutPage';
import OrdersPage   from '@/pages/customer/OrdersPage';
import ProfilePage  from '@/pages/customer/ProfilePage';

import DashboardPage   from '@/pages/admin/DashboardPage';
import ProductsPage    from '@/pages/admin/ProductsPage';
import CategoriesPage  from '@/pages/admin/CategoriesPage';
import AdminOrdersPage from '@/pages/admin/OrdersPage';
import AnalyticsPage   from '@/pages/admin/AnalyticsPage';

export default function App() {
  const { token, fetchUser } = useAuthStore();

  // On every page load, re-validate token with the API
  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#d4820f', secondary: '#fff' },
          },
        }}
      />

      <Routes>
        {/* Customer Layout */}
        <Route element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="menu" element={<MenuPage />} />

          <Route path="login" element={
            <GuestRoute><LoginPage /></GuestRoute>
          } />
          <Route path="register" element={
            <GuestRoute><RegisterPage /></GuestRoute>
          } />

          <Route path="cart" element={
            <ProtectedRoute><CartPage /></ProtectedRoute>
          } />
          <Route path="checkout" element={
            <ProtectedRoute><CheckoutPage /></ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          } />
        </Route>

        {/* Admin Layout */}
        <Route path="admin" element={
          <AdminRoute><AdminLayout /></AdminRoute>
        }>
          <Route index         element={<DashboardPage />} />
          <Route path="products"   element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders"     element={<AdminOrdersPage />} />
          <Route path="analytics"  element={<AnalyticsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}