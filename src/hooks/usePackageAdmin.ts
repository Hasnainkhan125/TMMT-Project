// hooks/usePackageAdmin.js
// Shared data hook for both the Amer queue and the customer's own list.
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1/package-applications`;

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export function usePackageAdmin({ mine = false } = {}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', q: '' });

  // ─── FETCH APPLICATIONS ──────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // If it's the customer's own list, use /me/list; otherwise use the admin endpoint with filters.
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

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // ─── PATCH HELPER ──────────────────────────────────────────────────
  const patch = useCallback(async (id, path, body, okMsg) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Not authenticated');
      return null;
    }

    try {
      // Determine HTTP method based on path
      const method =
        path.includes('status') ||
        path.includes('payment') ||
        path.includes('approve') ||
        path.includes('reject')
          ? 'PATCH'
          : 'POST';

      const res = await fetch(`${API_BASE}/${id}${path}`, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Request failed');
      }

      if (okMsg) toast.success(okMsg);

      // Optimistic refresh of the single record
      if (data.data?.application) {
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? data.data.application : a))
        );
      } else {
        fetchApplications();
      }

      return data.data;
    } catch (e) {
      toast.error(e.message);
      return null;
    }
  }, [fetchApplications]);

  // ─── ADMIN ACTIONS ──────────────────────────────────────────────────
  const updateStatus = useCallback(
    (id, status, note) =>
      patch(id, '/status', { status, note }, `Status updated to ${status.replace(/_/g, ' ')}`),
    [patch]
  );

  const requestDocs = useCallback(
    (id, documents, note) =>
      patch(id, '/request-documents', { documents, note }, 'Documents requested'),
    [patch]
  );

  const addComment = useCallback(
    (id, message) =>
      patch(id, '/comments', { message }, 'Message sent'),
    [patch]
  );

  const updatePayment = useCallback(
    (id, payload) =>
      patch(id, '/payment', payload, 'Payment updated'),
    [patch]
  );

  // ─── DOCUMENT APPROVAL ──────────────────────────────────────────────
  const approveDocument = useCallback(
    (id, docId) =>
      patch(id, `/documents/${docId}/approve`, {}, 'Document approved ✅'),
    [patch]
  );

  // ─── DOCUMENT REJECTION ──────────────────────────────────────────────
  const rejectDocument = useCallback(
    (id, docId, reason) =>
      patch(id, `/documents/${docId}/reject`, { reason }, 'Document rejected ❌'),
    [patch]
  );

  // ─── DOWNLOAD URL ──────────────────────────────────────────────────
  const downloadUrl = useCallback((id, docId) => {
    const userId = localStorage.getItem('userData')
      ? JSON.parse(localStorage.getItem('userData') || '{}')?._id
      : null;
    return `${API_BASE}/${id}/documents/${docId}/user/${userId}/download`;
  }, []);

  // ─── PREVIEW URL FOR IMAGES ──────────────────────────────────────
  const previewUrl = useCallback((id, docId) => {
    return `${API_BASE}/${id}/documents/${docId}/preview`;
  }, []);

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
  };
}