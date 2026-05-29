import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ErrorMsg } from '../../Shared';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center py-8 px-4 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,var(--color-terracotta-light)_0%,transparent_60%),radial-gradient(ellipse_50%_40%_at_0%_100%,var(--color-green-light)_0%,transparent_60%),var(--color-cream)]">
      <div className="w-full max-w-[400px] bg-white rounded-lg p-10 shadow-xl max-sm:px-5 max-sm:py-7">
        <h2 className="font-display text-3xl font-semibold text-charcoal mb-1">Welcome back</h2>
        <p className="font-body text-gray-500 mb-7">Sign in to your account</p>
        
        <ErrorMsg msg={error} />
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-semibold text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="you@example.com" 
              className="block w-full px-[14px] py-[10px] box-border font-body text-base text-charcoal bg-white border border-gray-300 rounded-sm outline-none placeholder:text-gray-300 transition-all duration-150 ease-in-out focus:border-terracotta focus:ring-3 focus:ring-terracotta/12 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-semibold text-gray-700">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="••••••••" 
              className="block w-full px-[14px] py-[10px] box-border font-body text-base text-charcoal bg-white border border-gray-300 rounded-sm outline-none placeholder:text-gray-300 transition-all duration-150 ease-in-out focus:border-terracotta focus:ring-3 focus:ring-terracotta/12 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-3 inline-flex items-center justify-center gap-1.5 px-[18px] py-2 font-body text-sm font-semibold border-none rounded-sm cursor-pointer whitespace-nowrap text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.3)] transition-all duration-150 ease-in-out hover:bg-terracotta-dark hover:shadow-[0_4px_12px_rgba(196,98,45,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-5 text-center font-body text-[0.9rem] text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="color-terracotta font-medium no-underline hover:text-terracotta-dark hover:underline transition-colors duration-150">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}