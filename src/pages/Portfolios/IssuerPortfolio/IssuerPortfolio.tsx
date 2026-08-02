"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  Lock,
  MoreHorizontal,
  Plus,
  Settings,
  Shield,
  User,
  Users,
  Wallet,
  X,
  ExternalLink,
  Clock,
  Coins,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAccount } from 'wagmi'
import axios from 'axios'
import { toast } from 'sonner'

const mockInvestors = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    type: "Individual",
    status: "verified",
    country: "USA",
    kycStatus: "approved",
    claimsStatus: "complete",
    tokensHeld: ["GBB", "REIT"],
    totalInvestment: "$15,430",
    joinDate: "2024-01-15",
    walletAddress: "0x1234...5678",
    complianceScore: 98,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    type: "Individual",
    status: "pending",
    country: "UK",
    kycStatus: "pending",
    claimsStatus: "incomplete",
    tokensHeld: [],
    totalInvestment: "$0",
    joinDate: "2024-01-20",
    walletAddress: "0x5678...9012",
    complianceScore: 45,
  },
  {
    id: "3",
    name: "TechCorp Investments",
    email: "investments@techcorp.com",
    type: "Institution",
    status: "verified",
    country: "Canada",
    kycStatus: "approved",
    claimsStatus: "complete",
    tokensHeld: ["TECH", "REIT"],
    totalInvestment: "$125,000",
    joinDate: "2024-01-10",
    walletAddress: "0x9012...3456",
    complianceScore: 100,
  },
]

const mockTokens = [
  {
    id: "1",
    symbol: "GBB",
    name: "Green Brew Bond",
    totalSupply: "1,000,000",
    circulatingSupply: "250,000",
    price: "$10.43",
    marketCap: "$2,607,500",
    holders: 45,
    type: "DEBT",
    apy: "8.5%",
    status: "active",
    complianceRules: ["KYC", "AML", "ACCREDITED_INVESTOR"],
    mintingEnabled: true,
  },
  {
    id: "2",
    symbol: "REIT",
    name: "Royal Real Estate Token",
    totalSupply: "500,000",
    circulatingSupply: "180,000",
    price: "$25.67",
    marketCap: "$4,620,600",
    holders: 78,
    type: "EQUITY",
    apy: "12.3%",
    status: "active",
    complianceRules: ["KYC", "AML", "QUALIFIED_INVESTOR"],
    mintingEnabled: true,
  },
]

const mockPendingActions = [
  {
    id: "1",
    type: "kyc_approval",
    investor: "Sarah Johnson",
    description: "KYC documents submitted for review",
    priority: "high",
    date: "2024-01-22",
  },
  {
    id: "2",
    type: "token_mint",
    investor: "John Smith",
    description: "Mint request for 100 GBB tokens",
    priority: "medium",
    date: "2024-01-21",
  },
  {
    id: "3",
    type: "compliance_check",
    investor: "TechCorp Investments",
    description: "Annual compliance verification due",
    priority: "low",
    date: "2024-01-20",
  },
]

const IssuerPortfolio = () => {
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null)
  const [actionFilter, setActionFilter] = useState("all")
  const [pendingInvestments, setPendingInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const { address } = useAccount()

  const totalInvestors = mockInvestors.length
  const verifiedInvestors = mockInvestors.filter((i) => i.status === "verified").length
  const totalTokenValue = mockTokens.reduce(
    (sum, token) => sum + Number.parseFloat(token.marketCap.replace(/[$,]/g, "")),
    0,
  )

  // Fetch pending investments for the connected issuer
  useEffect(() => {
    const fetchPendingInvestments = async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5001/api/v1/investments/issuer/${address}?status=pending_confirmation,confirmed,ready_to_mint`);
        if (response.data.success) {
          setPendingInvestments(response.data.data.investments);
        }
      } catch (error) {
        console.error('Error fetching pending investments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingInvestments();
  }, [address]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleMintTokens = async (investment: any) => {
    try {
      setLoading(true);
      
      // Update investment status to minting
      await axios.put(`http://localhost:5001/api/v1/investments/${investment._id}/status`, {
        status: 'minting',
        notes: 'Token minting initiated by issuer'
      });

      // Here you would integrate with your token minting contract
      // For now, we'll simulate the minting process
      toast.success(`Token minting initiated for ${investment.tokenAmount} ${investment.tokenSymbol}`);
      
      // Refresh the investments list
      const response = await axios.get(`http://localhost:5001/api/v1/investments/issuer/${address}?status=pending_confirmation,confirmed,ready_to_mint`);
      if (response.data.success) {
        setPendingInvestments(response.data.data.investments);
      }
    } catch (error) {
      console.error('Error minting tokens:', error);
      toast.error('Failed to mint tokens');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_confirmation':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'ready_to_mint':
        return 'bg-green-100 text-green-800';
      case 'minting':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-surface text-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">IssuerHub</span>
            </div>
          </div>

          <div className="ml-auto flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {pendingInvestments.length}
              </Badge>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="Issuer" />
                    <AvatarFallback>EC</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">EcoFinance Corp</p>
                    <p className="text-xs leading-none text-muted-foreground">issuer@ecofinance.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Company Profile</DropdownMenuItem>
                <DropdownMenuItem>Token Settings</DropdownMenuItem>
                <DropdownMenuItem>Compliance Center</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background/50 backdrop-blur-sm min-h-[calc(100vh-4rem)]">
          <nav className="p-6 space-y-2">
            <Button variant="ghost" className="w-full justify-start bg-emerald-50 text-emerald-700">
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Investors
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Tokens
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Coins className="mr-2 h-4 w-4" />
              Investments
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Market Cap</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalTokenValue.toLocaleString()}</div>
                <p className="text-xs opacity-80">+8.2% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvestors}</div>
                <p className="text-xs text-muted-foreground">{verifiedInvestors} verified</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tokens</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockTokens.length}</div>
                <p className="text-xs text-muted-foreground">All tokens active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Investments</CardTitle>
                <Coins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingInvestments.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting token mint</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="investors" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="investors">Investors</TabsTrigger>
              <TabsTrigger value="tokens">Tokens</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="actions">Pending Actions</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            <TabsContent value="investors" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Investor Management</CardTitle>
                      <CardDescription>Manage investor onboarding, KYC, and token allocations</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Investor
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>KYC Status</TableHead>
                        <TableHead>Claims</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockInvestors.map((investor) => (
                        <TableRow key={investor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {investor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{investor.name}</div>
                                <div className="text-sm text-muted-foreground">{investor.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{investor.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={investor.kycStatus === "approved" ? "default" : "outline"}
                              className={
                                investor.kycStatus === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : investor.kycStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : ""
                              }
                            >
                              {investor.kycStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={investor.claimsStatus === "complete" ? "default" : "outline"}
                              className={
                                investor.claimsStatus === "complete"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {investor.claimsStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">{investor.totalInvestment}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Progress value={investor.complianceScore} className="w-16" />
                              <span className="text-sm">{investor.complianceScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Investor Details - {investor.name}</DialogTitle>
                                    <DialogDescription>
                                      Complete investor profile and compliance information
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Full Name</Label>
                                        <p className="font-medium">{investor.name}</p>
                                      </div>
                                      <div>
                                        <Label>Email</Label>
                                        <p className="font-mono text-sm">{investor.email}</p>
                                      </div>
                                      <div>
                                        <Label>Investor Type</Label>
                                        <p>{investor.type}</p>
                                      </div>
                                      <div>
                                        <Label>Country</Label>
                                        <p>{investor.country}</p>
                                      </div>
                                      <div>
                                        <Label>Wallet Address</Label>
                                        <p className="font-mono text-sm">{investor.walletAddress}</p>
                                      </div>
                                      <div>
                                        <Label>Join Date</Label>
                                        <p>{investor.joinDate}</p>
                                      </div>
                                    </div>
                                    <Separator />
                                    <div>
                                      <Label>Token Holdings</Label>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {investor.tokensHeld.length > 0 ? (
                                          investor.tokensHeld.map((token) => (
                                            <Badge key={token} variant="secondary">
                                              {token}
                                            </Badge>
                                          ))
                                        ) : (
                                          <p className="text-sm text-muted-foreground">No tokens held</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      {investor.kycStatus === "pending" && (
                                        <>
                                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                            <Check className="mr-2 h-4 w-4" />
                                            Approve KYC
                                          </Button>
                                          <Button variant="outline" size="sm">
                                            <X className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>
                                        </>
                                      )}
                                      <Button variant="outline" size="sm">
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Documents
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Shield className="mr-2 h-4 w-4" />
                                    Update Claims
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    Mint Tokens
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Freeze Account
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Remove Investor</DropdownMenuItem>
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

            <TabsContent value="tokens" className="space-y-6">
              <div className="grid gap-6">
                {mockTokens.map((token) => (
                  <Card key={token.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                            {token.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <CardTitle>
                              {token.name} ({token.symbol})
                            </CardTitle>
                            <CardDescription>{token.type} Token</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={token.status === "active" ? "default" : "outline"}
                            className={token.status === "active" ? "bg-green-100 text-green-700" : ""}
                          >
                            {token.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Total Supply</Label>
                          <p className="text-2xl font-bold">{token.totalSupply}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Circulating</Label>
                          <p className="text-2xl font-bold">{token.circulatingSupply}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Price</Label>
                          <p className="text-2xl font-bold">{token.price}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Market Cap</Label>
                          <p className="text-2xl font-bold">{token.marketCap}</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm text-muted-foreground">Compliance Rules</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {token.complianceRules.map((rule) => (
                              <Badge key={rule} variant="outline" className="text-blue-700 border-blue-300">
                                <Shield className="mr-1 h-3 w-3" />
                                {rule}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Mint Tokens
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Mint {token.symbol} Tokens</DialogTitle>
                                <DialogDescription>Issue new tokens to qualified investors</DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4">
                                <div>
                                  <Label htmlFor="investor">Select Investor</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Choose investor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockInvestors
                                        .filter((i) => i.status === "verified")
                                        .map((investor) => (
                                          <SelectItem key={investor.id} value={investor.id}>
                                            {investor.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="amount">Amount</Label>
                                  <Input id="amount" placeholder="Enter token amount" />
                                </div>
                                <div>
                                  <Label htmlFor="reason">Reason</Label>
                                  <Textarea id="reason" placeholder="Reason for minting" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button className="bg-purple-600 hover:bg-purple-700">Mint Tokens</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="investments" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Investment Transactions</CardTitle>
                      <CardDescription>Manage pending crypto investments and token minting</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : pendingInvestments.length === 0 ? (
                    <div className="text-center py-8">
                      <Coins className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-semibold text-foreground">No pending investments</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        When investors make crypto payments, they will appear here for token minting.
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Investor</TableHead>
                          <TableHead>Token</TableHead>
                          <TableHead>Investment</TableHead>
                          <TableHead>Token Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Transaction</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingInvestments.map((investment) => (
                          <TableRow key={investment._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{formatAddress(investment.investorAddress)}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(investment.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{investment.tokenSymbol}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono">
                                {formatCurrency(investment.investmentAmount)} {investment.investmentCurrency}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-mono">
                                {investment.tokenAmount} {investment.tokenSymbol}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{investment.paymentMethod}</div>
                                <div className="text-sm text-muted-foreground font-mono">
                                  {investment.requiredCryptoAmount} {investment.paymentMethod}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(investment.status)}>
                                {investment.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`https://sepolia.etherscan.io/tx/${investment.txHash}`, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {(investment.status === 'confirmed' || investment.status === 'ready_to_mint') && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleMintTokens(investment)}
                                    disabled={loading}
                                  >
                                    <Coins className="mr-2 h-4 w-4" />
                                    Mint Tokens
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
                                      <Clock className="mr-2 h-4 w-4" />
                                      Update Status
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      Cancel Investment
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pending Actions</CardTitle>
                      <CardDescription>Items requiring your attention</CardDescription>
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="kyc_approval">KYC Approvals</SelectItem>
                        <SelectItem value="token_mint">Token Mints</SelectItem>
                        <SelectItem value="compliance_check">Compliance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Show investment minting actions first */}
                    {pendingInvestments.slice(0, 3).map((investment) => (
                      <Card key={investment._id} className="border-l-4 border-l-green-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Coins className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  Token minting required for {investment.tokenAmount} {investment.tokenSymbol}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatAddress(investment.investorAddress)} • {new Date(investment.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-green-100 text-green-800">high</Badge>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                Mint Tokens
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Regular pending actions */}
                    {mockPendingActions.map((action) => (
                      <Card key={action.id} className="border-l-4 border-l-orange-400">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  action.priority === "high"
                                    ? "bg-red-100 text-red-600"
                                    : action.priority === "medium"
                                      ? "bg-yellow-100 text-yellow-600"
                                      : "bg-blue-100 text-blue-600"
                                }`}
                              >
                                {action.type === "kyc_approval" ? (
                                  <User className="h-5 w-5" />
                                ) : action.type === "token_mint" ? (
                                  <Wallet className="h-5 w-5" />
                                ) : (
                                  <Shield className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{action.description}</p>
                                <p className="text-sm text-muted-foreground">
                                  {action.investor} • {action.date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  action.priority === "high"
                                    ? "destructive"
                                    : action.priority === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {action.priority}
                              </Badge>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                                Review
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Overview</CardTitle>
                    <CardDescription>ERC3643 compliance status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Identity Registry</span>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Compliance Contract</span>
                        <Badge className="bg-green-100 text-green-700">Deployed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Claim Topics Registry</span>
                        <Badge className="bg-green-100 text-green-700">Configured</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Trusted Issuers Registry</span>
                        <Badge className="bg-green-100 text-green-700">Updated</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Claim Statistics</CardTitle>
                    <CardDescription>Investor claim verification status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>KYC Claims</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={85} className="w-20" />
                          <span className="text-sm">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>AML Claims</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={92} className="w-20" />
                          <span className="text-sm">92%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Accreditation Claims</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={78} className="w-20" />
                          <span className="text-sm">78%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
export default IssuerPortfolio;