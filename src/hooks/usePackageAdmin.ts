// hooks/usePackageAdmin.js
// Shared data hook for both the Amer queue and the customer's own list.
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1/package-applications`;
<<<<<<< HEAD
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};
=======
>>>>>>> 0bb91c2 (tmmt update frontend)

export function usePackageAdmin({ mine = false } = {}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', q: '' });
<<<<<<< HEAD
const fetchApplications = useCallback(async () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    setLoading(false);
    return;
  }
  setLoading(true);
  try {
    // 🟢 If it's the customer's own list, use /me/list; otherwise use the admin endpoint with filters.
    const url = mine
      ? `${API_BASE}/me/list`
      : `${API_BASE}?status=${filters.status}&q=${encodeURIComponent(filters.q)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.status === 'success') {
      setApplications(data.data.applications || []);
    } else {
      toast.error(data.message || 'Failed to load applications');
    }
  } catch (err) {
    console.error('fetch error:', err);
    toast.error('Could not fetch applications');
  } finally {
    setLoading(false);
  }
}, [mine, filters.status, filters.q]);
 useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const patch = async (id: string, path: string, body: any, okMsg: string) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/${id}${path}`, {
        method: path.includes('status') || path.includes('payment') ? 'PATCH' : 'POST',
=======

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const url = mine
        ? `${API_BASE}/me/list`
        : `${API_BASE}?status=${filters.status}&q=${encodeURIComponent(filters.q)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.status === 'success') {
        setApplications(data.data.applications || []);
      } else {
        toast.error(data.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error('fetch error:', err);
      toast.error('Could not fetch applications');
    } finally {
      setLoading(false);
    }
  }, [mine, filters.status, filters.q]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const patch = async (id, path, body, okMsg) => {
    const token = localStorage.getItem('authToken');
    try {
      const res = await fetch(`${API_BASE}/${id}${path}`, {
        method: path.includes('status') || path.includes('payment') || path.includes('approve') || path.includes('reject') ? 'PATCH' : 'POST',
>>>>>>> 0bb91c2 (tmmt update frontend)
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Request failed');
      if (okMsg) toast.success(okMsg);
<<<<<<< HEAD
      // optimistic refresh of the single record
=======
>>>>>>> 0bb91c2 (tmmt update frontend)
      if (data.data?.application) {
        setApplications((prev) => prev.map((a) => (a._id === id ? data.data.application : a)));
      } else {
        fetchApplications();
      }
      return data.data;
    } catch (e) {
      toast.error(e.message);
      return null;
    }
  };

<<<<<<< HEAD
  const updateStatus = (id: string, status: string, note: string) => patch(id, '/status', { status, note }, `Status updated to ${status.replace(/_/g, ' ')}`);
  const requestDocs = (id, documents, note) => patch(id, '/request-documents', { documents, note }, 'Documents requested');
  const addComment = (id, message) => patch(id, '/comments', { message }, 'Message sent');
  const updatePayment = (id, payload) => patch(id, '/payment', payload, 'Payment updated');

  const userId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}')?._id : null;
  const downloadUrl = (id: string, docId: string) => `${API_BASE}/${id}/documents/${docId}/user/${userId}/download`;

  return {
    applications, loading, filters, setFilters, fetchApplications,
    updateStatus, requestDocs, addComment, updatePayment, downloadUrl,
=======
  const updateStatus = (id, status, note) => patch(id, '/status', { status, note }, `Status updated to ${status.replace(/_/g, ' ')}`);
  const requestDocs = (id, documents, note) => patch(id, '/request-documents', { documents, note }, 'Documents requested');
  const addComment = (id, message) => patch(id, '/comments', { message }, 'Message sent');
  const updatePayment = (id, payload) => patch(id, '/payment', payload, 'Payment updated');
  
  // ─── Document approval ──────────────────────────────────────────────
  const approveDocument = (id, docId) => patch(id, `/documents/${docId}/approve`, {}, 'Document approved ✅');
  
  // ─── Document rejection ──────────────────────────────────────────────
  const rejectDocument = (id, docId, reason) => patch(id, `/documents/${docId}/reject`, { reason }, 'Document rejected ❌');

  // ─── Download URL ──────────────────────────────────────────────────
  const downloadUrl = (id, docId) => `${API_BASE}/${id}/documents/${docId}/download`;

  // ─── Preview URL for images ──────────────────────────────────────
  const previewUrl = (id, docId) => `${API_BASE}/${id}/documents/${docId}/preview`;

  return {
    applications,
    loading,
    filters,
    setFilters,
    fetchApplications,
    updateStatus,
    requestDocs,
    addComment,
    updatePayment,
    downloadUrl,
    previewUrl,
    approveDocument,
    rejectDocument,
>>>>>>> 0bb91c2 (tmmt update frontend)
  };
}