import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import RegisterSalonPage from '@/features/auth/pages/RegisterSalonPage';
import BookAppointmentPage from '@/features/booking/pages/BookAppointmentPage';
import ExplorePage from '@/features/explore/pages/ExplorePage';
import PackagesPage from '@/features/packages/pages/PackagesPage';
import ServicesPage from '@/features/services/pages/ServicesPage';
import { CustomerLayout } from '@/features/layout/CustomerLayout';
import BookingDetailPage from '@/features/my-bookings/pages/BookingDetailPage';
import MyBookingsPage from '@/features/my-bookings/pages/MyBookingsPage';
import BookingChatRedirectPage from '@/features/messages/pages/BookingChatRedirectPage';
import MessageThreadPage from '@/features/messages/pages/MessageThreadPage';
import MessagesPage from '@/features/messages/pages/MessagesPage';
import NotificationsPage from '@/features/notifications/pages/NotificationsPage';
import ContactPage from '@/features/contact/pages/ContactPage';
import PrivacyPolicyPage from '@/features/legal/pages/PrivacyPolicyPage';
import RefundPolicyPage from '@/features/legal/pages/RefundPolicyPage';
import SalonProfilePage from '@/features/salons/pages/SalonProfilePage';
import SalonsPage from '@/features/salons/pages/SalonsPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import LandingPage from '@/features/welcome/pages/LandingPage';
import WelcomePage from '@/features/welcome/pages/WelcomePage';
import { ScrollToTop } from '@/features/layout/ScrollToTop';
import NotFoundPage from '@/pages/NotFoundPage';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-salon" element={<RegisterSalonPage />} />

        <Route element={<CustomerLayout />}>
          <Route path="/book" element={<BookAppointmentPage />} />
          <Route path="/salons" element={<SalonsPage />} />
          <Route path="/salons/:branchId" element={<SalonProfilePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/refund" element={<RefundPolicyPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/my-bookings/:bookingId" element={<BookingDetailPage />} />
            <Route path="/reviews" element={<Navigate to="/my-bookings" replace />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/booking/:bookingId" element={<BookingChatRedirectPage />} />
            <Route path="/messages/:chatId" element={<MessageThreadPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/home" element={<Navigate to="/book" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
