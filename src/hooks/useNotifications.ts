import { useCallback, useEffect, useState } from 'react';

type Notification = {
  _id: string;
  applicationId?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'docs_required' | 'status_update' | 'payment';
  title?: string;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: string;
};

export const useNotifications = () => {
  const apiBase = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${apiBase}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to load notifications');
      setNotifications(data?.data?.notifications || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [apiBase, token]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${apiBase}/api/v1/notifications/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch {}
  }, [apiBase, token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  return { notifications, loading, error, fetchNotifications, markAsRead };
};


