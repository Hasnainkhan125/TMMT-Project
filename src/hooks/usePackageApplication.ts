// hooks/usePackageApplication.js
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api/v1/package-applications`;

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
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Submission failed');
      const app = data.data.application;
      // server also returns applicationId explicitly — prefer it
      app._id = data.data.applicationId || app._id || app.id;
      setApplication(app);
      return app;
    } catch (err) {
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
      // labels travel as one JSON field so multer never has to reconcile
      // interleaved text/file parts. Each file uses its docKey as the field name.
      const labels = {};
      files.forEach(({ docKey, label, file }) => {
        form.append(docKey, file, file.name);
        labels[docKey] = label;
      });
      form.append('labels', JSON.stringify(labels));

      const res = await fetch(`${API_BASE}/${applicationId}/documents`, {
        method: 'POST',
        headers: { ...authHeaders() }, // DO NOT set Content-Type; browser sets multipart boundary
        body: form,
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message || 'Upload failed');
      return true;
    } catch (err) {
      toast.error(err.message || 'Could not upload documents');
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  return { submitApplication, uploadDocuments, submitting, uploading, application };
}