import { Card, CardContent } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Star,
} from 'lucide-react';
import { useAccount } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import axios from 'axios';
import { getSTData } from '@/hooks/use-ST';
import { id, ethers } from 'ethers';
// import identityAbi from '@/abis/identityAbi.json';
const identityAbi = JSON.parse(`{
  "abi": [
    {
      "inputs": [],
      "name": "addKey",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  "address": "0x0000000000000000000000000000000000000000"
}`)
import tokenAbi from '@/artifacts/tokenABI.json';
import useEligibility from '@/hooks/use-eligibility';


interface EligibilityData {
  eligible: boolean;
  hasIdentity: boolean;
  reason: string;
  requiredClaims: Array<{ topic: number; topicName: string }>;
  userClaims: Array<{ topic: number; topicName: string; issuer: string }>;
  missingClaims: Array<{ topic: number; topicName: string }>;
  trustedIssuers?: Array<{ address: string; topics: string[] }>;
}
interface DeploymentInfo {
  tokenAddress: string;
  tokenLockSmartContract: string;
  contractSuite: string;
  network: string;
  explorerLink: string;
  
}
interface TokenCardProps {
  props: {
    name: string;
    symbol: string;
    type: string;
    status: string;
    startDate: string;
    endDate: string;
    description: string;
    image: string;
    creators: string[];
    contractAddress?: string;
    deploymentInfo?: DeploymentInfo;
    supply: string;
    purpose: string;
    claimsRequired: string[];
    compliance: string[];
    currency?: string;
    minInvestment?: string;
    maxInvestment?: string;
    initialPrice?: string;
    totalHolders?: number;
    isTradeable?: boolean;
    paused?: boolean;
    isPublic?: boolean;
  };
}

const labelToTopic: Record<string, number> = {
  KYC: 1,
  AML: 2,
  'Accredited Investor': 3,
};

const InvestmentCard = ({ props }: TokenCardProps) => {
  const [eligibilityData, setEligibilityData] =
    useState<EligibilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<{
    topic: number;
    topicName: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { address: connectedWallet } = useAccount();
  const item = props;


  const { onChainIdData, hasIdentity, userClaims, totalClaims, loading: eligibilityLoading, error } = useEligibility();


  const handleDetailsClick = (symbol: string) => {
    navigate(`/project/${symbol.toLowerCase()}`);
  };

  const handleRequestClaim = (claim: { topic: number; topicName: string }) => {
    setSelectedClaim(claim);
    setDialogOpen(true);
  };

  const submitClaimRequest = async () => {
    if (!connectedWallet || !selectedClaim) return;
    try {
      setSubmitting(true);
      setSubmitMessage(null);

      const identityRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/kyc/identity/details/${connectedWallet}`
      );
      const identityJson = await identityRes.json();
      const identityAddress: string | undefined =
        identityJson?.data?.identityAddress;

      if (!identityAddress) {
        setSubmitMessage(
          'No OnChainID found. Please create your OnChainID via KYC.'
        );
        setSubmitting(false);
        return;
      }

      // Pick a trusted issuer for this topic, if available
      const issuer = '0x892855D980DB2897fE6715300e4C5F32A3379811'
    
      // const issuer = eligibilityData?.trustedIssuers?.find(ti =>
      //   ti.topics.includes(String(selectedClaim?.topic))
      // )?.address;
    

      if (issuer) {
        if (!(window as any).ethereum) {
          throw new Error('Wallet not detected');
        }

        // Check and switch to Sepolia network if needed
        const browserProvider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        const network = await browserProvider.getNetwork();

        if (network.chainId !== 11155111n) {
          try {
            // Request to switch to Sepolia network
            await (window as any).ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
            });
          } catch (switchError: any) {
            // If the network is not added, add it
            if (switchError.code === 4902) {
              await (window as any).ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  },
                ],
              });
            } else {
              throw new Error('Failed to switch to Sepolia network');
            }
          }
        }

        // Investor adds issuer key to their identity (purpose=3 CLAIM, type=1 ECDSA)
        const signer = await browserProvider.getSigner();
        const identity = new ethers.Contract(
          identityAddress,
          identityAbi as any,
          signer
        );
        const issuerKey = ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(['address'], [issuer])
        );
        console.log('Issuer key:', issuerKey);
        if (issuerKey) {
          const isKeyExists = await identity.getKey(issuerKey);
          const purpose = Number(isKeyExists[0]); // or isKeyExists.purpose
          const keyType = Number(isKeyExists[1]); // or isKeyExists.keyType
          const keyValue = isKeyExists[2]; // bytes32 string

          console.log('Purpose:', purpose);
          console.log('Key Type:', keyType);
          console.log('Key Value:', keyValue);

          console.log('Purpose:', purpose, 'Key type:', keyType, 'Key value:', keyValue);

          if (keyValue !== issuerKey) {
            console.log('adding key for issuer');
            const keyAdded = await identity.addKey(issuerKey, 3, 1);
            await keyAdded.wait();
            console.log('Key added for issuer');
          }


          
        }
       
      }

      console.log('adding request:');

      // Create claim request for issuer to sign
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/claims/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investorWallet: connectedWallet,
          identityAddress,
          tokenAddress: item.contractAddress,
          issuerAddress: issuer || '',
          claimTopic: (selectedClaim.topic),
        }),
      });
      const json = await res.json();
      console.log('Claim request submitted:', json);
      if (!json.success)
        throw new Error(json.error || 'Failed to create claim request');

      setSubmitMessage(
        'Key added (if issuer provided) and claim request submitted. The issuer will review and sign your claim.'
      );
    } catch (e: any) {
      setSubmitMessage(e?.message || 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  const removeClaimTopicfromTokenRegistry = async (
    tokenAddress: string,
    claimTopic: number
  ) => {
    console.log(
      'Removing claim topic from token registry',
      tokenAddress,
      claimTopic
    );

    if (!(window as any).ethereum) {
      throw new Error('Wallet not detected');
    }

    // Check and switch to Sepolia network if needed
    const browserProvider = new ethers.BrowserProvider(
      (window as any).ethereum
    );
    const network = await browserProvider.getNetwork();
    console.log('Network:', network);
    if (network.chainId !== 11155111n) {
      console.log('Switching to Sepolia network');
      try {
        // Request to switch to Sepolia network
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
        });
      } catch (switchError: any) {
        console.log('Switch error:', switchError);
        // If the network is not added, add it
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
              },
            ],
          });
        } else {
          throw new Error('Failed to switch to Sepolia network');
        }
      }
    }

    // Investor removes issuer key from their identity (purpose=3 CLAIM, type=1 ECDSA)
    const signer = await browserProvider.getSigner();

    // const identity = new ethers.Contract(identityAddress, identityAbi as any, signer);
    // const issuerKey = ethers.keccak256(
    //   ethers.AbiCoder.defaultAbiCoder().encode(['address'], [issuer])
    // );
    console.log('Token address:', tokenAddress);
    console.log('Claim topic:', claimTopic);
    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);
    const tokenIdentityRegistry = await token.identityRegistry();
    const identityRegistry = new ethers.Contract(
      tokenIdentityRegistry,
      [
        'function topicsRegistry() view returns (address)',
        'function issuersRegistry() view returns (address)',
      ],
      signer
    );
    const topicsRegistryAddress = await identityRegistry.topicsRegistry();

    const topicsRegistry = new ethers.Contract(
      topicsRegistryAddress,
      ['function removeClaimTopic(uint256 _topic) external'],
      signer
    );

    const tx = await topicsRegistry.removeClaimTopic(claimTopic);
    await tx.wait();
  };



  const missingClaims = eligibilityData?.missingClaims?.filter((claim, index) => {
    return !userClaims.some(uc => String(uc.topic) === String(claim.topic));
  });

  console.log('Missing claims:', missingClaims);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);

        console.log('Fetching ST data for ID:', item.symbol);
        const stdata = await getSTData();
        console.log('ST data received:', stdata);

        const filteredTokens = stdata.filter(
          (contract: any) =>
            contract.symbol.toLowerCase() === item.symbol.toLowerCase()
        );

        console.log('Filtered tokens:', filteredTokens);

        if (filteredTokens.length > 0) {
          const securityTokenContract = filteredTokens[0];
        } else {
          console.log('No token found for symbol:', item.symbol);
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
      } finally {
        setLoading(false);
      }
    };

    // fetchTokenData();

    const fetchEligibility = async () => {
      if (!connectedWallet || !item.contractAddress) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/kyc/eligibility/${connectedWallet}/${item.contractAddress}`
        );
        const result = await response.json();

        if (result.success) {
          // Normalize topics in case backend returns strings
          const data = result.data;
          data.requiredClaims = (data.requiredClaims || []).map((c: any) => ({
            topic: c.topic,
            topicName: c.topicName,
          }));
          data.missingClaims = (data.missingClaims || []).map((c: any) => ({
            topic: c.topic,
            topicName: c.topicName,
          }));
          data.trustedIssuers = (data.trustedIssuers || []).map((ti: any) => ({
            address: ti.address,
            topics: (ti.topics || []).map((t: any) => t),
          }));
          setEligibilityData(data);

          console.log(
            'Fetching eligibility for:',
            connectedWallet,
            data,
            item.contractAddress
          );
        }

         
      
      } catch (error) {
        console.error('Error fetching eligibility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEligibility();
  }, [connectedWallet, item.contractAddress]);


  const getEligibilityBadge = () => {
    if (loading) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Checking...
        </Badge>
      );
    }

    if (!connectedWallet) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Connect Wallet
        </Badge>
      );
    }

    if (!eligibilityData) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Unknown
        </Badge>
      );
    }

    if (!eligibilityData.hasIdentity) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 text-white">
          <XCircle className="h-3 w-3" />
          No OnChainID
        </Badge>
      );
    }

    if (eligibilityData.eligible) {
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 bg-green-500 hover:bg-green-700"
        >
          <CheckCircle className="h-3 w-3" />
          Eligible
        </Badge>
      );
    }

    return (
      <Badge
        variant="destructive"
        className="flex items-center gap-1 text-white"
      >
        <XCircle className="h-3 w-3" />
        Not Eligible
      </Badge>
    );
  };

  const getActionButton = () => {
    if (!connectedWallet) {
      return (
        <Button className="w-full" variant="outline">
          Connect Wallet to Check Eligibility
        </Button>
      );
    }

    if (!eligibilityData?.hasIdentity) {
      return (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => handleDetailsClick(item.symbol)}
        >
          Complete KYC to Invest
        </Button>
      );
    }

    if (eligibilityData?.eligible ||missingClaims?.length === 0) {
      return (
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => handleDetailsClick(item.symbol)}
        >
          Invest Now
        </Button>
      );
    }

    return (
      <Button
        className="w-full bg-orange-600 hover:bg-orange-700"
        onClick={() => handleDetailsClick(item.symbol)}
      >
        Complete Missing Claims
      </Button>
    );
  };

  return (
    <Card className="group border-0 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:shadow-2xl">
      <div className="relative overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Status badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            variant={item.status === 'Open' ? 'default' : 'secondary'}
            className="bg-background/90 text-black"
          >
            {item.status}
          </Badge>
          {item.paused && (
            <Badge variant="destructive" className="bg-red-500/90">
              Paused
            </Badge>
          )}
        </div>

        {/* Eligibility badge overlay */}
        <div className="absolute top-4 right-4">{getEligibilityBadge()}</div>
      </div>

      <CardContent className="space-y-4 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground transition-colors group-hover:text-blue-600">
              {item.name}
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {item.symbol}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {item.type}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary">
          {item.description}
        </p>

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs">Min Investment</span>
            </div>
            <p className="text-sm font-semibold">
              ${item.minInvestment || 'N/A'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-500">
              <Users className="h-3 w-3" />
              <span className="text-xs">Total Holders</span>
            </div>
            <p className="text-sm font-semibold">{item.totalHolders || 0}</p>
          </div>
        </div>

        {/* Compliance & Claims */}
        <div className="space-y-3">
          <div>
            <h4 className="mb-2 flex items-center gap-1 text-xs font-medium text-foreground">
              <Shield className="h-3 w-3" />
             {(missingClaims && missingClaims.length > 0) ? 'Required Claims' : 'Verified Claims'}
            </h4>
            <div className="flex flex-wrap gap-2">
              {eligibilityData?.requiredClaims?.map((claim, index) => {
                const hasClaim = userClaims.some(uc => String(uc.topic) === String(claim.topic));
                console.log('User claims:', userClaims, 'Claim:', claim);
                return (
                  <Button
                    key={index}
                    size="sm"
                    variant={hasClaim ? 'secondary' : 'outline'}
                    className={
                      hasClaim
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : ''
                    }
                    onClick={() => !hasClaim && handleRequestClaim(claim)}
                    disabled={hasClaim}
                  >
                    {claim.topic.toString().slice(0, 6) +
                      '...' +
                      claim.topic.toString().slice(-6)}
                    {hasClaim && <CheckCircle className="ml-1 h-3 w-3" />}
                  </Button>
                );
              }) ||
                item.claimsRequired.map((label, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleRequestClaim({
                        topic: labelToTopic[label] ?? 0,
                        topicName: label,
                      })
                    }
                  >
                    {label}
                  </Button>
                ))}
            </div>
          </div>

          {eligibilityData?.missingClaims &&
            eligibilityData.missingClaims.length > 0 && (missingClaims && missingClaims.length > 0) && (
              <div>
                <h4 className="mb-2 flex items-center gap-1 text-xs font-medium text-red-700">
                  <AlertCircle className="h-3 w-3" />
                  Missing Claims
                </h4>
                <div className="flex flex-wrap gap-1">
                  {eligibilityData.missingClaims.map((claim, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="text-xs text-white"
                    >
                      {claim.topicName.slice(0, 6) +
                        '...' +
                        claim.topicName.slice(-6)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Action button */}
        <div className="pt-2">{getActionButton()}</div>

        {/* Contract info */}
        <div className="border-t border-gray-100 pt-2">
          <p className="font-mono text-xs break-all text-gray-500">
            {item.contractAddress || item.deploymentInfo?.tokenAddress || 'N/A'}
          </p>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Request Claim:{' '}
              {(selectedClaim?.topic ?? 0).toString().slice(0, 6) +
                '...' +
                (selectedClaim?.topic ?? 0).toString().slice(-6)}
            </DialogTitle>
            <DialogDescription>
              We will submit a claim request to a trusted issuer for this token.
              The issuer key must be added to your identity before signing your
              claim.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              Token: <span className="font-mono">{item.symbol}</span>
            </p>
            <p>
              Contract:{' '}
              <span className="font-mono break-all">
                {item.contractAddress || item.deploymentInfo?.tokenAddress || 'N/A'}
              </span>
            </p>
            <p>
              Wallet: <span className="font-mono">{connectedWallet}</span>
            </p>
            {eligibilityData?.trustedIssuers && (
              <div className="text-xs text-gray-500">
                Trusted issuers for topic:{' '}
                {selectedClaim?.topic.toString().slice(0, 6) +
                  '...' +
                  selectedClaim?.topic.toString().slice(-6)}
                <div className="mt-1 flex flex-wrap gap-1">
                  {eligibilityData.trustedIssuers
                    ?.filter(
                      ti =>
                        selectedClaim && ti.topics.includes(String(selectedClaim.topic))
                    )
                    .map((ti, idx) => (
                      <Badge key={idx} variant="outline" className="font-mono">
                        {ti.address}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
          {submitMessage && (
            <div className="mt-2 text-xs break-all text-foreground">
              {submitMessage}
            </div>
          )}

          <div className="mt-2 text-xs break-all text-foreground">
            <Button
              variant="outline"
              onClick={() => {
                const contractAddr = item.contractAddress || item.deploymentInfo?.tokenAddress;
                if (contractAddr) {
                  removeClaimTopicfromTokenRegistry(
                    contractAddr,
                    selectedClaim?.topic ?? 0
                  );
                }
              }}
            >
              Remove Claim
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={submitClaimRequest} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Confirm Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default InvestmentCard;
