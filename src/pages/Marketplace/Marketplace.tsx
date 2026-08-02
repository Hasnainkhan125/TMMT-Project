import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import InvestmentCard from '@/components/ui/Investment-Card';
import { motion } from 'framer-motion';
import { getSTData } from '@/hooks/use-ST';
import { useEligibility } from '@/hooks/use-eligibility';
import { useAccount } from 'wagmi';
import { CheckCircle, XCircle, AlertCircle, Shield, User, Wallet } from 'lucide-react';
import axios from 'axios';

// Define the token interface based on the provided data structure
interface DeploymentInfo {
  tokenAddress: string;
  tokenLockSmartContract: string;
  contractSuite: string;
  network: string;
  explorerLink: string;
}
interface SecurityToken {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  address: string;
  deploymentInfo?: DeploymentInfo;
  owner: string;
  status: string;
  isActive: boolean;
  isPublic: boolean;
  isTradeable: boolean;
  currency: string;
  decimals: number;
  totalSupply: string;
  circulatingSupply: string;
  initialPrice: string;
  minInvestment: string;
  maxInvestment: string;
  jurisdiction: string;
  ownerJurisdiction: string;
  kycRequired: boolean;
  amlRequired: boolean;
  accreditedOnly: boolean;
  paused: boolean;
  complianceModules: Array<{
    name: string;
    address: string;
    status: string;
    deployedAt: string;
    settings: string;
    complianceSettings: any[];
  }>;
  requiredClaims: any[];
  claimTopics: any[];
  agents: string[];
  tokenAgents: any[];
  documents: any[];
  socialLinks: any;
  stats: {
    totalHolders: number;
    totalTransactions: number;
    totalVolume: string;
    lastUpdated: string;
    totalBurned: string;
    totalMinted: string;
    totalTransfers: number;
  };
  metrics: {
    totalHolders: number;
    totalTransactions: number;
    totalVolume: string;
  };
}

const investmentOpportunities = [
  {
    name: 'Stellar Cash Reserve',
    symbol: 'SCR',
    type: 'Fund',
    status: 'Open',
    startDate: '21 Nov 2023',
    endDate: '20 Dec 2027',
    description:
      'Stellar Cash Reserve - bridging the traditional and digital financial realms.',
    image:
      'https://www.designyourway.net/blog/wp-content/uploads/2023/08/3-32.jpg',
    creators: ['Stellar Financial Group', 'Galaxy Digital'],
    contractAddress: '0x8d12A197cB00D4747a1fe03395095ce2A5CC6819',
    supply: '1,000,000 SCR',
    purpose:
      'To offer high-liquidity reserve-backed crypto investments for stable yield.',
    claimsRequired: ['KYC', 'AML'],
    compliance: ['Reg D', 'MiCA'],
  },
  {
    name: 'Apex Capital Partners',
    symbol: 'ACP',
    type: 'Fund',
    status: 'Open',
    startDate: '1 Nov 2023',
    endDate: '30 Nov 2035',
    description: 'Apex Capital Partners - where opportunity meets innovation.',
    image:
      'https://media.licdn.com/dms/image/v2/D4E22AQFXdhaZY1lFIA/feedshare-shrink_800/feedshare-shrink_800/0/1719510764247?e=2147483647&v=beta&t=Gamv2uPWJS2ge6kG1_REGUW7gY9r9ETpUlccInMHScs',
    creators: ['Apex Holdings Ltd.'],
    contractAddress: '0xaC24e68b8657c56A4578fFb69c03F1bC9Fc0f865',
    supply: '5,000,000 ACP',
    purpose: 'To invest in frontier markets, AI startups, and renewable tech.',
    claimsRequired: ['KYC', 'Accredited Investor Proof'],
    compliance: ['SEC 506(c)', 'MAS'],
  },
  {
    name: 'Green Brew Bond',
    symbol: 'GBB',
    type: 'Debt',
    status: 'Open',
    startDate: '20 May 2024',
    endDate: '21 May 2028',
    description:
      'A tokenized debt instrument designed to support sustainable coffee production.',
    image:
      'https://www.manhattanstreetcapital.com/sites/default/files/nasdaq_crypto_ecosystem.jpg',
    creators: ['Green Bean Ventures', 'EarthChain'],
    contractAddress: '0x23B987D96D37Fc8C6c8C3c9621bEb12f8B4182Bc',
    supply: '750,000 GBB',
    purpose:
      'To fund fair-trade certified coffee farming in Latin America and Africa.',
    claimsRequired: ['KYC', 'Impact Investor Declaration'],
    compliance: ['ESG Standards', 'EU Green Bond Regulation'],
  },
];

// const investmentOpportunities = [
// {
// symbol: 'SCR',
// name: 'Stellar Cash Reserve',
// description: 'Stellar Cash Reserve - bridging the traditional and digital financial realms',
// type: 'Fund',
// status: 'Open' as const,
// qualified: false,
// startDate: '21 Nov 2023',
// endDate: '20 Dec 2027'
// },
// {
// symbol: 'ACP',
// name: 'Apex Capital Partners',
// description: 'Apex Capital Partners - where opportunity meets innovation',
// type: 'Fund',
// status: 'Open' as const,
// qualified: false,
// startDate: '1 Nov 2023',
// endDate: '30 Nov 2035'
// },
// {
// symbol: 'GBB',
// name: 'Green Brew Bond',
// description: 'The Green Brew Bond is a tokenized debt instrument designed to support sustainable coffee production and farming',
// type: 'Debt',
// status: 'Open' as const,
// qualified: false,
// startDate: '20 May 2024',
// endDate: '21 May 2028'
// }
// ];


// import { ethers } from 'ethers';
// import { Identity } from '@onchain-id/solidity';



const Dashboard = () => {
  const navigate = useNavigate();
  const [securityTokens, setSecurityTokens] = useState<SecurityToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { address: connectedWallet } = useAccount();
  const { onChainIdData, hasIdentity, userClaims, totalClaims, loading: eligibilityLoading, error } = useEligibility();
  const [identityAddress, setIdentityAddress] = useState<string>('');
  const handleDetailsClick = (symbol: string) => {
    navigate(`/project/${symbol.toLowerCase()}`);
  };

  const handleCreateOnChainId = async (claimIssuerAddress: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/kyc/create-onchainid/${connectedWallet}`);
    console.log(response);


  //   try {
  //     const userIdentity = new ethers.Contract(
  //       onChainIdData?.identityAddress,
  //         Identity.abi,
  //         connectedWallet
  //     );

  //     // option #1 for addClaim, add claim issuer signing key (type = 3 CLAIM) into user identity store:
  //     const txUserIdentity = await userIdentity
  //         .connect(connectedWallet)
  //         .addKey(
  //             ethers.keccak256(
  //                 ethers.AbiCoder.defaultAbiCoder().encode(
  //                     ['address'],
  //                     [claimIssuerAddress]
  //                 )
  //             ),
  //             3,
  //             1
  //         );
  //     await txUserIdentity.wait();
  //     console.log(
  //         `[✓ 27] Invoked addKey at userIdentiyt ${await userIdentity.getAddress()}`
  //     );
  // } catch (error) {
  //     console.error(error);
  //     throw error;
  // }
  
    // try {
    //   const identityAddress = await factory.getIdentity(connectedWallet);
    //   console.log(identityAddress, "here is a identity address");
   

    //   const response = await addKey(identityAddress,claimIssuerAddress,connectedWallet);
    //   console.log(response, "here is a response");
        
    // } catch (error) {
    //   console.error('Error creating OnChainID:', error);
    // }
  };

  const run = async () => {
    try {
      setLoading(true);
      console.log('run');
      const stdata = await getSTData();
      console.log(stdata);
      setSecurityTokens(stdata || []);
    } catch (error) {
      console.error('Error fetching security tokens:', error);
      setSecurityTokens([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  const getOnChainIdStatusCard = () => {
    if (!connectedWallet) {
      return (
        <Card className="mb-8 border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-surface rounded-full">
              <Wallet className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Connect Your Wallet</h3>
              <p className="text-text-secondary text-sm">Connect your wallet to check investment eligibility</p>
            </div>
            <Button variant="outline">Connect Wallet</Button>
          </CardContent>
        </Card>
      );
    }

    if (eligibilityLoading) {
      return (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full animate-pulse">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Checking OnChainID Status...</h3>
              <p className="text-blue-600 text-sm">Please wait while we verify your identity credentials</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className="mb-8 border-red-200 bg-red-50 w-[100vw]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error Loading Identity Status</h3>
              <p className="text-red-600 text-sm text-wrap w-[90vw]">{error}</p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!hasIdentity) {
      return (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">OnChainID Required</h3>
              <p className="text-yellow-700 text-sm">You need to complete KYC verification to invest in tokens</p>
            </div>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => navigate('/onboarding/kyc')}
            >
              Complete KYC
            </Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => handleCreateOnChainId(securityTokens[0].address)}
            >
              Create OnChainID
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-8 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">
                OnChainID Verified
                <Badge variant="default" className="bg-green-600">
                  {totalClaims} Claims
                </Badge>
              </h3>
              <p className="text-green-700 text-sm">
                Identity Address: <span className="font-mono text-xs">{onChainIdData?.identityAddress}</span>
              </p>
            </div>
          </div>
          
          {userClaims.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Your Verified Claims
              </h4>
              <div className="flex flex-wrap gap-2">
                {userClaims.map((claim, index) => (
                  <Badge key={index} variant="outline" className="bg-green-100 border-green-300 text-green-800">
                    {claim.topicName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-background p-8 pt-[10%]">
      <div className="mb-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">
          Investment Opportunities
        </h1>
        <p className="text-text-secondary">
          Discover and invest in tokenized securities. Your eligibility is automatically checked based on your OnChainID claims.
        </p>
      </div>

      {/* OnChainID Status Card */}
      {getOnChainIdStatusCard()}

      <div className="mb-8 rounded-lg bg-purple-500 p-6 text-white">
        <h3 className="mb-2 font-medium">
          The 'Invest' tab offers an overview of all the Issuer's projects and
          your qualification status for each project at a glance.
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm">13 of 51</span>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              ←
            </Button>
            <Button variant="secondary" size="sm">
              →
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="secondary"
          size="sm"
          className="bg-black text-white hover:bg-sky-950"
        >
          <Link to="/issuer/dashboard" className="text-white">
            Tokenize Asset
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-text-secondary">Loading investment opportunities...</div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {securityTokens?.map((item, index) => (
            <motion.div
              key={item.id || index}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="overflow-hidden rounded-2xl border border-border shadow-xl"
            >
              <InvestmentCard
                props={{
                  name: item.name,
                  symbol: item.symbol,
                  type: 'Token',
                  status: item.isActive ? 'Open' : 'Closed',
                  startDate: new Date(item.createdAt).toLocaleDateString(),
                  endDate: 'N/A',
                  description: item.description || `${item.name} - A digital security token offering`,
                  image: 'https://www.designyourway.net/blog/wp-content/uploads/2023/08/3-32.jpg', // Default image
                  creators: [item.owner],
                  contractAddress: item.address || item.deploymentInfo?.tokenAddress || '',
                  supply: `${item.totalSupply} ${item.symbol}`,
                  purpose: `Digital security token with ${item.currency} denomination`,
                  claimsRequired: [
                    ...(item.kycRequired ? ['KYC'] : []),
                    ...(item.amlRequired ? ['AML'] : []),
                    ...(item.accreditedOnly ? ['Accredited Investor'] : [])
                  ],
                  compliance: [
                    ...(item.amlRequired ? ['AML'] : []),
                    ...(item.kycRequired ? ['KYC'] : []),
                    `Jurisdiction: ${item.jurisdiction}`
                  ],
                  // Additional data for display
                  minInvestment: item.minInvestment,
                  maxInvestment: item.maxInvestment,
                  initialPrice: item.initialPrice,
                  isTradeable: item.isTradeable,
                  totalHolders: item.stats?.totalHolders || 0,
                  currency: item.currency,
                  paused: item.paused,
                  isPublic: item.isPublic,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && securityTokens.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="text-text-secondary">No investment opportunities available at the moment.</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
