const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1'

export interface InvestorDetails {
  id: string
  wallet_address: string
  identity_address?: string
  email?: string
  phone?: string
  full_name?: string
  jurisdiction: string
  status: 'active' | 'suspended' | 'rejected' | 'approved'
  analytics?: {
    total_orders: number
    total_invested_usd: number
    completed_orders: number
    pending_orders: number
    success_rate: string
    avg_investment: string
  }
  recent_orders: any[]
  kyc_status?: string
  aml_risk_rating?: string
  sanctions_screening?: any
  pending_document_requests?: any[]
  pending_proof_requests?: any[]
}

export interface DocumentRequest {
  documents: string[]
  message: string
  requested_by: string
}

export interface ProofRequest {
  transaction_hash: string
  requested_by: string
  message: string
}

export interface InvestorAction {
  investor_id: string
  action_by: string
  reason?: string
  notes?: string
}

// Get all investors
export const getAllInvestors = async (params?: {
  page?: number
  size?: number
  status?: string
  jurisdiction?: string
  search?: string
}) => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.size) queryParams.append('size', params.size.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction)
  if (params?.search) queryParams.append('search', params.search)

  const response = await fetch(`${API_BASE_URL}/investors?${queryParams}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch investors: ${response.statusText}`)
  }
  
  return response.json()
}

// Get investor by wallet address
export const getInvestorByWallet = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/investors/wallet/${walletAddress}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch investor: ${response.statusText}`)
  }
  
  return response.json()
}

// Get investor full details with claims and compliance
export const getInvestorDetails = async (investorId: string) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/details`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch investor details: ${response.statusText}`)
  }
  
  return response.json()
}

// Get investor compliance status
export const getInvestorCompliance = async (investorId: string) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/compliance`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch compliance status: ${response.statusText}`)
  }
  
  return response.json()
}

// Request documents from investor
export const requestDocuments = async (investorId: string, request: DocumentRequest) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/request-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to request documents: ${response.statusText}`)
  }
  
  return response.json()
}

// Request transaction proof
export const requestTransactionProof = async (investorId: string, request: ProofRequest) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/request-proof`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to request proof: ${response.statusText}`)
  }
  
  return response.json()
}

// Approve investor
export const approveInvestor = async (investorId: string, action: InvestorAction) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      approved_by: action.action_by,
      notes: action.notes,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to approve investor: ${response.statusText}`)
  }
  
  return response.json()
}

// Reject investor
export const rejectInvestor = async (investorId: string, action: InvestorAction) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rejected_by: action.action_by,
      reason: action.reason,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to reject investor: ${response.statusText}`)
  }
  
  return response.json()
}

// Suspend investor
export const suspendInvestor = async (investorId: string, action: InvestorAction) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/suspend`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      suspended_by: action.action_by,
      reason: action.reason,
    }),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to suspend investor: ${response.statusText}`)
  }
  
  return response.json()
}

// Update investor classification
export const updateInvestorClassification = async (investorId: string, classification: any) => {
  const response = await fetch(`${API_BASE_URL}/investors/${investorId}/classification`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classification),
  })
  
  if (!response.ok) {
    throw new Error(`Failed to update classification: ${response.statusText}`)
  }
  
  return response.json()
}

// Get KYC details
export const getKYCDetails = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/kyc/status/${walletAddress}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KYC details: ${response.statusText}`)
  }
  
  return response.json()
}

// Get OnChain ID details (correct endpoint)
export const getOnChainIdDetails = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/kyc/identity/details/${walletAddress}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch OnChain ID details: ${response.statusText}`)
  }
  
  return response.json()
}

// Get KYC status (correct endpoint)  
export const getKYCStatus = async (walletAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/kyc/status/${walletAddress}`)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch KYC status: ${response.statusText}`)
  }
  
  return response.json()
}

// Check token eligibility
export const checkTokenEligibility = async (walletAddress: string, tokenAddress: string) => {
  const response = await fetch(`${API_BASE_URL}/kyc/eligibility/${walletAddress}/${tokenAddress}`)
  
  if (!response.ok) {
    throw new Error(`Failed to check eligibility: ${response.statusText}`)
  }
  
  return response.json()
} 