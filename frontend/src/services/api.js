const API_BASE_URL = 'http://localhost:3001/api';

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || response.statusText);
  }
  return response.json();
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// ==============================
// Auth & Users
// ==============================

export const loginUser = async (email, password, name = '') => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  return handleResponse(res);
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
};

export const resetPasswordWithToken = async (token, newPassword) => {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword })
  });
  return handleResponse(res);
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
  return handleResponse(res);
};

export const toggleUserAdmin = async (email) => {
  const res = await fetch(`${API_BASE_URL}/users/toggle-admin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
};

export const resetUserPassword = async (email) => {
  const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  return handleResponse(res);
};

// ==============================
// Projects
// ==============================

export const fetchProjects = async () => {
  const res = await fetch(`${API_BASE_URL}/projects`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createProjectDB = async (projectData) => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(res);
};

export const updateProjectDB = async (id, projectData) => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(projectData)
  });
  return handleResponse(res);
};

export const deleteProjectDB = async (id) => {
  const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

// ==============================
// Orders
// ==============================

export const fetchOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, { headers: getHeaders() });
  return handleResponse(res);
};

export const createOrderDB = async (orderData) => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(orderData)
  });
  return handleResponse(res);
};

export const updateOrderDB = async (id, orderData) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(orderData)
  });
  return handleResponse(res);
};

export const deleteOrderDB = async (id) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const addOrderCommentDB = async (id, commentData) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(commentData)
  });
  return handleResponse(res);
};
