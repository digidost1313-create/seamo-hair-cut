import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './lib/store'
import Auth from './pages/Auth'
import Home from './pages/customer/Home'
import Search from './pages/customer/Search'
import SalonDetail from './pages/customer/SalonDetail'
import MyBookings from './pages/customer/MyBookings'
import Notifications from './pages/customer/Notifications'
import Profile from './pages/customer/Profile'
import OwnerRegister from './pages/owner/Register'
import OwnerDashboard from './pages/owner/Dashboard'
import OwnerBookings from './pages/owner/Bookings'
import Tokens from './pages/owner/Tokens'
import StaffServices from './pages/owner/StaffServices'
import OwnerPayments from './pages/owner/Payments'
import VoiceSettings from './pages/owner/VoiceSettings'
import OwnerSubscription from './pages/owner/Subscription'
import OwnerMore from './pages/owner/More'
import AdminDashboard from './pages/admin/Dashboard'
import { AdminSalons, AdminCustomers, AdminBookings, AdminFinance, AdminPlans, AdminBanners, AdminPush, AdminTickets, AdminSettings, AdminAudit } from './pages/admin/Manage'

export default function App() {
  return <AppProvider><BrowserRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/search" element={<Search />} />
    <Route path="/salon/:id" element={<SalonDetail />} />
    <Route path="/my-bookings" element={<MyBookings />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/owner/register" element={<OwnerRegister />} />
    <Route path="/owner" element={<OwnerDashboard />} />
    <Route path="/owner/bookings" element={<OwnerBookings />} />
    <Route path="/owner/tokens" element={<Tokens />} />
    <Route path="/owner/staff" element={<StaffServices kind="staff" />} />
    <Route path="/owner/services" element={<StaffServices kind="services" />} />
    <Route path="/owner/payments" element={<OwnerPayments />} />
    <Route path="/owner/voice" element={<VoiceSettings />} />
    <Route path="/owner/subscription" element={<OwnerSubscription />} />
    <Route path="/owner/more" element={<OwnerMore />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/salons" element={<AdminSalons />} />
    <Route path="/admin/customers" element={<AdminCustomers />} />
    <Route path="/admin/bookings" element={<AdminBookings />} />
    <Route path="/admin/finance" element={<AdminFinance />} />
    <Route path="/admin/plans" element={<AdminPlans />} />
    <Route path="/admin/banners" element={<AdminBanners />} />
    <Route path="/admin/push" element={<AdminPush />} />
    <Route path="/admin/tickets" element={<AdminTickets />} />
    <Route path="/admin/settings" element={<AdminSettings />} />
    <Route path="/admin/audit" element={<AdminAudit />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes></BrowserRouter></AppProvider>
}
