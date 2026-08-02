// Token Models - Comprehensive Security Token Data Structure
// This file contains all the models for managing security tokens throughout their lifecycle

export interface TokenContractAddresses {
  // Core token contract
  tokenAddress: string
  
  // Identity & Registry contracts
  identityRegistry: string
  identityRegistryStorage: string
  claimTopicsRegistry: string
  trustedIssuerRegistry: string
  
  // Compliance contracts
  complianceContract: string
  modularCompliance?: string
  
  // Factory contracts
  trexFactory?: string
  implementationAuthority?: string
  
  // Proxy contracts
  tokenProxy?: string
  identityRegistryProxy?: string
  claimTopicsRegistryProxy?: string
  
  // Agent contracts
  agentManager?: string
  
  // Network information
  chainId: number
  networkName: string
  blockNumber?: number
  deploymentTimestamp: string
}

export interface TokenBasicInfo {
  // Basic token details
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  circulatingSupply: string
  tokenPrice: string
  currency: string // USD, EUR, etc.
  
  // Deployment info
  deploymentSalt: string
  deployedAt: string
  deployedBy: string
  
  // Token economics
  marketCap?: number
  tradingVolume24h?: number
  priceChange24h?: number
  
  // Token state
  isPaused: boolean
  isTransferable: boolean
  isMintable: boolean
  isBurnable: boolean
}

export interface AssetInformation {
  // Asset categorization
  assetCategory: string // real-estate, financial, alternative, etc.
  assetType: string // residential, corporate-bonds, art, etc.
  assetDescription: string
  
  // Asset value
  assetValue: string
  assetCurrency: string
  valuationDate: string
  valuationMethod: string
  
  // Asset location & details
  jurisdiction: string
  location?: string
  assetIdentifier?: string // Property ID, CUSIP, etc.
  
  // Asset characteristics
  assetMetadata: Record<string, any>
  riskLevel: 'Low' | 'Medium' | 'High'
  liquidityScore: number
  
  // Legal structure
  legalStructure: string // Direct ownership, SPV, etc.
  ownershipType: string // Freehold, Leasehold, etc.
}

export interface JurisdictionRequirements {
  jurisdiction: string
  jurisdictionName: string
  
  // Required documents
  generalDocuments: string[]
  assetSpecificDocuments: string[]
  
  // Regulatory requirements
  regulatoryFramework: string[]
  complianceStandards: string[]
  
  // Licensing requirements
  requiredLicenses: string[]
  supervisoryAuthority: string[]
  
  // Tax implications
  taxTreatment: string
  withholdingTax: number
  
  // Restrictions
  investorRestrictions: string[]
  transferRestrictions: string[]
}

export interface ComplianceConfiguration {
  // Required claims
  requiredClaims: string[]
  claimTopics: number[]
  
  // Compliance modules
  modules: {
    CountryAllowModule: {
      enabled: boolean
      allowedCountries: number[]
    }
    CountryRestrictModule: {
      enabled: boolean
      restrictedCountries: number[]
    }
    MaxBalanceModule: {
      enabled: boolean
      maxBalance: string
    }
    TransferRestrictModule: {
      enabled: boolean
      restrictions: string[]
    }
    TimeRestrictModule: {
      enabled: boolean
      restrictions: TimeRestriction[]
    }
  }
  
  // KYC/AML requirements
  kycRequired: boolean
  amlRequired: boolean
  accreditationRequired: boolean
  
  // Compliance checks
  automaticCompliance: boolean
  manualReviewRequired: boolean
  
  // Trusted issuers
  trustedIssuers: string[]
  claimIssuers: string[]
}

export interface TimeRestriction {
  restrictionType: 'hold_period' | 'trading_hours' | 'lock_period'
  startTime?: string
  endTime?: string
  duration?: number // in seconds
  description: string
}

export interface DocumentRequirement {
  id: string
  documentType: string
  documentName: string
  isRequired: boolean
  description: string
  category: 'general' | 'asset_specific' | 'compliance' | 'legal'
  
  // Upload info
  uploadStatus: 'pending' | 'uploaded' | 'verified' | 'rejected'
  ipfsHash?: string
  ipfsUrl?: string
  fileName?: string
  fileSize?: number
  uploadedAt?: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
  
  // Review process
  reviewStatus: 'pending' | 'in_review' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  reviewComments?: string
}

export interface SPVInformation {
  // SPV details
  spvRequired: boolean
  spvStatus: 'not_required' | 'pending' | 'in_formation' | 'formed' | 'dissolved'
  
  // SPV entity details
  spvName?: string
  spvEntityType?: string // LLC, Corporation, etc.
  spvJurisdiction?: string
  spvRegistrationNumber?: string
  spvAddress?: string
  
  // SPV formation
  formationDate?: string
  formationCost?: string
  legalCounsel?: string
  
  // SPV management
  spvManager?: string
  spvDirectors?: string[]
  spvShareholders?: string[]
  
  // SPV documentation
  spvDocuments: DocumentRequirement[]
}

export interface TokenStatus {
  // Overall status
  currentStatus: 'draft' | 'pending_documents' | 'under_review' | 'pending_spv' | 'pending_approval' | 'approved' | 'listed' | 'paused' | 'delisted' | 'dissolved'
  
  // Status history
  statusHistory: {
    status: string
    timestamp: string
    updatedBy: string
    reason?: string
    comments?: string
  }[]
  
  // Approval workflow
  approvalWorkflow: {
    stage: string
    status: 'pending' | 'in_progress' | 'completed' | 'rejected'
    assignedTo?: string
    dueDate?: string
    completedAt?: string
    comments?: string
  }[]
  
  // Milestones
  milestones: {
    name: string
    description: string
    targetDate: string
    completedDate?: string
    status: 'pending' | 'completed' | 'overdue'
  }[]
}

export interface TokenOwnerInfo {
  // Owner details
  ownerAddress: string
  ownerName?: string
  ownerType: 'individual' | 'company' | 'institution'
  
  // Company details (if applicable)
  companyName?: string
  companyRegistrationNumber?: string
  companyJurisdiction?: string
  
  // Contact information
  email?: string
  phone?: string
  address?: string
  
  // Identity verification
  identityVerified: boolean
  kycStatus: 'pending' | 'verified' | 'rejected'
  kycProvider?: string
  kycVerifiedAt?: string
  
  // Permissions
  permissions: {
    canMint: boolean
    canBurn: boolean
    canPause: boolean
    canFreeze: boolean
    canBlacklist: boolean
    canUpdateCompliance: boolean
  }
}

export interface TokenAgentInfo {
  // Identity Registry Agent
  identityRegistryAgent: string
  
  // Token Agent
  tokenAgent: string
  
  // Compliance Agent
  complianceAgent?: string
  
  // Other agents
  transferAgent?: string
  registrarAgent?: string
  
  // Agent permissions
  agentPermissions: Record<string, string[]>
}

export interface AccountManagement {
  // Account lists
  blacklistedAccounts: {
    address: string
    blacklistedAt: string
    blacklistedBy: string
    reason: string
    canRevert: boolean
  }[]
  
  whitelistedAccounts: {
    address: string
    whitelistedAt: string
    whitelistedBy: string
    privileges: string[]
  }[]
  
  frozenAccounts: {
    address: string
    frozenAt: string
    frozenBy: string
    reason: string
    frozenAmount?: string
    canUnfreeze: boolean
  }[]
  
  // Account statistics
  totalAccounts: number
  activeAccounts: number
  verifiedAccounts: number
  suspendedAccounts: number
}

export interface InvestorInformation {
  id: string
  walletAddress: string
  onChainIdentity?: string
  
  // Personal information
  fullName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  country: string
  
  // Investor classification
  investorType: 'retail' | 'accredited' | 'institutional' | 'qualified_institutional'
  accreditationStatus: boolean
  accreditationDate?: string
  accreditationExpiry?: string
  
  // Compliance status
  kycStatus: 'pending' | 'verified' | 'rejected' | 'expired'
  amlStatus: 'pending' | 'verified' | 'rejected' | 'expired'
  complianceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  
  // Investment details
  totalInvestment: string
  tokenBalance: string
  averagePurchasePrice: string
  realizedPnL: string
  unrealizedPnL: string
  
  // Activity
  firstInvestment?: string
  lastActivity?: string
  transactionCount: number
  
  // Status
  status: 'active' | 'suspended' | 'blacklisted' | 'frozen'
  
  // Documents
  documents: DocumentRequirement[]
  
  // Claims
  claims: {
    claimType: string
    claimValue: string
    claimIssuer: string
    claimDate: string
    claimExpiry?: string
    claimStatus: 'valid' | 'expired' | 'revoked'
  }[]
}

export interface TokenTransaction {
  id: string
  txHash: string
  blockNumber: number
  timestamp: string
  
  // Transaction details
  type: 'mint' | 'burn' | 'transfer' | 'freeze' | 'unfreeze' | 'pause' | 'unpause' | 'blacklist' | 'whitelist'
  from?: string
  to?: string
  amount?: string
  
  // Context
  initiatedBy: string
  reason?: string
  complianceCheck: boolean
  
  // Status
  status: 'pending' | 'confirmed' | 'failed' | 'reverted'
  gasUsed?: string
  gasPrice?: string
  
  // Compliance
  complianceValidated: boolean
  complianceRules: string[]
  
  // Related data
  investmentOrderId?: string
  approvalId?: string
}

export interface TokenAnalytics {
  // Performance metrics
  totalRaised: string
  totalInvestors: number
  averageInvestment: string
  
  // Trading metrics
  totalVolume: string
  totalTransactions: number
  averageTransactionSize: string
  
  // Time series data
  priceHistory: {
    date: string
    price: string
    volume: string
  }[]
  
  // Investor analytics
  investorDemographics: {
    country: string
    count: number
    percentage: number
  }[]
  
  investorTypes: {
    type: string
    count: number
    totalInvestment: string
  }[]
  
  // Compliance metrics
  complianceScore: number
  kycCompletionRate: number
  amlPassRate: number
  
  // Risk metrics
  riskScore: number
  liquidityScore: number
  volatilityScore: number
}

// Main Security Token Model
export interface SecurityToken {
  // Unique identifier
  id: string
  
  // Basic information
  basicInfo: TokenBasicInfo
  
  // Contract addresses
  contractAddresses: TokenContractAddresses
  
  // Asset information
  assetInfo: AssetInformation
  
  // Jurisdiction and compliance
  jurisdictionInfo: JurisdictionRequirements
  complianceConfig: ComplianceConfiguration
  
  // Documentation
  documentRequirements: DocumentRequirement[]
  
  // SPV information
  spvInfo: SPVInformation
  
  // Status and workflow
  tokenStatus: TokenStatus
  
  // Parties involved
  ownerInfo: TokenOwnerInfo
  agentInfo: TokenAgentInfo
  
  // Account management
  accountManagement: AccountManagement
  
  // Investors
  investors: InvestorInformation[]
  
  // Transactions
  transactions: TokenTransaction[]
  
  // Analytics
  analytics: TokenAnalytics
  
  // Metadata
  metadata: {
    version: string
    lastUpdated: string
    updatedBy: string
    tags: string[]
    notes?: string
  }
}

// Helper types for creation process
export interface CreateTokenRequest {
  basicInfo: Partial<TokenBasicInfo>
  assetInfo: Partial<AssetInformation>
  complianceConfig: Partial<ComplianceConfiguration>
  ownerInfo: Partial<TokenOwnerInfo>
  agentInfo: Partial<TokenAgentInfo>
  documents: File[]
  metadata?: Record<string, any>
}

export interface TokenCreationResponse {
  tokenId: string
  contractAddresses: TokenContractAddresses
  status: string
  estimatedCompletionTime: string
  nextSteps: string[]
  requiredActions: string[]
}

// Status enums
export enum TokenStatusEnum {
  DRAFT = 'draft',
  PENDING_DOCUMENTS = 'pending_documents',
  UNDER_REVIEW = 'under_review',
  PENDING_SPV = 'pending_spv',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  LISTED = 'listed',
  PAUSED = 'paused',
  DELISTED = 'delisted',
  DISSOLVED = 'dissolved'
}

export enum DocumentStatusEnum {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum InvestorStatusEnum {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
  FROZEN = 'frozen'
}

// Asset categories (moved from component to model)
export const ASSET_CATEGORIES = {
  "real-estate": {
    name: "Real Estate",
    assets: [
      { id: "residential", name: "Residential Property", description: "Houses, apartments, condos" },
      { id: "commercial", name: "Commercial Real Estate", description: "Office spaces, retail, industrial" },
      { id: "reits", name: "Real Estate Investment Trusts", description: "Diversified property portfolios" },
      { id: "vacation-rentals", name: "Vacation Rentals", description: "Short-term rental properties" },
      { id: "co-living", name: "Co-Living Spaces", description: "Shared housing investments" },
      { id: "mixed-use", name: "Mixed-Use Developments", description: "Combined residential/commercial" },
      { id: "affordable-housing", name: "Affordable Housing", description: "Social housing projects" },
      { id: "land", name: "Land Parcels", description: "Undeveloped land investments" },
    ],
  },
  financial: {
    name: "Financial Instruments",
    assets: [
      { id: "corporate-bonds", name: "Corporate Bonds", description: "Company debt securities" },
      { id: "municipal-bonds", name: "Municipal Bonds", description: "Government infrastructure funding" },
      { id: "government-securities", name: "Government Securities", description: "Treasury bills, sovereign debt" },
      { id: "asset-backed-securities", name: "Asset-Backed Securities", description: "Mortgage-backed securities" },
      { id: "etfs", name: "Exchange-Traded Funds", description: "Diversified investment funds" },
      { id: "debt-instruments", name: "Debt Instruments", description: "Loans and credit products" },
      { id: "green-bonds", name: "Green Bonds", description: "Environmental project funding" },
      { id: "stock-options", name: "Stock Options", description: "Equity compensation programs" },
    ],
  },
  alternative: {
    name: "Alternative Assets",
    assets: [
      { id: "art", name: "Art & Collectibles", description: "Fine art, rare books, manuscripts" },
      { id: "wine-spirits", name: "Wine & Spirits", description: "Rare wines and premium spirits" },
      { id: "precious-metals", name: "Precious Metals", description: "Gold, silver, platinum reserves" },
      { id: "gemstones", name: "Precious Gemstones", description: "Diamonds, emeralds, rare stones" },
      { id: "carbon-credits", name: "Carbon Credits", description: "Environmental offset trading" },
      { id: "intellectual-property", name: "Intellectual Property", description: "Patents, copyrights, trademarks" },
      { id: "music-royalties", name: "Music Royalties", description: "Artist revenue streams" },
      { id: "movie-rights", name: "Movie Production Rights", description: "Film funding and revenue" },
    ],
  },
  infrastructure: {
    name: "Infrastructure & Energy",
    assets: [
      { id: "renewable-energy", name: "Renewable Energy", description: "Solar, wind, hydroelectric projects" },
      { id: "data-centers", name: "Data Centers", description: "Cloud and AI infrastructure" },
      { id: "transportation", name: "Transportation Systems", description: "Railways, airports, ports" },
      { id: "utilities", name: "Utilities", description: "Water, gas, electricity infrastructure" },
      { id: "telecommunications", name: "Telecommunications", description: "5G networks, fiber optics" },
      { id: "smart-cities", name: "Smart City Projects", description: "IoT-enabled urban development" },
      { id: "energy-storage", name: "Energy Storage", description: "Battery systems, grid storage" },
      { id: "oil-gas", name: "Oil & Gas Assets", description: "Wells, reserves, refineries" },
    ],
  },
  agriculture: {
    name: "Agriculture & Commodities",
    assets: [
      { id: "agricultural-land", name: "Agricultural Land", description: "Farmland and crop production" },
      { id: "livestock", name: "Livestock", description: "Cattle, dairy, poultry operations" },
      { id: "agritech", name: "AgriTech Projects", description: "Vertical farms, precision agriculture" },
      { id: "commodities-storage", name: "Commodities Storage", description: "Grain silos, cold storage" },
      { id: "fisheries", name: "Fisheries", description: "Fishing rights and aquaculture" },
      { id: "water-rights", name: "Water Rights", description: "Water resource allocation" },
      { id: "rare-earth", name: "Rare Earth Elements", description: "Critical minerals and metals" },
    ],
  },
  business: {
    name: "Business & Services",
    assets: [
      { id: "small-business", name: "Small Business Loans", description: "Local business funding" },
      { id: "franchise", name: "Franchise Businesses", description: "Restaurant and retail franchises" },
      { id: "shared-workspace", name: "Shared Workspaces", description: "Coworking and office spaces" },
      { id: "hotels", name: "Hospitality", description: "Hotels, resorts, entertainment venues" },
      { id: "healthcare-facilities", name: "Healthcare Facilities", description: "Clinics, medical centers" },
      { id: "educational-institutions", name: "Educational Institutions", description: "Schools, training centers" },
      { id: "logistics", name: "Logistics & Shipping", description: "Warehouses, shipping containers" },
      { id: "waste-management", name: "Waste Management", description: "Recycling, waste-to-energy" },
    ],
  },
}

// Jurisdiction requirements (moved from component to model)
export const JURISDICTION_REQUIREMENTS = {
  US: {
    name: "United States",
    generalDocs: ["Business License", "Tax ID (EIN)", "Articles of Incorporation", "Operating Agreement"],
    assetSpecific: {
      residential: [
        "Property Deed",
        "Property Tax Records",
        "Insurance Policy",
        "Property Appraisal",
        "Zoning Certificate",
      ],
      commercial: [
        "Commercial Property Deed",
        "Lease Agreements",
        "Environmental Assessment",
        "Building Permits",
        "Fire Safety Certificate",
      ],
      "corporate-bonds": [
        "SEC Registration",
        "Financial Statements (10-K)",
        "Credit Rating",
        "Prospectus",
        "Board Resolutions",
      ],
      art: ["Certificate of Authenticity", "Provenance Documentation", "Insurance Appraisal", "Conservation Report"],
      "renewable-energy": [
        "Environmental Impact Assessment",
        "Grid Connection Agreement",
        "Power Purchase Agreement",
        "Construction Permits",
      ],
    },
  },
  UK: {
    name: "United Kingdom",
    generalDocs: [
      "Companies House Registration",
      "VAT Registration",
      "Memorandum of Association",
      "Articles of Association",
    ],
    assetSpecific: {
      residential: [
        "Land Registry Title",
        "Energy Performance Certificate",
        "Building Regulations Approval",
        "Property Survey",
      ],
      commercial: [
        "Commercial Property Title",
        "Business Rates Assessment",
        "Planning Permission",
        "Health & Safety Certificate",
      ],
      "corporate-bonds": [
        "FCA Authorization",
        "Annual Accounts",
        "Prospectus",
        "Credit Assessment",
        "Listing Particulars",
      ],
      art: [
        "Export License (if applicable)",
        "Insurance Valuation",
        "Authenticity Certificate",
        "Conservation Assessment",
      ],
      "renewable-energy": [
        "Planning Permission",
        "Grid Connection Offer",
        "Environmental Permit",
        "Construction Certificate",
      ],
    },
  },
  EU: {
    name: "European Union",
    generalDocs: ["EU Business Registration", "VAT Number", "Company Statute", "Beneficial Ownership Register"],
    assetSpecific: {
      residential: ["Property Registration", "Energy Certificate", "Building Permit", "Municipal Approval"],
      commercial: ["Commercial Registration", "Zoning Permit", "Fire Safety Certificate", "Environmental Compliance"],
      "corporate-bonds": ["ESMA Registration", "MiFID II Compliance", "Prospectus Regulation", "Credit Rating"],
      art: ["Cultural Property Certificate", "Export Permit", "Insurance Documentation", "Authenticity Proof"],
      "renewable-energy": [
        "Environmental Impact Study",
        "Grid Code Compliance",
        "Renewable Energy Certificate",
        "Construction License",
      ],
    },
  },
  UAE: {
    name: "United Arab Emirates",
    generalDocs: ["Trade License", "Chamber of Commerce Certificate", "Memorandum of Association", "Emirates ID"],
    assetSpecific: {
      residential: ["Title Deed", "DEWA Connection", "Municipality Approval", "Property Valuation"],
      commercial: ["Commercial License", "NOC from Authorities", "Fire & Safety Certificate", "Municipality Permit"],
      "corporate-bonds": [
        "SCA Registration",
        "Sharia Compliance (if applicable)",
        "Financial Statements",
        "Credit Rating",
      ],
      art: ["Cultural Heritage Permit", "Import/Export License", "Insurance Certificate", "Authenticity Document"],
      "renewable-energy": [
        "DEWA Approval",
        "Environmental Clearance",
        "Construction Permit",
        "Grid Connection Agreement",
      ],
    },
  },
} 