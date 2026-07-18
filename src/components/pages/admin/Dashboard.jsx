import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../../services/api';
import { Spinner, ErrorMsg } from '../../Shared';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.dashboard()
      .then(d => setData(d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorMsg msg={error} />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', val: data?.stats?.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Services', val: data?.stats?.totalServices, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Bookings', val: data?.stats?.totalBookings, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Reviews', val: data?.stats?.totalReviews, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans antialiased text-slate-800">
      {/* Dashboard Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Admin Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time overview and platform management metrics.</p>
      </div>

      {/* Primary Stat Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, val, color, bg }) => (
          <div 
            key={label} 
            className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition duration-200 hover:shadow-md hover:border-slate-300"
          >
            <div className={`text-3xl font-bold tracking-tight ${color} mb-1`}>
              {val ?? '—'}
            </div>
            <div className="text-sm font-semibold text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Segment Breakdown Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Users by Role Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-950 mb-4 tracking-tight">Users by Role</h4>
          <div className="flex flex-col gap-2.5">
            {data?.usersByRole?.map(r => (
              <div 
                key={r._id} 
                className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-slate-100/50 transition-colors"
              >
                <span className="capitalize font-medium text-sm text-slate-700">{r._id || 'Unknown'}</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-md">{r.count}</span>
              </div>
            ))}
            {(!data?.usersByRole || data.usersByRole.length === 0) && (
              <p className="text-sm text-slate-400 italic">No role data available.</p>
            )}
          </div>
        </div>

        {/* Bookings by Status Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-950 mb-4 tracking-tight">Bookings by Status</h4>
          <div className="flex flex-col gap-2.5">
            {data?.bookingsByStatus?.map(r => {
              // Custom dynamic status badges color picking
              const statusColors = {
                pending: 'bg-amber-100 text-amber-800',
                accepted: 'bg-indigo-100 text-indigo-800',
                completed: 'bg-emerald-100 text-emerald-800',
                cancelled: 'bg-rose-100 text-rose-800',
              };
              const colorClass = statusColors[r._id?.toLowerCase()] || 'bg-slate-100 text-slate-800';

              return (
                <div 
                  key={r._id} 
                  className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-slate-100/50 transition-colors"
                >
                  <span className="capitalize font-medium text-sm text-slate-700">{r._id || 'Unknown'}</span>
                  <span className={`${colorClass} text-xs font-bold px-2.5 py-1 rounded-md`}>{r.count}</span>
                </div>
              );
            })}
            {(!data?.bookingsByStatus || data.bookingsByStatus.length === 0) && (
              <p className="text-sm text-slate-400 italic">No booking data available.</p>
            )}
          </div>
        </div>
      </div>

      <hr className="border-t border-slate-200/80 my-8" />
      
      {/* Quick Navigation Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-slate-950 tracking-tight mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Link 
            to="/admin/users" 
            className="flex items-center justify-center p-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm transition hover:bg-slate-50 hover:border-slate-300 text-center"
          >
            👥 Manage Users
          </Link>
          <Link 
            to="/admin/services" 
            className="flex items-center justify-center p-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm transition hover:bg-slate-50 hover:border-slate-300 text-center"
          >
            🛠️ Manage Services
          </Link>
          <Link 
            to="/admin/bookings" 
            className="flex items-center justify-center p-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm transition hover:bg-slate-50 hover:border-slate-300 text-center"
          >
            📅 View All Bookings
          </Link>


          <Link 
            to="/admin/reports" 
            className="flex items-center justify-center p-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-sm transition hover:bg-rose-50 hover:border-rose-200 text-center relative group"
          >
            ⚠️ Manage Violations & Reports
          </Link>


        </div>
      </div>
    </div>
  );
}