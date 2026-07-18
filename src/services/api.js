const BASE_URL = import.meta.env.VITE_API_URL || 'https://market-place-api-xlwv.onrender.com/api';
const getToken = () => localStorage.getItem('token');

const headers = (isFormData = false) => {
  const h = {};
  if (!isFormData) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
};

const request = async (method, path, body = null, isFormData = false) => {
  const opts = { method, headers: headers(isFormData) };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login: (body) => request('POST', '/auth/login', body),
  logout: () => request('POST', '/auth/logout'),
  me: () => request('GET', '/auth/me'),
};

// Services
export const servicesAPI = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/services${q ? '?' + q : ''}`);
  },
  get: (id) => request('GET', `/services/${id}`),
  my: () => request('GET', '/services/provider/my'),
  create: (form) => request('POST', '/services', form, true),
  update: (id, form) => request('PUT', `/services/${id}`, form, true),
  delete: (id) => request('DELETE', `/services/${id}`),
};

// Bookings
export const bookingsAPI = {
  create: (body) => request('POST', '/bookings', body),
  myCustomer: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/bookings/customer${q ? '?' + q : ''}`);
  },
  myProvider: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/bookings/provider${q ? '?' + q : ''}`);
  },
  get: (id) => request('GET', `/bookings/${id}`),
  updateStatus: (id, status) => request('PATCH', `/bookings/${id}/status`, { status }),
};

// Reviews
export const reviewsAPI = {
  create: (body) => request('POST', '/reviews', body),
  forService: (serviceId) => request('GET', `/reviews/service/${serviceId}`),
  forProvider: (providerId) => request('GET', `/reviews/provider/${providerId}`),
};

// Users
export const usersAPI = {
  profile: () => request('GET', '/users/profile'),
  updateProfile: (form) => request('PUT', '/users/profile', form, true),
  getUser: (id) => request('GET', `/users/${id}`),
};

// Chats & Messages
export const chatsAPI = {
  createInquiry: (body) => request('POST', '/chats/inquiry', body),
  listConversations: () => request('GET', '/chats'),
  getMessages: (chatId) => request('GET', `/chats/${chatId}/messages`),
};

// Admin
export const adminAPI = {
  dashboard: () => request('GET', '/admin/dashboard'),
  users: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/admin/users${q ? '?' + q : ''}`);
  },
  suspendUser: (id) => request('PATCH', `/admin/users/${id}/suspend`),
  deleteUser: (id) => request('DELETE', `/admin/users/${id}`),
  services: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/admin/services${q ? '?' + q : ''}`);
  },
  removeService: (id) => request('DELETE', `/admin/services/${id}`),
  
  // Toggle service suspension with optional notes payload
  suspendService: (id, body) => request('PATCH', `/admin/services/${id}/suspend`, body),
  
  bookings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/admin/bookings${q ? '?' + q : ''}`);
  },

  getReports: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/admin/reports${q ? '?' + q : ''}`);
  },
  dismissReport: (id) => {
    return request('DELETE', `/admin/reports/${id}`);
  },
  toggleUserSuspension: (id) => {
    return request('PATCH', `/admin/users/${id}/suspend`);
  },
  deleteUserAccount: (id) => {
    return request('DELETE', `/admin/users/${id}`);
  }
};

// Compliance Reports
export const reportsAPI = {
  create: (reportData) => {
    return request('POST', '/reports', reportData);
  }
};



