import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen grid place-items-start py-16 px-8 bg-cream relative overflow-hidden bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,var(--color-terracotta-light)_0%,transparent_55%),radial-gradient(ellipse_60%_50%_at_0%_100%,var(--color-green-light)_0%,transparent_55%),var(--color-cream)] before:content-[''] before:absolute before:-top-8 before:-right-16 before:w-80 before:h-80 before:rounded-full before:border-[40px] before:border-terracotta-light before:opacity-50 before:pointer-events-none">
      
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
          {/* Primary Action Button */}
          <Link 
            to="/search" 
            className="inline-flex items-center justify-center gap-1.5 px-7 py-3 font-body text-base font-semibold rounded-md text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.3)] transition-all duration-150 ease-in-out hover:bg-terracotta-dark hover:shadow-[0_4px_12px_rgba(196,98,45,0.4)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Browse Services
          </Link>
          
          {/* Ghost Layout Variants based on Roles */}
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
  );
}