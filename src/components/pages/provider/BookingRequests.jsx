import React, { useEffect, useState } from 'react';
import { bookingsAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg, StatusBadge } from '../../Shared';

export default function BookingRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await bookingsAPI.myProvider(params);
      setBookings(data.bookings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      setError('');
      setMsg('');
      await bookingsAPI.updateStatus(id, status);
      setMsg(`Booking request was successfully marked as ${status}.`);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const getCustomerAvatar = (customer) => {
    if (customer?.profileImage) {
      if (customer.profileImage.startsWith('http')) {
        return customer.profileImage;
      }
      const cleanImagePath = customer.profileImage.startsWith('/') 
        ? customer.profileImage 
        : `/${customer.profileImage}`;

      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || 'User')}&background=FAF7F2&color=C4622D&bold=true`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Block Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#E7E5E4] gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1917]">Booking Requests</h2>
            <p className="text-sm font-medium text-[#78716C] mt-1">Review incoming customer requests, approve orders, and manage task fulfillment.</p>
          </div>
          
          <div className="inline-flex items-center bg-white border border-[#E7E5E4] p-2 rounded-xl shadow-xs shrink-0">
            <label htmlFor="filter" className="flex items-center gap-2.5 text-xs font-bold text-[#44403C] uppercase tracking-wider pl-1.5">
              Filter Status:
              <select 
                id="filter"
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF7F2] border border-[#D6D3D1] hover:border-[#44403C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4622D] text-xs font-semibold text-[#1C1917] transition cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
        </div>

        {/* Feedback Banners */}
        {(error || msg) && (
          <div className="space-y-2">
            {error && <ErrorMsg msg={error} />}
            {msg && <SuccessMsg msg={msg} />}
          </div>
        )}

        {/* Data Response Streams */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E7E5E4] shadow-xs max-w-md mx-auto">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-[#44403C] font-bold text-base">No requests registered</p>
            <p className="text-xs text-[#78716C] mt-1">Incoming consumer tickets matched to this profile layer filter will compile here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div 
                key={b._id} 
                className="bg-white border border-[#E7E5E4] rounded-2xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition hover:shadow-sm"
              >
                {/* Left Side Customer Profile Info Section */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FAF7F2] border border-[#E7E5E4] shrink-0 shadow-2xs">
                    <img 
                      src={getCustomerAvatar(b.customerId)} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.customerId?.name || 'User')}&background=FAF7F2&color=C4622D&bold=true`;
                      }}
                    />
                  </div>

                  <div className="space-y-3 min-w-0 flex-1">
                    <div>
                      <h4 className="text-base font-bold text-[#1C1917] tracking-tight">{b.serviceId?.title || 'Requested Listing'}</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-[#44403C]">
                      <p className="truncate">
                        <span className="font-bold text-[#78716C] mr-1.5 uppercase text-3xs tracking-wider">Customer:</span>
                        <span className="text-[#1C1917] font-semibold">{b.customerId?.name || 'Unknown User'}</span> 
                        <span className="text-[#78716C] text-xs font-normal block sm:inline sm:ml-1.5">({b.customerId?.email})</span>
                      </p>
                      
                      {b.customerId?.phone && (
                        <p className="truncate">
                          <span className="font-bold text-[#78716C] mr-1.5 uppercase text-3xs tracking-wider">Phone:</span>
                          <span className="text-[#1C1917] font-semibold">{b.customerId.phone}</span>
                        </p>
                      )}

                      <p className="flex items-center gap-1">
                        <span className="font-bold text-[#78716C] mr-1.5 uppercase text-3xs tracking-wider">Schedule:</span>
                        <span className="text-[#1C1917] font-semibold">
                          {new Date(b.bookingDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#78716C] uppercase text-3xs tracking-wider">Lifecycle:</span>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>

                    {b.notes && (
                      <div className="bg-[#FAF7F2]/60 border border-[#F5F5F4] p-3 rounded-xl text-sm text-[#44403C]">
                        <strong className="text-3xs font-bold uppercase tracking-wider text-[#78716C] block mb-0.5">Customer Memo</strong>
                        <p className="italic text-[#1C1917]">"{b.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side Workflow Actions */}
                <div className="flex items-center shrink-0 sm:justify-start gap-2 pt-4 md:pt-0 border-t border-[#F5F5F4] md:border-t-0">
                  {b.status === 'pending' && (
                    <>
                      <button 
                        className="flex-1 md:flex-initial px-4 py-2 bg-[#2A5C3F] hover:bg-[#1E422B] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-2xs transition"
                        onClick={() => updateStatus(b._id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button 
                        className="flex-1 md:flex-initial px-4 py-2 bg-white hover:bg-[#FEE2E2] border border-[#D6D3D1] hover:border-[#FEE2E2] text-[#991B1B] text-xs font-bold uppercase tracking-wider rounded-lg transition"
                        onClick={() => updateStatus(b._id, 'cancelled')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === 'accepted' && (
                    <button 
                      className="w-full md:w-auto px-4 py-2 bg-[#C4622D] hover:bg-[#9E4E22] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-2xs transition"
                      onClick={() => updateStatus(b._id, 'completed')}
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}