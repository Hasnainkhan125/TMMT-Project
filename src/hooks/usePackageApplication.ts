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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [application, setApplication] = useState(null);

  // SUBMIT APPLICATION
  const submitApplication = useCallback(async (payload) => {
    setSubmitting(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Submission failed');
      }

      const app = data.data.application;
      app._id = app._id || data.data._id;
      setApplication(app);
      return data.data;
    } catch (err) {
      console.error('❌ submitApplication error:', err);
      toast.error(err.message || 'Could not submit application');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // UPLOAD MULTIPLE DOCUMENTS - One by one for better error handling
  const uploadDocuments = useCallback(async (applicationId, files) => {
    if (!applicationId) {
      toast.error('Missing application id');
      return false;
    }
    if (!files?.length) {
      return true; // nothing to upload is fine
    }

    setUploading(true);
    setUploadProgress(0);

    let uploadedCount = 0;
    const totalFiles = files.length;

    try {
      for (const { docKey, label, file } of files) {
        const form = new FormData();
        form.append('document', file);
        form.append('docKey', docKey);
        form.append('label', label);

        const res = await fetch(`${API_BASE}/${applicationId}/documents`, {
          method: 'POST',
          headers: authHeaders(),
          body: form,
        });

        const data = await res.json();

        if (!res.ok || data.status === 'fail' || data.status === 'error') {
          console.error(`❌ Failed to upload ${label}:`, data);
          toast.error(`Failed to upload ${label}: ${data.message || 'Unknown error'}`);
        } else {
          uploadedCount++;
          const progress = Math.round((uploadedCount / totalFiles) * 100);
          setUploadProgress(progress);
          toast.success(`✅ ${label} uploaded successfully`);
        }
      }

      const allUploaded = uploadedCount === totalFiles;

      if (allUploaded) {
        toast.success('All documents uploaded successfully! 🎉');
      } else if (uploadedCount > 0) {
        toast.warning(`⚠️ ${uploadedCount}/${totalFiles} documents uploaded. Please try again for the remaining files.`);
      } else {
        toast.error('Failed to upload any documents. Please try again.');
      }

      return allUploaded;
    } catch (err) {
      console.error('❌ uploadDocuments error:', err);
      toast.error(err.message || 'Could not upload documents');
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  // UPLOAD SINGLE DOCUMENT
  const uploadSingleDocument = useCallback(async (applicationId, docKey, label, file) => {
    if (!applicationId) {
      toast.error('Missing application id');
      return false;
    }
    if (!file) {
      toast.error('No file provided');
      return false;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('document', file);
      form.append('docKey', docKey);
      form.append('label', label);

      const res = await fetch(`${API_BASE}/${applicationId}/documents`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      });

      const data = await res.json();

      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Upload failed');
      }

      toast.success(`✅ ${label} uploaded successfully`);
      return data.data || data;
    } catch (err) {
      console.error('❌ uploadSingleDocument error:', err);
      toast.error(err.message || 'Could not upload document');
      return false;
    } finally {
      setUploading(false);
    }
  }, []);

  // GET APPLICATION
  const getApplication = useCallback(async (applicationId) => {
    try {
      const res = await fetch(`${API_BASE}/${applicationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();

      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch application');
      }

      setApplication(data.data || data);
      return data.data || data;
    } catch (err) {
      console.error('❌ getApplication error:', err);
      toast.error(err.message || 'Could not fetch application');
      return null;
    }
  }, []);

  // GET DOCUMENTS
  const getDocuments = useCallback(async (applicationId) => {
    try {
      const res = await fetch(`${API_BASE}/${applicationId}/documents`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();

      if (!res.ok || data.status === 'fail' || data.status === 'error') {
        throw new Error(data.message || 'Failed to fetch documents');
      }

      return data.data || data;
    } catch (err) {
      console.error('❌ getDocuments error:', err);
      toast.error(err.message || 'Could not fetch documents');
      return [];
    }
  }, []);

  return {
    submitApplication,
    uploadDocuments,
    uploadSingleDocument,
    getApplication,
    getDocuments,
    submitting,
    uploading,
    uploadProgress,
    application,
  };
}