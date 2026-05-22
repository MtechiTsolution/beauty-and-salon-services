import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layouts
import CustomerLayout from './components/customer/CustomerLayout';
import AdminLayout from './components/admin/AdminLayout';

// Customer pages
import Home from './pages/Home';
import Services from './pages/Services';
import Branches from './pages/Branches';
import Packages from './pages/Packages';
import BookAppointment from './pages/BookAppointment';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import AdminBranches from './pages/admin/AdminBranches';
import AdminCategories from './pages/admin/AdminCategories';
import AdminServices from './pages/admin/AdminServices';
import AdminStaff from './pages/admin/AdminStaff';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminPackages from './pages/admin/AdminPackages';
import AdminReports from './pages/admin/AdminReports';
import AdminNotifications from './pages/admin/AdminNotifications';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Customer Website */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin Panel */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/branches" element={<AdminBranches />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/staff" element={<AdminStaff />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App