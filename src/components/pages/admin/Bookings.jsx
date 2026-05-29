import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api';
import { Spinner, ErrorMsg, StatusBadge } from '../../Shared';

export default function AdminBookings() {
  const [bookings,     setBookings]     = useState([]);
  const [total,        setTotal]        = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // State to handle the booking detail viewport overlay
  const [selectedBooking, setSelectedBooking] = useState(null);

  const load = () => {
    setLoading(true);
    const params = statusFilter ? { status: statusFilter } : {};
    adminAPI.bookings(params)
      .then(d => { setBookings(d.bookings); setTotal(d.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          All Bookings <span className="text-sm font-normal text-slate-400">({total})</span>
        </h2>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            Filter by status
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
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

      <ErrorMsg msg={error} />

      {loading && (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      )}

      {/* Main Table Interface */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map(b => (
              <tr 
                key={b._id} 
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                onClick={() => setSelectedBooking(b)}
                title="Click to inspect booking records & reviews"
              >
                <td className="px-6 py-4">
                  <strong className="text-slate-800 font-semibold group-hover:text-sky-600 group-hover:underline transition-colors">
                    {b.serviceId?.title || 'Unknown Service'}
                  </strong>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">{b.customerId?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-600">{b.providerId?.name || 'N/A'}</td>
                <td className="px-6 py-4 text-slate-400 text-xs font-medium">
                  {new Date(b.bookingDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOOKING DETAILS MODAL POPUP */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]" 
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl border border-slate-100 scale-100 transition-all duration-200 max-h-[90vh] flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-700 text-base">Booking Document</h3>
                <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded select-all">
                  {selectedBooking._id}
                </span>
              </div>
              <button 
                className="text-xl leading-none text-slate-400 hover:text-slate-600 transition" 
                onClick={() => setSelectedBooking(null)}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Primary Service Meta */}
              <div>
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">Requested Service</label>
                <h4 className="text-lg font-extrabold text-slate-800 leading-tight">
                  {selectedBooking.serviceId?.title || 'Service Title Unspecified'}
                </h4>
                <p className="text-xs font-semibold text-emerald-600 mt-1">
                  Rate: KES {selectedBooking.serviceId?.price || '0.00'}
                </p>
              </div>

              <hr className="border-slate-100" />

              {/* Two Column Logistics Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Customer Name</label>
                  <p className="text-sm text-slate-700 font-semibold">{selectedBooking.customerId?.name || 'Deleted Account'}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{selectedBooking.customerId?.email}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Assigned Provider</label>
                  <p className="text-sm text-slate-700 font-semibold">{selectedBooking.providerId?.name || 'Deleted Account'}</p>
                  <p className="text-xs text-slate-400 font-mono truncate">{selectedBooking.providerId?.email}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Schedule Placement Date</label>
                  <p className="text-sm text-slate-700 font-medium">
                    {new Date(selectedBooking.bookingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Current Workflow Status</label>
                  <div className="pt-0.5">
                    <StatusBadge status={selectedBooking.status} />
                  </div>
                </div>
              </div>

              {/* Dynamic Associated Feedback Section */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Client Feedback / Review</label>
                
                {selectedBooking.reviewId || selectedBooking.review ? (
                  (() => {
                    // Normalize lookup reference for populated configurations
                    const reviewData = selectedBooking.review || selectedBooking.reviewId;
                    return (
                      <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          {/* Visual Star Grid */}
                          <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                            {Array.from({ length: 5 }, (_, idx) => (
                              <span key={idx}>
                                {idx < reviewData.rating ? '★' : '☆'}
                              </span>
                            ))}
                            <span className="text-xs text-slate-500 font-bold ml-1">({reviewData.rating}/5)</span>
                          </div>
                          {reviewData.createdAt && (
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(reviewData.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 font-medium italic leading-relaxed">
                          "{reviewData.comment || 'No textual feedback recorded.'}"
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50/50 border border-dashed border-slate-200 rounded-lg p-3 text-center">
                    No matching transaction review statement has been finalized for this transaction item.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}