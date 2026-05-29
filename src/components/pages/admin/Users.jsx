import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api';
import { Spinner, ErrorMsg, SuccessMsg } from '../../Shared';

export default function AdminUsers() {
  const [users,      setUsers]      = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [msg,        setMsg]        = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // State to hold the user currently viewed in the popup modal
  const [selectedUser, setSelectedUser] = useState(null);

  const load = () => {
    setLoading(true);
    const params = roleFilter ? { role: roleFilter } : {};
    adminAPI.users(params)
      .then(d => { setUsers(d.users); setTotal(d.total); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [roleFilter]);

  const suspend = async (id) => {
    try { const d = await adminAPI.suspendUser(id); setMsg(d.message); load(); }
    catch (e) { setError(e.message); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try { await adminAPI.deleteUser(id); setMsg('User deleted.'); load(); }
    catch (e) { setError(e.message); }
  };

  const BACKEND_URL = 'https://market-place-api-xlwv.onrender.com';
  
  const getUserAvatar = (userItem) => {
    if (userItem?.profileImage) {
      if (userItem.profileImage.startsWith('http')) {
        return userItem.profileImage;
      }
      const cleanImagePath = userItem.profileImage.startsWith('/') 
        ? userItem.profileImage 
        : `/${userItem.profileImage}`;

      return `${BACKEND_URL}${cleanImagePath}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(userItem?.name || 'User')}&background=E3F2FD&color=0D8ABC`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Users <span className="text-sm font-normal text-slate-400">({total})</span>
        </h2>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            Filter by role
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            >
              <option value="">All Types</option>
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
      </div>

      <ErrorMsg msg={error} />
      <SuccessMsg msg={msg} />

      {loading && (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      )}

      {/* Main Responsive Table Wrapper */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-4">
                  <div 
                    className="flex items-center gap-3 cursor-pointer group" 
                    onClick={() => setSelectedUser(u)}
                    title="Click to view full profile details"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center flex-shrink-0 bg-slate-100 shadow-inner">
                      <img 
                        src={getUserAvatar(u)} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=E3F2FD&color=0D8ABC`;
                        }}
                      />
                    </div>
                    <strong className="text-sky-600 group-hover:underline font-semibold">{u.name}</strong>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.email}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isSuspended ? (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                      Suspended
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  {u.role !== 'admin' && (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                          u.isSuspended 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                        onClick={() => suspend(u._id)}
                      >
                        {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                      <button 
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 hover:bg-red-100/80 transition"
                        onClick={() => del(u._id, u.name)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER DETAILS MODAL POPUP */}
      {selectedUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-[fadeIn_0.15s_ease-out]" 
          onClick={() => setSelectedUser(null)}
        >
          <div 
            className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl border border-slate-100 scale-100 transition-all duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
              <h3 className="font-bold text-slate-700 text-base">User Document Card</h3>
              <button 
                className="text-xl leading-none text-slate-400 hover:text-slate-600 transition" 
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 shadow-inner flex-shrink-0 bg-slate-50">
                  <img 
                    src={getUserAvatar(selectedUser)} 
                    alt={selectedUser.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=E3F2FD&color=0D8ABC`;
                    }}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 leading-tight mb-1">{selectedUser.name}</h4>
                  {selectedUser.isSuspended ? (
                    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/10">
                      Suspended Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                      Active Account
                    </span>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Grid Information Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Database Reference ID</label>
                  <p className="font-mono text-xs text-slate-600 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded inline-block select-all">{selectedUser._id}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
                  <p className="text-sm text-slate-700 truncate font-medium">{selectedUser.email}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Account Role Classification</label>
                  <p className="text-sm text-slate-700 font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Phone Number Reference</label>
                  <p className="text-sm text-slate-700 font-medium">{selectedUser.phone || 'Not Provided'}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Operational Base / Location</label>
                  <p className="text-sm text-slate-700 font-medium">{selectedUser.location || 'Not Provided'}</p>
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">System Platform Enrollment</label>
                  <p className="text-sm text-slate-700 font-medium text-xs">
                    {new Date(selectedUser.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">Provider Bio / Summary</label>
                  <p className="text-sm text-slate-600 italic bg-slate-50 border-l-4 border-sky-500 p-3 rounded-r-lg leading-relaxed">
                    {selectedUser.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}