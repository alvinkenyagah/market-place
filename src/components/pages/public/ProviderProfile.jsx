import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersAPI, servicesAPI, reviewsAPI } from '../../../services/api';
import { Spinner, ErrorMsg, StarRating } from '../../Shared';

export default function ProviderProfile() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4; // Adjust this number to change grid capacity

  useEffect(() => {
    Promise.all([usersAPI.getUser(id), servicesAPI.list({ providerId: id }), reviewsAPI.forProvider(id)])
      .then(([u, s, r]) => { 
        setProvider(u.user); 
        setServices(s.services || []); 
        setReviews(r.reviews || []); 
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <Spinner />
    </div>
  );
  
  if (error) return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      <ErrorMsg msg={error} />
    </div>
  );
  
  if (!provider) return (
    <div className="max-w-4xl mx-auto p-6 text-center mt-12 bg-white rounded-xl border border-stone-200 shadow-sm">
      <p className="text-stone-600 font-medium">User not found.</p>
      <Link to="/search" className="mt-4 inline-block text-terracotta hover:text-terracotta-dark font-medium text-sm">&larr; Back to Search</Link>
    </div>
  );

  const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';
  
  const getAvatarSrc = () => {
    if (provider?.profileImage) {
      if (provider.profileImage.startsWith('http')) return provider.profileImage;
      const cleanImagePath = provider.profileImage.startsWith('/') ? provider.profileImage : `/${provider.profileImage}`;
      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(provider?.name || 'User')}&background=2A5C3F&color=fff&size=128`;
  };

  const getCustomerAvatar = (customer) => {
    if (customer?.profileImage) {
      if (customer.profileImage.startsWith('http')) return customer.profileImage;
      const cleanImagePath = customer.profileImage.startsWith('/') ? customer.profileImage : `/${customer.profileImage}`;
      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(customer?.name || 'User')}&background=F0EBE3&color=C4622D`;
  };

  // --- Pagination Logic ---
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(indexOfFirstService, indexOfLastService);
  const totalPages = Math.ceil(services.length / servicesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-cream text-charcoal antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Action */}
        <div className="flex items-center">
          <Link to="/search" className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-terracotta group transition">
            <svg className="w-5 h-5 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Search
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-earthGreen via-gold to-terracotta" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-terracotta-light flex-shrink-0 shadow-inner bg-cream">
            <img 
              src={getAvatarSrc()} 
              alt={`${provider.name}'s profile`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=2A5C3F&color=fff&size=128`;
              }}
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">{provider.name}</h2>
              <div className="mt-1.5 flex flex-wrap justify-center sm:justify-start items-center gap-2 text-sm text-stone-500">
                <span className="px-2.5 py-0.5 bg-terracotta-light text-terracotta border border-terracotta/10 text-xs font-semibold uppercase tracking-wider rounded-md">
                  {provider.role}
                </span>
                {provider.location && <span className="flex items-center gap-1"><span>📍</span> {provider.location}</span>}
                {provider.phone && <span className="flex items-center gap-1"><span>📞</span> {provider.phone}</span>}
              </div>
            </div>

            <p className="text-xs text-stone-500 font-medium">
              Member since {new Date(provider.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Bio Card */}
        {provider.bio && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-charcoal flex items-center gap-2">
              <span className="text-terracotta">👤</span> About the Provider
            </h3>
            <p className="text-stone-700 leading-relaxed text-sm sm:text-base border-l-4 border-earthGreen bg-cream-dark/40 p-4 rounded-r-xl">
              {provider.bio}
            </p>
          </div>
        )}

        {/* Services Listings Grid Layout */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
            <span className="text-terracotta">🛠️</span> Active Services ({services.length})
          </h3>
          
          {services.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400 text-sm shadow-sm">
              No active services currently listed.
            </div>
          ) : (
            <>
              {/* Made the wrapper grid gaps tighter and modified individual cards to be smaller */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentServices.map(s => (
                  <div key={s._id} className="bg-white rounded-xl border border-stone-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition duration-200 group">
                    <div className="space-y-0.5">
                      <p className="font-bold text-charcoal text-base group-hover:text-terracotta transition line-clamp-1">{s.title}</p>
                      <p className="text-[10px] font-semibold tracking-wider text-stone-400 uppercase">{s.location}</p>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium uppercase leading-none mb-0.5">Rate</span>
                        <span className="text-base font-extrabold text-earthGreen">KES {s.price}</span>
                      </div>
                      <Link to={`/services/${s._id}`} className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-terracotta hover:bg-terracotta-dark shadow-sm rounded-md transition">
                        View Service
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Interface Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 pt-2">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition text-xs font-medium"
                  >
                    &larr; Prev
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        currentPage === page
                          ? 'bg-terracotta text-white'
                          : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:hover:bg-white transition text-xs font-medium"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reviews Timeline Feed */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
            <span className="text-gold">★</span> Client Reviews ({reviews.length})
          </h3>
          
          {reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-400 text-sm shadow-sm">
              No reviews recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r._id} className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-11 h-11 rounded-full overflow-hidden border border-stone-200 flex-shrink-0 bg-cream shadow-inner">
                    <img 
                      src={getCustomerAvatar(r.customerId)} 
                      alt={`${r.customerId?.name || 'User'}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.customerId?.name || 'User')}&background=F0EBE3&color=C4622D`;
                      }}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-bold text-charcoal text-sm sm:text-base">{r.customerId?.name || 'Anonymous User'}</span>
                        <span className="text-xs text-stone-500 font-medium">
                          on <span className="italic text-stone-600 font-semibold">{r.serviceId?.title || 'Service'}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gold">
                        <StarRating value={r.rating} />
                      </div>
                    </div>
                    
                    <p className="text-stone-700 text-sm sm:text-base leading-relaxed bg-cream/50 rounded-xl p-3 border border-stone-100">
                      {r.comment}
                    </p>
                    
                    {r.createdAt && (
                      <div className="text-right">
                        <span className="text-xs font-medium text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}