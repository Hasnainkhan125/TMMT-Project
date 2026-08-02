/**
 * Visa Checks API Client
 *
 * Handles all API operations for visa and labour check applications:
 * - Creating new check applications
 * - Retrieving application status and history
 * - Downloading result PDFs
 * - Real-time application tracking
 */

import { CreateApplicationRequest, CreateApplicationResponse, Application, ApplicationStatus } from '@/types';

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_V1 = `${API_BASE}/api/v1`;

// Type Definitions for API Responses
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApplicationResult {
  applicationId: string;
  serviceType: string;
  status: ApplicationStatus;
  result: Record<string, any>;
  completedAt: Date;
  downloadUrl?: string;
}

// Helper: Get Authorization Token
const getAuthToken = (): string => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No auth token found in localStorage');
    return '';
  }
  return token;
};

// Helper: Create Authorization Headers
const createHeaders = (contentType = 'application/json'): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': contentType,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper: Handle API Errors
const handleApiError = (error: unknown, context: string): never => {
  if (error instanceof Error) {
    console.error(`[${context}] Error:`, error.message);
    throw new Error(`${context}: ${error.message}`);
  }
  console.error(`[${context}] Unknown error:`, error);
  throw new Error(`${context}: An unknown error occurred`);
};

/**
 * POST /api/v1/visa/checks
 * Create a new visa/labour check application
 *
 * @param request - Application creation request with service type, identifiers, documents, and speed tier
 * @returns Promise with applicationId, checkoutUrl, and estimated completion date
 */
export const createApplication = async (
  request: CreateApplicationRequest
): Promise<CreateApplicationResponse> => {
  try {
    const response = await fetch(`${API_V1}/visa/checks`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({
        serviceType: request.serviceType,
        identifiers: request.identifiers,
        documentIds: request.documentIds,
        speedTier: request.speedTier,
        pricing: request.pricing,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Create application failed:', errorData);
      throw new Error(
        errorData.message || `Failed to create application (${response.status})`
      );
    }

    const data = (await response.json()) as CreateApplicationResponse;
    return {
      applicationId: data.applicationId,
      checkoutUrl: data.checkoutUrl,
      estimatedCompletionAt: new Date(data.estimatedCompletionAt),
    };
  } catch (error) {
    handleApiError(error, 'createApplication');
  }
};

/**
 * GET /api/v1/visa/applications
 * Retrieve all applications for the authenticated user
 *
 * @returns Promise with array of user's applications
 */
export const getApplications = async (): Promise<Application[]> => {
  try {
    const response = await fetch(`${API_V1}/visa/applications`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Get applications failed:', errorData);
      throw new Error(
        errorData.message || `Failed to fetch applications (${response.status})`
      );
    }

    const data = (await response.json()) as { applications: Application[] };

    // Normalize dates
    return data.applications.map((app) => ({
      ...app,
      createdAt: new Date(app.createdAt),
      estimatedCompletionAt: new Date(app.estimatedCompletionAt),
      completedAt: app.completedAt ? new Date(app.completedAt) : undefined,
    }));
  } catch (error) {
    handleApiError(error, 'getApplications');
  }
};

/**
 * GET /api/v1/visa/{applicationId}/result
 * Retrieve the result of a completed visa check application
 *
 * @param applicationId - The application ID to fetch results for
 * @returns Promise with application result and status
 */
export const getApplicationResult = async (
  applicationId: string
): Promise<ApplicationResult> => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await fetch(
      `${API_V1}/visa/${encodeURIComponent(applicationId)}/result`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Application not found');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Get application result failed:', errorData);
      throw new Error(
        errorData.message || `Failed to fetch application result (${response.status})`
      );
    }

    const data = (await response.json()) as ApplicationResult;
    return {
      ...data,
      completedAt: new Date(data.completedAt),
    };
  } catch (error) {
    handleApiError(error, 'getApplicationResult');
  }
};

/**
 * GET /api/v1/visa/{applicationId}/result/pdf
 * Download the result PDF for a completed application
 *
 * @param applicationId - The application ID to download PDF for
 * @returns Promise with PDF blob
 */
export const downloadResultPdf = async (applicationId: string): Promise<Blob> => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await fetch(
      `${API_V1}/visa/${encodeURIComponent(applicationId)}/result/pdf`,
      {
        method: 'GET',
        headers: createHeaders('application/pdf'),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PDF not found. Application may not be completed yet.');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Download PDF failed:', errorData);
      throw new Error(
        errorData.message || `Failed to download PDF (${response.status})`
      );
    }

    return await response.blob();
  } catch (error) {
    handleApiError(error, 'downloadResultPdf');
  }
};

/**
 * GET /api/v1/visa/{applicationId}
 * Retrieve detailed information about a specific application
 *
 * @param applicationId - The application ID to fetch
 * @returns Promise with full application details
 */
export const getApplicationDetail = async (
  applicationId: string
): Promise<Application> => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await fetch(
      `${API_V1}/visa/${encodeURIComponent(applicationId)}`,
      {
        method: 'GET',
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Application not found');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Get application detail failed:', errorData);
      throw new Error(
        errorData.message || `Failed to fetch application details (${response.status})`
      );
    }

    const data = (await response.json()) as Application;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      estimatedCompletionAt: new Date(data.estimatedCompletionAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    };
  } catch (error) {
    handleApiError(error, 'getApplicationDetail');
  }
};

/**
 * POST /api/v1/visa/{applicationId}/cancel
 * Cancel a pending application
 *
 * @param applicationId - The application ID to cancel
 * @returns Promise indicating success
 */
export const cancelApplication = async (applicationId: string): Promise<{ success: boolean }> => {
  try {
    if (!applicationId) {
      throw new Error('Application ID is required');
    }

    const response = await fetch(
      `${API_V1}/visa/${encodeURIComponent(applicationId)}/cancel`,
      {
        method: 'POST',
        headers: createHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Application not found');
      }
      const errorData = await response.json().catch(() => ({}));
      console.error('Cancel application failed:', errorData);
      throw new Error(
        errorData.message || `Failed to cancel application (${response.status})`
      );
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, 'cancelApplication');
  }
};

// Export the API client as a namespace object for convenient usage
export const checksApi = {
  createApplication,
  getApplications,
  getApplicationDetail,
  getApplicationResult,
  downloadResultPdf,
  cancelApplication,
};

export default checksApi;
