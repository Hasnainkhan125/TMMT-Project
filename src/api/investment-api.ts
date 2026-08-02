// // Types for the investment API
// interface ComplianceAttestations {
//   amlVerified: boolean
//   jurisdictionCompliant: boolean
//   kycVerified: boolean
//   termsAccepted: boolean
// }

// interface InvestorDetails {
//   accreditedInvestorStatus: boolean
//   countryOfResidence: string
//   email: string
//   fullName: string
//   identityDocument: string
//   walletAddress: string
// }

// interface Network {
//   chainId: string
//   networkName: string
// }

// interface TokenDetails {
//   decimals: number
//   network: Network
//   tokenName: string
// }

// interface InvestmentDetails {
//   investmentAmount: string
//   paymentMethod: string
//   requestedTokenAmount: string
//   tokenAddress: string
//   tokenSymbol: string
// }

// interface AdditionalInfo {
//   notes?: string
//   referenceId?: string
// }

// interface InvestmentData {
//   purchaseByToken: string
//   AdditionalInfo?: AdditionalInfo
//   purchaseByNetworkId: string
//   purchaseByTokenAmt: string
//   investmentStatus: string
//   usdAmt: string
//   ComplianceAttestations: ComplianceAttestations
//   InvestorDetails: InvestorDetails
//   toAddress: string
//   investingToken: string
//   TokenDetails: TokenDetails
//   InvestmentDetails: InvestmentDetails
//   type: string
//   fromAddress: string
//   txHash: string
// }

// interface InvestmentPayload {
//   data: InvestmentData[]
// }

// interface InvestmentResponse {
//   success: boolean
//   data?: any
//   error?: string
// }

// // API configuration
// const API_BASE_URL = 'https://ig.gov-cloud.ai/pi-entity-instances-service/v2.0'
// const SCHEMA_ID = '68661aea2ec4242da906ee0f'

// // You should store this in environment variables
// const API_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDg0NjgyMjUsImlhdCI6MTc0ODQzMjIyNSwianRpIjoiM2UxYTM0NDAtYzEzZC00NGRlLThkYjYtMTk2MmQwNzAzMmQ4IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI0OGM5MzRiNy0zMmI4LTRjYjAtODc4Yi02MmUxMzVjOTJjMTUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.M34dj5aG86FdXd-Jkn3kxbazoRFDVztGvy916YfnZLIxGf2VLp2Z0GaDrXOvWXAk3DLgtJmbNrVg41wqtoYdlEXRbcymmo4fqD5a7KURmidPtBrtSqGrdWsz7xPmiuINpw04bOLir4I23HcyAJUbVL9tqdhJ_AnGNBlLnr5071wy1z0YY5Qi-_4oiOegm9mdsHFHdf9LFgBxvcDg36TQGw3LlhoJX6-_OVXP9f_K79gnTXDBbH6UtlA96bacVFeJyNYc3BG39YvRdJ4F1evibDTpzQcg9mL8bnYIDFDG9PhkX3wXaDZFB05j9WUH-MG08akcDiyJPXv7DY3tbaj0SQ'

// /**
//  * Submit investment data to the API
//  * @param payload - The investment data to submit
//  * @returns Promise with the API response
//  */
// export const submitInvestment = async (payload: InvestmentPayload): Promise<InvestmentResponse> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/schemas/${SCHEMA_ID}/instances`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${API_TOKEN}`
//       },
//       body: JSON.stringify(payload)
//     })

//     if (!response.ok) {
//       const errorData = await response.text()
//       throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`)
//     }

//     const data = await response.json()
//     return {
//       success: true,
//       data
//     }
//   } catch (error) {
//     console.error('Error submitting investment:', error)
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : 'Unknown error occurred'
//     }
//   }
// }

// /**
//  * Create a sample investment payload
//  * @param overrides - Optional overrides for the default values
//  * @returns InvestmentPayload object
//  */
// export const createInvestmentPayload = (overrides: Partial<InvestmentData> = {}): InvestmentPayload => {
//   const defaultData: InvestmentData = {
//     purchaseByToken: "USDC",
//     AdditionalInfo: {
//       notes: "VIP investor",
//       referenceId: "INV-2023-001"
//     },
//     purchaseByNetworkId: "111555111",
//     purchaseByTokenAmt: "5000",
//     investmentStatus: "1",
//     usdAmt: "5000.00",
//     ComplianceAttestations: {
//       amlVerified: true,
//       jurisdictionCompliant: true,
//       kycVerified: true,
//       termsAccepted: true
//     },
//     InvestorDetails: {
//       accreditedInvestorStatus: true,
//       countryOfResidence: "US",
//       email: "john@example.com",
//       fullName: "John Doe",
//       identityDocument: "kyc_doc_12345",
//       walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
//     },
//     toAddress: "0x744ffd0001f411d781b6df6b828c76d32b65076e",
//     investingToken: "0x66D331E247A6Bd7afc9989e7cC00b17eb1Ef9995",
//     TokenDetails: {
//       decimals: 18,
//       network: {
//         chainId: "11155111",
//         networkName: "Ethereum Sepolia"
//       },
//       tokenName: "TestingToken6"
//     },
//     InvestmentDetails: {
//       investmentAmount: "5000.00",
//       paymentMethod: "stablecoin",
//       requestedTokenAmount: "1000",
//       tokenAddress: "0x66D331E247A6Bd7afc9989e7cC00b17eb1Ef9995",
//       tokenSymbol: "TTS6"
//     },
//     type: "individual",
//     fromAddress: "0x3F146C06ba1E3164222bfe48070673b47d6c0f0A",
//     txHash: "0x1"
//   }

//   // Merge default data with overrides
//   const mergedData = { ...defaultData, ...overrides }

//   return {
//     data: [mergedData]
//   }
// }

// // Export types for use in other files
// export type {
//   InvestmentData,
//   InvestmentPayload,
//   InvestmentResponse,
//   ComplianceAttestations,
//   InvestorDetails,
//   TokenDetails,
//   InvestmentDetails,
//   AdditionalInfo
// }



// Types for the investment API
interface ComplianceAttestations {
  amlVerified: boolean
  jurisdictionCompliant: boolean
  kycVerified: boolean
  termsAccepted: boolean
}

interface InvestorDetails {
  accreditedInvestorStatus: boolean
  countryOfResidence: string
  email: string
  fullName: string
  identityDocument: string
  walletAddress: string
}

interface Network {
  chainId: string
  networkName: string
}

interface TokenDetails {
  decimals: number
  network: Network
  tokenName: string
}

interface InvestmentDetails {
  investmentAmount: string
  paymentMethod: string
  requestedTokenAmount: string
  tokenAddress: string
  tokenSymbol: string
}

interface AdditionalInfo {
  notes?: string
  referenceId?: string
}

interface InvestmentData {
  purchaseByToken: string
  AdditionalInfo?: AdditionalInfo
  purchaseByNetworkId: string
  purchaseByTokenAmt: string
  investmentStatus: string
  usdAmt: string
  ComplianceAttestations: ComplianceAttestations
  InvestorDetails: InvestorDetails
  toAddress: string
  investingToken: string
  TokenDetails: TokenDetails
  InvestmentDetails: InvestmentDetails
  type: string
  fromAddress: string
  txHash: string
}

interface InvestmentPayload {
  data: InvestmentData[]
}

interface InvestmentResponse {
  success: boolean
  data?: any
  error?: string
}

// API configuration
const API_BASE_URL = "https://ig.gov-cloud.ai/pi-entity-instances-service/v2.0"
const SCHEMA_ID = "68661aea2ec4242da906ee0f"

// You should store this in environment variables
const API_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDg0NjgyMjUsImlhdCI6MTc0ODQzMjIyNSwianRpIjoiM2UxYTM0NDAtYzEzZC00NGRlLThkYjYtMTk2MmQwNzAzMmQ4IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI0OGM5MzRiNy0zMmI4LTRjYjAtODc4Yi02MmUxMzVjOTJjMTUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.M34dj5aG86FdXd-Jkn3kxbazoRFDVztGvy916YfnZLIxGf2VLp2Z0GaDrXOvWXAk3DLgtJmbNrVg41wqtoYdlEXRbcymmo4fqD5a7KURmidPtBrtSqGrdWsz7xPmiuINpw04bOLir4I23HcyAJUbVL9tqdhJ_AnGNBlLnr5071wy1z0YY5Qi-_4oiOegm9mdsHFHdf9LFgBxvcDg36TQGw3LlhoJX6-_OVXP9f_K79gnTXDBbH6UtlA96bacVFeJyNYc3BG39YvRdJ4F1evibDTpzQcg9mL8bnYIDFDG9PhkX3wXaDZFB05j9WUH-MG08akcDiyJPXv7DY3tbaj0SQ"

/**
 * Submit investment data to the API
 * @param payload - The investment data to submit
 * @returns Promise with the API response
 */
export const submitInvestment = async (payload: InvestmentPayload): Promise<InvestmentResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/schemas/${SCHEMA_ID}/instances`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData}`)
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error submitting investment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Create a sample investment payload
 * @param overrides - Optional overrides for the default values
 * @returns InvestmentPayload object
 */
export const createInvestmentPayload = (overrides: Partial<InvestmentData> = {}): InvestmentPayload => {
  const defaultData: InvestmentData = {
    purchaseByToken: "USDC",
    AdditionalInfo: {
      notes: "VIP investor",
      referenceId: "INV-2023-001",
    },
    purchaseByNetworkId: "111555111",
    purchaseByTokenAmt: "5000",
    investmentStatus: "1",
    usdAmt: "5000.00",
    ComplianceAttestations: {
      amlVerified: true,
      jurisdictionCompliant: true,
      kycVerified: true,
      termsAccepted: true,
    },
    InvestorDetails: {
      accreditedInvestorStatus: true,
      countryOfResidence: "US",
      email: "john@example.com",
      fullName: "John Doe",
      identityDocument: "kyc_doc_12345",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
    toAddress: "0x744ffd0001f411d781b6df6b828c76d32b65076e",
    investingToken: "0x66D331E247A6Bd7afc9989e7cC00b17eb1Ef9995",
    TokenDetails: {
      decimals: 18,
      network: {
        chainId: "11155111",
        networkName: "Ethereum Sepolia",
      },
      tokenName: "TestingToken6",
    },
    InvestmentDetails: {
      investmentAmount: "5000.00",
      paymentMethod: "stablecoin",
      requestedTokenAmount: "1000",
      tokenAddress: "0x66D331E247A6Bd7afc9989e7cC00b17eb1Ef9995",
      tokenSymbol: "TTS6",
    },
    type: "individual",
    fromAddress: "0x3F146C06ba1E3164222bfe48070673b47d6c0f0A",
    txHash: "0x1",
  }

  // Merge default data with overrides
  const mergedData = { ...defaultData, ...overrides }

  return {
    data: [mergedData],
  }
}

// Export types for use in other files
export type {
  InvestmentData,
  InvestmentPayload,
  InvestmentResponse,
  ComplianceAttestations,
  InvestorDetails,
  TokenDetails,
  InvestmentDetails,
  AdditionalInfo,
  Network,
}
