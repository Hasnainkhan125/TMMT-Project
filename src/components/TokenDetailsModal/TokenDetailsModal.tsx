import React, { useState, useEffect } from 'react'
import { X, ExternalLink, Copy, Users, TrendingUp, Shield, FileText, Settings, Activity, BarChart3, Download, Upload, CheckCircle, XCircle, AlertCircle, Pause, Play, Trash2, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Alert, AlertDescription } from '../ui/alert'
import { Separator } from '../ui/separator'
import { tokenService } from '../../services/token-service'

interface ModalTokenData {
  _id?: string
  id?: string
  name: string
  symbol: string
  deploymentInfo?: {
    network?: string
    tokenAddress?: string
    identityRegistryAddress?: string
    explorerLink?: string
    deployedAt?: string
    status?: string
    contractSuite?: {
      identityRegistryAddress?: string
      identityRegistryStorageAddress?: string
      trustedIssuerRegistryAddress?: string
      claimTopicsRegistryAddress?: string
      modularComplianceAddress?: string
    }
  }
  contractSuite?: {
    token?: string
    identityRegistry?: string
    identityRegistryStorage?: string
    claimTopicsRegistry?: string
    trustedIssuersRegistry?: string
    compliance?: string
    factory?: string
    gateway?: string
  }
  complianceModules?: Array<{
    name?: string
    moduleKey?: string
    address?: string
    proxyAddress?: string
    isActive?: boolean
    status?: string
  }>
  claimData?: {
    claimTopics?: (number | string)[]
    trustedIssuers?: string[]
    claimIssuers?: string[]
    issuerClaims?: Array<{
      claimTopic: number
      issuer: string
      data: string
    }> | string[][]
  }
  assetInfo?: {
    type?: string
    category?: string
    description?: string
    estimatedValue?: string
    currency?: string
    jurisdiction?: string
  }
  basicInfo?: {
    description?: string
    totalSupply?: string
    decimals?: number
    initialPrice?: string
    minInvestment?: string
    maxInvestment?: string
  }
  ownerInfo?: {
    name?: string
    email?: string
    address?: string
    jurisdiction?: string
  }
  metadata?: {
    logoUrl?: string
    website?: string
    whitepaper?: string
    socialLinks?: {
      twitter?: string
      linkedin?: string
      telegram?: string
      discord?: string
    }
  }
  // Dashboard format fields
  assetType?: string
  assetCategory?: string
  assetDescription?: string
  assetValue?: string
  assetCurrency?: string
  jurisdiction?: string
  description?: string
  totalSupply?: string
  decimals?: number
  initialPrice?: string
  minInvestment?: string
  maxInvestment?: string
  ownerName?: string
  ownerEmail?: string
  ownerAddress?: string
  ownerJurisdiction?: string
  logoUrl?: string
  website?: string
  whitepaper?: string
  socialLinks?: Record<string, string>
  status?: "deployed" | "pending" | "failed"
  createdAt?: string
  updatedAt?: string
}

interface TokenDetailsModalProps {
  token: ModalTokenData | null
  isOpen: boolean
  onClose: () => void
}

export const TokenDetailsModal: React.FC<TokenDetailsModalProps> = ({
  token,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(false)
  const [investors, setInvestors] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [documents, setDocuments] = useState<any[]>([])
  const [newInvestorAddress, setNewInvestorAddress] = useState('')
  const [blacklistAddress, setBlacklistAddress] = useState('')
  const [blacklistReason, setBlacklistReason] = useState('')
  const [updateStatusValue, setUpdateStatusValue] = useState('')
  const [uploadingDocument, setUploadingDocument] = useState(false)

  // Helper function to get values with fallbacks for both data formats
  const getValue = (field: string, fallback: string = 'N/A') => {
    if (!token) return fallback
    
    const paths: Record<string, any> = {
      tokenId: token._id || token.id || fallback,
      name: token.name || fallback,
      symbol: token.symbol || fallback,
      description: token.basicInfo?.description || token.description || fallback,
      totalSupply: token.basicInfo?.totalSupply || token.totalSupply || fallback,
      decimals: token.basicInfo?.decimals || token.decimals || 18,
      initialPrice: token.basicInfo?.initialPrice || token.initialPrice || fallback,
      minInvestment: token.basicInfo?.minInvestment || token.minInvestment || fallback,
      maxInvestment: token.basicInfo?.maxInvestment || token.maxInvestment || fallback,
      assetType: token.assetInfo?.type || token.assetType || fallback,
      assetCategory: token.assetInfo?.category || token.assetCategory || fallback,
      assetDescription: token.assetInfo?.description || token.assetDescription || fallback,
      assetValue: token.assetInfo?.estimatedValue || token.assetValue || fallback,
      assetCurrency: token.assetInfo?.currency || token.assetCurrency || 'USD',
      jurisdiction: token.assetInfo?.jurisdiction || token.jurisdiction || fallback,
      ownerName: token.ownerInfo?.name || token.ownerName || fallback,
      ownerEmail: token.ownerInfo?.email || token.ownerEmail || fallback,
      ownerAddress: token.ownerInfo?.address || token.ownerAddress || fallback,
      ownerJurisdiction: token.ownerInfo?.jurisdiction || token.ownerJurisdiction || fallback,
      logoUrl: token.metadata?.logoUrl || token.logoUrl || '',
      website: token.metadata?.website || token.website || '',
      whitepaper: token.metadata?.whitepaper || token.whitepaper || '',
      socialLinks: token.metadata?.socialLinks || token.socialLinks || {},
      network: token.deploymentInfo?.network || 'unknown',
      tokenAddress: token.deploymentInfo?.tokenAddress || '',
      identityRegistryAddress: token.deploymentInfo?.identityRegistryAddress || token.deploymentInfo?.contractSuite?.identityRegistryAddress || '',
      deployedAt: token.deploymentInfo?.deployedAt || token.createdAt || '',
      status: token.deploymentInfo?.status || token.status || 'unknown'
    }
    
    return paths[field] !== undefined ? paths[field] : fallback
  }

  useEffect(() => {
    if (token && isOpen) {
      loadTabData(activeTab)
    }
  }, [token, isOpen, activeTab])

  const loadTabData = async (tab: string) => {
    if (!token) return

    setLoading(true)
    try {
      const tokenId = getValue('tokenId')
      switch (tab) {
        case 'investors':
          const investorsData = await tokenService.getInvestors(tokenId)
          setInvestors(investorsData)
          break
        case 'transactions':
          const transactionsData = await tokenService.getTransactions(tokenId)
          setTransactions(transactionsData)
          break
        case 'analytics':
          const analyticsData = await tokenService.getTokenAnalytics(tokenId)
          setAnalytics(analyticsData)
          break
        case 'reports':
          const documentsData = await tokenService.getDocuments(tokenId)
          setDocuments(documentsData)
          break
      }
    } catch (error) {
      console.error('Error loading tab data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  const handleAddInvestor = async () => {
    if (!token || !newInvestorAddress) return

    try {
      await tokenService.addInvestor(getValue('tokenId'), { address: newInvestorAddress })
      setNewInvestorAddress('')
      loadTabData('investors')
    } catch (error) {
      console.error('Error adding investor:', error)
    }
  }

  const handleBlacklistAccount = async () => {
    if (!token || !blacklistAddress || !blacklistReason) return

    try {
      await tokenService.blacklistAccount(getValue('tokenId'), blacklistAddress, blacklistReason)
      setBlacklistAddress('')
      setBlacklistReason('')
      loadTabData('investors')
    } catch (error) {
      console.error('Error blacklisting account:', error)
    }
  }

  const handleUpdateTokenStatus = async () => {
    if (!token || !updateStatusValue) return

    try {
      await tokenService.updateTokenStatus(getValue('tokenId'), updateStatusValue)
      loadTabData('details')
    } catch (error) {
      console.error('Error updating token status:', error)
    }
  }

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!token) return

    setUploadingDocument(true)
    try {
      await tokenService.uploadDocument(getValue('tokenId'), documentType, file)
      loadTabData('reports')
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    if (!token) return

    try {
      const blob = await tokenService.generateComplianceReport(getValue('tokenId'), reportType)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${getValue('symbol')}_${reportType}_report.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  if (!token) return null

  return (
    <Dialog open={isOpen}  onOpenChange={onClose}>
      <DialogContent className="max-w-6xl min-h-[90vh] max-h-[90vh] overflow-y-scroll">
        <div>

        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getValue('logoUrl') && (
                <img src={getValue('logoUrl')} alt={getValue('name')} className="w-8 h-8 rounded-full" />
              )}
              <span>{getValue('name')} ({getValue('symbol')})</span>
              <Badge variant={getValue('status') === 'deployed' ? 'default' : 'secondary'}>
                {getValue('status')}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Token Name</Label>
                      <p className="text-sm font-medium">{getValue('name')}</p>
                    </div>
                    <div>
                      <Label>Symbol</Label>
                      <p className="text-sm font-medium">{getValue('symbol')}</p>
                    </div>
                    <div>
                      <Label>Total Supply</Label>
                      <p className="text-sm font-medium">{getValue('totalSupply')}</p>
                    </div>
                    <div>
                      <Label>Decimals</Label>
                      <p className="text-sm font-medium">{getValue('decimals')}</p>
                    </div>
                    <div>
                      <Label>Initial Price</Label>
                      <p className="text-sm font-medium">{getValue('initialPrice')} {getValue('assetCurrency')}</p>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground">{getValue('description', 'No description available')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Asset Type</Label>
                      <p className="text-sm font-medium">{getValue('assetType')}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm font-medium">{getValue('assetCategory')}</p>
                    </div>
                    <div>
                      <Label>Jurisdiction</Label>
                      <p className="text-sm font-medium">{getValue('jurisdiction')}</p>
                    </div>
                    <div>
                      <Label>Estimated Value</Label>
                      <p className="text-sm font-medium">{getValue('assetValue')} {getValue('assetCurrency')}</p>
                    </div>
                    <div>
                      <Label>Min Investment</Label>
                      <p className="text-sm font-medium">{getValue('minInvestment')} {getValue('assetCurrency')}</p>
                    </div>
                    <div>
                      <Label>Max Investment</Label>
                      <p className="text-sm font-medium">{getValue('maxInvestment')} {getValue('assetCurrency')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Owner Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm font-medium">{getValue('ownerName')}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm font-medium">{getValue('ownerEmail')}</p>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-muted-foreground">
                          {getValue('ownerAddress') !== 'N/A' ? `${getValue('ownerAddress').slice(0, 6)}...${getValue('ownerAddress').slice(-4)}` : 'N/A'}
                        </p>
                        {getValue('ownerAddress') !== 'N/A' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(getValue('ownerAddress'))}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Jurisdiction</Label>
                      <p className="text-sm font-medium">{getValue('ownerJurisdiction')}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Links & Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle>Links & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {getValue('website') && getValue('website') !== '' && (
                      <div>
                        <Label>Website</Label>
                        <Button variant="link" className="overflow-hidden p-0 h-auto text-sm" onClick={() => window.open(getValue('website'), '_blank')}>
                          {getValue('website')} <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                    {getValue('whitepaper') && getValue('whitepaper') !== '' && (
                      <div>
                        <Label>Whitepaper</Label>
                        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => window.open(getValue('whitepaper'), '_blank')}>
                          View Whitepaper <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )}
                    {getValue('socialLinks') && Object.keys(getValue('socialLinks')).length > 0 && (
                      <div>
                        <Label>Social Links</Label>
                        <div className="flex gap-2 flex-wrap">
                          {Object.entries(getValue('socialLinks')).map(([platform, url]) => (
                            <Button key={platform} variant="outline" size="sm" onClick={() => window.open(url as string, '_blank')}>
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Deployment Information */}
              {getValue('tokenAddress') && getValue('tokenAddress') !== '' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Deployment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Network</Label>
                        <p className="text-sm font-medium capitalize">{getValue('network')}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <Badge variant={getValue('status') === 'deployed' ? 'default' : 'secondary'}>
                          {getValue('status')}
                        </Badge>
                      </div>
                      <div>
                        <Label>Token Contract Address</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-mono text-muted-foreground">
                            {`${getValue('tokenAddress').slice(0, 6)}...${getValue('tokenAddress').slice(-4)}`}
                          </p>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(getValue('tokenAddress'))}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`https://${getValue('network') === 'holesky' ? 'holesky.etherscan.io' : 'sepolia.etherscan.io'}/address/${getValue('tokenAddress')}`, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {getValue('identityRegistryAddress') && getValue('identityRegistryAddress') !== '' && (
                        <div>
                          <Label>Identity Registry Address</Label>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-muted-foreground">
                              {`${getValue('identityRegistryAddress').slice(0, 6)}...${getValue('identityRegistryAddress').slice(-4)}`}
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(getValue('identityRegistryAddress'))}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => window.open(`https://${getValue('network') === 'holesky' ? 'holesky.etherscan.io' : 'sepolia.etherscan.io'}/address/${getValue('identityRegistryAddress')}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label>Deployed At</Label>
                        <p className="text-sm text-muted-foreground">
                          {getValue('deployedAt') !== 'N/A' ? new Date(getValue('deployedAt')).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contract Suite */}
              {token.contractSuite && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contract Suite</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(token.contractSuite).map(([name, address]) => {
                        if (!address) return null
                        return (
                          <div key={name} className="flex items-center justify-between">
                            <Label className="capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</Label>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono text-muted-foreground">
                                {`${address.slice(0, 6)}...${address.slice(-4)}`}
                              </p>
                              <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(address)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => window.open(`https://${getValue('network') === 'holesky' ? 'holesky.etherscan.io' : 'sepolia.etherscan.io'}/address/${address}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Modules */}
              {token.complianceModules && token.complianceModules.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {token.complianceModules.map((module, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{module.name || module.moduleKey}</p>
                            <p className="text-sm font-mono text-muted-foreground">
                              {module.address && `${module.address.slice(0, 6)}...${module.address.slice(-4)}`}
                              {module.proxyAddress && `${module.proxyAddress.slice(0, 6)}...${module.proxyAddress.slice(-4)}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={module.isActive || module.status === 'active' ? 'default' : 'secondary'}>
                              {module.isActive || module.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => handleCopyAddress(module.address || module.proxyAddress || '')}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Investors Tab */}
            <TabsContent value="investors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Investor Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <Input
                      placeholder="Investor wallet address"
                      value={newInvestorAddress}
                      onChange={(e) => setNewInvestorAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddInvestor} disabled={!newInvestorAddress}>
                      Add Investor
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Address</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Added Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investors.map((investor, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {`${investor.address?.slice(0, 6)}...${investor.address?.slice(-4)}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant={investor.status === 'approved' ? 'default' : 'secondary'}>
                                {investor.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(investor.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                                <Button variant="outline" size="sm">
                                  Update Status
                                </Button>
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

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Investment Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Order management functionality will be implemented with marketplace integration.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction Hash</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((tx, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {`${tx.hash?.slice(0, 6)}...${tx.hash?.slice(-4)}`}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{tx.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {`${tx.from?.slice(0, 6)}...${tx.from?.slice(-4)}`}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {`${tx.to?.slice(0, 6)}...${tx.to?.slice(-4)}`}
                            </TableCell>
                            <TableCell>{tx.amount} {getValue('symbol')}</TableCell>
                            <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Token Management Tab */}
            <TabsContent value="management" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Token Status Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Token Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Select value={updateStatusValue} onValueChange={setUpdateStatusValue}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="frozen">Frozen</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleUpdateTokenStatus} disabled={!updateStatusValue}>
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Management */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Blacklist Address</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Address to blacklist"
                          value={blacklistAddress}
                          onChange={(e) => setBlacklistAddress(e.target.value)}
                        />
                      </div>
                      <Textarea
                        placeholder="Reason for blacklisting"
                        value={blacklistReason}
                        onChange={(e) => setBlacklistReason(e.target.value)}
                        className="mt-2"
                      />
                      <Button onClick={handleBlacklistAccount} className="mt-2" disabled={!blacklistAddress || !blacklistReason}>
                        Blacklist Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {token.complianceModules && token.complianceModules.length > 0 ? (
                    <div className="space-y-4">
                      {token.complianceModules.map((module, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{module.name || module.moduleKey}</h4>
                            <Badge variant={module.isActive || module.status === 'active' ? 'default' : 'secondary'}>
                              {module.isActive || module.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Address: {module.address || module.proxyAddress}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {module.isActive || module.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button variant="outline" size="sm">
                              Configure
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No compliance modules configured for this token.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Token Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Total Holders</h4>
                        <p className="text-2xl font-bold">{analytics.totalHolders || '0'}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Total Transactions</h4>
                        <p className="text-2xl font-bold">{analytics.totalTransactions || '0'}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Market Cap</h4>
                        <p className="text-2xl font-bold">{analytics.marketCap || '0'} {getValue('assetCurrency')}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Document Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Document Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Document Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select document type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="compliance">Compliance Report</SelectItem>
                            <SelectItem value="audit">Audit Report</SelectItem>
                            <SelectItem value="legal">Legal Document</SelectItem>
                            <SelectItem value="financial">Financial Statement</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Upload Document</Label>
                        <Input type="file" className="mt-2" />
                      </div>
                      <Button disabled={uploadingDocument}>
                        {uploadingDocument ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Upload Document'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Generate Reports */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Generate Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('compliance')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Compliance Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('audit')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Audit Trail Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('transactions')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Transaction History
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('investors')}>
                        <FileText className="h-4 w-4 mr-2" />
                        Investor Registry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document List */}
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {documents.map((doc, index) => (
                        <TableRow key={index}>
                          <TableCell>{doc.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.type}</Badge>
                          </TableCell>
                          <TableCell>{new Date(doc.uploadDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
        </div>

      </DialogContent>
    </Dialog>
  )
} 