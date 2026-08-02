import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const AMER_API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/visa`;

export interface AmerApplication {
  _id: string;
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
  amerActions: {
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

export interface AmerStats {
  byStatus: Array<{ _id: string; count: number }>;
  byFraudRisk: Array<{ _id: string; count: number }>;
  byPriority: Array<{ _id: string; count: number }>;
  total: number;
  recent: AmerApplication[];
}

export const useAmerDashboard = () => {
  const [applications, setApplications] = useState<AmerApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<AmerApplication[]>([]);
  const [stats, setStats] = useState<AmerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all applications for Amer dashboard
  const fetchAllApplications = async (filters?: {
    status?: string;
    applicationType?: string;
    priority?: string;
    fraudRisk?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const queryParams = new URLSearchParams();
      
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.applicationType) queryParams.append('applicationType', filters.applicationType);
      if (filters?.priority) queryParams.append('priority', filters.priority);
      if (filters?.fraudRisk) queryParams.append('fraudRisk', filters.fraudRisk);
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());

      const response = await fetch(`${AMER_API_BASE_URL}/applications?${queryParams}`, {
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
      if (data.status === 'success' || data.success) {
        const apps = (data.data?.applications || data.applications || []) as AmerApplication[]
        setApplications(apps);
        setFilteredApplications(apps);
        // stats shape might vary
        const st: any = data.data?.stats || data.stats
        if (st) setStats(st);
      } else {
        throw new Error(data.message || 'Failed to fetch applications');
      }

    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to fetch applications');
      toast.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (
    applicationId: string, 
    status: string, 
    note?: string,
    priority?: string,
    fraudRisk?: string,
    amerNotes?: string,
    requiredDocuments?: string[]
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          note,
          priority,
          fraudRisk,
          amerNotes,
          requiredDocuments
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const updated = data.data?.application || data.application
        if (updated) {
          setApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
          setFilteredApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
        }
        toast.success(`Application status updated to ${status}`);
        return data.data.application;
      } else {
        throw new Error(data.message || 'Failed to update application status');
      }

    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error('Failed to update application status');
      throw err;
    }
  };

  // Add fraud alert
  const addFraudAlert = async (
    applicationId: string, 
    type: string, 
    severity: string, 
    description: string
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/applications/${applicationId}/fraud-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          severity,
          description
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const updated = data.data?.application || data.application
        if (updated) {
          setApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
          setFilteredApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
        }
        toast.success('Fraud alert added successfully');
        return data.data.application;
      } else {
        throw new Error(data.message || 'Failed to add fraud alert');
      }

    } catch (err) {
      console.error('Error adding fraud alert:', err);
      toast.error('Failed to add fraud alert');
      throw err;
    }
  };

  // Issue penalty
  const issuePenalty = async (
    applicationId: string, 
    type: string, 
    amount: number, 
    reason: string, 
    dueDate?: string
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/applications/${applicationId}/penalty`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount,
          reason,
          dueDate
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const updated = data.data?.application || data.application
        if (updated) {
          setApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
          setFilteredApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
        }
        toast.success('Penalty issued successfully');
        return data.data.application;
      } else {
        throw new Error(data.message || 'Failed to issue penalty');
      }

    } catch (err) {
      console.error('Error issuing penalty:', err);
      toast.error('Failed to issue penalty');
      throw err;
    }
  };

  // Request additional documents for an application
  const requestAdditionalDocuments = async (
    applicationId: string,
    requested: string[],
    note?: string
  ) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${AMER_API_BASE_URL}/${applicationId}/request-documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requested, note })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === 'success' || data.success) {
        const updated = data.data?.application || data.application
        if (updated) {
          setApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
          setFilteredApplications(prev => prev.map(app => app._id === applicationId ? updated : app));
        }
        toast.success('Document request sent to applicant');
        return updated;
      } else {
        throw new Error(data.message || 'Failed to request documents');
      }
    } catch (err) {
      console.error('Error requesting documents:', err);
      toast.error('Failed to request documents');
      throw err;
    }
  };

  // Request OTP
  const requestOTP = async (applicationId: string, purpose: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/applications/${applicationId}/otp-request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setApplications(prev => prev.map(app => 
          app._id === applicationId ? data.data.application : app
        ));
        setFilteredApplications(prev => prev.map(app => 
          app._id === applicationId ? data.data.application : app
        ));
        toast.success('OTP requested successfully');
        return data.data.application;
      } else {
        throw new Error(data.message || 'Failed to request OTP');
      }

    } catch (err) {
      console.error('Error requesting OTP:', err);
      toast.error('Failed to request OTP');
      throw err;
    }
  };

  // Filter applications
  const filterApplications = (filters: {
    status?: string;
    applicationType?: string;
    priority?: string;
    fraudRisk?: string;
    searchQuery?: string;
  }) => {
    let filtered = [...applications];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    if (filters.applicationType && filters.applicationType !== 'all') {
      filtered = filtered.filter(app => app.applicationType === filters.applicationType);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(app => app.metadata.priority === filters.priority);
    }

    if (filters.fraudRisk && filters.fraudRisk !== 'all') {
      filtered = filtered.filter(app => app.metadata.fraudRisk === filters.fraudRisk);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.sponsor.firstName.toLowerCase().includes(query) ||
        app.sponsor.lastName.toLowerCase().includes(query) ||
        app.sponsor.email.toLowerCase().includes(query) ||
        app.metadata.serviceName?.toLowerCase().includes(query) ||
        app.applicationType.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  // Get application by ID
  const getApplicationById = async (applicationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/applications/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data.application;
      } else {
        throw new Error(data.message || 'Failed to fetch application');
      }

    } catch (err) {
      console.error('Error fetching application:', err);
      toast.error('Failed to fetch application');
      throw err;
    }
  };

  // Get application statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${AMER_API_BASE_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success' || data.success) {
        const st = data.data?.stats || data.stats
        setStats(st);
        return st;
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }

    } catch (err) {
      console.error('Error fetching statistics:', err);
      toast.error('Failed to fetch statistics');
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAllApplications();
  }, []);

  return {
    applications,
    filteredApplications,
    stats,
    loading,
    error,
    fetchAllApplications,
    updateApplicationStatus,
    addFraudAlert,
    issuePenalty,
    requestAdditionalDocuments,
    requestOTP,
    filterApplications,
    getApplicationById,
    fetchStats
  };
};
