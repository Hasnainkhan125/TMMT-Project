// hooks/usePackageApplication.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/v1/package-applications`;

const authHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function usePackageApplication() {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [application, setApplication] = useState(null);

  const submitApplication = useCallback(async (payload) => {
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      // ✅ Server returns: { status: 'success', data: { application, referenceId, _id } }
      // On error: { status: 'fail', message: '...' }
      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Submission failed');
      }

      const app = data.data.application;
      // Ensure _id is set
      app._id = app._id || data.data._id;
      setApplication(app);
      // Return the full data object (or just the app)
      return data.data; // contains { application, referenceId, _id }
    } catch (err) {
      console.error('❌ submitApplication error:', err);
      toast.error(err.message || 'Could not submit application');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // files = [{ docKey, label, file }]
  const uploadDocuments = useCallback(async (applicationId, files) => {
    if (!applicationId) { toast.error('Missing application id'); return false; }
    if (!files?.length) return true; // nothing to upload is fine
    setUploading(true);
    try {
      const form = new FormData();
      const labels = {};
      files.forEach(({ docKey, label, file }) => {
        form.append(docKey, file, file.name);
        labels[docKey] = label;
      });
      form.append('labels', JSON.stringify(labels));

      const res = await fetch(`${API_BASE}/${applicationId}/documents`, {
        method: 'POST',
        headers: { ...authHeaders() }, // DO NOT set Content-Type
        body: form,
      });
      const data = await res.json();
      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Upload failed');
      }
      return true;
    } catch (err) {
      console.error('❌ uploadDocuments error:', err);
      toast.error(err.message || 'Could not upload documents');
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  return { submitApplication, uploadDocuments, submitting, uploading, application };
}