import { 
  SecurityToken, 
  CreateTokenRequest, 
  TokenCreationResponse,
  TokenStatusEnum,
  DocumentRequirement,
  InvestorInformation,
  TokenTransaction,
  DocumentStatusEnum,
  ASSET_CATEGORIES,
  JURISDICTION_REQUIREMENTS
} from '../types/token-models'

export class TokenService {
  private apiBaseUrl: string

  constructor(apiBaseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1') {
    this.apiBaseUrl = apiBaseUrl
  }

  // Token Creation - Updated to match backend API
  async createToken(tokenData: any, claimData: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/createToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenData,
          claimData
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Token creation error:', error)
      throw error
    }
  }

  // Check prefix availability
  async checkPrefix(prefix: string, name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/checkPrefix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prefix, name }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.isValid
    } catch (error) {
      console.error('Check prefix error:', error)
      throw error
    }
  }

  // Get token by address
  async getTokenByAddress(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/getToken?address=${address}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get token by address error:', error)
      throw error
    }
  }

  // Get all tokens with filtering and pagination (using correct endpoint)
  async getAllTokens(params: {
    page?: number
    limit?: number
    status?: string
    ownerAddress?: string
    search?: string
    sortBy?: string
    sortOrder?: string
  } = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${this.apiBaseUrl}/token/getAllTokens?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get all tokens error:', error)
      throw error
    }
  }

  // Get token by ID
  async getTokenById(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/getTokenById/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get token by ID error:', error)
      throw error
    }
  }

  // Get tokens by owner address
  async getTokensByOwner(ownerAddress: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/getTokensByOwner/${ownerAddress}?page=${page}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get tokens by owner error:', error)
      throw error
    }
  }

  // Update token status
  async updateTokenStatus(id: string, status: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/updateTokenStatus/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update token status error:', error)
      throw error
    }
  }

  // Update token metadata
  async updateTokenMetadata(id: string, metadata: any): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/updateTokenMetadata/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update token metadata error:', error)
      throw error
    }
  }

  // Delete token (soft delete)
  async deleteToken(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/deleteToken/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Delete token error:', error)
      throw error
    }
  }

  // Get token analytics
  async getTokenAnalytics(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/getTokenAnalytics/${id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get token analytics error:', error)
      throw error
    }
  }

  // Add compliance module
  async addCompliance(tokenAddress: string, complianceModules: string[], complianceSettings: any[]): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/addCompliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenAddress,
          complianceModules,
          complianceSettings
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Add compliance error:', error)
      throw error
    }
  }

  // Document Management (placeholder for future implementation)
  async uploadDocument(tokenId: string, documentType: string, file: File): Promise<DocumentRequirement> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Upload document error:', error)
      throw error
    }
  }

  async getDocuments(tokenId: string): Promise<DocumentRequirement[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/documents`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get documents error:', error)
      throw error
    }
  }

  async updateDocumentStatus(
    tokenId: string, 
    documentId: string, 
    status: DocumentStatusEnum,
    reviewComments?: string
  ): Promise<DocumentRequirement> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reviewComments }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update document status error:', error)
      throw error
    }
  }

  // Investor Management (placeholder for future implementation)
  async addInvestor(tokenId: string, investor: Partial<InvestorInformation>): Promise<InvestorInformation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/investors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(investor),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Add investor error:', error)
      throw error
    }
  }

  // Get investors using correct investor API endpoint
  async getInvestors(tokenId?: string): Promise<InvestorInformation[]> {
    try {
      // Use the investor API endpoint instead of token-specific endpoint
      const response = await fetch(`${this.apiBaseUrl}/investors`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Return the investors data properly
      if (data.success && data.data) {
        return data.data
      }
      
      return data
    } catch (error) {
      console.error('Get investors error:', error)
      throw error
    }
  }

  async updateInvestorStatus(
    tokenId: string, 
    investorId: string, 
    status: string,
    reason?: string
  ): Promise<InvestorInformation> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/investors/${investorId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Update investor status error:', error)
      throw error
    }
  }

  // Transaction Management (placeholder for future implementation)
  async addTransaction(tokenId: string, transaction: Partial<TokenTransaction>): Promise<TokenTransaction> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Add transaction error:', error)
      throw error
    }
  }

  // Get transactions using correct investments API endpoint
  async getTransactions(tokenId: string, limit?: number, offset?: number): Promise<TokenTransaction[]> {
    try {
      // Use SPV orders endpoint to get transactions for a token
      const response = await fetch(`${this.apiBaseUrl}/investments/spv/${tokenId}/orders`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform investment orders to transaction format
      if (data.success && data.data?.orders) {
        return data.data.orders.map((order: any) => ({
          id: order._id || order.id,
          type: 'investment',
          tokenSymbol: order.token_symbol || 'Unknown',
          amount: order.expected_token_amount || '0',
          value: order.investment_amount?.toString() || '0',
          currency: order.investment_currency || 'USD',
          status: order.status === 'allocated' ? 'completed' : order.status === 'pending_payment' ? 'pending' : order.status,
          date: order.created_at || new Date().toISOString(),
          txHash: order.payment_tx_hash,
          fromAddress: order.investor_wallet,
          toAddress: order.delivery_address,
          investorId: order.investor_wallet,
          notes: order.notes || ''
        }))
      }
      
      return []
    } catch (error) {
      console.error('Get transactions error:', error)
      throw error
    }
  }

  // Account Management (placeholder for future implementation)
  async blacklistAccount(tokenId: string, address: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/accounts/blacklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Blacklist account error:', error)
      throw error
    }
  }

  async whitelistAccount(tokenId: string, address: string, privileges: string[]): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/accounts/whitelist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, privileges }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Whitelist account error:', error)
      throw error
    }
  }

  async freezeAccount(tokenId: string, address: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/accounts/freeze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Freeze account error:', error)
      throw error
    }
  }

  // Analytics and Reporting
  async generateComplianceReport(tokenId: string, reportType: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/reports/${reportType}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      return blob
    } catch (error) {
      console.error('Generate compliance report error:', error)
      throw error
    }
  }

  // Utility Methods
  getAssetCategories() {
    return ASSET_CATEGORIES
  }

  getJurisdictionRequirements() {
    return JURISDICTION_REQUIREMENTS
  }

  getRequiredDocuments(jurisdiction: string, assetType: string): string[] {
    const jurisdictionInfo = JURISDICTION_REQUIREMENTS[jurisdiction as keyof typeof JURISDICTION_REQUIREMENTS]
    if (!jurisdictionInfo) return []

    const generalDocs = jurisdictionInfo.generalDocs || []
    const assetDocs = jurisdictionInfo.assetSpecific[assetType as keyof typeof jurisdictionInfo.assetSpecific] || []
    
    return [...generalDocs, ...assetDocs]
  }

  // Marketplace Integration (placeholder for future implementation)
  async listTokenInMarketplace(tokenId: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/marketplace/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('List token in marketplace error:', error)
      throw error
    }
  }

  async delistTokenFromMarketplace(tokenId: string, reason: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/${tokenId}/marketplace/delist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('Delist token from marketplace error:', error)
      throw error
    }
  }

  async getTokenContract(tokenId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/token/getTokenById/${tokenId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Get token contract error:', error)
      throw error
    }
  }

  // Helper method to transform frontend form data to backend API format
  transformFormDataToApiFormat(formData: any) {
    return {
      tokenData: {
        // Required fields for backend
        ownerAddress: formData.ownerInfo.address,
        irAgentAddress: formData.agentInfo.irAgentAddress,
        tokenAgentAddress: formData.agentInfo.tokenAgentAddress,
        name: formData.basicInfo.name,
        symbol: formData.basicInfo.symbol,
        decimals: formData.basicInfo.decimals || 18,
        prefix: formData.basicInfo.prefix,
        
        // Compliance modules (required by backend)
        complianceModules: formData.complianceConfig.complianceModules,
        
        // Basic Token Information
        totalSupply: formData.basicInfo.totalSupply,
        initialPrice: formData.basicInfo.initialPrice,
        description: formData.basicInfo.description,
        
        // Token Economics
        currency: formData.assetInfo.currency || 'USD',
        minInvestment: formData.basicInfo.minInvestment || '1000',
        maxInvestment: formData.basicInfo.maxInvestment || '1000000',
        
        // Asset Information
        assetType: formData.assetInfo.type,
        assetCategory: formData.assetInfo.category,
        assetDescription: formData.assetInfo.description,
        assetValue: formData.assetInfo.estimatedValue,
        assetCurrency: formData.assetInfo.currency || 'USD',
        estimatedValue: formData.assetInfo.estimatedValue,
        jurisdiction: formData.assetInfo.jurisdiction,
        
        // Owner Information
        ownerName: formData.ownerInfo.name,
        ownerEmail: formData.ownerInfo.email,
        ownerJurisdiction: formData.ownerInfo.jurisdiction,
        
        // Compliance Configuration
        kycRequired: formData.complianceConfig?.kycRequired,
        amlRequired: formData.complianceConfig?.amlRequired,
        accreditedOnly: formData.complianceConfig?.accreditedOnly,
        requiredClaims: formData.complianceConfig?.requiredClaims,
        
        // Agent Information
        trustedIssuers: formData.agentInfo?.trustedIssuers,
        
        // Frontend Display & Metadata
        logoUrl: formData.metadata?.logoUrl,
        website: formData.metadata?.website,
        whitepaper: formData.metadata?.whitepaper,
        socialLinks: formData.metadata?.socialLinks,
        
        // Documents (for future implementation)
        documents: formData.documents || [],
        uploadedDocuments: formData.uploadedDocuments || {},
        requiredDocuments: formData.requiredDocuments || []
      },
      claimData: {
        claimTopics: formData.claimData.claimTopics,
        claimIissuers: formData.claimData.claimIssuer, // Backend expects double 'i'
        issuerClaims: formData.claimData.issuerClaims
      }
    }
  }
}

// Export singleton instance
export const tokenService = new TokenService() 