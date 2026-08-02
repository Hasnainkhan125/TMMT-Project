import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Bell,
  Copy,
  Eye,
  FileText,
  MoreHorizontal,
  PieChart,
  Shield,
  TrendingUp,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Key,
  Plus,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInvestorList } from '@/hooks/use-ST';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { toast } from 'sonner';
import { ethers, EtherSymbol } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';

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
// Types for API response
interface InvestorDetails {
  accreditedInvestorStatus: boolean;
  countryCode: string;
  countryOfResidence: string;
  email: string;
  fullName: string;
  identityDocuments: {
    bankProof: string;
    identityProof: string;
    otherDocs: string[];
    proofOfAddress: string;
    proofOfIncome: string;
  };
  walletAddress: string;
}

interface ClaimData {
  contract: string;
  issuer: string;
  name: string;
}

interface ClaimForUser {
  data: string;
  identity: string;
  issuer: string;
  scheme: number;
  signature: string;
  topic: string;
  uri: string;
}

interface ClaimStatus {
  accreditationVerified: boolean;
  amlVerified: boolean;
  jurisdictionCompliant: boolean;
  kycVerified: boolean;
  termsAccepted: boolean;
}

interface InvestorData {
  investorId: string;
  InvestorDetails: InvestorDetails;
  tokenAddress: string;
  investorAddress: string;
  claimData: {
    data: ClaimData[];
  };
  investorIdentityAddress: string;
  claimStatus: ClaimStatus;
  status: string;
  claimForUser: {
    data: ClaimForUser[];
  };
  piMetadata: {
    updationTimeMS: number;
    creationTimeMS: number;
    entityId: string;
    tenantID: string;
    transactionId: string;
  };
}

const mockTokens = [
  {
    id: '1',
    symbol: 'GBB',
    name: 'Green Brew Bond',
    balance: '0',
    valuationPerToken: '$10.43',
    totalValuation: '$0.00',
    type: 'DEBT',
    wallet: '0xc688cFCE83948...',
    status: 'qualified',
    apy: '8.5%',
    maturity: '2025-12-31',
    issuer: 'EcoFinance Corp',
    compliance: ['KYC', 'AML', 'ACCREDITED'],
  },
];

const InvestorPortfolio = () => {
  const [investorData, setInvestorData] = useState<InvestorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signerKeyApproved, setSignerKeyApproved] = useState(false);
  const [approvingSignerKey, setApprovingSignerKey] = useState(false);
  const [addingClaim, setAddingClaim] = useState<string | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

    const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();


  const handleApproveSignerKey = async (issuerAddress: string) => {
    if (!investorData || !walletClient) return;

    // setApprovingSignerKey(true)
    try {
      toast.loading('Approving ClaimIssuer signer key...', {
        id: 'approve-signer',
      });

      // Create a signer from the wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      console.log(signer, 'signer');
      const contract = new ethers.Contract(
        investorData.investorIdentityAddress,
        identityAbi,
        signer
      );
      console.log('Contract:', contract);

      const issuerSignerKey = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(['address'], [issuerAddress])
      );
      const tx = await contract.addKey(issuerSignerKey, 3, 1, {
        gasLimit: 1000000,
      });
      console.log('Transaction:', tx);

      const res = await tx.wait();
      console.log('Transaction result:', res);

      // setSignerKeyApproved(true)
      toast.success('ClaimIssuer signer key approved successfully!', {
        id: 'approve-signer',
      });
    } catch (error) {
      console.error('Error approving signer key:', error);
      toast.error('Failed to approve signer key', { id: 'approve-signer' });
    } finally {
      setApprovingSignerKey(false);
    }
  };

  const handleAddClaim = async (
    issuerAddress: string,
    claimTopic: string,
    claimForUser: ClaimForUser
  ) => {
    console.log(
      issuerAddress,
      claimTopic,
      claimForUser,
      'issuerAddress,claimTopic,claimForUser'
    );
    if (!investorData || !walletClient) return;

    setAddingClaim(claimTopic);
    try {
      toast.loading(`Adding ${claimTopic} claim...`, {
        id: `add-claim-${claimTopic}`,
      });

      // Create a signer from the wallet client
      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        investorData.investorIdentityAddress,
        identityAbi,
        signer
      );
      console.log('Contract:', contract);

      const tx = await contract.addClaim(
        claimForUser.topic,
        claimForUser.scheme,
         claimForUser.issuer,
        claimForUser.signature,
        claimForUser.data,
        claimForUser.uri
      );
      console.log('Transaction:', tx);

      await tx.wait();
      console.log('Claim added successfully');

      setSelectedClaims(prev => [...prev, claimTopic]);
      toast.success(`${claimTopic} claim added successfully!`, {
        id: `add-claim-${claimTopic}`,
      });
    } catch (error) {
      console.error('Error adding claim:', error);
      toast.error(`Failed to add ${claimTopic} claim`, {
        id: `add-claim-${claimTopic}`,
      });
    } finally {
      setAddingClaim(null);
    }
  };

  const getOnChainIDStatus = () => {
    if (!investorData) return 'loading';
    if (
      !investorData.investorIdentityAddress ||
      investorData.investorIdentityAddress === '0x0'
    ) {
      return 'pending';
    }
    return 'active';
  };

  const getComplianceScore = () => {
    if (!investorData?.claimStatus) return 0;
    const statuses = Object.values(investorData.claimStatus);
    const trueCount = statuses.filter(Boolean).length;
    return Math.round((trueCount / statuses.length) * 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading investor portfolio...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to view your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => open()} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">SecureToken</span>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback>
                      {investorData.InvestorDetails.fullName
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-medium">
                      {investorData.InvestorDetails.fullName}
                    </p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {investorData.InvestorDetails.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-4rem)] w-64 border-r bg-background/50 backdrop-blur-sm">
          <nav className="space-y-2 p-6">
            <Button
              variant="ghost"
              className="w-full justify-start bg-purple-50 text-purple-700"
            >
              <PieChart className="mr-2 h-4 w-4" />
              Portfolio
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Documents
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* OnChainID Status Banner */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {onChainIDStatus === 'pending' ? (
                    <Clock className="h-5 w-5 text-amber-600" />
                  ) : onChainIDStatus === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      OnChainID Status:{' '}
                      {onChainIDStatus === 'pending'
                        ? 'Pending'
                        : onChainIDStatus === 'active'
                          ? 'Active'
                          : 'Loading...'}
                    </p>
                    {onChainIDStatus === 'active' && (
                      <div className="flex items-center space-x-2">
                        <p className="font-mono text-sm text-text-secondary">
                          {investorData.investorIdentityAddress.slice(0, 10)}...
                          {investorData.investorIdentityAddress.slice(-8)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(
                              investorData.investorIdentityAddress
                            )
                          }
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              `https://sepolia.etherscan.io/address/${investorData.investorIdentityAddress}`,
                              '_blank'
                            )
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {onChainIDStatus === 'active' && !signerKeyApproved && (
                  <Button
                    onClick={() =>
                      handleApproveSignerKey(
                        investorData.claimData.data[0].contract
                      )
                    }
                    disabled={approvingSignerKey}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {approvingSignerKey ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Approve ClaimIssuer
                      </>
                    )}
                  </Button>
                )}
                {signerKeyApproved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    ClaimIssuer Approved
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Overview */}
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Investor Status
                </CardTitle>
                <User className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {investorData.InvestorDetails.accreditedInvestorStatus
                    ? 'Accredited'
                    : 'Retail'}
                </div>
                <p className="text-xs opacity-80">
                  {investorData.InvestorDetails.countryOfResidence}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OnChainID</CardTitle>
                <Shield className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {onChainIDStatus === 'active'
                    ? 'Active'
                    : onChainIDStatus === 'pending'
                      ? 'Pending'
                      : 'Loading'}
                </div>
                <p className="text-muted-foreground text-xs">
                  {onChainIDStatus === 'active'
                    ? 'Identity deployed'
                    : 'Awaiting deployment'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Claims Available
                </CardTitle>
                <FileText className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {investorData?.claimData?.data?.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  {selectedClaims?.length} added to identity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {complianceScore}%
                </div>
                <Progress value={complianceScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="identity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity">Identity & Claims</TabsTrigger>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6">
              {/* Investor Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Investor Profile</CardTitle>
                  <CardDescription>
                    Your verified investor information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <Label>Full Name</Label>
                        <p className="font-medium">
                          {investorData.InvestorDetails.fullName}
                        </p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="font-medium">
                          {investorData.InvestorDetails.email}
                        </p>
                      </div>
                      <div>
                        <Label>Country</Label>
                        <p className="font-medium">
                          {investorData.InvestorDetails.countryOfResidence} (
                          {investorData.InvestorDetails.countryCode})
                        </p>
                      </div>
                      <div>
                        <Label>Investor Type</Label>
                        <Badge
                          variant={
                            investorData.InvestorDetails
                              .accreditedInvestorStatus
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {investorData.InvestorDetails.accreditedInvestorStatus
                            ? 'Accredited'
                            : 'Retail'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Wallet Address</Label>
                        <div className="flex items-center space-x-2">
                          <p className="font-mono text-sm">
                            {investorData.InvestorDetails.walletAddress.slice(
                              0,
                              10
                            )}
                            ...
                            {investorData.InvestorDetails.walletAddress.slice(
                              -8
                            )}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                investorData.InvestorDetails.walletAddress
                              )
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label>OnChainID Address</Label>
                        {onChainIDStatus === 'active' ? (
                          <div className="flex items-center space-x-2">
                            <p className="font-mono text-sm">
                              {investorData.investorIdentityAddress.slice(
                                0,
                                10
                              )}
                              ...
                              {investorData.investorIdentityAddress.slice(-8)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(
                                  investorData.investorIdentityAddress
                                )
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Pending deployment
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Claims Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Claims</CardTitle>
                  <CardDescription>
                    {signerKeyApproved
                      ? 'Select claims to add to your OnChainID'
                      : 'Approve ClaimIssuer first to manage claims'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!signerKeyApproved && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        You need to approve the ClaimIssuer signer key before
                        you can add claims to your identity.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4">
                      {investorData?.claimData?.data?.map((claim, index) => {
                      const claimForUser =
                        investorData?.claimForUser?.data[index];
                      const isAdded = selectedClaims.includes(claim.name);
                      const isAdding = addingClaim === claim.name;

                      return (
                        <div
                          key={claim.name}
                          className={`flex items-center justify-between rounded-lg border p-4 ${
                            isAdded
                              ? 'border-green-200 bg-green-50'
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {isAdded ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-border" />
                            )}
                            <div>
                              <h4 className="font-medium">{claim.name}</h4>
                              <p className="text-muted-foreground text-sm">
                                Issued by: {claim.issuer}
                              </p>
                              <p className="text-muted-foreground font-mono text-xs">
                                Contract: {claim.contract.slice(0, 10)}...
                                {claim.contract.slice(-8)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isAdded ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Added
                              </Badge>
                            ) : (
                              <Button
                                onClick={() =>
                                  handleAddClaim(
                                    claim.contract,
                                    claim.name,
                                    claimForUser
                                  )
                                }
                                disabled={!signerKeyApproved || isAdding}
                                size="sm"
                              >
                                {isAdding ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Claim
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="holdings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Token Holdings</CardTitle>
                  <CardDescription>
                    Your security token portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTokens.map(token => (
                        <TableRow key={token.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-xs font-bold text-white">
                                {token.symbol.slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {token.symbol}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  {token.name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {token.balance}
                          </TableCell>
                          <TableCell className="font-mono">
                            {token.valuationPerToken}
                          </TableCell>
                          <TableCell className="font-mono font-medium">
                            {token.totalValuation}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                token.status === 'active'
                                  ? 'default'
                                  : token.status === 'qualified'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className={
                                token.status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : ''
                              }
                            >
                              {token.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {token.status === 'qualified' &&
                                signerKeyApproved &&
                                selectedClaims.length > 0 && (
                                  <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Mint
                                  </Button>
                                )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Copy Address
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Identity Documents</CardTitle>
                  <CardDescription>
                    Your uploaded verification documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(
                      investorData?.InvestorDetails?.identityDocuments
                    ||{}).map(([key, value]) => {
                      if (key === 'otherDocs') return null;
                      const stringValue =
                        typeof value === 'string'
                          ? value
                          : Array.isArray(value)
                            ? value[0] || ''
                            : '';
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              <p className="text-muted-foreground text-sm">
                                IPFS: {stringValue.slice(0, 20)}...
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(stringValue, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>
                    Your verification and compliance status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(investorData?.claimStatus||{}).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div className="flex items-center space-x-3">
                            {value ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600" />
                            )}
                            <div>
                              <h4 className="font-medium capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h4>
                              <p className="text-muted-foreground text-sm">
                                {value ? 'Verified' : 'Pending verification'}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={value ? 'default' : 'secondary'}
                            className={
                              value ? 'bg-green-100 text-green-700' : ''
                            }
                          >
                            {value ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default InvestorPortfolio;
