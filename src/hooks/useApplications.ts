import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, type VisaApplication, type ApplicationStats } from '@/lib/supabase';
import { toast } from 'sonner';
import { tokenService } from '@/services/token-service';
import { useAuth } from '@/contexts/AuthContext';

export const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/visa`;

export interface EnhancedVisaApplication {
  id: string;
  applicationType: string;
  status: string;
  sponsor: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    emiratesId?: string;
  };
  sponsored?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nationality?: string;
    passportNumber?: string;
    dateOfBirth?: string;
    relationship?: string;
  };
  attachments: Array<{
    _id?: string;
    id?: string;
    path: string;
    filename: string;
    type: string;
    verificationStatus: string;
    fraudScore: number;
    extractedData?: any;
    uploadedAt: string;
  }>;
  metadata: {
    serviceId: string;
    serviceName?: string;
    chatHistory: Array<{
      type: string;
      content: string;
      userId: string;
    }>;
    personalInfo: {
      nationality?: string;
      emiratesId?: string;
      currentVisa?: string;
      accommodation?: string;
    };
    sponsorInfo: {
      salary?: string;
      company?: string;
      tradeLicense?: string;
      establishmentCard?: string;
    };
    submittedAt?: string;
    fraudRisk: string;
    blacklistStatus: string;
    requiredDocuments: string[];
    additionalNotes?: string;
    amerNotes?: string;
    priority: string;
  };
  history: Array<{
    action: string;
    by: string;
    note: string;
    at: string;
  }>;
  amerActions?: {
    lastReviewedBy?: {
      firstName: string;
      lastName: string;
    };
    lastReviewedAt?: string;
    reviewNotes?: string;
    fraudAlerts: Array<{
      type: string;
      severity: string;
      description: string;
      detectedAt: string;
      resolved: boolean;
    }>;
    penalties: Array<{
      type: string;
      amount: number;
      reason: string;
      issuedAt: string;
      dueDate: string;
      paid: boolean;
    }>;
    otpRequests: Array<{
      requestedAt: string;
      purpose: string;
      status: string;
      expiresAt: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export const useApplications = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<EnhancedVisaApplication[]>([]);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    docs_required: 0,
    approved: 0,
    rejected: 0,
    closed: 0,
    fraud_detected: 0,
    penalty_issued: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Your AuthContext's `user` object may expose the id under different keys
  // depending on how it was populated (id, _id, userId, sub, etc). This
  // resolves it safely instead of assuming `user.id` always exists, which
  // was silently producing the string "undefined" in the request URL and
  // crashing the backend's ObjectId cast.
  const getUserId = (): string | null => {
    if (!user) return null;
    const candidate =
      (user as any).id ??
      (user as any)._id ??
      (user as any).userId ??
      (user as any).sub ??
      null;
    return candidate ? String(candidate) : null;
  };

  // Applications and their nested attachments can come back with either
  // `id` or `_id` depending on which endpoint populated them. Resolve both
  // consistently so lookups/filters never silently no-op.
  const getAppKey = (app: any): string | undefined => app?.id ?? app?._id;
  const getDocKey = (doc: any): string | undefined => doc?._id ?? doc?.id;

  // Fetch user details
  const fetchUserDetails = async () => {
    const userId = getUserId();
    if (!userId) {
      console.warn('fetchUserDetails skipped: no resolved user id yet');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/applications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setUserDetails(data.data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  // Fetch applications for the current user by user ID
  const fetchApplications = async () => {
    if (authLoading) return;

    const userId = getUserId();
    if (!userId) {
      // Don't fire the request at all if we don't have a real id yet —
      // this is what was previously hitting the backend as
      // "/applications/user/undefined" and throwing a Mongoose CastError.
      console.warn('fetchApplications skipped: no resolved user id yet');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      // Fetch applications by user ID instead of email
      const response = await fetch(`${API_BASE_URL}/applications/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      if (data.status === 'success') {
        setApplications(data.data.applications);
        setUserDetails(data.data.user);

        // Transform stats from backend format
        const transformedStats: ApplicationStats = {
          total: data.data.applications.length || 0,
          draft: 0,
          submitted: 0,
          under_review: 0,
          docs_required: 0,
          approved: 0,
          rejected: 0,
          closed: 0,
          fraud_detected: 0,
          penalty_issued: 0
        };

        // Count applications by status
        data.data.applications.forEach((app: any) => {
          const status = app.status;
          if (status in transformedStats) {
            (transformedStats as any)[status] = ((transformedStats as any)[status] || 0) + 1;
          }
        });

        setStats(transformedStats);
      } else {
        throw new Error(data.error || 'Failed to fetch applications');
      }

    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Create new application
  const createApplication = async (applicationData: Partial<EnhancedVisaApplication> & { sponsor?: { phone?: string; emiratesId?: string } }) => {
    const userId = getUserId();
    if (!userId) return null;
    console.log('createApplication called', applicationData)

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationType: applicationData.applicationType,
          sponsor: {
            phone: applicationData?.sponsor?.phone,
            emiratesId: (applicationData as any)?.sponsor?.emiratesId,
            firstName: applicationData?.sponsor?.firstName,
            lastName: applicationData?.sponsor?.lastName,
            email: applicationData?.sponsor?.email,
          },
          sponsored: applicationData.sponsored,
          requiredDocuments: applicationData.metadata?.requiredDocuments,
        })
      });
      console.log('response', response)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
        console.log('data', data)
      if (data.status === 'success' || data.success) {
        const newApplication = data.data?.application || data.application;
        setApplications(prev => [newApplication, ...prev]);
        toast.success('Application created successfully');
        return newApplication;
      } else {
        throw new Error(data.message || 'Failed to create application');
      }

    } catch (err) {
      console.error('Error creating application:', err);
      toast.error('Failed to create application');
      return null;
    }
  };

  // Update application status
  const updateApplicationStatus = async (applicationId: string, newStatus: string, note?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = getUserId();

      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          note
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setApplications(prev => prev.map((app: EnhancedVisaApplication) => {
          if (app.id === applicationId) {
            return {
              ...app,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              history: [
                ...app.history,
                {
                  action: newStatus,
                  by: userId || 'user',
                  note: note || `Status updated to ${newStatus}`,
                  at: new Date().toISOString()
                }
              ]
            };
          }
          return app;
        }));

        toast.success(`Application status updated to ${newStatus}`);
      } else {
        throw new Error(data.message || 'Failed to update application status');
      }

    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Failed to update application status');
    }
  };

  // Submit application
  const submitApplication = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = getUserId();

      const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/submit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setApplications(prev => prev.map((app: EnhancedVisaApplication) => {
          if (app.id === applicationId) {
            return {
              ...app,
              status: 'submitted',
              updatedAt: new Date().toISOString(),
              metadata: {
                ...app.metadata,
                submittedAt: new Date().toISOString()
              },
              history: [
                ...app.history,
                {
                  action: 'submitted',
                  by: userId || 'user',
                  note: 'Application submitted for review',
                  at: new Date().toISOString()
                }
              ]
            };
          }
          return app;
        }));

        toast.success('Application submitted successfully');
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }

    } catch (err) {
      console.error('Error submitting application:', err);
      toast.error('Failed to submit application');
    }
  };

  // Upload documents
  const uploadDocuments = async (applicationId: string, documents: File[]) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = getUserId();

      const formData = new FormData();
      documents.forEach((doc, index) => {
        formData.append('documents', doc);
      });

      const response = await fetch(`${API_BASE_URL}/${applicationId}/documents`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setApplications(prev => prev.map((app: EnhancedVisaApplication) => {
          if (app.id === applicationId) {
            return {
              ...app,
              attachments: [
                ...app.attachments,
                ...documents.map((doc, index) => ({
                  path: `/uploads/applications/${applicationId}/${doc.name}`,
                  filename: doc.name,
                  type: doc.type,
                  verificationStatus: 'pending',
                  fraudScore: 0,
                  uploadedAt: new Date().toISOString()
                }))
              ],
              updatedAt: new Date().toISOString(),
              history: [
                ...app.history,
                {
                  action: 'documents_uploaded',
                  by: userId || 'user',
                  note: `${documents.length} document(s) uploaded`,
                  at: new Date().toISOString()
                }
              ]
            };
          }
          return app;
        }));

        toast.success('Documents uploaded successfully');
      } else {
        throw new Error(data.message || 'Failed to upload documents');
      }

    } catch (err) {
      console.error('Error uploading documents:', err);
      toast.error('Failed to upload documents');
    }
  };

  // Delete a single document/attachment from an application.
  // NOTE: this hits `${application}/attachments/{documentId}`, mirroring the
  // download route the Documents page already calls
  // (`/attachments/{id}/download`). If your backend exposes a different
  // path for deletion, update the URL below to match.
  const deleteDocument = async (applicationId: string, documentId: string) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/${applicationId}/attachments/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Some DELETE endpoints return no body — don't blow up parsing an
      // empty response as JSON.
      const data = await response.json().catch(() => ({} as any));

      if (data && (data.success === false || data.status === 'error')) {
        throw new Error(data.message || data.error || 'Failed to delete document');
      }

      // Remove the deleted attachment from local state so the UI updates
      // immediately without waiting on a full refetch.
      setApplications(prev => prev.map((app: EnhancedVisaApplication) => {
        if (getAppKey(app) !== applicationId) return app;
        return {
          ...app,
          attachments: app.attachments.filter((doc: any) => getDocKey(doc) !== documentId),
          updatedAt: new Date().toISOString(),
        };
      }));
    } catch (err) {
      console.error('Error deleting document:', err);
      // Re-throw so the calling component's try/catch can show its own
      // toast/UI feedback instead of us double-toasting here.
      throw err;
    }
  };

  // Delete application
  const deleteApplication = async (applicationId: string) => {
    try {
      setApplications(prev => prev.filter((app: EnhancedVisaApplication) => app.id !== applicationId));
      toast.success('Application deleted successfully');
    } catch (err) {
      console.error('Error deleting application:', err);
      toast.error('Failed to delete application');
    }
  };

  // context populates the user object asynchronously after mount).
  const resolvedUserId = getUserId();
  useEffect(() => {
    if (!authLoading && resolvedUserId) {
      fetchApplications();
      fetchUserDetails();
    }
  }, [authLoading, resolvedUserId]);

  return {
    applications,
    userDetails,
    stats,
    loading,
    error,
    fetchApplications,
    createApplication,
    updateApplicationStatus,
    submitApplication,
    uploadDocuments,
    deleteDocument,
    deleteApplication
  };
};