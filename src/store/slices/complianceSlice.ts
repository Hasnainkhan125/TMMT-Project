import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface ComplianceRule {
  id: string
  name: string
  description: string
  type: "kyc" | "aml" | "jurisdiction" | "accreditation" | "custom"
  isActive: boolean
  parameters: Record<string, any>
  createdAt: string
  updatedAt: string
}

interface ComplianceCheck {
  id: string
  investorAddress: string
  ruleId: string
  ruleName: string
  status: "pending" | "passed" | "failed" | "expired"
  result: any
  checkedAt: string
  expiresAt?: string
  notes?: string
}

interface JurisdictionRestriction {
  countryCode: string
  countryName: string
  isAllowed: boolean
  restrictions: string[]
  lastUpdated: string
}

interface ComplianceReport {
  id: string
  type: "kyc" | "aml" | "general" | "audit"
  title: string
  description: string
  generatedAt: string
  data: any
  status: "generating" | "completed" | "failed"
  downloadUrl?: string
}

interface ComplianceState {
  rules: ComplianceRule[]
  checks: ComplianceCheck[]
  jurisdictions: JurisdictionRestriction[]
  reports: ComplianceReport[]
  statistics: {
    totalChecks: number
    passedChecks: number
    failedChecks: number
    pendingChecks: number
    complianceRate: number
    kycVerificationRate: number
    amlClearanceRate: number
  } | null
  isLoading: boolean
  error: string | null
  selectedRule: ComplianceRule | null
}

const initialState: ComplianceState = {
  rules: [],
  checks: [],
  jurisdictions: [],
  reports: [],
  statistics: null,
  isLoading: false,
  error: null,
  selectedRule: null,
}

// Async thunks
export const fetchComplianceRules = createAsyncThunk(
  "compliance/fetchRules",
  async (tokenAddress: string, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/compliance/rules?tokenAddress=${tokenAddress}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch compliance rules")
    }

    return response.json()
  },
)

export const createComplianceRule = createAsyncThunk(
  "compliance/createRule",
  async (ruleData: Omit<ComplianceRule, "id" | "createdAt" | "updatedAt">, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/compliance/rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify(ruleData),
    })

    if (!response.ok) {
      throw new Error("Failed to create compliance rule")
    }

    return response.json()
  },
)

export const updateComplianceRule = createAsyncThunk(
  "compliance/updateRule",
  async ({ ruleId, updates }: { ruleId: string; updates: Partial<ComplianceRule> }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/compliance/rules/${ruleId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update compliance rule")
    }

    return response.json()
  },
)

export const deleteComplianceRule = createAsyncThunk("compliance/deleteRule", async (ruleId: string, { getState }) => {
  const state = getState() as { auth: { accessToken: string } }
  const response = await fetch(`/api/compliance/rules/${ruleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${state.auth.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to delete compliance rule")
  }

  return { ruleId }
})

export const fetchComplianceChecks = createAsyncThunk(
  "compliance/fetchChecks",
  async ({ investorAddress, limit = 50 }: { investorAddress?: string; limit?: number }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const params = new URLSearchParams()
    if (investorAddress) params.append("investorAddress", investorAddress)
    params.append("limit", limit.toString())

    const response = await fetch(`/api/compliance/checks?${params}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch compliance checks")
    }

    return response.json()
  },
)

export const runComplianceCheck = createAsyncThunk(
  "compliance/runCheck",
  async ({ investorAddress, ruleId }: { investorAddress: string; ruleId: string }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/compliance/checks/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify({ investorAddress, ruleId }),
    })

    if (!response.ok) {
      throw new Error("Failed to run compliance check")
    }

    return response.json()
  },
)

export const fetchJurisdictionRestrictions = createAsyncThunk(
  "compliance/fetchJurisdictions",
  async (_, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/compliance/jurisdictions", {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch jurisdiction restrictions")
    }

    return response.json()
  },
)

export const updateJurisdictionRestriction = createAsyncThunk(
  "compliance/updateJurisdiction",
  async (
    { countryCode, updates }: { countryCode: string; updates: Partial<JurisdictionRestriction> },
    { getState },
  ) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/compliance/jurisdictions/${countryCode}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      throw new Error("Failed to update jurisdiction restriction")
    }

    return response.json()
  },
)

export const generateComplianceReport = createAsyncThunk(
  "compliance/generateReport",
  async ({ type, parameters }: { type: ComplianceReport["type"]; parameters: any }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/compliance/reports/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify({ type, parameters }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate compliance report")
    }

    return response.json()
  },
)

export const fetchComplianceStatistics = createAsyncThunk(
  "compliance/fetchStatistics",
  async (tokenAddress: string, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/compliance/statistics?tokenAddress=${tokenAddress}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch compliance statistics")
    }

    return response.json()
  },
)

const complianceSlice = createSlice({
  name: "compliance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedRule: (state, action: PayloadAction<ComplianceRule | null>) => {
      state.selectedRule = action.payload
    },
    updateCheckStatus: (
      state,
      action: PayloadAction<{ checkId: string; status: ComplianceCheck["status"]; result?: any }>,
    ) => {
      const { checkId, status, result } = action.payload
      const checkIndex = state.checks.findIndex((check) => check.id === checkId)
      if (checkIndex !== -1) {
        state.checks[checkIndex] = {
          ...state.checks[checkIndex],
          status,
          result: result || state.checks[checkIndex].result,
          checkedAt: new Date().toISOString(),
        }
      }
    },
    addComplianceCheck: (state, action: PayloadAction<ComplianceCheck>) => {
      state.checks.unshift(action.payload)
    },
    toggleRuleStatus: (state, action: PayloadAction<string>) => {
      const ruleId = action.payload
      const ruleIndex = state.rules.findIndex((rule) => rule.id === ruleId)
      if (ruleIndex !== -1) {
        state.rules[ruleIndex].isActive = !state.rules[ruleIndex].isActive
        state.rules[ruleIndex].updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch compliance rules
      .addCase(fetchComplianceRules.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchComplianceRules.fulfilled, (state, action) => {
        state.isLoading = false
        state.rules = action.payload
      })
      .addCase(fetchComplianceRules.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch compliance rules"
      })
      // Create compliance rule
      .addCase(createComplianceRule.fulfilled, (state, action) => {
        state.rules.unshift(action.payload)
      })
      .addCase(createComplianceRule.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create compliance rule"
      })
      // Update compliance rule
      .addCase(updateComplianceRule.fulfilled, (state, action) => {
        const ruleIndex = state.rules.findIndex((rule) => rule.id === action.payload.id)
        if (ruleIndex !== -1) {
          state.rules[ruleIndex] = action.payload
        }
      })
      .addCase(updateComplianceRule.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update compliance rule"
      })
      // Delete compliance rule
      .addCase(deleteComplianceRule.fulfilled, (state, action) => {
        state.rules = state.rules.filter((rule) => rule.id !== action.payload.ruleId)
      })
      .addCase(deleteComplianceRule.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete compliance rule"
      })
      // Fetch compliance checks
      .addCase(fetchComplianceChecks.fulfilled, (state, action) => {
        state.checks = action.payload
      })
      .addCase(fetchComplianceChecks.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch compliance checks"
      })
      // Run compliance check
      .addCase(runComplianceCheck.fulfilled, (state, action) => {
        state.checks.unshift(action.payload)
      })
      .addCase(runComplianceCheck.rejected, (state, action) => {
        state.error = action.error.message || "Failed to run compliance check"
      })
      // Fetch jurisdiction restrictions
      .addCase(fetchJurisdictionRestrictions.fulfilled, (state, action) => {
        state.jurisdictions = action.payload
      })
      .addCase(fetchJurisdictionRestrictions.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch jurisdiction restrictions"
      })
      // Update jurisdiction restriction
      .addCase(updateJurisdictionRestriction.fulfilled, (state, action) => {
        const jurisdictionIndex = state.jurisdictions.findIndex((j) => j.countryCode === action.payload.countryCode)
        if (jurisdictionIndex !== -1) {
          state.jurisdictions[jurisdictionIndex] = action.payload
        }
      })
      .addCase(updateJurisdictionRestriction.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update jurisdiction restriction"
      })
      // Generate compliance report
      .addCase(generateComplianceReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload)
      })
      .addCase(generateComplianceReport.rejected, (state, action) => {
        state.error = action.error.message || "Failed to generate compliance report"
      })
      // Fetch compliance statistics
      .addCase(fetchComplianceStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload
      })
      .addCase(fetchComplianceStatistics.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch compliance statistics"
      })
  },
})

export const { clearError, setSelectedRule, updateCheckStatus, addComplianceCheck, toggleRuleStatus } =
  complianceSlice.actions
export default complianceSlice.reducer
