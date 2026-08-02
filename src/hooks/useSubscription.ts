// src/hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';

export interface CurrentSubscription {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  lookupKey: string;
  productName: string;
  amount: number; // in fils
  interval: 'month' | 'year';
  intervalCount: number;
  latestInvoiceUrl?: string;
  latestInvoicePdf?: string;
}

const ACTIVE_STATUSES = ['active', 'trialing'];

export function useSubscription() {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSubscription(null);
        return;
      }
      const res = await fetch(`${apiBase}/api/v1/services/payments/subscriptions/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSubscription(data.subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const isActive = subscription ? ACTIVE_STATUSES.includes(subscription.status) : false;

  return { subscription, loading, error, isActive, refetch: fetch_ };
}