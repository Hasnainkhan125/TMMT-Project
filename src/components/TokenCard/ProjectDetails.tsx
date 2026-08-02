import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Shield,
  Users,
  TrendingUp,
  DollarSign,
  Award,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  Network,
  Hash,
  Target,
  Database,
  Settings,
  Globe,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  FileText,
  Eye,
  EyeOff,
  Calendar,
  MapPin,
  Building,
  Wallet,
  Zap,
  Star,
  AlertTriangle,
  Info,
  Link as LinkIcon,
  ExternalLink,
  User,
  Loader2,
  ArrowRightLeft,
  CreditCard,
} from 'lucide-react';
import { getSTData } from '@/hooks/use-ST';
import axios from 'axios';
import { useAccount, useBalance, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import useEligibility from '@/hooks/use-eligibility';
import { toast } from 'sonner';
import { createOrder } from '@/api/orders';

// Enhanced interfaces for ADNOC token data
interface TokenMetrics {
  totalTransactions: number;
  totalHolders: number;
  totalVolume: string;
}

interface DeploymentInfo {
  contractSuite: {
    identityRegistryAddress: string;
    identityRegistryStorageAddress: string;
    trustedIssuerRegistryAddress: string;
    claimTopicsRegistryAddress: string;
    modularComplianceAddress: string;
  };
  tokenAddress: string;
  tokenLockSmartContract: string;
  deployedAt: string;
  network: string;
  explorerLink: string;
}

interface ComplianceModule {
  moduleKey: string;
  proxyAddress: string;
  complianceSettings: string[];
  deployedAt: string;
  status: string;
}

interface ClaimData {
  claimTopics: string[];
  claimTopicsIds: number[];
  claimTopicsHashed: string[];
  claimIssuers: string[];
  issuerClaims: string[][];
  issuerClaimsHashed: string[][];
}

interface EnhancedSecurityToken {
  metrics: TokenMetrics;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  prefix: string;
  ownerAddress: string;
  ownerName: string;
  ownerEmail: string;
  ownerJurisdiction: string;
  irAgentAddress: string;
  tokenAgentAddress: string;
  tokenAgents: Array<{
    address: string;
    role: string;
    addedAt: string;
  }>;
  initialPrice: string;
  currency: string;
  minInvestment: string;
  maxInvestment: string;
  deploymentInfo: DeploymentInfo;
  complianceModules: ComplianceModule[];
  kycRequired: boolean;
  amlRequired: boolean;
  accreditedOnly: boolean;
  requiredClaims: string[];
  trustedIssuers: string[];
  claimData: ClaimData;
  status: string;
  totalSupply: string;
  circulatingSupply: string;
  assetType: string;
  assetCategory: string;
  assetDescription: string;
  assetValue: string;
  assetCurrency: string;
  estimatedValue: string;
  jurisdiction: string;
  logoUrl: string;
  description: string;
  website: string;
  whitepaper: string;
  socialLinks: Record<string, any>;
  createdBy: string;
  isActive: boolean;
  isPublic: boolean;
  isTradeable: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
}

// Contract addresses for Sepolia
const USDT_ADDRESS = '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06'; // Sepolia USDT
const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Sepolia USDC

const ERC20_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Advanced Investment Modal Component
const AdvancedInvestmentModal = ({ 
  open, 
  onOpenChange, 
  token 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  token: EnhancedSecurityToken | null;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [investmentData, setInvestmentData] = useState({
    currency: 'USD',
    amount: '',
    tokenAmount: '',
    paymentMethod: 'crypto',
    cryptoToken: 'USDT',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [requiredAmount, setRequiredAmount] = useState('0');
  const [hasBalance, setHasBalance] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isUSPerson, setIsUSPerson] = useState<null | boolean>(null);
  const [pepStatus, setPepStatus] = useState<'none' | 'self' | 'family' | 'associate' | null>('none');
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [creatingOrder, setCreatingOrder] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  // Get balances for different tokens
  const { data: ethBalance } = useBalance({ address });
  const { data: usdtBalance } = useBalance({
    address,
    token: USDT_ADDRESS as `0x${string}`,
  });
  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS as `0x${string}`,
  });

  const { writeContract } = useWriteContract();

  const steps = [
    { title: 'Amount', description: 'Investment details', icon: DollarSign },
    { title: 'Payment', description: 'Choose method', icon: CreditCard },
    { title: 'Contact', description: 'Your information', icon: User },
    { title: 'Compliance', description: 'Declarations', icon: Shield },
    { title: 'Review', description: 'Confirm order', icon: Eye },
    { title: 'Complete', description: 'Finalize payment', icon: CheckCircle }
  ];

  const calculateRequiredAmount = () => {
    if (!investmentData.amount || !token?.initialPrice) return '0';
    
    const tokenAmount = Number(investmentData.amount) / Number(token.initialPrice);
    setInvestmentData(prev => ({ ...prev, tokenAmount: tokenAmount.toFixed(6) }));
    
    // Calculate required crypto amount (assuming 1:1 USD for stablecoins)
    const required = investmentData.cryptoToken === 'ETH' ? 
      (Number(investmentData.amount) / 3000).toFixed(6) : // Rough ETH price
      investmentData.amount;
    
    setRequiredAmount(required);
    return required;
  };

  const checkBalance = () => {
    const required = Number(requiredAmount);
    let available = 0;

    switch (investmentData.cryptoToken) {
      case 'ETH':
        available = Number(formatEther(ethBalance?.value || 0n));
        break;
      case 'USDT':
        available = Number(formatUnits(usdtBalance?.value || 0n, 6));
        break;
      case 'USDC':
        available = Number(formatUnits(usdcBalance?.value || 0n, 6));
        break;
    }

    setHasBalance(available >= required);
    return available >= required;
  };

  useEffect(() => {
    calculateRequiredAmount();
  }, [investmentData.amount, investmentData.cryptoToken, token?.initialPrice]);

  useEffect(() => {
    checkBalance();
  }, [requiredAmount, ethBalance, usdtBalance, usdcBalance]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNetworkSwitch = async () => {
    if (chainId !== sepolia.id) {
      try {
        await switchChain({ chainId: sepolia.id });
        toast.success('Network switched to Sepolia');
      } catch (error) {
        toast.error('Failed to switch network');
      }
    }
  };
  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask not detected');
      return false;
    }
  
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
      return true;
    } catch (switchError: any) {
      // This error code 4902 indicates the chain is not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'] /* RPC URL */,
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          toast.error('Failed to add Sepolia network to MetaMask');
          return false;
        }
      }
      console.error('Failed to switch to Sepolia:', switchError);
      toast.error('Please switch MetaMask to Sepolia manually');
      return false;
    }
  };
  const processPayment = async () => {
    if (!address || !token?.ownerAddress) {
      toast.error('Wallet not connected or token owner not found');
      return;
    }

    setLoading(true);
    try {
      const switched = await switchToSepolia();
      if (!switched) return;

      let txHash: string = '';

      if (investmentData) {
        // Direct ETH transfer - we need to send ETH to the token owner address
        // Since writeContract is for contract calls, we'll need to use a different approach
        // For now, let's simulate the transaction
        const amount = parseEther('0.0001');
        const txResponse = await (window as any).ethereum?.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: token.ownerAddress,
            value: amount.toString(),
          }],
        });
        
        toast.info('ETH transfers require a different implementation - using simulation');
        txHash = Date.now()+ txResponse;
      } else {
        // ERC20 token transfer
        const tokenAddress = investmentData.cryptoToken === 'USDT' ? USDT_ADDRESS : USDC_ADDRESS;
        const decimals = investmentData.cryptoToken === 'USDT' ? 6 : 6;
        
        await writeContract({
          address: tokenAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [token.ownerAddress as `0x${string}`, parseUnits(requiredAmount, decimals)],
        });
        txHash = 'payment_tx_' + Date.now(); // Mock transaction hash for demo
      }

      setTransactionHash(txHash);
      
      // Store transaction in database
      await storeTransactionInDB(txHash);
      
      setCurrentStep(5); // Move to confirmation step
      toast.success('Payment submitted successfully!');
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast.error(error?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!address || !token) return;
    if (!termsAccepted) {
      alert('Please accept terms to continue');
      return;
    }
    try {
      setCreatingOrder(true);
      const order = await createOrder({
        investor_wallet: address.toLowerCase(),
        token_address: token.deploymentInfo.tokenAddress,
        investment_amount: Number(investmentData.amount),
        // cast to union types
        investment_currency: (investmentData.currency as 'USD' | 'AED' | 'CHF' | 'SGD' | 'EUR' | 'USDC' | 'USDT'),
        payment_method: (investmentData.cryptoToken === 'bank' ? 'bank_wire' : 'wallet'),
        network_id: typeof chainId === 'number' ? chainId : null,
        delivery_address: address,
        investor_contact: {
          name: contactName || undefined,
          email: contactEmail || undefined,
          phone: contactPhone || undefined,
        },
        declarations: {
          terms_accepted: termsAccepted,
          us_person: isUSPerson,
          pep_status: pepStatus,
          marketing_consent: marketingConsent,
        },
      });
      setCreatedOrderId(order.id);
      setCreatedOrderNumber(order.order_number);
      // Payment confirmation should be handled after wallet transaction flow completes
      // Proceed to next UI step
      setCurrentStep(5); // Move to confirmation step
      toast.success('Order created successfully!');
    } catch (e: any) {
      alert(e?.message || 'Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const storeTransactionInDB = async (txHash: string) => {
    try {
      const transactionData = {
        txHash,
        investorAddress: address,
        tokenAddress: token?.address,
        tokenSymbol: token?.symbol,
        investmentAmount: investmentData.amount,
        investmentCurrency: investmentData.currency,
        tokenAmount: investmentData.tokenAmount,
        investor_wallet: address,
        token_address: token?.address,
        investment_amount: investmentData.amount,
        paymentMethod: investmentData.cryptoToken,
        requiredCryptoAmount: requiredAmount,
        tokenOwnerAddress: token?.ownerAddress,
        status: 'pending_confirmation',
        createdAt: new Date().toISOString(),
        notes: investmentData.notes
      };

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/investments/create`, transactionData);
      console.log('Transaction stored in database');
    } catch (error) {
      console.error('Failed to store transaction:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="mx-auto h-12 w-12 text-green-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Investment Details</h3>
              <p className="text-text-secondary">Enter your investment amount and currency</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Investment Currency</Label>
                <RadioGroup
                  value={investmentData.currency}
                  onValueChange={(value) => setInvestmentData(prev => ({ ...prev, currency: value }))}
                  className="grid grid-cols-3 gap-4 mt-3"
                >
                  {['USD', 'EUR', 'AED'].map((currency) => (
                    <div key={currency} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-surface-light">
                      <RadioGroupItem value={currency} id={currency.toLowerCase()} />
                      <Label htmlFor={currency.toLowerCase()} className="font-medium">{currency}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="amount" className="text-base font-medium">Investment Amount</Label>
                <div className="relative mt-2">
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Minimum ${token?.minInvestment} ${investmentData.currency}`}
                    value={investmentData.amount}
                    onChange={(e) => setInvestmentData(prev => ({ ...prev, amount: e.target.value }))}
                    className="text-lg py-3"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    {investmentData.currency}
                  </span>
                </div>
                
                <div className="mt-4 p-4 bg-surface-light rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Investment Range:</span>
                    <span className="font-medium">{token?.minInvestment} - {token?.maxInvestment} {investmentData.currency}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Token Price:</span>
                    <span className="font-medium">{formatCurrency(token?.initialPrice || '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">You will receive:</span>
                    <span className="font-bold text-green-600">{investmentData.tokenAmount} {token?.symbol}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Select Cryptocurrency</Label>
              <RadioGroup
                value={investmentData.cryptoToken}
                onValueChange={(value) => setInvestmentData(prev => ({ ...prev, cryptoToken: value }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="USDT" id="usdt" />
                  <div className="flex-1">
                    <Label htmlFor="usdt" className="font-medium">USDT (Tether)</Label>
                    <p className="text-xs text-gray-500">Stable USD pegged cryptocurrency</p>
                    {usdtBalance && (
                      <p className="text-xs text-green-600">
                        Balance: {formatUnits(usdtBalance.value, 6)} USDT
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="USDC" id="usdc" />
                  <div className="flex-1">
                    <Label htmlFor="usdc" className="font-medium">USDC (USD Coin)</Label>
                    <p className="text-xs text-gray-500">USD backed stablecoin</p>
                    {usdcBalance && (
                      <p className="text-xs text-green-600">
                        Balance: {formatUnits(usdcBalance.value, 6)} USDC
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="ETH" id="eth" />
                  <div className="flex-1">
                    <Label htmlFor="eth" className="font-medium">ETH (Ethereum)</Label>
                    <p className="text-xs text-gray-500">Native Ethereum cryptocurrency</p>
                    {ethBalance && (
                      <p className="text-xs text-green-600">
                        Balance: {Number(formatEther(ethBalance.value)).toFixed(6)} ETH
                      </p>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="mx-auto h-12 w-12 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Contact Information</h3>
              <p className="text-text-secondary">Provide your contact details for order updates</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name" className="text-base font-medium">Full Name</Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Enter your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact-email" className="text-base font-medium">Email Address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">We'll send order updates to this email</p>
              </div>

              <div>
                <Label htmlFor="contact-phone" className="text-base font-medium">Phone Number <span className="text-gray-400">(Optional)</span></Label>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Privacy Notice</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Your contact information will only be used for order-related communications and compliance purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="mx-auto h-12 w-12 text-amber-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Compliance Declarations</h3>
              <p className="text-text-secondary">Please confirm the following statements</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-red-200 bg-red-50 rounded-lg">
                  <Checkbox
                    id="terms-accepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="terms-accepted" className="text-base font-medium text-red-900 cursor-pointer">
                      I accept the Terms and Conditions *
                    </Label>
                    <p className="text-sm text-red-700 mt-1">
                      Required: You must accept the terms to proceed with the investment.
                    </p>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-medium">Are you a US person for tax purposes?</Label>
                  <RadioGroup
                    value={isUSPerson === null ? 'unknown' : isUSPerson ? 'yes' : 'no'}
                    onValueChange={(value) => setIsUSPerson(value === 'unknown' ? null : value === 'yes')}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="us-person-no" />
                      <Label htmlFor="us-person-no">No</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="us-person-yes" />
                      <Label htmlFor="us-person-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unknown" id="us-person-unknown" />
                      <Label htmlFor="us-person-unknown">Prefer not to answer</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 border rounded-lg">
                  <Label className="text-base font-medium">Political Exposure Status</Label>
                  <Select value={pepStatus || 'none'} onValueChange={(value) => setPepStatus(value as any)}>
                    <SelectTrigger className="mt-3">
                      <SelectValue placeholder="Select your status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No political exposure</SelectItem>
                      <SelectItem value="self">I am a politically exposed person</SelectItem>
                      <SelectItem value="family">Close family member of PEP</SelectItem>
                      <SelectItem value="associate">Close associate of PEP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="marketing-consent" className="text-base font-medium cursor-pointer">
                      Marketing Communications
                    </Label>
                    <p className="text-sm text-text-secondary mt-1">
                      I consent to receive marketing communications about similar investment opportunities.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Important Notice</p>
                    <p className="text-sm text-amber-700 mt-1">
                      By proceeding, you acknowledge that you understand the risks associated with this investment and that you meet all applicable eligibility requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Eye className="mx-auto h-12 w-12 text-purple-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Review Your Order</h3>
              <p className="text-text-secondary">Please review all details before proceeding</p>
            </div>

            <div className="space-y-6">
              {/* Investment Summary */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-purple-600" />
                    Investment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-text-secondary text-sm">Token</span>
                      <p className="font-bold text-lg">{token?.symbol}</p>
                      <p className="text-gray-500 text-sm">{token?.name}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-sm">Investment Amount</span>
                      <p className="font-bold text-lg">{investmentData.amount} {investmentData.currency}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-sm">Token Amount</span>
                      <p className="font-bold text-lg text-green-600">{investmentData.tokenAmount} {token?.symbol}</p>
                    </div>
                    <div>
                      <span className="text-text-secondary text-sm">Payment Method</span>
                      <p className="font-bold text-lg capitalize">{investmentData.cryptoToken}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Required Payment</span>
                    <span className="font-bold text-xl text-green-600">{requiredAmount} {investmentData.cryptoToken}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg flex items-center">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Name:</span>
                      <span className="font-medium">{contactName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Email:</span>
                      <span className="font-medium">{contactEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Phone:</span>
                      <span className="font-medium">{contactPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Summary */}
              <Card>
                <CardHeader className="bg-amber-50">
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-amber-600" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Terms & Conditions</span>
                    <Badge variant={termsAccepted ? "default" : "destructive"} className={termsAccepted ? "bg-green-100 text-green-800" : ""}>
                      {termsAccepted ? "Accepted" : "Required"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>US Person Status</span>
                    <span className="text-sm text-text-secondary">
                      {isUSPerson === null ? 'Not specified' : isUSPerson ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PEP Status</span>
                    <span className="text-sm text-text-secondary capitalize">
                      {pepStatus === 'none' ? 'No exposure' : pepStatus || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Marketing Consent</span>
                    <span className="text-sm text-text-secondary">
                      {marketingConsent ? 'Consented' : 'Declined'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Network & Wallet Info */}
              <Card>
                <CardHeader className="bg-surface-light">
                  <CardTitle className="text-lg flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-text-secondary" />
                    Wallet & Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Wallet Address:</span>
                    <span className="font-mono text-sm">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Network:</span>
                    <span className="font-medium">
                      {chainId === sepolia.id ? 'Sepolia Testnet' : `Chain ${chainId}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Balance Status:</span>
                    <Badge variant={hasBalance ? "default" : "destructive"} className={hasBalance ? "bg-green-100 text-green-800" : "text-white"}>
                      {hasBalance ? "Sufficient" : "Insufficient"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional information..."
                  value={investmentData.notes}
                  onChange={(e) => setInvestmentData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Investment Submitted!</h3>
              <p className="text-text-secondary">
                Your investment has been submitted successfully. The token issuer will mint your tokens once the transaction is confirmed.
              </p>
              
              {transactionHash && (
                <div className="bg-surface-light p-4 rounded-lg">
                  <p className="text-sm text-text-secondary mb-2">Transaction Hash:</p>
                  <p className="font-mono text-sm break-all">{transactionHash}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Etherscan
                  </Button>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Your transaction is being processed on the blockchain</li>
                  <li>• The token issuer will review and mint your tokens</li>
                  <li>• You'll receive tokens in your wallet once minting is complete</li>
                  <li>• Track your investment in the investor dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return investmentData.amount && 
               Number(investmentData.amount) >= Number(token?.minInvestment) && 
               Number(investmentData.amount) <= Number(token?.maxInvestment);
      case 1:
        return investmentData.cryptoToken;
      case 2:
        return contactEmail; // Email is required for order updates
      case 3:
        return termsAccepted; // Terms must be accepted
      case 4:
        return termsAccepted && chainId === sepolia.id ;
      case 5:
        return !loading;
      default:
        return false;
    }
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Invest in {token?.symbol}
          </DialogTitle>
          <DialogDescription>
            Complete your investment through our secure crypto payment system
          </DialogDescription>
        </DialogHeader>

        {/* Enhanced Progress Steps */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isUpcoming = index > currentStep;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 relative">
                  {index < steps.length - 1 && (
                    <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                      isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-500' : 'bg-gray-200'
                    }`} style={{ transform: 'translateX(50%)' }} />
                  )}
                  
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    isCompleted 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : isActive 
                      ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="text-center mt-3 max-w-24">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isActive ? 'text-blue-500' : isCompleted ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-full h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round((currentStep / (steps.length - 1)) * 100)}% Complete</span>
          </div>
        </div>

        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || currentStep === 5}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {currentStep === 5 ? 'Close' : 'Cancel'}
            </Button>
            
            {currentStep === 4 ? (
              <Button 
                onClick={handleCreateOrder}
                disabled={creatingOrder || !termsAccepted }
                className="bg-purple-600 hover:bg-purple-700"
              >
                {creatingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Create Order'
                )}
              </Button>
            ) : currentStep === 5 ? (
              <Button 
                onClick={processPayment}
                disabled={loading || !createdOrderId}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProjectDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [enhancedToken, setEnhancedToken] = useState<EnhancedSecurityToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);

  const { address: connectedWallet } = useAccount();
  const {
    onChainIdData,
    hasIdentity,
    userClaims,
    totalClaims,
    loading: eligibilityLoading,
    error: eligibilityError,
  } = useEligibility();

  const [eligibilityData, setEligibilityData] = useState<any>(null);

  const missingClaims =
    eligibilityData?.missingClaims?.filter((claim: any) => {
      return !userClaims?.some(
        (uc: any) => String(uc.topic) === String(claim.topic)
      );
    }) || [];

  const id = params?.id as string;

  useEffect(() => {
    const fetchEligibility = async () => {
      if (!connectedWallet || !enhancedToken?.address) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5001/api/v1/kyc/eligibility/${connectedWallet}/${enhancedToken?.address}`
        );
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          data.requiredClaims = (data.requiredClaims || []).map((c: any) => ({
            topic: c.topic,
            topicName: c.topicName,
          }));
          data.missingClaims = (data.missingClaims || []).map((c: any) => ({
            topic: c.topic,
            topicName: c.topicName,
          }));
          setEligibilityData(data);
        }
      } catch (error) {
        console.error('Error fetching eligibility:', error);
      }
    };

    fetchEligibility();
  }, [connectedWallet, enhancedToken?.address]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        setError(null);

        const stdata = await getSTData();
        const filteredTokens = stdata.filter(
          (contract: any) => contract.symbol.toLowerCase() === id?.toLowerCase()
        );

        if (filteredTokens.length > 0) {
          setEnhancedToken(filteredTokens[0] as EnhancedSecurityToken);
        } else {
          setError('Token not found');
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to load token data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTokenData();
    }
  }, [id]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n?.toLocaleString();
  };

  const formatCurrency = (amount: string, currency: string = 'USD') => {
    const num = Number(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-lg text-text-secondary">Loading token details...</p>
        </div>
      </div>
    );
  }

  if (error || !enhancedToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Card className="mx-auto max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              {error || 'Token Not Found'}
            </h2>
            <p className="mb-6 text-text-secondary">
              {error === 'Token not found'
                ? `No token found with symbol "${id?.toUpperCase()}".`
                : 'There was an error loading the token details. Please try again.'}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-[5%]">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="transition-colors hover:bg-background/50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              {enhancedToken?.logoUrl ? (
                <img 
                  src={enhancedToken.logoUrl} 
                  alt={enhancedToken.name}
                  className="h-12 w-12 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-bold text-white shadow-lg">
                  {enhancedToken?.symbol}
                </div>
              )}
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {enhancedToken?.name}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-text-secondary">{enhancedToken?.assetCategory?.replace('-', ' ').toUpperCase()}</p>
                <Badge variant="outline">{enhancedToken?.assetType}</Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {enhancedToken?.jurisdiction}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
          {/* Main Content */}
          <div className="space-y-8 xl:col-span-3">
            {/* Hero Section */}
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-800">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="mb-2 flex items-center space-x-4">
                    <Badge className="bg-green-500 text-white">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {enhancedToken?.status}
                    </Badge>
                    <Badge variant="outline" className="border-white text-white">
                      <Building className="mr-1 h-3 w-3" />
                      {enhancedToken?.assetCategory}
                    </Badge>
                    <Badge variant="outline" className="border-blue-300 text-blue-200">
                      <Globe className="mr-1 h-3 w-3" />
                      {enhancedToken?.jurisdiction}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-semibold">{enhancedToken?.name}</h2>
                  <p className="mt-1 text-sm text-gray-200">
                    Asset Value: {formatCurrency(enhancedToken?.assetValue || '0', enhancedToken?.assetCurrency)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Asset Overview Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 shadow-lg">
                <CardContent className="p-6 text-center">
                  <DollarSign className="mx-auto mb-3 h-10 w-10 text-green-600" />
                  <h3 className="text-2xl font-bold text-green-700">
                    {formatCurrency(enhancedToken?.assetValue || '0', enhancedToken?.assetCurrency)}
                  </h3>
                  <p className="text-sm text-green-600">Total Asset Value</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Database className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                  <h3 className="text-2xl font-bold text-blue-700">
                    {formatNumber(enhancedToken?.totalSupply || '0')}
                  </h3>
                  <p className="text-sm text-blue-600">Total Token Supply</p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="mx-auto mb-3 h-10 w-10 text-purple-600" />
                  <h3 className="text-2xl font-bold text-purple-700">
                    {formatCurrency(enhancedToken?.initialPrice || '0')}
                  </h3>
                  <p className="text-sm text-purple-600">Token Price</p>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Tabs */}
            <Card className="border-0 shadow-lg">
              <Tabs defaultValue="overview" className="w-full">
                <CardHeader className="pb-4">
                  <TabsList className="grid w-full grid-cols-5 bg-surface">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="asset">Asset Details</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="investment">Investment</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="space-y-8">
                  <TabsContent value="overview" className="mt-0 space-y-8">
                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <Info className="mr-2 h-5 w-5 text-blue-600" />
                        About {enhancedToken?.name}
                      </h3>
                      <p className="mb-4 text-lg leading-relaxed text-foreground">
                        {enhancedToken?.description}
                      </p>
                      <p className="text-text-secondary">
                        <strong>Asset Description:</strong> {enhancedToken?.assetDescription}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <User className="mr-2 h-5 w-5 text-indigo-600" />
                        Token Issuer Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3">
                              <User className="h-8 w-8 text-indigo-600" />
                              <div>
                                <p className="font-semibold text-indigo-700">
                                  {enhancedToken?.ownerName}
                                </p>
                                <p className="text-sm text-indigo-600">
                                  {enhancedToken?.ownerEmail}
                                </p>
                                <p className="text-xs text-indigo-500">
                                  Jurisdiction: {enhancedToken?.ownerJurisdiction}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                          <CardContent className="p-4">
                            <div>
                              <p className="text-sm text-text-secondary">Owner Address</p>
                              <p className="font-mono text-sm break-all">
                                {enhancedToken?.ownerAddress}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="asset" className="mt-0 space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <Building className="mr-2 h-5 w-5 text-green-600" />
                        Underlying Asset Information
                      </h3>
                      
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-green-700 mb-2">Asset Category</h4>
                            <p className="text-green-600 capitalize">
                              {enhancedToken?.assetCategory?.replace('-', ' ')}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-blue-700 mb-2">Asset Type</h4>
                            <p className="text-blue-600 capitalize">{enhancedToken?.assetType}</p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-purple-700 mb-2">Current Valuation</h4>
                            <p className="text-purple-600 text-xl font-bold">
                              {formatCurrency(enhancedToken?.assetValue || '0', enhancedToken?.assetCurrency)}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-orange-700 mb-2">Estimated Value</h4>
                            <p className="text-orange-600 text-xl font-bold">
                              {formatCurrency(enhancedToken?.estimatedValue || '0', enhancedToken?.assetCurrency)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="mt-0 space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <Shield className="mr-2 h-5 w-5 text-blue-600" />
                        Active Compliance Modules
                      </h3>
                      <div className="space-y-4">
                        {enhancedToken?.complianceModules?.map((module, index) => (
                          <Card key={index} className="border-0 bg-gradient-to-r from-green-50 to-green-100">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-green-700">
                                    {module.moduleKey?.replace(/([A-Z])/g, ' $1').trim()}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    Deployed: {new Date(module.deployedAt).toLocaleDateString()}
                                  </p>
                                  <p className="font-mono text-xs text-green-500 break-all">
                                    {module.proxyAddress}
                                  </p>
                                </div>
                                <Badge className="bg-green-600 text-white">
                                  {module.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="investment" className="mt-0 space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                        Investment Details
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100">
                          <CardContent className="p-4">
                            <p className="text-sm text-text-secondary">Minimum Investment</p>
                            <p className="text-2xl font-bold text-green-700">
                              {formatCurrency(enhancedToken?.minInvestment || '0')}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                          <CardContent className="p-4">
                            <p className="text-sm text-text-secondary">Maximum Investment</p>
                            <p className="text-2xl font-bold text-blue-700">
                              {formatCurrency(enhancedToken?.maxInvestment || '0')}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                          <CardContent className="p-4">
                            <p className="text-sm text-text-secondary">Token Price</p>
                            <p className="text-2xl font-bold text-purple-700">
                              {formatCurrency(enhancedToken?.initialPrice || '0')}
                            </p>
                          </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                          <CardContent className="p-4">
                            <p className="text-sm text-text-secondary">Currency</p>
                            <p className="text-2xl font-bold text-orange-700">
                              {enhancedToken?.currency}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-0 space-y-6">
                    <div>
                      <h3 className="mb-4 flex items-center text-xl font-semibold">
                        <FileText className="mr-2 h-5 w-5 text-foreground" />
                        Documents & Resources
                      </h3>
                      <p className="text-sm text-text-secondary">No documents uploaded yet.</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Investment Opportunity</CardTitle>
                  <Badge variant={missingClaims?.length > 0 ? 'destructive' : 'default'}>
                    {missingClaims?.length > 0 ? "Not Qualified" : "Qualified"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-text-secondary mb-1">Token Price</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(enhancedToken?.initialPrice || '0')}
                  </p>
                  <p className="text-sm text-gray-500">per {enhancedToken?.symbol}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Min Investment:</span>
                    <span className="font-semibold">{formatCurrency(enhancedToken?.minInvestment || '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Max Investment:</span>
                    <span className="font-semibold">{formatCurrency(enhancedToken?.maxInvestment || '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Available Supply:</span>
                    <span className="font-semibold">{formatNumber(enhancedToken?.totalSupply || '0')}</span>
                  </div>
                </div>

                {missingClaims?.length > 0 ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Qualification Required
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                          Complete identity verification to start investing.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setInvestmentModalOpen(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                    size="lg"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Invest with Crypto
                  </Button>
                )}

                {missingClaims?.length > 0 && (
                  <Button
                    onClick={() => navigate(`/qualification/kyc-enhanced/${enhancedToken?.symbol}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700"
                    size="lg"
                  >
                    Get Qualified
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <LinkIcon className="mr-2 h-5 w-5 text-text-secondary" />
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {enhancedToken?.website && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(enhancedToken.website, '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Official Website
                  </Button>
                )}
                
                {enhancedToken?.whitepaper && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(enhancedToken.whitepaper, '_blank')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Terms & Conditions
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`${enhancedToken?.deploymentInfo?.explorerLink}`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Advanced Investment Modal */}
      <AdvancedInvestmentModal
        open={investmentModalOpen}
        onOpenChange={setInvestmentModalOpen}
        token={enhancedToken}
      />
    </div>
  );
};

export default ProjectDetails;
