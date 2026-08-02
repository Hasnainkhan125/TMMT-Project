


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

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
  status: 'active' | 'paused' | 'frozen'
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
  investorType: 'individual' | 'institutional'
  accreditedStatus: boolean
  kycStatus: 'pending' | 'verified' | 'rejected'
  amlStatus: 'pending' | 'verified' | 'rejected'
  totalInvested: number
  tokenBalance: number
  firstInvestment: string
  lastActivity: string
  riskScore: number
  complianceScore: number
  status: 'active' | 'suspended' | 'blacklisted'
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
  type: 'investment' | 'transfer' | 'mint' | 'burn' | 'freeze' | 'unfreeze'
  tokenSymbol: string
  amount: string
  value: string
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected'
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
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed'
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
    level: 'low' | 'medium' | 'high'
    factors: string[]
  }
}

interface IssuerState {
  tokens: TokenData[]
  selectedToken: string
  investors: InvestorProfile[]
  transactions: Transaction[]
  investmentOrders: InvestmentOrder[]
  analytics: {
    totalRaised: number
    activeInvestors: number
    pendingOrders: number
    complianceRate: number
    monthlyGrowth: number
  }
  loading: boolean
  error: string | null
}

const initialState: IssuerState = {
  tokens: [],
  selectedToken: '',
  investors: [],
  transactions: [],
  investmentOrders: [],
  analytics: {
    totalRaised: 0,
    activeInvestors: 0,
    pendingOrders: 0,
    complianceRate: 0,
    monthlyGrowth: 0
  },
  loading: false,
  error: null
}

export const fetchTokens = createAsyncThunk(
  'issuer/fetchTokens',
  async (issuerAddress: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock token data
    return [
      {
        id: '1',
        symbol: 'GBB',
        name: 'Green Brew Bond',
        tokenAddress: '0x97C1E24C5A5D5F5b5e5D5c5B5a5F5E5d5C5b5A5f',
        totalSupply: '1000000',
        circulatingSupply: '750000',
        price: 10.43,
        marketCap: 7822500,
        holders: 245,
        totalInvestments: 156,
        status: 'active' as const,
        compliance: {
          kycRequired: true,
          amlRequired: true,
          accreditedOnly: false,
          jurisdictionRestrictions: ['US', 'EU']
        },
        createdAt: '2024-01-15',
        lastActivity: '2024-01-20',
        trustedIssuers: [issuerAddress],
        emergencyPaused: false
      }
    ]
  }
)

export const fetchInvestors = createAsyncThunk(
  'issuer/fetchInvestors',
  async (tokenId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    
    return [
      {
        id: '1',
        walletAddress: '0xD2E33B6ACDE32e80E6553270C349C9BC8E45aCf0',
        onChainId: '0xB7A730d79eCB3A171a66c4Aebdf0f84DC62882A4',
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        country: 'US',
        investorType: 'individual' as const,
        accreditedStatus: true,
        kycStatus: 'verified' as const,
        amlStatus: 'verified' as const,
        totalInvested: 25000,
        tokenBalance: 2397.5,
        firstInvestment: '2024-01-10',
        lastActivity: '2024-01-18',
        riskScore: 25,
        complianceScore: 95,
        status: 'active' as const,
        documents: {
          identity: 'ipfs://QmIdentity123',
          address: 'ipfs://QmAddress123',
          income: 'ipfs://QmIncome123',
          accreditation: 'ipfs://QmAccred123'
        },
        transactions: []
      }
    ]
  }
)

export const approveInvestmentOrder = createAsyncThunk(
  'issuer/approveInvestmentOrder',
  async ({ orderId, tokenSymbol }: { orderId: string; tokenSymbol: string }) => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { orderId, status: 'approved' as const, reviewedAt: new Date().toISOString() }
  }
)

export const mintTokens = createAsyncThunk(
  'issuer/mintTokens',
  async ({ tokenSymbol, recipient, amount }: { tokenSymbol: string; recipient: string; amount: string }) => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const transaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'mint',
      tokenSymbol,
      amount,
      value: (parseFloat(amount) * 10.43).toFixed(2),
      currency: 'USD',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      toAddress: recipient
    }
    
    return transaction
  }
)

const issuerSlice = createSlice({
  name: 'issuer',
  initialState,
  reducers: {
    setSelectedToken: (state, action: PayloadAction<string>) => {
      state.selectedToken = action.payload
    },
    updateInvestorStatus: (state, action: PayloadAction<{ investorId: string; status: InvestorProfile['status'] }>) => {
      const investor = state.investors.find(inv => inv.id === action.payload.investorId)
      if (investor) {
        investor.status = action.payload.status
      }
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTokenEmergencyPause: (state, action: PayloadAction<{ tokenId: string; paused: boolean }>) => {
      const token = state.tokens.find(t => t.id === action.payload.tokenId)
      if (token) {
        token.emergencyPaused = action.payload.paused
      }
    },
    addTrustedIssuer: (state, action: PayloadAction<{ tokenId: string; issuerAddress: string }>) => {
      const token = state.tokens.find(t => t.id === action.payload.tokenId)
      if (token && !token.trustedIssuers.includes(action.payload.issuerAddress)) {
        token.trustedIssuers.push(action.payload.issuerAddress)
      }
    },
    removeTrustedIssuer: (state, action: PayloadAction<{ tokenId: string; issuerAddress: string }>) => {
      const token = state.tokens.find(t => t.id === action.payload.tokenId)
      if (token) {
        token.trustedIssuers = token.trustedIssuers.filter(addr => addr !== action.payload.issuerAddress)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokens.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTokens.fulfilled, (state, action) => {
        state.loading = false
        state.tokens = action.payload
        if (action.payload.length > 0) {
          state.selectedToken = action.payload[0].symbol
        }
      })
      .addCase(fetchInvestors.fulfilled, (state, action) => {
        state.investors = action.payload
      })
      .addCase(approveInvestmentOrder.fulfilled, (state, action) => {
        const order = state.investmentOrders.find(o => o.id === action.payload.orderId)
        if (order) {
          order.status = action.payload.status
          order.reviewedAt = action.payload.reviewedAt
        }
      })
      .addCase(mintTokens.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload)
      })
  }
})

export const { 
  setSelectedToken, 
  updateInvestorStatus, 
  addTransaction,
  updateTokenEmergencyPause,
  addTrustedIssuer,
  removeTrustedIssuer
} = issuerSlice.actions
export default issuerSlice.reducer