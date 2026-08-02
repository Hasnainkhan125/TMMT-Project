export async function sendWhatsAppTrackingMessage(to: string, body: string) {
  const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:5001';
  const payload = {
    body,
    from: `whatsapp:${(import.meta.env.VITE_TWILIO_WHATSAPP_FROM as string) || ''}`,
    to: `whatsapp:${to}`,
  };
  const res = await fetch(`${base}/api/sendWhatsappMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Failed to send WhatsApp message');
  return await res.text();
}


