import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg } from '../../Shared';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [msg,      setMsg]      = useState('');

  // UI Search, Filtering, and Custom Modal State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null); // stores { id, title }
  
  // 🆕 Suspension Tracking Modal State
  const [suspendTarget, setSuspendTarget] = useState(null); // stores { id, title, isAdminSuspended }
  const [suspensionNote, setSuspensionNote] = useState('');

  const load = () => {
    setLoading(true);
    adminAPI.services()
      .then(d => { setServices(d.services || []); setTotal(d.total || 0); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminAPI.removeService(deleteTarget.id);
      setMsg(`Service "${deleteTarget.title}" was successfully removed.`);
      setDeleteTarget(null);
      load();
    } catch (e) {
      setError(e.message);
      setDeleteTarget(null);
    }
  };

  // 🆕 Suspension Handler
  const handleConfirmSuspension = async () => {
    if (!suspendTarget) return;
    try {
      await adminAPI.suspendService(suspendTarget.id, { note: suspensionNote });
      const actionText = suspendTarget.isAdminSuspended ? 'reactivated' : 'suspended';
      setMsg(`Service "${suspendTarget.title}" was successfully ${actionText}.`);
      setSuspendTarget(null);
      setSuspensionNote('');
      load();
    } catch (e) {
      setError(e.message);
      setSuspendTarget(null);
      setSuspensionNote('');
    }
  };

  // Filtered array processing pipeline
  const filteredServices = services.filter(s => {
    const matchesSearch = 
      s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.providerId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && s.isActive && !s.isAdminSuspended) || 
      (statusFilter === 'inactive' && !s.isActive) ||
      (statusFilter === 'suspended' && s.isAdminSuspended); // 🆕 Added filter route

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-charcoal antialiased">
      
      {/* Header and Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/60 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">All Marketplace Services</h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Managing <span className="text-terracotta font-bold">{total}</span> total listings registered across your platform
          </p>
        </div>

        {/* Dynamic Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Real-time Search */}
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400 pointer-events-none text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search title, category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 placeholder-stone-400 shadow-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta transition outline-none"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm rounded-xl border border-stone-200 bg-white px-3 py-2 font-medium text-stone-700 shadow-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta transition outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="suspended">Suspended by Admin</option>
          </select>
        </div>
      </div>

      <ErrorMsg msg={error} />
      <SuccessMsg msg={msg} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : filteredServices.length === 0 ? (
        /* Enhanced UX Empty State Feedback block */
        <div className="bg-white rounded-2xl border border-dashed border-stone-200 p-12 text-center shadow-xs">
          <div className="text-3xl mb-2">🛠️</div>
          <h4 className="text-base font-bold text-stone-700">No matching services discovered</h4>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Try adjusting your structural keywords, clearing search prompts, or switching visibility filters.
          </p>
        </div>
      ) : (
        /* Main Responsive Data Display Grid Layout */
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
          <table className="w-full border-collapse text-left text-sm text-stone-600">
            <thead className="bg-stone-50/70 text-xs font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Provider / Owner</th>
                <th className="px-6 py-4">Category classification</th>
                <th className="px-6 py-4">Standard Rate</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredServices.map(s => (
                <tr key={s._id} className="hover:bg-cream/40 transition-colors group">
                  <td className="px-6 py-4 font-bold text-stone-800 text-base tracking-tight max-w-xs truncate">
                    {s.title}
                    {s.isAdminSuspended && s.suspensionNote && (
                      <p className="text-[11px] text-amber-600 font-normal mt-0.5 truncate max-w-xs" title={s.suspensionNote}>
                        Note: {s.suspensionNote}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-600 font-medium">
                    {s.providerId?.name || <span className="text-xs text-stone-400 italic font-normal">Unknown Provider</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600 capitalize">
                      {s.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-base font-extrabold text-earthGreen">KES {s.price}</span>
                  </td>
                  <td className="px-6 py-4">
                    {s.isAdminSuspended ? (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Suspended
                      </span>
                    ) : s.isActive ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-stone-50 px-2.5 py-1 text-xs font-bold text-stone-400 ring-1 ring-inset ring-stone-600/10">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle Button for Suspend / Reactivate */}
                      <button
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition duration-150 shadow-xs ${
                          s.isAdminSuspended 
                            ? 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white hover:border-amber-600'
                            : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-amber-600 hover:text-white hover:border-amber-600'
                        }`}
                        onClick={() => setSuspendTarget({ id: s._id, title: s.title, isAdminSuspended: s.isAdminSuspended })}
                      >
                        {s.isAdminSuspended ? 'Lift Suspension' : 'Suspend'}
                      </button>

                      <button
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xs transition duration-150"
                        onClick={() => setDeleteTarget({ id: s._id, title: s.title })}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🆕 SUSPENSION TOGGLE MODAL OVERLAY */}
      {suspendTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => { setSuspendTarget(null); setSuspensionNote(''); }}
        >
          <div 
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-stone-100 p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl text-amber-600">
              🛡️
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">
                {suspendTarget.isAdminSuspended ? 'Lift Service Suspension?' : 'Suspend Service Listing?'}
              </h3>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                {suspendTarget.isAdminSuspended 
                  ? `Are you sure you want to reinstate "${suspendTarget.title}"? It will instantly return to the public marketplace list.`
                  : `Are you sure you want to hide "${suspendTarget.title}"? Public access will be revoked immediately.`
                }
              </p>
            </div>

            {/* Render Reason Text Field only when placing a new suspension */}
            {!suspendTarget.isAdminSuspended && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">Reason for Suspension (optional):</label>
                <textarea
                  value={suspensionNote}
                  onChange={e => setSuspensionNote(e.target.value)}
                  placeholder="e.g., Pricing violation or inadequate descriptions..."
                  rows={3}
                  className="w-full text-sm p-3 rounded-xl border border-stone-200 bg-white text-stone-700 shadow-xs focus:border-terracotta focus:ring-1 focus:ring-terracotta transition outline-none resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-bold text-stone-500 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
                onClick={() => { setSuspendTarget(null); setSuspensionNote(''); }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition ${
                  suspendTarget.isAdminSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
                onClick={handleConfirmSuspension}
              >
                {suspendTarget.isAdminSuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAILWIND DESIGN CONFIRMATION MODAL OVERLAY */}
      {deleteTarget && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => setDeleteTarget(null)}
        >
          <div 
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl border border-stone-100 p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-xl text-red-600">
              ⚠️
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-lg">Remove Service Listing?</h3>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Are you sure you want to completely erase <span className="font-semibold text-stone-800">"{deleteTarget.title}"</span>? Customers will lose access instantly. This action is irreversible.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm font-bold text-stone-500 bg-stone-100 rounded-xl hover:bg-stone-200 transition"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition"
                onClick={handleConfirmDelete}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}