"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  BarChart3,
  Bell,
  Copy,
  Eye,
  FileText,
  MoreHorizontal,
  Shield,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ShoppingCart,
  Send,
  DollarSign,
  Filter,
  Search,
  Users,
  Download,
  Settings,
  Ban,
  UserCheck,
  UserX,
  Coins,
  Building,
  Activity,
  Mail,
  Globe,
  Lock,
  Unlock,
  Archive,
  Plus,
  Minus,
  Pause,
  Play,
  RefreshCw,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Code,
  LifeBuoy,
  PieChart,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { toast } from "sonner"
import { useTrexContracts } from "@/hooks/use-trex-contracts"

// import { useAppDispatch, useAppSelector } from "@/hooks/redux"


import { 
  fetchTokens, 
  setSelectedToken, 
  fetchInvestors, 
  approveInvestmentOrder,
  updateInvestorStatus,
  addTrustedIssuer,
  removeTrustedIssuer,
  updateTokenEmergencyPause
} from "@/store/slices/issuerSlice"
import { useDispatch, useSelector } from "react-redux"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { getInvestorList, getSTData } from "@/hooks/use-ST"


// Types for issuer dashboard
interface TokenData {
  id: string
  symbol: string
  name: string
  tokenAddress: string
  totalSupply: string
  circulatingSupply: string
  price: number
  marketCap: number
  holders: number
  totalInvestments: number
  status: "active" | "paused" | "frozen"
  compliance: {
    kycRequired: boolean
    amlRequired: boolean
    accreditedOnly: boolean
    jurisdictionRestrictions: string[]
  }
  createdAt: string
  lastActivity: string
  trustedIssuers: string[]
  emergencyPaused: boolean
}

interface InvestorProfile {
  id: string
  walletAddress: string
  onChainId: string
  fullName: string
  email: string
  country: string
  investorType: "individual" | "institutional"
  accreditedStatus: boolean
  kycStatus: "pending" | "verified" | "rejected"
  amlStatus: "pending" | "verified" | "rejected"
  totalInvested: number
  tokenBalance: number
  firstInvestment: string
  lastActivity: string
  riskScore: number
  complianceScore: number
  status: "active" | "suspended" | "blacklisted"
  documents: {
    identity: string
    address: string
    income: string
    accreditation?: string
  }
  transactions: Transaction[]
}

interface Transaction {
  id: string
  type: "investment" | "transfer" | "mint" | "burn" | "freeze" | "unfreeze"
  tokenSymbol: string
  amount: string
  value: string
  currency: string
  status: "pending" | "processing" | "completed" | "failed" | "rejected"
  date: string
  txHash?: string
  fromAddress?: string
  toAddress?: string
  investorId?: string
  notes?: string
  approvedBy?: string
  rejectedReason?: string
}

interface InvestmentOrder {
  id: string
  investorId: string
  investorName: string
  investorEmail: string
  tokenSymbol: string
  requestedAmount: number
  investmentValue: number
  currency: string
  paymentMethod: string
  status: "pending" | "approved" | "rejected" | "processing" | "completed"
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  complianceChecks: {
    kyc: boolean
    aml: boolean
    jurisdiction: boolean
    accreditation: boolean
  }
  documents: string[]
  riskAssessment: {
    score: number
    level: "low" | "medium" | "high"
    factors: string[]
  }
}

interface CreateTokenFormData {
  name: string
  symbol: string
  decimals: number
  ownerAddress: string
  irAgentAddress: string
  tokenAgentAddress: string
  prefix: string
  modules: {
    CountryAllowModule: number[]
    CountryRestrictModule: number[]
    MaxBalanceModule: number[]
  }
  claimData: {
    claimTopics: string[]
    claimIissuers: string[]
    issuerClaims: string[]
  }
}

// import type { AppDispatch } from "@/store/store"
// import { useDispatch, useSelector } from "react-redux"

// export const useAppDispatch = () => useDispatch<AppDispatch>()
// export const useAppSelector = useSelector


const TokenCreationStepper = ({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: (tokenAddress: string) => void
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { address: issuerAddress, isConnected } = useAppKitAccount()
  
  const [formData, setFormData] = useState<CreateTokenFormData>({
    name: '',
    symbol: '',
    decimals: 18,
    ownerAddress: issuerAddress || '',
    irAgentAddress: issuerAddress || '',
    tokenAgentAddress: issuerAddress || '',
    prefix: '',
    modules: {
      CountryAllowModule: [840, 826], // US, UK
      CountryRestrictModule: [],
      MaxBalanceModule: [1000000]
    },
    claimData: {
      claimTopics: ['IDENTITY_CLAIM'],
      claimIissuers: [issuerAddress || ''],
      issuerClaims: ['VERIFIED']
    }
  })

  // Update addresses when wallet connects
  useEffect(() => {
    if (issuerAddress) {
      setFormData((prev: any) => ({
        ...prev,
        ownerAddress: issuerAddress,
        irAgentAddress: issuerAddress,
        tokenAgentAddress: issuerAddress,
        claimData: {
          ...prev.claimData,
          claimIissuers: [issuerAddress]
        }
      }))
    }
  }, [issuerAddress])

  const steps = [
    { id: 1, title: "Basic Information", description: "Token details and metadata" },
    { id: 2, title: "Addresses & Agents", description: "Owner and agent configurations" },
    { id: 3, title: "Compliance Modules", description: "Configure compliance settings" },
    { id: 4, title: "Identity Claims", description: "Setup identity verification" },
    { id: 5, title: "Review & Create", description: "Review and deploy token" }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCreateToken = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)
    try {
      toast.loading('Creating token...', { id: 'create-token' })
      
      const response = await fetch(`${API_BASE_URL}/tokens/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenData: formData,
          claimData: formData.claimData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create token')
      }

      toast.success('Token created successfully!', { id: 'create-token' })
      onSuccess(result.tokenAddress)
      onClose()
      
      // Reset form
      setCurrentStep(1)
      setFormData({
        ...formData,
        name: '',
        symbol: '',
        prefix: ''
      })

    } catch (error: any) {
      console.error('Token creation error:', error)
      toast.error(error.message || 'Failed to create token', { id: 'create-token' })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<CreateTokenFormData>) => {
    setFormData((prev: any) => ({ ...prev, ...updates }))
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.symbol && formData.prefix
      case 2:
        return formData.ownerAddress && formData.irAgentAddress && formData.tokenAgentAddress
      case 3:
        return true // Module configuration is optional
      case 4:
        return formData.claimData.claimTopics.length > 0 && formData.claimData.claimIissuers.length > 0
      default:
        return true
    }
  }

  return (
    <div>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Create New ERC3643 Token
          </SheetTitle>
          <SheetDescription>
            Follow the steps to configure and deploy your security token
          </SheetDescription>
        </SheetHeader>

        {/* Progress Steps */}
        <div className="my-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                  ${currentStep >= step.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-200 text-text-secondary'
                  }
                `}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    h-0.5 w-12 mx-2
                    ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="font-medium">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Token Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="e.g., Green Brew Bond"
                />
              </div>
              <div>
                <Label htmlFor="symbol">Token Symbol *</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => updateFormData({ symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., GBB"
                />
              </div>
              <div>
                <Label htmlFor="decimals">Decimals</Label>
                <Input
                  id="decimals"
                  type="number"
                  value={formData.decimals}
                  onChange={(e) => updateFormData({ decimals: parseInt(e.target.value) || 18 })}
                />
              </div>
              <div>
                <Label htmlFor="prefix">Salt/Prefix *</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => updateFormData({ prefix: e.target.value })}
                  placeholder="unique-salt-123"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Unique identifier for deterministic deployment
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Addresses & Agents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="ownerAddress">Owner Address *</Label>
                <Input
                  id="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={(e) => updateFormData({ ownerAddress: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="irAgentAddress">Identity Registry Agent *</Label>
                <Input
                  id="irAgentAddress"
                  value={formData.irAgentAddress}
                  onChange={(e) => updateFormData({ irAgentAddress: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div>
                <Label htmlFor="tokenAgentAddress">Token Agent *</Label>
                <Input
                  id="tokenAgentAddress"
                  value={formData.tokenAgentAddress}
                  onChange={(e) => updateFormData({ tokenAgentAddress: e.target.value })}
                  placeholder="0x..."
                />
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Note:</strong> All agent addresses are currently set to your wallet address. 
                  You can modify them if needed.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Compliance Modules */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Country Allow Module</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Specify allowed countries (country codes)
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Country code (e.g., 840 for US)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseInt(e.currentTarget.value)
                        if (value && !formData.modules.CountryAllowModule.includes(value)) {
                          updateFormData({
                            modules: {
                              ...formData.modules,
                              CountryAllowModule: [...formData.modules.CountryAllowModule, value]
                            }
                          })
                          e.currentTarget.value = ''
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.modules.CountryAllowModule.map((code) => (
                    <Badge key={code} variant="secondary" className="flex items-center gap-1">
                      {code}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => {
                          updateFormData({
                            modules: {
                              ...formData.modules,
                              CountryAllowModule: formData.modules.CountryAllowModule.filter(c => c !== code)
                            }
                          })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Max Balance Module</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Maximum tokens per wallet
                </p>
                <Input
                  type="number"
                  value={formData.modules.MaxBalanceModule[0] || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0
                    updateFormData({
                      modules: {
                        ...formData.modules,
                        MaxBalanceModule: [value]
                      }
                    })
                  }}
                  placeholder="1000000"
                />
              </div>
            </div>
          )}

          {/* Step 4: Identity Claims */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Claim Topics</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required identity claim types
                </p>
                <div className="space-y-2">
                  {['IDENTITY_CLAIM', 'KYC_CLAIM', 'AML_CLAIM', 'ACCREDITATION_CLAIM'].map((topic) => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic}
                        checked={formData.claimData.claimTopics.includes(topic)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData({
                              claimData: {
                                ...formData.claimData,
                                claimTopics: [...formData.claimData.claimTopics, topic]
                              }
                            })
                          } else {
                            updateFormData({
                              claimData: {
                                ...formData.claimData,
                                claimTopics: formData.claimData.claimTopics.filter(t => t !== topic)
                              }
                            })
                          }
                        }}
                      />
                      <Label htmlFor={topic} className="text-sm">{topic}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="claimIssuer">Claim Issuers</Label>
                <Input
                  id="claimIssuer"
                  value={formData.claimData.claimIissuers[0] || ''}
                  onChange={(e) => {
                    updateFormData({
                      claimData: {
                        ...formData.claimData,
                        claimIissuers: [e.target.value]
                      }
                    })
                  }}
                  placeholder="0x..."
                />
              </div>

              <div>
                <Label className="text-base font-medium">Issuer Claims</Label>
                <div className="space-y-2">
                  {['VERIFIED', 'KYC_PASSED', 'AML_CLEARED', 'ACCREDITED'].map((claim) => (
                    <div key={claim} className="flex items-center space-x-2">
                      <Checkbox
                        id={claim}
                        checked={formData.claimData.issuerClaims.includes(claim)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            updateFormData({
                              claimData: {
                                ...formData.claimData,
                                issuerClaims: [...formData.claimData.issuerClaims, claim]
                              }
                            })
                          } else {
                            updateFormData({
                              claimData: {
                                ...formData.claimData,
                                issuerClaims: formData.claimData.issuerClaims.filter(c => c !== claim)
                              }
                            })
                          }
                        }}
                      />
                      <Label htmlFor={claim} className="text-sm">{claim}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review & Create */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Review Token Configuration</h3>
                
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Symbol:</span>
                        <span className="font-medium">{formData.symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Decimals:</span>
                        <span className="font-medium">{formData.decimals}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Salt:</span>
                        <span className="font-mono text-xs">{formData.prefix}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Addresses</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Owner:</span>
                        <p className="font-mono text-xs break-all">{formData.ownerAddress}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">IR Agent:</span>
                        <p className="font-mono text-xs break-all">{formData.irAgentAddress}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Token Agent:</span>
                        <p className="font-mono text-xs break-all">{formData.tokenAgentAddress}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Allowed Countries:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.modules.CountryAllowModule.map((code: number) => (
                            <Badge key={code} variant="outline" className="text-xs">{code}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Max Balance:</span>
                        <span className="font-medium ml-2">{formData.modules.MaxBalanceModule[0]?.toLocaleString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Required Claims:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {formData.claimData.claimTopics.map((topic: string) => (
                            <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Once created, the token configuration cannot be easily modified. Please review all details carefully.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateToken}
              disabled={loading || !isConnected}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-2" />
                  Create Token
                </>
              )}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
    </div>
        )
      }

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const IssuerDashboard = () => {
  const dispatch = useDispatch()
  const {  selectedToken, investors, investmentOrders, analytics } = useSelector((state: any) => state.issuer)
  const [loading, setLoading] = useState(false)
  const [showCreateToken, setShowCreateToken] = useState(false)
  const [tokenHolders, setTokenHolders] = useState([])
  const [localLoading, setLocalLoading] = useState(false)
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null)
  const [mintAmount, setMintAmount] = useState("")
  const [mintRecipient, setMintRecipient] = useState("")
  const [blacklistAddress, setBlacklistAddress] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [complianceFilter, setComplianceFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")
  const [trustedIssuerAddress, setTrustedIssuerAddress] = useState("")
  const [tokens, setTokens] = useState([])
  const [hasTokens, setHasTokens] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)


  // const [showCreateToken, setShowCreateToken] = useState(false)
  // const [tokenHolders, setTokenHolders] = useState([])
  // const [investors, setInvestors] = useState<InvestorProfile[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // const [investmentOrders, setInvestmentOrders] = useState<InvestmentOrder[]>([])
  // const [selectedInvestor, setSelectedInvestor] = useState<InvestorProfile | null>(null)
  // const [mintAmount, setMintAmount] = useState("")
  // const [mintRecipient, setMintRecipient] = useState("")
  // const [blacklistAddress, setBlacklistAddress] = useState("")
  // const [searchTerm, setSearchTerm] = useState("")
  // const [statusFilter, setStatusFilter] = useState("all")
  // const [complianceFilter, setComplianceFilter] = useState("all")
  const [tokenInfo, setTokenInfo] = useState(null)

  const { address: issuerAddress,allAccounts, isConnected } = useAppKitAccount()
  const { open } = useAppKit()


  const {
    mintTokens,
    burnTokens,
    freezeTokens,
    unfreezeTokens,
    forcedTransfer,
    addToBlacklist,
    removeFromBlacklist,
    updateIdentityRegistry,
    trustedIssuers,
    token,
    loading: contractLoading,
  } = useTrexContracts()

  // Mock data for demonstration
  const mockTokens: TokenData[] = [
    {
      id: "1",
      symbol: "GBB",
      name: "Green Brew Bond",
      tokenAddress: "0x97C1E24C5A5D5F5b5e5D5c5B5a5F5E5d5C5b5A5f",
      totalSupply: "1000000",
      circulatingSupply: "750000",
      price: 10.43,
      marketCap: 7822500,
      holders: 245,
      totalInvestments: 156,
      status: "active",
      compliance: {
        kycRequired: true,
        amlRequired: true,
        accreditedOnly: false,
        jurisdictionRestrictions: ["US", "EU"],
      },
      createdAt: "2024-01-15",
      lastActivity: "2024-01-20",
      trustedIssuers: [issuerAddress || ""],
      emergencyPaused: false
    },
    {
      id: "2",
      symbol: "RGT",
      name: "Royal Galaxy Token",
      tokenAddress: "0x97C1E1235A5D5F5b5e5D5c5B5a5F5E5d5C5b5A5f",
      totalSupply: "1000000",
      circulatingSupply: "750000",
      price: 1.23,
      marketCap: 1230000,
      holders: 1000,
      totalInvestments: 1000,
      status: "paused",
      compliance: {
        kycRequired: true,
        amlRequired: false,
        accreditedOnly: false,
        jurisdictionRestrictions: ["UAE", "UK"],
      },
      createdAt: "2025-01-15",
      lastActivity: "2025-07-06",
      trustedIssuers: [issuerAddress || ""],
      emergencyPaused: false
    },
  ]

  const mockInvestors: InvestorProfile[] = [
    {
      id: "1",
      walletAddress: "0xD2E33B6ACDE32e80E6553270C349C9BC8E45aCf0",
      onChainId: "0xB7A730d79eCB3A171a66c4Aebdf0f84DC62882A4",
      fullName: "John Smith",
      email: "john.smith@example.com",
      country: "US",
      investorType: "individual",
      accreditedStatus: true,
      kycStatus: "verified",
      amlStatus: "verified",
      totalInvested: 25000,
      tokenBalance: 2397.5,
      firstInvestment: "2024-01-10",
      lastActivity: "2024-01-18",
      riskScore: 25,
      complianceScore: 95,
      status: "active",
      documents: {
        identity: "ipfs://QmIdentity123",
        address: "ipfs://QmAddress123",
        income: "ipfs://QmIncome123",
        accreditation: "ipfs://QmAccred123",
      },
      transactions: [],
    },
    {
      id: "2",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      onChainId: "0xC8B841e90eDC4A282a77c4Aebdf0f84DC62882B5",
      fullName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      country: "CA",
      investorType: "institutional",
      accreditedStatus: true,
      kycStatus: "verified",
      amlStatus: "pending",
      totalInvested: 100000,
      tokenBalance: 9587.2,
      firstInvestment: "2024-01-05",
      lastActivity: "2024-01-19",
      riskScore: 15,
      complianceScore: 88,
      status: "active",
      documents: {
        identity: "ipfs://QmIdentity456",
        address: "ipfs://QmAddress456",
        income: "ipfs://QmIncome456",
        accreditation: "ipfs://QmAccred456",
      },
      transactions: [],
    },
  ]

  const mockOrders: InvestmentOrder[] = [
    {
      id: "ORD-001",
      investorId: "3",
      investorName: "Michael Chen",
      investorEmail: "michael.chen@example.com",
      tokenSymbol: "GBB",
      requestedAmount: 1000,
      investmentValue: 10430,
      currency: "USDC",
      paymentMethod: "stablecoin",
      status: "pending",
      submittedAt: "2024-01-20T10:30:00Z",
      complianceChecks: {
        kyc: true,
        aml: true,
        jurisdiction: true,
        accreditation: false,
      },
      documents: ["ipfs://QmDoc1", "ipfs://QmDoc2"],
      riskAssessment: {
        score: 35,
        level: "medium",
        factors: ["First-time investor", "Large investment amount"],
      },
      notes: "First investment from this investor. Requires additional review.",
    },
    {
      id: "ORD-002",
      investorId: "4",
      investorName: "Emma Wilson",
      investorEmail: "emma.wilson@example.com",
      tokenSymbol: "GBB",
      requestedAmount: 500,
      investmentValue: 5215,
      currency: "ETH",
      paymentMethod: "crypto_wallet",
      status: "approved",
      submittedAt: "2024-01-19T14:15:00Z",
      reviewedAt: "2024-01-19T16:30:00Z",
      reviewedBy: issuerAddress,
      complianceChecks: {
        kyc: true,
        aml: true,
        jurisdiction: true,
        accreditation: true,
      },
      documents: ["ipfs://QmDoc3", "ipfs://QmDoc4"],
      riskAssessment: {
        score: 20,
        level: "low",
        factors: ["Verified accredited investor", "Good compliance history"],
      },
      notes: "Approved for minting. All compliance checks passed.",
    },
  ]




  // API helper function
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  // Load token holders
  const loadTokenHolders = async (tokenAddress: string) => {
    if (!tokenAddress) return
    
    setLoading(true)
    try {
      const response = await apiCall(`/token/${tokenAddress}/holders`)
      setTokenHolders(response.data || [])
      toast.success('Token holders loaded successfully')
    } catch (error: any) {
      toast.error(`Failed to load token holders: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Load transactions
  const loadTransactions = async (tokenAddress: string) => {
    if (!tokenAddress) return
    
    try {
      const response = await apiCall(`/token/${tokenAddress}/transactions?limit=20`)
      setTransactions(response.data || [])
    } catch (error) {
      console.error('Failed to load transactions:', error)
    }
  }

  // Load token info
  const loadTokenInfo = async (tokenAddress: string) => {
    if (!tokenAddress) return
    
    try {
      const response = await apiCall(`/token/${tokenAddress}/info`)
      setTokenInfo(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to load token info:', error)
    }
  }

  const fetchIssuerData = async () => {
    try {
      setLoading(true)
      const res = await getInvestorList()
      console.log("API Response:", res)

      if (!isConnected) {
        open()
        return
      }

      if (issuerAddress) {
        const investorDetails = res.content.filter(
          (investor: any) => investor.investorAddress.toLowerCase() === issuerAddress.toLowerCase(),
        )
        const allTokens = investorDetails.map((investor: any) => investor.tokenAddress)

        const stdata = await getSTData()
        console.log("ST data received:", stdata)

        // Filter the data based on the symbol from URL params
        const filteredTokens = stdata.content.filter((contract: any) => contract.ownerAddress.toLowerCase() == issuerAddress?.toLowerCase())

        setTokens(filteredTokens)
        setHasTokens(filteredTokens.length > 0)
        
        if (filteredTokens.length > 0) {
          setSelectedToken(filteredTokens[0].tokenSymbol || "")
        }
        
        const details = {...investorDetails[0], tokens: filteredTokens} 
        console.log("Filtered investor details:", details)
      }
    } catch (error) {
      console.error("Error fetching investor data:", error)
      toast.error("Failed to fetch investor data")
    } finally {
      setLoading(false)
      setDataLoaded(true)
    }
  }

  useEffect(() => {
    fetchIssuerData()
  }, [issuerAddress])


  useEffect(() => {
    if (issuerAddress) {
      dispatch(fetchTokens(issuerAddress))
    }
  }, [dispatch, issuerAddress])

  useEffect(() => {
    if (selectedToken) {
      dispatch(fetchInvestors(selectedToken))
    }
  }, [dispatch, selectedToken])

  const handleMintTokens = async () => {
    if (!mintRecipient || !mintAmount) {
      toast.error("Please enter recipient address and amount")
      return
    }

    try {
      setLocalLoading(true)
      toast.loading("Minting tokens...", { id: "mint-tokens" })

      const result = await mintTokens(selectedToken, mintRecipient, mintAmount)

      if (result.success) {
        toast.success(`Successfully minted ${mintAmount} tokens to ${mintRecipient}`, { id: "mint-tokens" })
        setMintAmount("")
        setMintRecipient("")
      }
    } catch (error) {
      console.error("Minting error:", error)
      toast.error("Failed to mint tokens", { id: "mint-tokens" })
    } finally {
      setLocalLoading(false)
    }
  }

  const handleBlacklistAddress = async () => {
    if (!blacklistAddress) {
      toast.error("Please enter an address to blacklist")
      return
    }

    try {
      setLocalLoading(true)
      toast.loading("Adding to blacklist...", { id: "blacklist" })

      const result = await addToBlacklist(selectedToken, blacklistAddress)

      if (result.success) {
        toast.success(`Address ${blacklistAddress} added to blacklist`, { id: "blacklist" })
        setBlacklistAddress("")

        // Update investor status in Redux
        dispatch(updateInvestorStatus({ 
          investorId: blacklistAddress, 
          status: "blacklisted" 
        }))
      }
    } catch (error) {
      console.error("Blacklist error:", error)
      toast.error("Failed to blacklist address", { id: "blacklist" })
    } finally {
      setLocalLoading(false)
    }
  }

  const handleApproveOrder = async (orderId: string) => {
    try {
      setLocalLoading(true)
      const result = await dispatch(approveInvestmentOrder({ orderId, tokenSymbol: selectedToken }))
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success("Investment order approved successfully")
      }
    } catch (error) {
      console.error("Approval error:", error)
      toast.error("Failed to approve order")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      setLocalLoading(true)
      toast.loading("Rejecting investment order...", { id: "reject-order" })

      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("Investment order rejected", { id: "reject-order" })
    } catch (error) {
      console.error("Rejection error:", error)
      toast.error("Failed to reject order", { id: "reject-order" })
    } finally {
      setLocalLoading(false)
    }
  }

  const handleSuspendInvestor = async (investorId: string) => {
    try {
      setLocalLoading(true)
      dispatch(updateInvestorStatus({ investorId, status: "suspended" }))
      toast.success("Investor suspended successfully")
    } catch (error) {
      console.error("Suspension error:", error)
      toast.error("Failed to suspend investor")
    } finally {
      setLocalLoading(false)
    }
  }

  const handleAddTrustedIssuer = async () => {
    if (!trustedIssuerAddress) {
      toast.error("Please enter issuer address")
      return
    }

    try {
      setLocalLoading(true)
      toast.loading("Adding trusted issuer...", { id: "add-issuer" })

      const result = await trustedIssuers.addTrustedIssuer(trustedIssuerAddress, [1, 2, 3])

      if (result.success) {
        const currentToken = mockTokens.find(t => t.symbol === selectedToken)
        if (currentToken) {
          dispatch(addTrustedIssuer({ tokenId: currentToken.id, issuerAddress: trustedIssuerAddress }))
        }
        toast.success("Trusted issuer added successfully", { id: "add-issuer" })
        setTrustedIssuerAddress("")
      }
    } catch (error) {
      console.error("Add trusted issuer error:", error)
      toast.error("Failed to add trusted issuer", { id: "add-issuer" })
    } finally {
      setLocalLoading(false)
    }
  }

  const handleEmergencyPause = async () => {
    try {
      setLocalLoading(true)
      toast.loading("Emergency pausing token transfers...", { id: "emergency-pause" })

      const result = await token.pause()

      if (result.success) {
        const currentToken = mockTokens.find(t => t.symbol === selectedToken)
        if (currentToken) {
          dispatch(updateTokenEmergencyPause({ tokenId: currentToken.id, paused: true }))
        }
        toast.success("Token transfers paused successfully", { id: "emergency-pause" })
      }
    } catch (error) {
      console.error("Emergency pause error:", error)
      toast.error("Failed to pause token transfers", { id: "emergency-pause" })
    } finally {
      setLocalLoading(false)
    }
  }


  const handleTokenCreated = (tokenAddress: string) => {
    setSelectedToken(tokenAddress)
    toast.success(`Token created successfully! Address: ${tokenAddress}`)
    // Load the new token data
    loadTokenInfo(tokenAddress)
    loadTokenHolders(tokenAddress)
    loadTransactions(tokenAddress)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const filteredInvestors = mockInvestors.filter((investor) => {
    const matchesSearch =
      investor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investor.walletAddress.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || investor.status === statusFilter
    const matchesCompliance =
      complianceFilter === "all" ||
      (complianceFilter === "verified" && investor.kycStatus === "verified" && investor.amlStatus === "verified") ||
      (complianceFilter === "pending" && (investor.kycStatus === "pending" || investor.amlStatus === "pending"))

    return matchesSearch && matchesStatus && matchesCompliance
  })

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.investorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Please connect your wallet to access the issuer dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => open()} className="w-full">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state while fetching data
  if (!dataLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading Dashboard
            </CardTitle>
            <CardDescription>Fetching your token portfolio...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show token creation flow if no tokens exist
  if (!hasTokens) {
    return (
      <div className="min-h-screen pt-[5%] bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="container mx-auto px-6 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                  <Coins className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              Welcome to Security Token Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Launch your first ERC-3643 compliant security token with built-in KYC, AML, and advanced compliance features. 
              Join the future of regulated digital assets.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge variant="outline" className="px-4 py-2 text-sm border-purple-200 text-purple-700">
                <Shield className="w-4 h-4 mr-2" />
                Regulatory Compliant
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-blue-200 text-blue-700">
                <Users className="w-4 h-4 mr-2" />
                KYC/AML Ready
              </Badge>
              <Badge variant="outline" className="px-4 py-2 text-sm border-cyan-200 text-cyan-700">
                <Globe className="w-4 h-4 mr-2" />
                Global Access
              </Badge>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-background/60 backdrop-blur-sm border-purple-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">$2.1B+</h3>
                <p className="text-muted-foreground">Total Value Tokenized</p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-blue-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">500+</h3>
                <p className="text-muted-foreground">Active Issuers</p>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-sm border-cyan-100 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">99.9%</h3>
                <p className="text-muted-foreground">Compliance Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-background/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-bold mb-4">Ready to Launch Your Security Token?</CardTitle>
                <CardDescription className="text-lg">
                  Our guided setup process will have your token deployed and compliant in minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Built-in Compliance</h4>
                      <p className="text-sm text-muted-foreground">Automatic KYC/AML verification and jurisdiction controls</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Investor Management</h4>
                      <p className="text-sm text-muted-foreground">Complete investor onboarding and portfolio tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Real-time Analytics</h4>
                      <p className="text-sm text-muted-foreground">Advanced reporting and performance insights</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Enterprise Security</h4>
                      <p className="text-sm text-muted-foreground">Bank-grade security with multi-sig support</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button
                    onClick={() => setShowCreateToken(true)}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Coins className="w-6 h-6 mr-3" />
                    Create Your First Token
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    No setup fees • Deploy in 5 minutes • Full compliance included
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Token Creation Stepper */}
        <TokenCreationStepper
          isOpen={showCreateToken}
          onClose={() => setShowCreateToken(false)}
          onSuccess={handleTokenCreated}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[5%] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Building className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">Token Issuer</span>
            </div>
          </div>



          <div className="ml-auto flex items-center space-x-4">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Token" />
              </SelectTrigger>
              <SelectContent>
                {tokens.map((token: any) => (
                  <SelectItem key={token.tokenAddress} value={token.tokenSymbol}>
                    {token.tokenSymbol} - {token.tokenName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center space-x-4">
            <Button
              onClick={() => setShowCreateToken(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Token
            </Button>
         
           
          </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-issuer.jpg" alt="Issuer" />
                    <AvatarFallback>IS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Token Issuer</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {issuerAddress?.slice(0, 6)}...{issuerAddress?.slice(-4)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
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
              variant={activeTab === "overview" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button 
              variant={activeTab === "investors" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("investors")}
            >
              <Users className="mr-2 h-4 w-4" />
              Investors
            </Button>
            <Button 
              variant={activeTab === "orders" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Orders
            </Button>
            <Button 
              variant={activeTab === "transactions" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("transactions")}
            >
              <Activity className="mr-2 h-4 w-4" />
              Transactions
            </Button>
            <Button 
              variant={activeTab === "management" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("management")}
            >
              <Coins className="mr-2 h-4 w-4" />
              Token Management
            </Button>
            <Button 
              variant={activeTab === "compliance" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("compliance")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Compliance
            </Button>
            <Button 
              variant={activeTab === "analytics" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("analytics")}
            >
              <PieChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button 
              variant={activeTab === "reports" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("reports")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </Button>
            <Button 
              variant={activeTab === "settings" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              variant={activeTab === "api" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("api")}
            >
              <Code className="mr-2 h-4 w-4" />
              API Management
            </Button>
            <Button 
              variant={activeTab === "support" ? "default" : "ghost"} 
              className="w-full justify-start"
              onClick={() => setActiveTab("support")}
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              Support & Help
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Cards */}
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$7.82M</div>
                <p className="text-xs opacity-80">+12.5% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+18 new this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Requires review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Price</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$10.43</div>
                <p className="text-xs text-green-600">+2.3% today</p>
              </CardContent>
            </Card>
          </div>

          {/* Dynamic Content Based on Active Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Token Portfolio Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Your Token Portfolio
                  </h2>
                  <p className="text-muted-foreground">
                    Manage {tokens.length} token{tokens.length !== 1 ? 's' : ''} and track performance
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateToken(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Token
                </Button>
              </div>

              {/* Token Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tokens.map((token: any, index: number) => (
                  <Card key={token.tokenAddress} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm overflow-hidden">
                    {/* Token Header */}
                    <div className={`h-2 bg-gradient-to-r ${
                      index % 3 === 0 ? 'from-purple-500 to-blue-500' :
                      index % 3 === 1 ? 'from-blue-500 to-cyan-500' :
                      'from-cyan-500 to-green-500'
                    }`} />
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${
                            index % 3 === 0 ? 'from-purple-500 to-blue-500' :
                            index % 3 === 1 ? 'from-blue-500 to-cyan-500' :
                            'from-cyan-500 to-green-500'
                          } flex items-center justify-center`}>
                            <span className="text-white font-bold text-lg">
                              {token.tokenSymbol?.charAt(0) || 'T'}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-foreground">
                              {token.tokenSymbol || 'N/A'}
                            </CardTitle>
                            <CardDescription className="text-sm font-medium">
                              {token.tokenName || 'Unknown Token'}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedToken(token.tokenSymbol)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(token.tokenAddress)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Address
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View on Explorer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Token Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-background/60 rounded-lg">
                          <div className="text-lg font-bold text-foreground">
                            {token.totalSupply ? Number(token.totalSupply).toLocaleString() : '1,000,000'}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Supply</div>
                        </div>
                        <div className="text-center p-3 bg-background/60 rounded-lg">
                          <div className="text-lg font-bold text-green-600">
                            ${token.initialPrice ? Number(token.initialPrice).toFixed(2) : '10.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">Price</div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="p-3 bg-surface-light rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Contract Address</div>
                            <div className="text-sm font-mono text-foreground">
                              {token.tokenAddress?.slice(0, 6)}...{token.tokenAddress?.slice(-4)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(token.tokenAddress)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedToken(token.tokenSymbol)
                            setActiveTab("management")
                          }}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          Mint
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedToken(token.tokenSymbol)
                            setActiveTab("investors")
                          }}
                        >
                          <Users className="w-3 h-3 mr-1" />
                          Investors
                        </Button>
                      </div>

                      {/* Status */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <Badge 
                          variant="default" 
                          className="bg-green-100 text-green-700 hover:bg-green-100"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Created {new Date(token.deployedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Token Card */}
                <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-dashed border-border hover:border-purple-300 bg-gradient-to-br from-gray-50 to-white cursor-pointer" onClick={() => setShowCreateToken(true)}>
                  <CardContent className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Create New Token</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Launch another ERC-3643 compliant security token
                    </p>
                    <Badge variant="outline" className="border-purple-200 text-purple-700">
                      <Coins className="w-3 h-3 mr-1" />
                      Quick Setup
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Analytics */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-900">
                      <TrendingUp className="h-5 w-5" />
                      <span>Portfolio Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Total Market Cap</span>
                        <span className="font-bold text-blue-900">
                          ${tokens.reduce((acc: number, token: any) => acc + (Number(token.initialPrice || 10) * Number(token.totalSupply || 1000000)), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Active Tokens</span>
                        <span className="font-bold text-blue-900">{tokens.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700">Avg. Token Price</span>
                        <span className="font-bold text-blue-900">
                          ${tokens.length > 0 ? (tokens.reduce((acc: number, token: any) => acc + Number(token.initialPrice || 10), 0) / tokens.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-100">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-900">
                      <Activity className="h-5 w-5" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {tokens.slice(0, 3).map((token: any, index: number) => (
                        <div key={token.tokenAddress} className="flex items-center space-x-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-purple-700">
                            {token.tokenSymbol} token deployed successfully
                          </span>
                          <span className="text-xs text-purple-500 ml-auto">
                            {new Date(token.deployedAt || Date.now() - index * 86400000).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      {tokens.length === 0 && (
                        <div className="text-center text-purple-600 py-4">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "investors" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Investor Management</h2>
                  <p className="text-muted-foreground">Manage your token investors and their compliance status</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Investor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Investment</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Compliance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvestors.map((investor) => (
                        <TableRow key={investor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{investor.fullName.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{investor.fullName}</div>
                                <div className="text-sm text-muted-foreground">{investor.email}</div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {investor.walletAddress.slice(0, 6)}...{investor.walletAddress.slice(-4)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <Badge variant={investor.investorType === "institutional" ? "default" : "secondary"}>
                                {investor.investorType}
                              </Badge>
                              {investor.accreditedStatus && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Accredited
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono">${investor.totalInvested.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              Since {new Date(investor.firstInvestment).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono">
                              {investor.tokenBalance.toFixed(2)} {selectedToken}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant={investor.kycStatus === "verified" ? "default" : "secondary"}
                                  className={investor.kycStatus === "verified" ? "bg-green-100 text-green-700" : ""}
                                >
                                  KYC: {investor.kycStatus}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">Score: {investor.complianceScore}%</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                investor.status === "active"
                                  ? "default"
                                  : investor.status === "suspended"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={
                                investor.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : investor.status === "blacklisted"
                                    ? "bg-red-100 text-red-700"
                                    : ""
                              }
                            >
                              {investor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedInvestor(investor)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Investor Profile: {investor.fullName}</DialogTitle>
                                    <DialogDescription>
                                      Complete investor information and compliance status
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedInvestor && (
                                    <div className="space-y-6">
                                      {/* Basic Information */}
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Basic Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div>
                                              <Label>Full Name</Label>
                                              <p className="font-medium">{selectedInvestor.fullName}</p>
                                            </div>
                                            <div>
                                              <Label>Email</Label>
                                              <p className="font-medium">{selectedInvestor.email}</p>
                                            </div>
                                            <div>
                                              <Label>Country</Label>
                                              <p className="font-medium">{selectedInvestor.country}</p>
                                            </div>
                                            <div>
                                              <Label>Investor Type</Label>
                                              <Badge
                                                variant={
                                                  selectedInvestor.investorType === "institutional"
                                                    ? "default"
                                                    : "secondary"
                                                }
                                              >
                                                {selectedInvestor.investorType}
                                              </Badge>
                                            </div>
                                            <div>
                                              <Label>Wallet Address</Label>
                                              <div className="flex items-center space-x-2">
                                                <p className="font-mono text-sm">{selectedInvestor.walletAddress}</p>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => copyToClipboard(selectedInvestor.walletAddress)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                            <div>
                                              <Label>OnChain ID</Label>
                                              <div className="flex items-center space-x-2">
                                                <p className="font-mono text-sm">{selectedInvestor.onChainId}</p>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => copyToClipboard(selectedInvestor.onChainId)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      {/* Documents */}
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Documents</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(selectedInvestor.documents).map(([key, value]) => (
                                              <div
                                                key={key}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                              >
                                                <div className="flex items-center space-x-3">
                                                  <FileText className="h-5 w-5 text-blue-600" />
                                                  <div>
                                                    <p className="font-medium capitalize">
                                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                      IPFS: {value.slice(0, 15)}...
                                                    </p>
                                                  </div>
                                                </div>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => window.open(value, "_blank")}
                                                >
                                                  <ExternalLink className="mr-2 h-4 w-4" />
                                                  View
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleSuspendInvestor(investor.id)}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspend
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Ban className="mr-2 h-4 w-4" />
                                    Blacklist
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Message
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
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Investment Orders</h2>
                  <p className="text-muted-foreground">Review and approve pending investment orders</p>
                </div>
              </div>

              <div className="grid gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>{order.investorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{order.investorName}</CardTitle>
                            <CardDescription>{order.investorEmail}</CardDescription>
                            <p className="text-sm text-muted-foreground">Order ID: {order.id}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            order.status === "pending"
                              ? "secondary"
                              : order.status === "approved"
                                ? "default"
                                : "destructive"
                          }
                          className={
                            order.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : order.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : ""
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Investment Details */}
                        <Card className="bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Investment Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-mono">{order.requestedAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-mono">${order.investmentValue.toLocaleString()}</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Compliance Checks */}
                        <Card className="bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Compliance</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {Object.entries(order.complianceChecks).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between">
                                <span className="text-sm capitalize">{key}:</span>
                                <Badge variant={value ? "default" : "secondary"}>
                                  {value ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        {/* Risk Assessment */}
                        <Card className="bg-slate-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">Risk Assessment</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Risk Level:</span>
                              <Badge variant="outline">{order.riskAssessment.level}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {order.status === "pending" && (
                        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => handleRejectOrder(order.id, "Compliance issues")}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleApproveOrder(order.id)}
                            disabled={localLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {localLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <UserCheck className="mr-2 h-4 w-4" />
                            )}
                            Approve & Mint
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "management" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Token Management</h2>
                  <p className="text-muted-foreground">Mint tokens, manage trusted issuers, and control token operations</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Mint Tokens */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Coins className="h-5 w-5" />
                      <span>Mint Tokens</span>
                    </CardTitle>
                    <CardDescription>Mint new tokens to approved investors</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="mint-recipient">Recipient Address</Label>
                      <Input
                        id="mint-recipient"
                        placeholder="0x..."
                        value={mintRecipient}
                        onChange={(e) => setMintRecipient(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mint-amount">Amount</Label>
                      <Input
                        id="mint-amount"
                        type="number"
                        placeholder="0.00"
                        value={mintAmount}
                        onChange={(e) => setMintAmount(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleMintTokens} disabled={localLoading || contractLoading} className="w-full">
                      {localLoading || contractLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-4 w-4" />
                          Mint Tokens
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Trusted Issuers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      <span>Trusted Issuers</span>
                    </CardTitle>
                    <CardDescription>Add or remove trusted issuers for compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="trusted-issuer">Issuer Address</Label>
                      <Input
                        id="trusted-issuer"
                        placeholder="0x..."
                        value={trustedIssuerAddress}
                        onChange={(e) => setTrustedIssuerAddress(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAddTrustedIssuer}
                        disabled={localLoading || contractLoading}
                        className="flex-1"
                      >
                        {localLoading || contractLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="mr-2 h-4 w-4" />
                        )}
                        Add Issuer
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Minus className="mr-2 h-4 w-4" />
                        Remove Issuer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Blacklist Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Ban className="h-5 w-5" />
                      <span>Blacklist Management</span>
                    </CardTitle>
                    <CardDescription>Add or remove addresses from blacklist</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="blacklist-address">Address to Blacklist</Label>
                      <Input
                        id="blacklist-address"
                        placeholder="0x..."
                        value={blacklistAddress}
                        onChange={(e) => setBlacklistAddress(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleBlacklistAddress}
                        disabled={localLoading || contractLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {localLoading || contractLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Ban className="mr-2 h-4 w-4" />
                        )}
                        Blacklist
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Unlock className="mr-2 h-4 w-4" />
                        Remove Blacklist
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span>Emergency Controls</span>
                    </CardTitle>
                    <CardDescription>Emergency pause and resume token transfers</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleEmergencyPause}
                        disabled={localLoading || contractLoading}
                        variant="destructive"
                        className="flex-1"
                      >
                        {localLoading || contractLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Pause className="mr-2 h-4 w-4" />
                        )}
                        Emergency Pause
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Play className="mr-2 h-4 w-4" />
                        Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Token Operations */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Token Operations</CardTitle>
                  <CardDescription>Advanced operations for token management</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <Lock className="h-6 w-6 mb-2" />
                      <span>Freeze Address</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Unlock className="h-6 w-6 mb-2" />
                      <span>Unfreeze Address</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Send className="h-6 w-6 mb-2" />
                      <span>Forced Transfer</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Archive className="h-6 w-6 mb-2" />
                      <span>Burn Tokens</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Transaction History</h2>
                  <p className="text-muted-foreground">All token transactions and operations</p>
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

              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                    <p className="text-sm">Transaction history will appear here as operations are performed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Compliance Management</h2>
                  <p className="text-muted-foreground">Monitor and manage compliance requirements</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">KYC Required</p>
                        <p className="text-sm text-muted-foreground">Identity verification mandatory</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">AML Required</p>
                        <p className="text-sm text-muted-foreground">Anti-money laundering checks</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">95%</div>
                        <p className="text-sm text-muted-foreground">KYC Verified</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">92%</div>
                        <p className="text-sm text-muted-foreground">AML Cleared</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Advanced Analytics</h2>
                  <p className="text-muted-foreground">Detailed insights into token performance and investor behavior</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Performance Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Monthly Growth</span>
                          <span className="text-green-600">+12.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Investor Retention</span>
                          <span className="text-blue-600">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Investor Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Institutional vs Individual</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 bg-blue-200 rounded h-4"></div>
                        <div className="flex-2 bg-green-200 rounded h-4"></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>30% Institutional</span>
                        <span>70% Individual</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Risk Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">Low Risk</div>
                        <p className="text-sm text-muted-foreground">Portfolio Risk Score</p>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full border-4 border-green-300 flex items-center justify-center">
                          <span className="text-sm font-medium">25</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Reports & Documentation</h2>
                  <p className="text-muted-foreground">Generate compliance reports and export data</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Reports</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      KYC/AML Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Investor Activity Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Token Issuance Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Investor Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Transaction History
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Export Compliance Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Settings</h2>
                  <p className="text-muted-foreground">Configure your issuer dashboard and token settings</p>
                </div>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Settings</CardTitle>
                    <CardDescription>Configure token-specific settings and compliance rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Transfer Restrictions</Label>
                        <p className="text-sm text-muted-foreground">Enable transfer restrictions for compliance</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Automatic Compliance Checks</Label>
                        <p className="text-sm text-muted-foreground">Automatically verify investor compliance</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Investment Orders</Label>
                        <p className="text-sm text-muted-foreground">Get notified of new investment requests</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Compliance Alerts</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts for compliance issues</p>
                      </div>
                      <Switch checked={true} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">API Management</h2>
                  <p className="text-muted-foreground">Manage API keys and integration settings</p>
                </div>
              </div>

              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Generate and manage API keys for external integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Production API Key</p>
                        <p className="text-sm text-muted-foreground font-mono">sk_prod_************************</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate New API Key
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Webhooks</CardTitle>
                    <CardDescription>Configure webhooks for real-time notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Webhook Endpoint
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Support & Help</h2>
                  <p className="text-muted-foreground">Get help and access documentation</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <span>Documentation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Token Issuance Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      Compliance Best Practices
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="mr-2 h-4 w-4" />
                      API Documentation
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-5 w-5" />
                      <span>Get Support</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Support Team
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Globe className="mr-2 h-4 w-4" />
                      Visit Help Center
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
        
      </div>
            {/* Token Creation Stepper */}
            <TokenCreationStepper
        isOpen={showCreateToken}
        onClose={() => setShowCreateToken(false)}
        onSuccess={handleTokenCreated}
      />
    </div>
  )
}

export default IssuerDashboard









