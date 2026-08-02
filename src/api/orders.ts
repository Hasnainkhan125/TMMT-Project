export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

export type CreateOrderRequest = {
  investor_wallet: string;
  token_address: string;
  investment_amount: number;
  investment_currency: 'USD' | 'AED' | 'CHF' | 'SGD' | 'EUR' | 'USDC' | 'USDT';
  payment_method: 'wallet' | 'bank_wire' | 'card' | 'other';
  network_id?: number | null;
  delivery_address: string;
  investor_contact?: { name?: string; email?: string; phone?: string };
  declarations: { terms_accepted: boolean; us_person?: boolean | null; pep_status?: 'none' | 'self' | 'family' | 'associate' | null; marketing_consent?: boolean };
};

export type OrderSummary = {
  id: string;
  order_number: string;
  status: string;
  settlement_status?: string;
  investment_amount: number;
  investment_currency: string;
  expected_token_amount?: string;
  token_symbol: string;
  created_at: string;
};

export async function createOrder(payload: CreateOrderRequest) {
  const res = await fetch(`${API_BASE}/api/v1/investments/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to create order');
  return json.data.order as OrderSummary;
}

export async function updateOrderStatus(orderId: string, body: { status: string; payment_tx_hash?: string; allocation_tx_hash?: string; notes?: string; reason?: string }) {
  const res = await fetch(`${API_BASE}/api/v1/investments/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update order');
  return json.data.order as OrderSummary;
}

export async function getOrdersBySPV(spvId: string, opts?: { status?: string; page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (opts?.status) q.set('status', opts.status);
  if (opts?.page) q.set('page', String(opts.page));
  if (opts?.limit) q.set('limit', String(opts.limit));
  const res = await fetch(`${API_BASE}/api/v1/investments/spv/${spvId}/orders${q.toString() ? `?${q.toString()}` : ''}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch orders');
  return json.data;
}

export async function getOrderDetails(orderId: string) {
  const res = await fetch(`${API_BASE}/api/v1/investments/orders/${orderId}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch order details');
  return json.data;
}

export async function getInvestorPortfolio(wallet: string, includeHistory = true) {
  const res = await fetch(`${API_BASE}/api/v1/portfolio/investor/${wallet}?include_history=${includeHistory ? 'true' : 'false'}`);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch portfolio');
  return json.data;
} 