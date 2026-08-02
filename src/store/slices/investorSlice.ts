import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

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
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    language: string
    currency: string
  }
}

interface InvestorState {
  profile: InvestorProfile | null
  isLoading: boolean
  error: string | null
  documents: any[]
  uploadProgress: number
  complianceHistory: any[]
}

const initialState: InvestorState = {
  profile: null,
  isLoading: false,
  error: null,
  documents: [],
  uploadProgress: 0,
  complianceHistory: [],
}

// Async thunks
export const fetchInvestorProfile = createAsyncThunk("investor/fetchProfile", async (address: string, { getState }) => {
  const state = getState() as { auth: { accessToken: string } }
  const response = await fetch(`/api/investor/profile/${address}`, {
    headers: {
      Authorization: `Bearer ${state.auth.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch investor profile")
  }

  return response.json()
})

export const updateInvestorProfile = createAsyncThunk(
  "investor/updateProfile",
  async (profileData: Partial<InvestorProfile>, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/investor/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error("Failed to update profile")
    }

    return response.json()
  },
)

export const uploadDocument = createAsyncThunk(
  "investor/uploadDocument",
  async ({ file, documentType }: { file: File; documentType: string }, { getState, dispatch }) => {
    const state = getState() as { auth: { accessToken: string } }
    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", documentType)

    const response = await fetch("/api/investor/documents/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload document")
    }

    return response.json()
  },
)

export const fetchComplianceHistory = createAsyncThunk("investor/fetchComplianceHistory", async (_, { getState }) => {
  const state = getState() as { auth: { accessToken: string } }
  const response = await fetch("/api/investor/compliance/history", {
    headers: {
      Authorization: `Bearer ${state.auth.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch compliance history")
  }

  return response.json()
})

export const submitKYCVerification = createAsyncThunk("investor/submitKYC", async (kycData: any, { getState }) => {
  const state = getState() as { auth: { accessToken: string } }
  const response = await fetch("/api/investor/kyc/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.auth.accessToken}`,
    },
    body: JSON.stringify(kycData),
  })

  if (!response.ok) {
    throw new Error("Failed to submit KYC verification")
  }

  return response.json()
})

const investorSlice = createSlice({
  name: "investor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    updateComplianceStatus: (
      state,
      action: PayloadAction<{
        kycStatus?: "pending" | "verified" | "rejected"
        amlStatus?: "pending" | "verified" | "rejected"
        complianceScore?: number
      }>,
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    addDocument: (state, action: PayloadAction<any>) => {
      state.documents.push(action.payload)
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter((doc) => doc.id !== action.payload)
    },
    updatePreferences: (state, action: PayloadAction<Partial<InvestorProfile["preferences"]>>) => {
      if (state.profile) {
        state.profile.preferences = { ...state.profile.preferences, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch investor profile
      .addCase(fetchInvestorProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInvestorProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(fetchInvestorProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch profile"
      })
      // Update investor profile
      .addCase(updateInvestorProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateInvestorProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.profile = action.payload
      })
      .addCase(updateInvestorProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to update profile"
      })
      // Upload document
      .addCase(uploadDocument.pending, (state) => {
        state.isLoading = true
        state.uploadProgress = 0
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.uploadProgress = 100
        state.documents.push(action.payload)
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isLoading = false
        state.uploadProgress = 0
        state.error = action.error.message || "Failed to upload document"
      })
      // Fetch compliance history
      .addCase(fetchComplianceHistory.fulfilled, (state, action) => {
        state.complianceHistory = action.payload
      })
      // Submit KYC verification
      .addCase(submitKYCVerification.pending, (state) => {
        state.isLoading = true
      })
      .addCase(submitKYCVerification.fulfilled, (state, action) => {
        state.isLoading = false
        if (state.profile) {
          state.profile.kycStatus = "pending"
        }
      })
      .addCase(submitKYCVerification.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to submit KYC verification"
      })
  },
})

export const { clearError, setUploadProgress, updateComplianceStatus, addDocument, removeDocument, updatePreferences } =
  investorSlice.actions
export default investorSlice.reducer
