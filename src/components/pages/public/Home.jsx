import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { servicesAPI } from '../../../services/api';
import { StarRating } from '../../Shared';
import 'animate.css';



export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await servicesAPI.list({ page: 1, limit: 3 });
        setFeatured(data.services || []);
      } catch (err) {
        console.error('Failed to load featured services:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-cream relative overflow-hidden">
      {/* ── Hero ── */}
      <div className="animate__animated animate__slideInRight animate__slow relative bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,var(--color-terracotta-light)_0%,transparent_55%),radial-gradient(ellipse_60%_50%_at_0%_100%,var(--color-green-light)_0%,transparent_55%),var(--color-cream)] before:content-[''] before:absolute before:-top-8 before:-right-16 before:w-80 before:h-80 before:rounded-full before:border-[40px] before:border-terracotta-light before:opacity-50 before:pointer-events-none px-8 pt-16 pb-20">
        <div className="max-w-[640px] animate-fade-up">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-tight text-charcoal mb-4">
            Find trusted<br />
            <em className="not-italic text-terracotta">service providers</em><br />
            in your area.
          </h1>

          <p className="font-body text-lg text-gray-700 mb-8 max-w-[480px] leading-relaxed">
            Book skilled professionals for any job — from home repairs to beauty services — all in one place.
          </p>

          <div className="flex items-center flex-wrap gap-2 mt-3">
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.3)] transition-all duration-150 ease-in-out hover:bg-terracotta-dark hover:shadow-[0_4px_12px_rgba(196,98,45,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Browse Services
            </Link>

            {!user && (
              <Link to="/register" className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-gray-700 bg-transparent border border-gray-300 transition-all duration-150 ease-in-out hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0">
                Get Started
              </Link>
            )}
            {user?.role === 'customer' && (
              <Link to="/dashboard" className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-gray-700 bg-transparent border border-gray-300 transition-all duration-150 ease-in-out hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0">
                My Dashboard
              </Link>
            )}
            {user?.role === 'provider' && (
              <Link to="/provider/dashboard" className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-gray-700 bg-transparent border border-gray-300 transition-all duration-150 ease-in-out hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0">
                Provider Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-gray-700 bg-transparent border border-gray-300 transition-all duration-150 ease-in-out hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Featured Services ── */}
      <section className="max-w-[1100px] mx-auto px-8 py-14 max-sm:px-5">

        {/* Section header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-charcoal relative inline-block after:content-[''] after:block after:w-10 after:h-[3px] after:bg-terracotta after:rounded-full after:mt-1.5">
              Featured Services
            </h2>
            <p className="font-body text-sm text-gray-500 mt-1">Handpicked professionals ready to help</p>
          </div>
          <Link
            to="/search"
            className="font-body text-sm font-semibold text-terracotta hover:text-terracotta-dark transition-colors shrink-0"
          >
            View all →
          </Link>
        </div>

        {/* Cards grid */}
        {loadingFeatured ? (
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-md overflow-hidden border border-gray-200 animate-pulse">
                <div className="w-full h-[140px] bg-gray-200" />
                <div className="p-4 flex flex-col gap-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-md">
            <p className="font-body text-base text-gray-500">No featured services available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
            {featured.map((s, idx) => (
              <div
                key={s._id}
                className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-xs flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-1 group"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Image */}
                <div className="relative overflow-hidden h-[140px] bg-gray-100">
                  {s.images?.[0] ? (
                    <img
                      src={s.images[0]?.startsWith('http') ? s.images[0] : `https://market-place-api-xlwv.onrender.com${s.images[0]}`}
                      alt={s.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cream-dark text-gray-400 font-body text-xs">
                      No preview available
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col gap-1.5">
                  <h4 className="font-display text-base font-semibold text-charcoal leading-tight line-clamp-1">
                    {s.title}
                  </h4>
                  <p className="font-body text-sm font-bold text-terracotta">
                    KES {s.price.toLocaleString()}
                  </p>
                  <p className="font-body text-xs text-gray-500">
                    {/* 🛠️ FIXED: Safely render location object or string properties */}
                    {s.category} · {typeof s.location === 'object' ? s.location?.formattedAddress : s.location}
                  </p>
                  <div className="flex items-center gap-1 font-body text-xs text-gray-500 mt-0.5">
                    <StarRating value={Math.round(s.averageRating)} />
                    <span>({s.totalReviews})</span>
                  </div>
                  <Link
                    to={`/services/${s._id}`}
                    className="mt-3 w-full text-center py-1.5 px-3 font-body text-xs font-semibold rounded-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    View Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/search"
            className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.25)] transition-all duration-150 ease-in-out hover:bg-terracotta-dark hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore All Services
          </Link>
        </div>
      </section>
    </div>
  );
}