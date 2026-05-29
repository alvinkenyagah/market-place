import React, { useEffect, useState } from 'react';
import { usersAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg } from '../../Shared';

export default function Profile() {
  const [form, setForm]                 = useState({ name: '', phone: '', location: '', bio: '' });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(''); // Local UX image selection mirror
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [currentUser, setCurrentUser]   = useState(null);

  useEffect(() => {
    usersAPI.profile()
      .then(data => {
        const u = data.user;
        setCurrentUser(u);
        setForm({ 
          name: u.name || '', 
          phone: u.phone || '', 
          location: u.location || '',
          bio: u.bio || '' 
        });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Sync file input stream to native browser memory for instant UI previews
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess(''); 
    setSaving(true);
    
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('location', form.location);
      
      if (currentUser?.role === 'provider') {
        fd.append('bio', form.bio);
      }
      
      if (profileImage) fd.append('profileImage', profileImage);
      
      await usersAPI.updateProfile(fd);
      setSuccess('Profile updated successfully.');
      
      // Cleanup preview state context pointer
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] grid place-items-center">
      <Spinner />
    </div>
  );

  const inputStyles = "block w-full px-3.5 py-2.5 font-body text-sm text-charcoal bg-white border border-gray-300 rounded-sm outline-none placeholder:text-gray-400 transition-all focus:border-terracotta focus:ring-3 focus:ring-terracotta/12 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const labelStyles = "font-body text-sm font-semibold text-gray-700";
  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-[1000px] mx-auto p-8 max-sm:p-5 animate-[fadeUp_0.35s_ease_both]">
      
      {/* Settings Header Indicator */}
      <div className="mb-8 pb-5 border-b border-gray-200">
        <h2 className="font-display text-3xl font-bold text-charcoal">Account Settings</h2>
        <p className="font-body text-sm text-gray-500 mt-1">Manage your public marketplace identity profile credentials.</p>
      </div>

      <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
        
        {/* COLUMN 1: Profile Avatar Summary Metadata Panel */}
        <div className="flex flex-col items-center text-center bg-white border border-gray-200 p-6 rounded-md shadow-xs h-fit">
          <div className="relative mb-4 group">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-terracotta" />
            ) : currentUser?.profileImage ? (
              <img src={`http://localhost:5000${currentUser.profileImage}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-cream-dark border-2 border-gray-300 flex items-center justify-center font-display text-3xl font-bold text-charcoal select-none">
                {userInitial}
              </div>
            )}
          </div>

          <h3 className="font-display text-lg font-bold text-charcoal leading-tight truncate w-full">{form.name || 'Anonymous User'}</h3>
          <p className="font-body text-xs text-gray-400 mt-0.5 truncate w-full">{currentUser?.email}</p>
          
          <div className="mt-4 flex gap-2">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full font-body text-xs font-bold uppercase tracking-wider ${
              currentUser?.role === 'admin' ? 'bg-status-cancelled-bg text-status-cancelled' :
              currentUser?.role === 'provider' ? 'bg-green-light text-green-brand' : 'bg-terracotta-light text-terracotta-dark'
            }`}>
              {currentUser?.role}
            </span>
          </div>
        </div>

        {/* COLUMN 2: Core Form Mutation Editor Fields */}
        <div className="col-span-2 bg-white border border-gray-200 p-8 rounded-md shadow-xs max-sm:p-5">
          <ErrorMsg msg={error} />
          <SuccessMsg msg={success} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Display Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputStyles} />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>Phone Number</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+254 700 000 000" className={inputStyles} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelStyles}>Primary Location Hub</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Nairobi, Kenya" className={inputStyles} />
            </div>

            {/* Provider Bio Text Block Configuration */}
            {currentUser?.role === 'provider' && (
              <div className="flex flex-col gap-1.5">
                <label className={labelStyles}>About Me (Bio)</label>
                <textarea 
                  value={form.bio} 
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} 
                  placeholder="Describe your professional skill milestones, workspace parameters, or common operating hourly rates..." 
                  className={`${inputStyles} resize-y min-h-[100px]`}
                  rows={4}
                  maxLength={500}
                />
                <div className="text-right font-body text-xs text-gray-400 mt-0.5">
                  <span className={form.bio.length >= 450 ? 'text-status-cancelled font-semibold' : ''}>{form.bio.length}</span> / 500 characters
                </div>
              </div>
            )}

            {/* Enhanced File Selector Upload Layout */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
              <label className={labelStyles}>Change Profile Image</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="block w-full font-body text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-cream file:text-charcoal file:cursor-pointer hover:file:bg-cream-dark" 
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button 
                type="submit" 
                disabled={saving} 
                className="px-6 py-2.5 font-body text-sm font-semibold rounded-sm text-white bg-terracotta shadow-[0_2px_8px_rgba(196,98,45,0.25)] hover:bg-terracotta-dark hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all cursor-pointer"
              >
                {saving ? 'Saving changes…' : 'Save Details'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}