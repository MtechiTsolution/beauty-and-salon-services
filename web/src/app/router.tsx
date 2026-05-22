import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import BookingsAdminPage from '@/features/admin/bookings/pages/BookingsAdminPage';
import BranchesAdminPage from '@/features/admin/branches/pages/BranchesAdminPage';
import CategoriesAdminPage from '@/features/admin/categories/pages/CategoriesAdminPage';
import CouponsAdminPage from '@/features/admin/coupons/pages/CouponsAdminPage';
import CustomersAdminPage from '@/features/admin/customers/pages/CustomersAdminPage';
import DashboardPage from '@/features/admin/dashboard/pages/DashboardPage';
import { AdminLayout } from '@/features/admin/layout/AdminLayout';
import NotificationsAdminPage from '@/features/admin/notifications/pages/NotificationsAdminPage';
import PackagesAdminPage from '@/features/admin/packages/pages/PackagesAdminPage';
import ReportsAdminPage from '@/features/admin/reports/pages/ReportsAdminPage';
import ServicesAdminPage from '@/features/admin/services/pages/ServicesAdminPage';
import StaffAdminPage from '@/features/admin/staff/pages/StaffAdminPage';
import BranchesPage from '@/features/customer/branches/pages/BranchesPage';
import BookAppointmentPage from '@/features/customer/booking/pages/BookAppointmentPage';
import HomePage from '@/features/customer/home/pages/HomePage';
import { CustomerLayout } from '@/features/customer/layout/CustomerLayout';
import MyBookingsPage from '@/features/customer/my-bookings/pages/MyBookingsPage';
import PackagesPage from '@/features/customer/packages/pages/PackagesPage';
import ProfilePage from '@/features/customer/profile/pages/ProfilePage';
import ServicesPage from '@/features/customer/services/pages/ServicesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer site */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="packages" element={<PackagesPage />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="branches" element={<BranchesAdminPage />} />
            <Route path="categories" element={<CategoriesAdminPage />} />
            <Route path="services" element={<ServicesAdminPage />} />
            <Route path="staff" element={<StaffAdminPage />} />
            <Route path="bookings" element={<BookingsAdminPage />} />
            <Route path="customers" element={<CustomersAdminPage />} />
            <Route path="coupons" element={<CouponsAdminPage />} />
            <Route path="packages" element={<PackagesAdminPage />} />
            <Route path="reports" element={<ReportsAdminPage />} />
            <Route path="notifications" element={<NotificationsAdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
