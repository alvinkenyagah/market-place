import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ErrorMsg } from '../../Shared';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    role: 'customer', 
    phone: '', 
    location: '' 
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  // UX Check: Check if password inputs match in real time
  const passwordsMatch = form.password === form.confirmPassword;
  const hasTypedBothPasswords = form.password.length > 0 && form.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Exclude confirmPassword before sending payloads to the backend API
      const { confirmPassword, ...registrationPayload } = form;
      const user = await register(registrationPayload);
      
      if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isProvider = form.role === 'provider';

  // Shared classes for form inputs to ensure visual harmony
  const inputStyles = "block w-full px-[14px] py-[10px] box-border font-body text-base text-charcoal bg-white border border-gray-300 rounded-sm outline-none placeholder:text-gray-300 transition-all duration-150 ease-in-out focus:border-terracotta focus:ring-3 focus:ring-terracotta/12 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";
  const labelStyles = "font-body text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-screen grid place-items-center py-12 px-4 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,var(--color-terracotta-light)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_0%_100%,var(--color-green-light)_0%,transparent_60%),var(--color-cream)] transition-all duration-300">
      <div className={`w-full bg-white rounded-lg p-10 shadow-xl max-sm:px-5 max-sm:py-7 transition-all duration-300 ${isProvider ? 'max-w-[760px]' : 'max-w-[440px]'}`}>
        
        <h2 className="font-display text-3xl font-semibold text-charcoal mb-1">Create Account</h2>
        <p className="font-body text-gray-500 mb-7">Join the Sokoni marketplace today</p>
        
        <ErrorMsg msg={error} />
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Layout Splitter: Becomes two-column side-by-side layout for providers, single column for customers */}
          <div className={`grid gap-4 ${isProvider ? 'grid-cols-2 max-md:grid-cols-1' : 'grid-cols-1'}`}>
            
            {/* COLUMN 1: Core Authentication Data */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Full Name</label>
                <input value={form.name} onChange={set('name')} required placeholder="Jane Doe" className={inputStyles} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Email</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" className={inputStyles} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Password</label>
                <input type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="Min. 6 characters" className={inputStyles} />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className={labelStyles}>Confirm Password</label>
                  {hasTypedBothPasswords && (
                    <span className={`text-xs font-bold font-body tracking-wide ${passwordsMatch ? 'text-green-brand' : 'text-status-cancelled'}`}>
                      {passwordsMatch ? '✓ MATCH' : '✗ MISMATCH'}
                    </span>
                  )}
                </div>
                <input 
                  type="password" 
                  value={form.confirmPassword} 
                  onChange={set('confirmPassword')} 
                  required 
                  minLength={6} 
                  placeholder="Repeat your password" 
                  className={`${inputStyles} ${hasTypedBothPasswords && !passwordsMatch ? 'border-status-cancelled focus:border-status-cancelled focus:ring-status-cancelled-bg' : ''}`} 
                />
              </div>
            </div>

            {/* COLUMN 2: Marketplace Roles & Context Metadata */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>I am a…</label>
                <select value={form.role} onChange={set('role')} className={`${inputStyles} cursor-pointer py-[11px]`}>
                  <option value="customer">Customer (Looking to Book)</option>
                  <option value="provider">Service Provider (Offering Skills)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Phone Number</label>
                <input value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" className={inputStyles} required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Location</label>
                <input value={form.location} onChange={set('location')} placeholder="Nairobi" className={inputStyles} required />
              </div>

              {/* UX Hint: Help service providers understand the platform structure right when they choose their account variant */}
              {isProvider && (
                <div className="p-3 bg-green-light rounded-sm border border-green-brand/10 mt-auto animate-[fadeUp_0.2s_ease_both]">
                  <p className="font-body text-xs text-green-brand leading-normal">
                    💡 <strong>Provider Option Selected:</strong> After signing up, you can list your services, set pricing milestones, and configure your gallery space directly from your new dashboard view.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Action Footer Control Block */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 inline-flex items-center justify-center gap-1.5 px-[18px] py-3 font-body text-base font-semibold border-none rounded-sm cursor-pointer whitespace-nowrap text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.3)] transition-all duration-150 ease-in-out hover:bg-terracotta-dark hover:shadow-[0_4px_12px_rgba(196,98,45,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center font-body text-[0.9rem] text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-terracotta font-medium no-underline hover:text-terracotta-dark hover:underline transition-colors duration-150">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}