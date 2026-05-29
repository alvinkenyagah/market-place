import React, { useEffect, useState } from 'react';
import { servicesAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg } from '../../Shared';

function ServiceModal({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { title: '', description: '', category: '', price: '', location: '' });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const BACKEND_URL = 'http://localhost:5000';

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRemoveExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);

    if (existingImages.length + images.length > 4) {
      setError(`A service can have a maximum of 4 images. You currently have ${existingImages.length} saved and ${images.length} selected.`);
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      if (initial?._id) {
        existingImages.forEach(img => fd.append('existingImages', img));
        await servicesAPI.update(initial._id, fd);
      } else {
        await servicesAPI.create(fd);
      }
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#1C1917]/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl border border-[#E7E5E4] w-full max-w-2xl overflow-hidden my-8 transform transition-all animate-scaleUp">
        
        {/* Modal Sticky Header Container */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF7F2] border-b border-[#E7E5E4]">
          <h3 className="text-lg font-black text-[#1C1917]">
            {initial?._id ? '✏️ Edit Service Listing' : '✨ Create New Service'}
          </h3>
          <button 
            onClick={onCancel}
            className="text-[#78716C] hover:text-[#1C1917] text-2xl font-semibold transition"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Window Area */}
        <form onSubmit={submit} className="p-6 space-y-5 max-h-[calc(100vh-160px)] overflow-y-auto">
          {error && <ErrorMsg msg={error} />}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Service Title</label>
              <input 
                className="w-full px-3 py-2 bg-white border border-[#D6D3D1] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] transition"
                value={form.title} 
                onChange={set('title')} 
                placeholder="e.g., Professional House Plumbing"
                required 
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Category</label>
              <input 
                className="w-full px-3 py-2 bg-white border border-[#D6D3D1] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] transition"
                value={form.category} 
                onChange={set('category')} 
                placeholder="e.g., Home Repairs"
                required 
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Location</label>
              <input 
                className="w-full px-3 py-2 bg-white border border-[#D6D3D1] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] transition"
                value={form.location} 
                onChange={set('location')} 
                placeholder="e.g., Nairobi, CBD"
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Description</label>
            <textarea 
              className="w-full px-3 py-2 bg-white border border-[#D6D3D1] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] transition placeholder-[#78716C]/60"
              value={form.description} 
              onChange={set('description')} 
              placeholder="Provide a detailed description of what your service includes..."
              required 
              rows={3} 
            />
          </div>

          <div className="flex flex-col gap-1 max-w-xs">
            <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Price (KES)</label>
            <div className="relative rounded-lg shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-[#78716C] text-xs font-bold">KES</span>
              </div>
              <input 
                type="number" 
                min={0} 
                className="w-full pl-12 pr-3 py-2 bg-white border border-[#D6D3D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-[#C4622D] text-sm text-[#1C1917] font-semibold transition"
                value={form.price} 
                onChange={set('price')} 
                required 
              />
            </div>
          </div>

          {initial?._id && existingImages.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Current Images</label>
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-[#E7E5E4] bg-[#FAF7F2]">
                    <img src={`${BACKEND_URL}${img}`} alt="" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      className="absolute top-1 right-1 bg-[#991B1B] text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md text-xs font-bold"
                      onClick={() => handleRemoveExistingImage(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#44403C] uppercase tracking-wider">Catalog Asset Upload</label>
            <div className="mt-1 flex justify-center px-6 py-4 border-2 border-[#D6D3D1] border-dashed rounded-xl bg-[#FAF7F2] relative group cursor-pointer">
              <div className="text-center pointer-events-none space-y-1">
                <span className="text-[#C4622D] font-bold text-xs">Upload Files</span>
                <p className="text-3xs text-[#78716C] uppercase tracking-wide">PNG, JPG up to 4 total</p>
              </div>
              <input 
                type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                onChange={e => setImages(Array.from(e.target.files))} 
              />
            </div>
            {images.length > 0 && (
              <p className="text-3xs font-bold uppercase text-[#2A5C3F] tracking-wide mt-1">✓ {images.length} new attachments staged.</p>
            )}
          </div>

          {/* Modal Actions Footer Panel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E7E5E4] bg-white">
            <button 
              type="button" 
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#44403C] bg-white border border-[#D6D3D1] rounded-lg hover:bg-[#FAF7F2] transition" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#C4622D] hover:bg-[#9E4E22] rounded-lg shadow-xs transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, data: null });

  const load = () => {
    setLoading(true);
    servicesAPI.my()
      .then(d => setServices(d.services || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this service listing?')) return;
    try { 
      await servicesAPI.delete(id); 
      setMsg('Service listing removed successfully.'); 
      load(); 
    } catch (e) { 
      setError(e.message); 
    }
  };

  const handleSave = () => { 
    setModalState({ isOpen: false, data: null }); 
    setMsg('Service changes indexed and updated successfully!'); 
    load(); 
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] antialiased py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Main Workspace Row Bar Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#E7E5E4] gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1C1917]">My Services</h2>
            <p className="mt-1 text-sm font-medium text-[#78716C]">Manage and track active catalog instances across your market areas.</p>
          </div>
          <button 
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#C4622D] hover:bg-[#9E4E22] rounded-lg shadow-xs transition shrink-0" 
            onClick={() => setModalState({ isOpen: true, data: null })}
          >
            <span className="mr-1.5 text-sm font-black">+</span> Add New Service
          </button>
        </div>

        {/* Global Banner Messages */}
        {(error || msg) && (
          <div className="space-y-2">
            {error && <ErrorMsg msg={error} />}
            {msg && <SuccessMsg msg={msg} />}
          </div>
        )}

        {/* Master Micro Service List Feed Framework */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Spinner />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E7E5E4] max-w-md mx-auto shadow-xs">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-[#44403C] font-bold text-base">No active listings configured</p>
            <p className="text-xs text-[#78716C] mt-1">Create configurations to map workflow timelines onto the platform database.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E7E5E4] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-[#44403C]">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E7E5E4] text-3xs font-bold uppercase tracking-wider text-[#78716C]">
                    <th className="px-6 py-4">Service Details</th>
                    <th className="px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Location</th>
                    <th className="px-6 py-4">Est Rate</th>
                    <th className="px-6 py-4">Visibility</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {services.map(s => (
                    <tr key={s._id} className="hover:bg-[#FAF7F2]/50 transition duration-150 group">
                      <td className="px-6 py-4">
                        <span className="block text-sm font-bold text-[#1C1917] group-hover:text-[#C4622D] transition truncate max-w-xs">
                          {s.title}
                        </span>
                        <span className="block text-xs text-[#78716C] line-clamp-1 max-w-xs mt-0.5 md:hidden">
                          {s.category} &bull; {s.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell font-medium text-[#78716C]">{s.category}</td>
                      <td className="px-6 py-4 hidden sm:table-cell font-medium text-[#78716C]">{s.location}</td>
                      <td className="px-6 py-4 font-bold text-[#1C1917]">KES {s.price}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-3xs font-bold uppercase tracking-wider border ${
                          s.isActive ? 'bg-[#E4EFE9] text-[#2A5C3F] border-[#2A5C3F]/10' : 'bg-[#F5F5F4] text-[#78716C] border-[#E7E5E4]'
                        }`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            className="px-2.5 py-1.5 text-3xs font-bold uppercase tracking-wider text-[#44403C] bg-white border border-[#D6D3D1] rounded-md shadow-2xs hover:bg-[#FAF7F2] transition" 
                            onClick={() => setModalState({ isOpen: true, data: s })}
                          >
                            Edit
                          </button>
                          <button 
                            className="px-2.5 py-1.5 text-3xs font-bold uppercase tracking-wider text-[#991B1B] bg-[#FEE2E2]/30 border border-[#FEE2E2] rounded-md hover:bg-[#FEE2E2] transition" 
                            onClick={() => deleteService(s._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Isolated Contextual Overlay Form Render Slot */}
        {modalState.isOpen && (
          <ServiceModal 
            initial={modalState.data} 
            onSave={handleSave} 
            onCancel={() => setModalState({ isOpen: false, data: null })} 
          />
        )}

      </div>
    </div>
  );
}