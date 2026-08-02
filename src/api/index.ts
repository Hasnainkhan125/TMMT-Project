import config from '@/config';
import { Application } from '@/types/tammat.types';

const BASE_URL = config.API_BASE_URL;

const ENDPOINTS = {
  // auth
  getSignData: `${BASE_URL}/user/auth_message`,
  login: `${BASE_URL}/user/sign_in`,
  logout: `${BASE_URL}/user/sign_out`,
  // applications
  createApplication: `${BASE_URL}/applications`,
  getApplication: `${BASE_URL}/applications/:id`,
  // services
  getServices: `${BASE_URL}/services/services`,
  getServiceById: `${BASE_URL}/services/services/:id`,
  searchServices: `${BASE_URL}/services/search`,
  getStats: `${BASE_URL}/services/stats`,
  createService: `${BASE_URL}/services/services`,
  updateService: `${BASE_URL}/services/services/:id`,
  deleteService: `${BASE_URL}/services/services/:id`,
  reloadServices: `${BASE_URL}/services/reload`,
  backupServices: `${BASE_URL}/services/backup`,
  restoreServices: `${BASE_URL}/services/restore`,
};

// OnChainID and Eligibility API functions
export const getOnChainIdDetails = async (walletAddress: string) => {
  try {
    const response = await fetch(`http://localhost:5001/api/v1/kyc/identity/details/${walletAddress}`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching OnChainID details:', error);
    throw error;
  }
};

export const checkTokenEligibility = async (walletAddress: string, tokenAddress: string) => {
  try {
    const response = await fetch(`http://localhost:5001/api/v1/kyc/eligibility/${walletAddress}/${tokenAddress}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking token eligibility:', error);
    throw error;
  }
};

export const applicationApi = {
  create: async (application: Application) => {
    const response = await fetch(`${ENDPOINTS.createApplication}`, {
      method: 'POST',
      body: JSON.stringify(application),
    });
    return response.json();
  },
  get: async (id: string) => {
    const response = await fetch(`${ENDPOINTS.getApplication}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  },  
};
export default ENDPOINTS;
