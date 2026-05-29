import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { servicesAPI, reviewsAPI, bookingsAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Spinner, ErrorMsg, SuccessMsg, StarRating } from '../../Shared';

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingErr, setBookingErr] = useState('');
  const [booking, setBooking] = useState(false);

  // States for Carousel and View Modal
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([servicesAPI.get(id), reviewsAPI.forService(id)])
      .then(([svcData, revData]) => { 
        setService(svcData.service); 
        setReviews(revData.reviews); 
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookingErr(''); setBookingMsg(''); setBooking(true);
    try {
      await bookingsAPI.create({ serviceId: id, bookingDate, notes });
      setBookingMsg('Booking submitted! The provider will confirm soon.');
      setBookingDate(''); setNotes('');
    } catch (e) {
      setBookingErr(e.message);
    } finally {
      setBooking(false);
    }
  };

  const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';
  
  const getReviewerAvatar = (reviewer) => {
    if (reviewer?.profileImage) {
      if (reviewer.profileImage.startsWith('http')) {
        return reviewer.profileImage;
      }
      const cleanImagePath = reviewer.profileImage.startsWith('/') 
        ? reviewer.profileImage 
        : `/${reviewer.profileImage}`;

      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewer?.name || 'User')}&background=E3F2FD&color=0D8ABC`;
  };

  const nextImage = (e) => {
    e.stopPropagation(); 
    if (!service?.images) return;
    setCurrentImgIndex((prev) => (prev === service.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation(); 
    if (!service?.images) return;
    setCurrentImgIndex((prev) => (prev === 0 ? service.images.length - 1 : prev - 1));
  };

  if (loading) return <Spinner />;
  if (error) return <div className="max-w-3xl mx-auto px-4 py-8"><ErrorMsg msg={error} /></div>;
  if (!service) return <div className="max-w-3xl mx-auto px-4 py-8 text-center text-slate-500 font-medium"><p>Service not found.</p></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 font-sans text-slate-800 antialiased">
      {/* Back Link */}
      <Link to="/search" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-amber-600 transition-colors duration-200 mb-5">
        ← Back to Search
      </Link>

      {/* Header Info */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 mb-2">{service.title}</h2>
        <p className="text-slate-500 text-base font-medium">
          {service.category} <span className="mx-1.5 text-slate-300">•</span> {service.location}
        </p>
      </div>

      {/* Price & Rating Summary Frame */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-6 bg-slate-50 border border-slate-100 rounded-xl">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">Price Range</span>
          <p className="text-2xl font-bold text-slate-900">KES {service.price}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200/60 shadow-sm">
          <StarRating value={Math.round(service.averageRating)} /> 
          <span className="text-sm font-semibold text-slate-600">({service.totalReviews} reviews)</span>
        </div>
      </div>

      {/* --- Image Carousel Section --- */}
      {service.images?.length > 0 && (
        <div className="mb-8 flex flex-col gap-3">
          <div 
            className="group relative w-full h-64 sm:h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer" 
            onClick={() => setIsModalOpen(true)}
          >
<img 
  src={service.images[currentImgIndex]?.startsWith('http') 
    ? service.images[currentImgIndex] 
    : `${BACKEND_URL}${service.images[currentImgIndex]}`
  } 
  alt={`${service.title} view ${currentImgIndex + 1}`} 
  className="w-full h-full object-cover block transition duration-500 scale-100 group-hover:scale-[1.02]"
/>
            
            {/* Hover overlay action helper */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="bg-slate-900/80 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                🔍 Click to expand
              </span>
            </div>
            
            {service.images.length > 1 && (
              <>
                <button 
                  type="button" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 font-bold text-lg flex items-center justify-center shadow-md transition transform active:scale-95 z-10 opacity-0 group-hover:opacity-100 sm:opacity-100" 
                  onClick={prevImage}
                >
                  ⟨
                </button>
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 font-bold text-lg flex items-center justify-center shadow-md transition transform active:scale-95 z-10 opacity-0 group-hover:opacity-100 sm:opacity-100" 
                  onClick={nextImage}
                >
                  ⟩
                </button>
              </>
            )}
          </div>

          {/* Indicators & Thumbnails Strip */}
          {service.images.length > 1 && (
            <div className="flex gap-2 justify-start overflow-x-auto pb-1 scrollbar-thin">
              {service.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-20 h-14 p-0 border-2 rounded-lg overflow-hidden shrink-0 bg-none transition-all duration-200 ${i === currentImgIndex ? 'border-amber-500 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  onClick={() => setCurrentImgIndex(i)}
                >
                  <img src={`${BACKEND_URL}${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="prose max-w-none mb-8">
        <p className="text-slate-600 leading-relaxed text-[1.05rem] whitespace-pre-line">{service.description}</p>
      </div>

      <hr className="border-t border-slate-200 my-8" />
      
      {/* Provider Details Block */}
      <div className="mb-8">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Service Provider</h3>
        {service.providerId && (
          <div className="flex items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                <img 
                  src={getReviewerAvatar(service.providerId)} 
                  alt={`${service.providerId.name}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(service.providerId.name)}&background=0D8ABC&color=fff`;
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-base">{service.providerId.name}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">📍 {service.providerId.location}</span>
              </div>
            </div>
            <Link to={`/providers/${service.providerId._id}`} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm whitespace-nowrap">
              View Profile
            </Link>
          </div>
        )}
      </div>

      <hr className="border-t border-slate-200 my-8" />

      {/* Booking Form Layout Panel */}
      {user?.role === 'customer' && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Book this Service</h3>
          <div className="max-w-md">
            <div className="mb-3">
              <SuccessMsg msg={bookingMsg} />
              <ErrorMsg msg={bookingErr} />
            </div>
            <form onSubmit={handleBook} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Preferred Date &amp; Time</label>
                <input 
                  type="datetime-local" 
                  value={bookingDate} 
                  onChange={e => setBookingDate(e.target.value)} 
                  required 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl shadow-sm bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Notes (optional)</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  rows={3} 
                  placeholder="Any special instructions or requirements…" 
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition text-sm"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-50 mt-1" 
                disabled={booking}
              >
                {booking ? 'Processing Appointment…' : 'Request Booking'}
              </button>
            </form>
          </div>
        </div>
      )}

      {!user && (
        <p className="p-4 bg-amber-50 text-amber-900 text-sm font-medium rounded-xl border border-amber-200/60 mb-8">
          <Link to="/login" className="text-amber-700 underline font-semibold hover:text-amber-800">Sign in</Link> to book this service.
        </p>
      )}

      <hr className="border-t border-slate-200 my-8" />

      {/* --- Review List Layout Components --- */}
      <div className="mb-12">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-slate-400 italic text-sm mt-2 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">No reviews yet. Be the first to try out this service!</p>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {reviews.map(r => (
              <div key={r._id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                  <img 
                    src={getReviewerAvatar(r.customerId)} 
                    alt={`${r.customerId?.name || 'User'}`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customerId?.name || 'User')}&background=E3F2FD&color=0D8ABC`;
                    }}
                  />
                </div>

                <div className="flex flex-col grow min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <span className="font-semibold text-sm text-slate-900 truncate">{r.customerId?.name || 'Anonymous User'}</span> 
                    <StarRating value={r.rating} />
                  </div>
                  <p className="mt-1.5 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                  <span className="text-[11px] font-medium text-slate-400 mt-2 block">{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Fullscreen Lightbox Modal View --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" 
          onClick={() => setIsModalOpen(false)}
        >
          <button 
            type="button" 
            className="absolute top-4 right-6 text-white hover:text-slate-300 text-4xl font-light cursor-pointer select-none transition z-[10001]" 
            onClick={() => setIsModalOpen(false)}
          >
            &times;
          </button>
          <div className="relative max-w-[95vw] max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={`${BACKEND_URL}${service.images[currentImgIndex]}`} 
              alt="Expanded service presentation" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {service.images.length > 1 && (
              <div className="text-slate-300 bg-slate-900/60 px-4 py-1 rounded-full backdrop-blur-sm mt-4 text-xs font-medium">
                Image {currentImgIndex + 1} of {service.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}