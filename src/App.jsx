

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import '../src/index.css'
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public
import Home from './components/pages/public/Home';
import Login from './components/pages/public/Login';
import Register from './components/pages/public/Register';
import Search from './components/pages/public/Search';
import ServiceDetail from './components/pages/public/ServiceDetail';
import ProviderProfile from './components/pages/public/ProviderProfile';
import Messages from './components/pages/public/Messages';
// Customer
import CustomerDashboard from './components/pages/customer/Dashboard';
import MyBookings from './components/pages/customer/MyBookings';
import Profile from './components/pages/customer/Profile';

// Provider
import ProviderDashboard from './components/pages/provider/Dashboard';
import MyServices from './components/pages/provider/MyServices';
import BookingRequests from './components/pages/provider/BookingRequests';

// Admin
import AdminDashboard from './components/pages/admin/Dashboard';
import AdminUsers from './components/pages/admin/Users';
import AdminServices from './components/pages/admin/Services';
import AdminBookings from './components/pages/admin/Bookings';
import AdminReports from './components/pages/admin/AdminReports';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/providers/:id" element={<ProviderProfile />} />

          {/* Customer */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />


          <Route path="/dashboard" element={
              <ProtectedRoute roles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />



            <Route path="/messages" element={
              <ProtectedRoute roles={['customer', 'provider']}>
                <Messages />
              </ProtectedRoute>
            } />



          <Route path="/my-bookings" element={
            <ProtectedRoute roles={['customer']}>
              <MyBookings />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['customer', 'provider']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Provider */}
          <Route path="/provider/dashboard" element={
            <ProtectedRoute roles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          } />
          <Route path="/provider/services" element={
            <ProtectedRoute roles={['provider']}>
              <MyServices />
            </ProtectedRoute>
          } />
          <Route path="/provider/bookings" element={
            <ProtectedRoute roles={['provider']}>
              <BookingRequests />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/services" element={
            <ProtectedRoute roles={['admin']}>
              <AdminServices />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute roles={['admin']}>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute roles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
