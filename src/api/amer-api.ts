import { supabase } from '@/lib/supabase';
import type { VisaApplication, ApplicationStats, FraudAlert, Penalty, OTPRequest } from '@/lib/supabase';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1` || 'http://localhost:5001/api/v1';

export class AmerApiService {
  private static async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  // Get all applications for Amer officers
  static async getAllApplications(params: {
    status?: string;
    applicationType?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      if (params.status) queryParams.append('status', params.status);
      if (params.applicationType) queryParams.append('applicationType', params.applicationType);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);

      const response = await fetch(`${API_BASE_URL}/visa/applications?${queryParams}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  }

  // Get application by ID
  static async getApplicationById(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/visa/applications/${id}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  // Update application status
  static async updateApplicationStatus(id: string, updates: {
    status: string;
    note?: string;
    requiredDocuments?: string[];
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/visa/applications/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  // Get application statistics
  static async getApplicationStats() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/visa/stats`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Upload documents to application
  static async uploadDocuments(applicationId: string, files: File[]) {
    try {
      const headers = await this.getAuthHeaders();
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('documents', file);
      });

      // Remove Content-Type header for FormData
      delete (headers as any)['Content-Type'];

      const response = await fetch(`${API_BASE_URL}/visa/applications/${applicationId}/documents`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error;
    }
  }

  // Create fraud alert
  static async createFraudAlert(alert: Omit<FraudAlert, 'id' | 'createdAt'>) {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .insert([{
          ...alert,
          createdAt: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating fraud alert:', error);
      throw error;
    }
  }

  // Get fraud alerts
  static async getFraudAlerts(applicationId?: string) {
    try {
      let query = supabase
        .from('fraud_alerts')
        .select('*')
        .order('createdAt', { ascending: false });

      if (applicationId) {
        query = query.eq('applicationId', applicationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching fraud alerts:', error);
      throw error;
    }
  }

  // Update fraud alert status
  static async updateFraudAlertStatus(id: string, status: string, assignedTo?: string) {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .update({ status, assignedTo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating fraud alert:', error);
      throw error;
    }
  }

  // Create penalty
  static async createPenalty(penalty: Omit<Penalty, 'id' | 'issuedAt'>) {
    try {
      const { data, error } = await supabase
        .from('penalties')
        .insert([{
          ...penalty,
          issuedAt: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating penalty:', error);
      throw error;
    }
  }

  // Get penalties
  static async getPenalties(applicationId?: string) {
    try {
      let query = supabase
        .from('penalties')
        .select('*')
        .order('issuedAt', { ascending: false });

      if (applicationId) {
        query = query.eq('applicationId', applicationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching penalties:', error);
      throw error;
    }
  }

  // Update penalty status
  static async updatePenaltyStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('penalties')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating penalty:', error);
      throw error;
    }
  }

  // Create OTP request
  static async createOTPRequest(otpRequest: Omit<OTPRequest, 'id' | 'createdAt'>) {
    try {
      const { data, error } = await supabase
        .from('otp_requests')
        .insert([{
          ...otpRequest,
          createdAt: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating OTP request:', error);
      throw error;
    }
  }

  // Payments
  static async createPaymentIntent(amount: number, metadata?: Record<string,string>) {
    const token = localStorage.getItem('authToken') || ''
    const res = await fetch(`${API_BASE_URL.replace('/visa','')}/services/payments/create-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ amount, currency: 'aed', metadata })
    })
    const data = await res.json()
    if (!res.ok || !data?.success) throw new Error(data?.message || 'Failed to create payment intent')
    return data.data.clientSecret as string
  }

  // Get OTP requests
  static async getOTPRequests(applicationId?: string) {
    try {
      let query = supabase
        .from('otp_requests')
        .select('*')
        .order('createdAt', { ascending: false });

      if (applicationId) {
        query = query.eq('applicationId', applicationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching OTP requests:', error);
      throw error;
    }
  }

  // Update OTP request status
  static async updateOTPRequestStatus(id: string, status: string) {
    try {
      const { data, error } = await supabase
        .from('otp_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating OTP request:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<any>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
