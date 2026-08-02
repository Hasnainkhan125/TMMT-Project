import React from 'react'
import { useState } from 'react';
import { applicationApi } from '@/api/';
          
const InquiryPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    passportNumber: '',
    emiratesId: '',
    nationality: '',
    dob: '',
  });
  const [isFastTrack, setIsFastTrack] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const { checkoutUrl } = await applicationApi.create({
        type: 'overstay_fine',
        inputData: form,
        isFastTrack,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      alert('Could not create application. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const price = isFastTrack ? 50 : 20;


  return (
    <section className="container mx-auto px-4  pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          

    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Overstay Fine Check</h1>
      <p className="text-gray-600 mb-6">Find out if there's a fine on your record. Result in 24-48 hours.</p>

      <div className="space-y-4">
        <input
          placeholder="Full name (as on passport)"
          value={form.fullName}
          onChange={e => setForm({...form, fullName: e.target.value})}
          className="w-full p-3 border rounded"
        />
        <input
          placeholder="Passport number"
          value={form.passportNumber}
          onChange={e => setForm({...form, passportNumber: e.target.value})}
          className="w-full p-3 border rounded"
        />
        <input
          placeholder="Emirates ID (if any)"
          value={form.emiratesId}
          onChange={e => setForm({...form, emiratesId: e.target.value})}
          className="w-full p-3 border rounded"
        />
        <input
          placeholder="Nationality"
          value={form.nationality}
          onChange={e => setForm({...form, nationality: e.target.value})}
          className="w-full p-3 border rounded"
        />
        <input
          type="date"
          value={form.dob}
          onChange={e => setForm({...form, dob: e.target.value})}
          className="w-full p-3 border rounded"
        />

        <label className="flex items-center gap-2 cursor-pointer p-3 border rounded">
          <input
            type="checkbox"
            checked={isFastTrack}
            onChange={e => setIsFastTrack(e.target.checked)}
          />
          <div>
            <div className="font-semibold">Fast-track (24 hours) — AED 50</div>
            <div className="text-sm text-gray-500">Standard is 24-48 hours at AED 20</div>
          </div>
        </label>

        <button
          onClick={submit}
          disabled={busy || !form.fullName || !form.passportNumber}
          className="w-full bg-black text-white p-4 rounded font-bold disabled:opacity-50"
        >
          {busy ? 'Processing...' : `Pay AED ${price} & Submit`}
        </button>
      </div>
    </div>
 
        </div>
      </div>
    </section>
  )
}

export default InquiryPage