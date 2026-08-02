// hooks/usePackageAdmin.js
// Shared data hook for both the Amer queue and the customer's own list.
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1/package-applications`;
const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export function usePackageAdmin({ mine = false } = {}) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', q: '' });

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    setLoading(true);
    try {
      const url =
      //  mine
        // ?
         `${API_BASE}/me/list`
        // : `${API_BASE}?status=${filters.status}&q=${encodeURIComponent(filters.q)}`;
      const res = await fetch(url, {   headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }, });
      const data = await res.json();

      if (data.status === 'success') setApplications(data.data.applications || []);
    } catch {
      toast.error('Failed to load applications');
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Request failed');
      if (okMsg) toast.success(okMsg);
      // optimistic refresh of the single record
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

  const updateStatus = (id: string, status: string, note: string) => patch(id, '/status', { status, note }, `Status updated to ${status.replace(/_/g, ' ')}`);
  const requestDocs = (id, documents, note) => patch(id, '/request-documents', { documents, note }, 'Documents requested');
  const addComment = (id, message) => patch(id, '/comments', { message }, 'Message sent');
  const updatePayment = (id, payload) => patch(id, '/payment', payload, 'Payment updated');

  const userId = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') || '{}')?._id : null;
  const downloadUrl = (id: string, docId: string) => `${API_BASE}/${id}/documents/${docId}/user/${userId}/download`;

  return {
    applications, loading, filters, setFilters, fetchApplications,
    updateStatus, requestDocs, addComment, updatePayment, downloadUrl,
  };
}