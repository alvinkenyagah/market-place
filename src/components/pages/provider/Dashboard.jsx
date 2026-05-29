import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { servicesAPI, bookingsAPI } from '../../../services/api';
import { Spinner, ErrorMsg } from '../../Shared';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([servicesAPI.my(), bookingsAPI.myProvider({ status: 'pending' })])
      .then(([s, b]) => { 
        setServices(s.services || []); 
        setPendingBookings(b.bookings || []); 
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] bg-cream">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="pb-5 border-b border-[#E7E5E4]">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1917]">
            Provider Dashboard
          </h2>
          <p className="text-sm font-medium text-[#78716C] mt-1">
            Welcome back, <span className="text-[#C4622D] font-bold">{user?.name}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorMsg msg={error} />
          </div>
        )}

        {/* Overview Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Active Services Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm flex flex-col justify-between items-start transition duration-200 hover:shadow-md hover:border-[#D6D3D1] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2A5C3F]" />
            <div>
              <div className="text-5xl font-black tracking-tight text-[#2A5C3F] mb-1">
                {services.length}
              </div>
              <div className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Active Services
              </div>
            </div>
            <Link 
              to="/provider/services" 
              className="mt-6 w-full sm:w-auto text-center px-4 py-2 bg-white border border-[#D6D3D1] hover:bg-[#FAF7F2] text-[#44403C] font-semibold text-sm rounded-xl shadow-xs transition active:scale-[0.98]"
            >
              Manage Services
            </Link>
          </div>

          {/* Pending Appointments Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm flex flex-col justify-between items-start transition duration-200 hover:shadow-md hover:border-[#D6D3D1] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C9941A]" />
            <div>
              <div className={`text-5xl font-black tracking-tight mb-1 transition-colors ${pendingBookings.length > 0 ? 'text-[#C9941A]' : 'text-[#78716C]'}`}>
                {pendingBookings.length}
              </div>
              <div className="text-xs font-bold text-[#78716C] uppercase tracking-wider">
                Pending Bookings
              </div>
            </div>
            <Link 
              to="/provider/bookings" 
              className={`mt-6 w-full sm:w-auto text-center px-4 py-2 text-sm font-semibold rounded-xl shadow-xs transition active:scale-[0.98] border ${
                pendingBookings.length > 0 
                  ? 'bg-[#FDF3DC] border-[#C9941A]/30 text-[#92400E] hover:bg-[#FEF3C7]' 
                  : 'bg-white border-[#D6D3D1] hover:bg-[#FAF7F2] text-[#44403C]'
              }`}
            >
              View Bookings
            </Link>
          </div>
        </div>

        {/* Pending Requests Stream Section */}
        {pendingBookings.length > 0 ? (
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F5F5F4]">
              <h3 className="text-lg font-bold text-[#1C1917] tracking-tight flex items-center gap-2">
                <span>🔔</span> Pending Requests 
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FEF3C7] text-[#92400E] text-xs font-bold rounded-md uppercase tracking-wider border border-[#FEF3C7]">
                Action Required
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {pendingBookings.slice(0, 3).map(b => (
                <div 
                  key={b._id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF7F2] border border-[#F0EBE3] rounded-xl hover:bg-[#F0EBE3]/50 transition duration-150"
                >
                  <div className="min-w-0">
                    <span className="block font-bold text-[#1C1917] text-base truncate">
                      {b.serviceId?.title || 'Service Listing'}
                    </span>
                    <span className="block text-xs font-medium text-[#78716C] mt-0.5">
                      Requested by:{' '}
                      <strong className="text-[#C4622D] font-bold">
                        {b.customerId?.name || 'Anonymous User'}
                      </strong>
                    </span>
                  </div>
                  <div className="shrink-0 self-start sm:self-center bg-white px-3 py-1.5 border border-[#E7E5E4] rounded-lg shadow-xs text-xs font-bold text-[#44403C] flex items-center gap-1">
                    <span>📅</span> {new Date(b.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
            
            {pendingBookings.length > 3 && (
              <div className="mt-4 pt-2 border-t border-[#F5F5F4]">
                <Link 
                  to="/provider/bookings" 
                  className="inline-flex items-center text-sm font-bold text-[#C4622D] hover:text-[#9E4E22] transition group"
                >
                  See all {pendingBookings.length} pending requests 
                  <span className="ml-1 transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Empty Dashboard State */
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E5E4] shadow-sm max-w-md mx-auto">
            <div className="text-4xl mb-2">✨</div>
            <p className="text-[#44403C] font-semibold">Your schedule is clear!</p>
            <p className="text-xs text-[#78716C] mt-1 max-w-xs mx-auto">
              Any new incoming customer bookings or service inquiries will appear right here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}