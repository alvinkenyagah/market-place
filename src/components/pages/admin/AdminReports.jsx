import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api';
import { Spinner, ErrorMsg } from '../../Shared';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Operational confirmation action tracking states
  const [processingId, setProcessingId] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const reasonsList = ['Harassment', 'Fraud or Scam', 'Poor Quality / Unprofessionalism', 'Late / No Show', 'Other'];

  const fetchReports = () => {
    setLoading(true);
    setError('');
    const params = { page, limit: 10 };
    if (filterReason) params.reason = filterReason;

    adminAPI.getReports(params)
      .then(res => {
        setReports(res.reports || []);
        setTotalPages(res.totalPages || 1);
      })
      .catch(err => setError(err.message || 'Failed to fetch reports panel listings.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [page, filterReason]);

  const handleToggleSuspend = async (providerId) => {
    if (!window.confirm('Are you sure you want to change this provider\'s platform access status?')) return;
    setProcessingId(providerId);
    setActionSuccessMsg('');
    try {
      const res = await adminAPI.toggleUserSuspension(providerId);
      setActionSuccessMsg(res.message || 'Provider suspension state altered successfully.');
      fetchReports(); // Refresh payload array states
    } catch (err) {
      alert(err.message || 'Error occurred updating user restrictions status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (providerId) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to completely erase this user account? This cannot be undone.')) return;
    setProcessingId(providerId);
    setActionSuccessMsg('');
    try {
      const res = await adminAPI.deleteUserAccount(providerId);
      setActionSuccessMsg(res.message || 'User profile purged completely.');
      fetchReports();
    } catch (err) {
      alert(err.message || 'Error executing complete account erasure.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismissReport = async (reportId) => {
    if (!window.confirm('Dismiss this issue record card? This takes no platform action against the provider.')) return;
    setProcessingId(reportId);
    setActionSuccessMsg('');
    try {
      const res = await adminAPI.dismissReport(reportId);
      setActionSuccessMsg(res.message || 'Report dismissed.');
      fetchReports();
    } catch (err) {
      alert(err.message || 'Error removing the report element.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans antialiased text-slate-800">
      
      {/* Header View Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Provider Grievance Reports</h2>
          <p className="text-sm text-slate-500 mt-1">Audit flags, check safety incidents, and manage platform restrictions.</p>
        </div>
        
        {/* Quick Filter Selection Menu */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Filter Cause:</label>
          <select
            value={filterReason}
            onChange={(e) => { setFilterReason(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950 text-xs font-semibold text-slate-700 transition"
          >
            <option value="">All Categories</option>
            {reasonsList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Action System Alert banner elements */}
      {actionSuccessMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center justify-between shadow-xs">
          <span>✓ {actionSuccessMsg}</span>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Main Core Section State Loading Controllers */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      ) : error ? (
        <ErrorMsg msg={error} />
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <p className="text-slate-400 font-medium text-base">No open grievance reports found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const isSuspended = report.providerId?.isSuspended;
            const targetMissing = !report.providerId;

            return (
              <div 
                key={report._id} 
                className={`bg-white border rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-start justify-between gap-6 transition hover:shadow-md ${
                  isSuspended ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Core Context Split Frame Panel */}
                <div className="space-y-4 flex-1">
                  
                  {/* Meta tag identity details block */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200/20 text-3xs font-extrabold uppercase tracking-wider rounded-md">
                      {report.reason}
                    </span>
                    <span className="text-3xs font-medium text-slate-400">
                      Filed: {new Date(report.createdAt).toLocaleString()}
                    </span>
                    {isSuspended && (
                      <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-3xs font-bold uppercase tracking-wider rounded-md">
                        Currently Suspended
                      </span>
                    )}
                    {targetMissing && (
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-3xs font-bold uppercase tracking-wider rounded-md">
                        User Already Account Cleared
                      </span>
                    )}
                  </div>

                  {/* Operational Stakeholders involved details layout section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-3xs tracking-wider mb-1">Target Accused Provider</span>
                      {!targetMissing ? (
                        <div>
                          <p className="font-bold text-slate-900">{report.providerId.name}</p>
                          <p className="text-slate-500 font-medium">{report.providerId.email}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">User profile missing / removed</p>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold uppercase text-3xs tracking-wider mb-1">Reporter Reference User</span>
                      {report.reporterId ? (
                        <div>
                          <p className="font-bold text-slate-900">{report.reporterId.name}</p>
                          <p className="text-slate-500 font-medium">{report.reporterId.email}</p>
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Anonymous or deleted request client account</p>
                      )}
                    </div>
                  </div>

                  {/* Explicit Textual Context Body Block layout */}
                  <div className="space-y-1">
                    <span className="text-slate-400 block font-semibold uppercase text-3xs tracking-wider">Complaint Context Narrative Details</span>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white border border-slate-100 p-3 rounded-xl shadow-inner whitespace-pre-line">
                      "{report.description}"
                    </p>
                  </div>
                </div>

                {/* Dashboard Operations Modification Commands Container Panel Grid */}
                <div className="flex sm:flex-row lg:flex-col items-stretch justify-end gap-2 lg:w-48 self-center lg:self-start w-full shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* Toggle Lock Account Restriction Capability Trigger control handle */}
                  {!targetMissing && (
                    <button
                      onClick={() => handleToggleSuspend(report.providerId._id)}
                      disabled={processingId !== null}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition duration-150 text-center flex-1 ${
                        isSuspended 
                          ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                          : 'bg-slate-950 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {processingId === report.providerId._id ? 'Updating...' : isSuspended ? '🔓 Unsuspend' : '🔒 Suspend Profile'}
                    </button>
                  )}

                  {/* Absolute Target Account Deletion Management Control Block */}
                  {!targetMissing && (
                    <button
                      onClick={() => handleDeleteUser(report.providerId._id)}
                      disabled={processingId !== null}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition duration-150 text-center flex-1"
                    >
                      {processingId === report.providerId._id ? 'Purging...' : '🗑️ Delete Account'}
                    </button>
                  )}

                  {/* Wipe/Dismiss this simple notification item report element trigger block logic */}
                  <button
                    onClick={() => handleDismissReport(report._id)}
                    disabled={processingId !== null}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition duration-150 text-center flex-1"
                  >
                    {processingId === report._id ? 'Dismissing...' : '✓ Dismiss Flag'}
                  </button>

                </div>
              </div>
            );
          })}

          {/* Simple Pagination Footer Controller Layout Nav Row */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                &larr; Previous
              </button>
              
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200/50">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}