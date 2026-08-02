import type { KYCData } from "@/store/kycStore"

export interface ClaimIssuerSubmission {
  investorProfile: {
    type: "individual" | "institution"
    country: string
    personalInfo: {
      firstName: string
      lastName: string
      nationality: string
      dateOfBirth: string
      phoneNumber: string
      address: {
        street: string
        city: string
        state: string
        zipCode: string
      }
      taxId?: string
    }
  }
  agreements: {
    riskDisclaimer: boolean
    termsOfService: boolean
    privacyPolicy: boolean
    kycConsent: boolean
    acceptedAt: Date
  }
  walletInfo: {
    primaryAddress: string
    additionalAddresses: string[]
  }
  documents: {
    identity: { url: string; type: string; uploadedAt: Date }
    address: { url: string; type: string; uploadedAt: Date }
    bank: { url: string; type: string; uploadedAt: Date }
    funds: { url: string; type: string; uploadedAt: Date }
  }
  metadata: {
    submissionId: string
    submittedAt: Date
    ipAddress?: string
    userAgent?: string
  }
}

export const submitToClaimIssuer = async (kycData: KYCData): Promise<{ success: boolean; submissionId: string }> => {
  // Transform KYC data to ClaimIssuer format
  const submission: ClaimIssuerSubmission = {
    investorProfile: {
      type: kycData.investorType as "individual" | "institution",
      country: kycData.countryOfResidence,
      personalInfo: {
        firstName: kycData.personalInfo.firstName,
        lastName: kycData.personalInfo.lastName,
        nationality: kycData.personalInfo.nationality,
        dateOfBirth: kycData.personalInfo.dateOfBirth,
        phoneNumber: kycData.personalInfo.phoneNumber,
        address: {
          street: kycData.personalInfo.address,
          city: kycData.personalInfo.city,
          state: kycData.personalInfo.state,
          zipCode: kycData.personalInfo.zipCode,
        },
        taxId: kycData.personalInfo.taxId,
      },
    },
    agreements: {
      ...kycData.agreements,
      acceptedAt: new Date(),
    },
    walletInfo: {
      primaryAddress: kycData.selectedAccount,
      additionalAddresses: kycData.walletAccounts.filter((addr) => addr !== kycData.selectedAccount),
    },
    documents: {
      identity: kycData.documents.find((doc) => doc.documentType === "identity")!,
      address: kycData.documents.find((doc) => doc.documentType === "address")!,
      bank: kycData.documents.find((doc) => doc.documentType === "bank")!,
      funds: kycData.documents.find((doc) => doc.documentType === "funds")!,
    },
    metadata: {
      submissionId: kycData.submissionId || `KYC-${Date.now()}`,
      submittedAt: new Date(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent,
    },
  }

  // Submit to your backend API
  const response = await fetch("/api/kyc/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(submission),
  })

  if (!response.ok) {
    throw new Error("Failed to submit KYC application")
  }

  return response.json()
}

const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    return data.ip
  } catch {
    return "unknown"
  }
}

