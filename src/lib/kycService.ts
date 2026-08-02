import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export interface KYCFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  idType: string;
  idNumber: string;
  occupation: string;
  annualIncome: string;
  walletAddress: string;
  idDocument: File | null;
  addressProof: File | null;
}

export interface KYCStatus {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  fullName: string;
  email: string;
  walletAddress: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface KYCResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Submit KYC application
export const submitKYC = async (formData: KYCFormData): Promise<any> => {
  try {
    const form = new FormData();
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (key === 'idDocument' || key === 'addressProof') {
        const file = formData[key as keyof KYCFormData];
        if (file instanceof File) {
          form.append(key, file);
        }
      } else {
        console.log(formData[key as keyof KYCFormData],'here is a form data')
        form.append(key, formData[key as keyof KYCFormData] as string);
      }
    });

    // await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(JSON.parse(JSON.stringify(formData)),'here is a form data')
    const response = await axios.post(`${API_BASE_URL}/kyc/submit`, formData);

    const result = await response.data;
    
    if (!response.statusText) {
      throw new Error(result.error || 'Failed to submit KYC application');
    }

    return result;
  } catch (error) {
    console.error('KYC submission error:', error);
    throw error;
  }
};

// Get KYC status by wallet address
export const getKYCStatus = async (walletAddress: string): Promise<KYCStatus | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/status/${walletAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // KYC not found
    }

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get KYC status');
    }

    return result.data;
  } catch (error) {
    console.error('Get KYC status error:', error);
    throw error;
  }
};

// Admin: Get all KYC applications
export const getAllKYC = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<{ data: KYCStatus[]; pagination: any }> => {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/kyc/admin/all?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-admin-token',
        'x-admin-token': 'admin-secret-token',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get KYC applications');
    }

    return result;
  } catch (error) {
    console.error('Get all KYC error:', error);
    throw error;
  }
};

// Admin: Update KYC status
export const updateKYCStatus = async (
  id: string, 
  status: string, 
  rejectionReason?: string, 
  notes?: string
): Promise<KYCResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-admin-token',
        'x-admin-token': 'admin-secret-token',
      },
      body: JSON.stringify({
        status,
        rejectionReason,
        notes,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update KYC status');
    }

    return result;
  } catch (error) {
    console.error('Update KYC status error:', error);
    throw error;
  }
};

// Admin: Get KYC statistics
export const getKYCStats = async (): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-admin-token',
        'x-admin-token': 'admin-secret-token',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to get KYC statistics');
    }

    return result.data;
  } catch (error) {
    console.error('Get KYC stats error:', error);
    throw error;
  }
};

// Admin: Delete KYC application
export const deleteKYC = async (id: string): Promise<KYCResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/kyc/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-admin-token',
        'x-admin-token': 'admin-secret-token',
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete KYC application');
    }

    return result;
  } catch (error) {
    console.error('Delete KYC error:', error);
    throw error;
  }
};

// Export all functions as default object for backward compatibility
const kycService = {
  submitKYC,
  getKYCStatus,
  getAllKYC,
  updateKYCStatus,
  getKYCStats,
  deleteKYC
};

export default kycService; 