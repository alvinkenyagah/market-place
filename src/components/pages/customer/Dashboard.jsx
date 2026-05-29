import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();

  // Unified link configuration matrix to map cleaner layouts
  const dashboardActions = [
    {
      title: 'Browse Services',
      description: 'Find and book top-rated service providers in your area instantly.',
      to: '/search',
      icon: (
        <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      bgAccent: 'bg-terracotta-light'
    },
    {
      title: 'My Bookings',
      description: 'Track ongoing tasks, review receipts, and check your service history.',
      to: '/my-bookings',
      icon: (
        <svg className="w-6 h-6 text-green-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      bgAccent: 'bg-green-light'
    },
    {
      title: 'Account Settings',
      description: 'Update your contact phone, preferred location details, and security passwords.',
      to: '/profile',
      icon: (
        <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      bgAccent: 'bg-gold-light'
    }
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-8 max-sm:p-5 animate-[fadeUp_0.35s_ease_both]">
      
      {/* Dashboard Welcoming Header Block Section */}
      <div className="mb-10 pb-6 border-b border-gray-200">
        <h2 className="font-display text-4xl font-bold text-charcoal tracking-tight mb-2 max-sm:text-3xl">
          Welcome back, <span className="text-terracotta italic font-normal">{user?.name || 'Client'}</span>!
        </h2>
        <p className="font-body text-base text-gray-500">
          What would you like to take care of in your marketplace ecosystem today?
        </p>
      </div>

      {/* Main Grid Interactive Command Hub Section */}
      <div>
        <h3 className="font-body text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">
          Quick Actions Shortcuts
        </h3>
        
        <div className="grid grid-cols-3 gap-5 max-md:grid-cols-2 max-sm:grid-cols-1">
          {dashboardActions.map((action, i) => (
            <Link 
              key={i} 
              to={action.to} 
              className="group bg-white rounded-md p-6 border border-gray-200 no-underline shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-1"
            >
              <div>
                {/* Dynamically styled custom asset ring enclosure icon */}
                <div className={`w-12 h-12 rounded-sm ${action.bgAccent} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  {action.icon}
                </div>
                
                <h4 className="font-display text-lg font-bold text-charcoal mb-2 group-hover:text-terracotta transition-colors">
                  {action.title}
                </h4>
                
                <p className="font-body text-sm text-gray-500 leading-relaxed">
                  {action.description}
                </p>
              </div>

              {/* Inline layout anchor target direction badge indicator link label */}
              <div className="mt-6 flex items-center gap-1 font-body text-xs font-bold text-terracotta group-hover:translate-x-1 transition-transform duration-150">
                Open Utility <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}