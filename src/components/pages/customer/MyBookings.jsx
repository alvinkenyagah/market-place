import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI, reviewsAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg, StatusBadge, StarRating } from '../../Shared';

function ReviewForm({ booking, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); 
    setLoading(true);
    try {
      await reviewsAPI.create({ bookingId: booking._id, rating: Number(rating), comment });
      onDone();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-5 border border-[#E7E5E4] rounded-xl bg-[#FAF7F2] space-y-4">
      <h4 className="text-sm font-bold text-[#1C1917] flex items-center gap-1.5">
        <span className="text-[#C9941A]">★</span> Leave a Review
      </h4>
      {err && <ErrorMsg msg={err} />}
      
      <form onSubmit={submit} className="space-y-4">
        <div className="flex flex-col gap-1.5 max-w-[120px]">
          <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Rating (1–5)</label>
          <div className="relative rounded-md shadow-xs">
            <input 
              type="number" 
              min={1} 
              max={5} 
              value={rating} 
              onChange={e => setRating(e.target.value)} 
              className="w-full px-3 py-1.5 bg-white border border-[#D6D3D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] font-semibold transition"
              required
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Comment</label>
          <textarea 
            value={comment} 
            onChange={e => setComment(e.target.value)} 
            rows={3} 
            className="w-full px-3 py-2 bg-white border border-[#D6D3D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] placeholder-[#78716C]/60 transition"
            placeholder="Share details of your experience with this service provider..."
            required
          />
        </div>
        
        <div className="flex justify-end pt-1">
          <button 
            type="submit" 
            className="px-4 py-2 bg-[#C4622D] hover:bg-[#9E4E22] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState('');
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [showReview, setShowReview] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await bookingsAPI.myCustomer(params);
      setBookings(data.bookings || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const cancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingsAPI.updateStatus(id, 'cancelled');
      setCancelMsg('Booking status updated to cancelled.');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Branding Header and Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#E7E5E4] gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1917]">My Bookings</h2>
            <p className="text-sm font-medium text-[#78716C] mt-1">Track schedules, inspect receipts, and manage feedback.</p>
          </div>

          <div className="inline-flex items-center bg-white border border-[#E7E5E4] p-2 rounded-xl shadow-xs shrink-0">
            <label className="flex items-center gap-2.5 text-xs font-bold text-[#44403C] uppercase tracking-wider pl-1.5">
              Status:
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#FAF7F2] border border-[#D6D3D1] hover:border-[#44403C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4622D] text-xs font-semibold text-[#1C1917] transition cursor-pointer"
              >
                <option value="">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
        </div>
        
        {/* Messages State block */}
        {(cancelMsg || error) && (
          <div className="space-y-2">
            {cancelMsg && <SuccessMsg msg={cancelMsg} />}
            {error && <ErrorMsg msg={error} />}
          </div>
        )}

        {/* Loading Spinner Container */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        )}
        
        {/* Clean Empty Placeholder Template Layout */}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-16 bg-white border border-[#E7E5E4] rounded-2xl shadow-xs max-w-md mx-auto">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-[#44403C] font-semibold text-base">No bookings match this criterion</p>
            <p className="text-xs text-[#78716C] mt-1 max-w-xs mx-auto">
              When you set up service timelines with active marketplace specialists, they will stream natively here.
            </p>
          </div>
        )}

        {/* Chronological Grid Items Stream Feed */}
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white border border-[#E7E5E4] rounded-2xl p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-sm space-y-4">
              
              {/* Card Meta Row Split Block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-lg font-bold text-[#C4622D] hover:text-[#9E4E22] transition truncate">
                  <Link to={`/services/${b.serviceId?._id}`}>{b.serviceId?.title || 'Service Listing'}</Link>
                </p>
                <div className="self-start sm:self-auto shrink-0">
                  <StatusBadge status={b.status} />
                </div>
              </div>
              
              {/* Internal Specifications Data Box Elements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#44403C] bg-[#FAF7F2]/60 rounded-xl p-4 border border-[#F5F5F4]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#78716C] font-medium">📅 Date:</span> 
                  <span className="text-[#1C1917] font-semibold">
                    {new Date(b.bookingDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#78716C] font-medium">👤 Specialist:</span> 
                  <span className="text-[#1C1917] font-semibold">{b.providerId?.name || 'Unspecified'}</span>
                </div>
                {b.notes && (
                  <div className="sm:col-span-2 pt-2 border-t border-[#E7E5E4]/60 mt-1">
                    <span className="text-[#78716C] font-medium block text-xs uppercase tracking-wider mb-0.5">Customer Memo</span> 
                    <p className="text-[#1C1917] text-sm italic bg-white p-2.5 rounded-lg border border-[#E7E5E4]">{b.notes}</p>
                  </div>
                )}
              </div>

              {/* Action Toolbar Context Node Layer */}
              <div className="flex items-center justify-end pt-1">
                {b.status === 'pending' && (
                  <button 
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#991B1B] border border-[#FEE2E2] bg-[#FEE2E2]/40 rounded-lg hover:bg-[#FEE2E2] transition shadow-2xs" 
                    onClick={() => cancel(b._id)}
                  >
                    Cancel Booking
                  </button>
                )}
                
                {b.status === 'completed' && !reviewedIds.has(b._id) && (
                  <div className="w-full">
                    {showReview === b._id ? (
                      <ReviewForm 
                        booking={b} 
                        onDone={() => { 
                          setReviewedIds(s => new Set([...s, b._id])); 
                          setShowReview(null); 
                        }} 
                      />
                    ) : (
                      <div className="flex justify-end">
                        <button 
                          className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#44403C] border border-[#D6D3D1] bg-white rounded-lg hover:bg-[#FAF7F2] shadow-xs transition" 
                          onClick={() => setShowReview(b._id)}
                        >
                          Leave Review
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {reviewedIds.has(b._id) && (
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2A5C3F] bg-[#E4EFE9] border border-[#2A5C3F]/10 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span>✓</span> Review submitted
                  </p>
                )}
              </div>
              
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}