import React from 'react';

export function Spinner() {
  return <p>Loading…</p>;
}

export function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ color: 'red' }}>{msg}</p>;
}

export function SuccessMsg({ msg }) {
  if (!msg) return null;
  return <p style={{ color: 'green' }}>{msg}</p>;
}

export function StatusBadge({ status }) {
  const colors = {
    pending: 'orange',
    accepted: 'blue',
    completed: 'green',
    cancelled: 'red',
  };
  return (
    <span style={{ color: colors[status] || 'black', fontWeight: 'bold' }}>
      {status}
    </span>
  );
}

export function StarRating({ value, max = 5 }) {
  return (
    <span>
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < value ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div>
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
      <span> Page {page} of {pages} </span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}
