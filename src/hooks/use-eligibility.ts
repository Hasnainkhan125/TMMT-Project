    import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { getOnChainIdDetails, checkTokenEligibility } from '@/api';

export interface EligibilityData {
  eligible: boolean;
  hasIdentity: boolean;
  reason: string;
  requiredClaims: Array<{ topic: number; topicName: string }>;
  userClaims: Array<{ topic: number; topicName: string; issuer: string }>;
  missingClaims: Array<{ topic: number; topicName: string }>;
  identityAddress?: string;
}

export interface OnChainIdData {
  hasIdentity: boolean;
  identityAddress: string | null;
  claims: Array<{
    claimId: string;
    topic: number;
    scheme: number;
    issuer: string;
    data: string;
    uri: string;
    topicName: string;
  }>;
  totalClaims: number;
  message?: string;
}

export const useEligibility = () => {
  const { address: connectedWallet } = useAccount();
  const [onChainIdData, setOnChainIdData] = useState<OnChainIdData | null>(null);
  const [eligibilityCache, setEligibilityCache] = useState<Map<string, EligibilityData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch OnChainID details for connected wallet
  const fetchOnChainIdDetails = useCallback(async () => {
    if (!connectedWallet) {
      setOnChainIdData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getOnChainIdDetails(connectedWallet);
      if (response.success) {
        setOnChainIdData(response.data);
      } else {
        setError(response.error || 'Failed to fetch OnChainID details');
      }
    } catch (err) {
      setError('Network error while fetching OnChainID details');
      console.error('OnChainID fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [connectedWallet]);

  // Check eligibility for a specific token
  const checkEligibility = useCallback(async (tokenAddress: string): Promise<EligibilityData | null> => {
    if (!connectedWallet) {
      return null;
    }

    // Check cache first
    const cacheKey = `${connectedWallet}-${tokenAddress}`;
    if (eligibilityCache.has(cacheKey)) {
      return eligibilityCache.get(cacheKey)!;
    }

    try {
      const response = await checkTokenEligibility(connectedWallet, tokenAddress);
      if (response.success) {
        const eligibilityData = response.data;
        // Cache the result
        setEligibilityCache(prev => new Map(prev.set(cacheKey, eligibilityData)));
        return eligibilityData;
      } else {
        setError(response.error || 'Failed to check eligibility');
        return null;
      }
    } catch (err) {
      setError('Network error while checking eligibility');
      console.error('Eligibility check error:', err);
      return null;
    }
  }, [connectedWallet, eligibilityCache]);

  // Clear cache when wallet changes
  useEffect(() => {
    setEligibilityCache(new Map());
    setError(null);
  }, [connectedWallet]);

  // Fetch OnChainID details when wallet connects
  useEffect(() => {
    fetchOnChainIdDetails();
  }, [fetchOnChainIdDetails]);

  return {
    onChainIdData,
    loading,
    error,
    fetchOnChainIdDetails,
    checkEligibility,
    clearCache: () => setEligibilityCache(new Map()),
    hasIdentity: onChainIdData?.hasIdentity || false,
    userClaims: onChainIdData?.claims || [],
    totalClaims: onChainIdData?.totalClaims || 0,
  };
};

export default useEligibility; 