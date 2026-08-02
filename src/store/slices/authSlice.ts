import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  address: string
  email?: string
  name?: string
  role: "investor" | "issuer" | "admin"
  onChainId?: string
  kycStatus: "pending" | "verified" | "rejected"
  amlStatus: "pending" | "verified" | "rejected"
  accreditedStatus: boolean
  country: string
  createdAt: string
  lastLogin: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  accessToken: string | null
  refreshToken: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  refreshToken: null,
}

// Async thunks
export const loginWithWallet = createAsyncThunk(
  "auth/loginWithWallet",
  async ({ address, signature }: { address: string; signature: string }) => {
    // Mock API call - replace with actual authentication
    const response = await fetch("/api/auth/wallet-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, signature }),
    })

    if (!response.ok) {
      throw new Error("Authentication failed")
    }

    return response.json()
  },
)

export const refreshAuth = createAsyncThunk("auth/refresh", async (_, { getState }) => {
  const state = getState() as { auth: AuthState }
  const refreshToken = state.auth.refreshToken

  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error("Token refresh failed")
  }

  return response.json()
})

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData: Partial<User>, { getState }) => {
    const state = getState() as { auth: AuthState }
    const token = state.auth.accessToken

    const response = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    if (!response.ok) {
      throw new Error("Profile update failed")
    }

    return response.json()
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.accessToken = null
      state.refreshToken = null
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{
        kycStatus?: "pending" | "verified" | "rejected"
        amlStatus?: "pending" | "verified" | "rejected"
        accreditedStatus?: boolean
      }>,
    ) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login with wallet
      .addCase(loginWithWallet.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginWithWallet.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
      })
      .addCase(loginWithWallet.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Login failed"
      })
      // Refresh auth
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(refreshAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.accessToken = null
        state.refreshToken = null
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Profile update failed"
      })
  },
})

export const { logout, clearError, setUser, updateUserStatus } = authSlice.actions
export default authSlice.reducer
