import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface TokenHolding {
  id: string
  symbol: string
  name: string
  balance: number
  price: number
  value: number
  change24h: number
  apy: string
  maturity: string
  issuer: string
  tokenAddress: string
  logo: string
}

interface Transaction {
  id: string
  type: "investment" | "transfer" | "mint" | "burn" | "claim"
  tokenSymbol: string
  tokenName?: string
  amount: string
  value: string
  currency: string
  status: "pending" | "processing" | "completed" | "failed"
  date: string
  txHash?: string
  fromAddress?: string
  toAddress?: string
  fees?: string
  notes?: string
}

interface PortfolioAnalytics {
  totalValue: number
  totalInvested: number
  totalReturn: number
  returnPercentage: number
  dayChange: number
  dayChangePercentage: number
  diversificationScore: number
  riskScore: number
  sharpeRatio: number
  volatility: number
  maxDrawdown: number
}

interface PortfolioState {
  holdings: TokenHolding[]
  transactions: Transaction[]
  analytics: PortfolioAnalytics | null
  isLoading: boolean
  error: string | null
  selectedTimeframe: "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL"
  chartData: any[]
  performanceData: any[]
}

const initialState: PortfolioState = {
  holdings: [],
  transactions: [],
  analytics: null,
  isLoading: false,
  error: null,
  selectedTimeframe: "1M",
  chartData: [],
  performanceData: [],
}

// Async thunks
export const fetchPortfolioData = createAsyncThunk("portfolio/fetchData", async (address: string, { getState }) => {
  const state = getState() as { auth: { accessToken: string } }
  const response = await fetch(`/api/portfolio/${address}`, {
    headers: {
      Authorization: `Bearer ${state.auth.accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch portfolio data")
  }

  return response.json()
})

export const fetchTransactions = createAsyncThunk(
  "portfolio/fetchTransactions",
  async ({ address, limit = 50 }: { address: string; limit?: number }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/portfolio/${address}/transactions?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch transactions")
    }

    return response.json()
  },
)

export const fetchAnalytics = createAsyncThunk(
  "portfolio/fetchAnalytics",
  async ({ address, timeframe }: { address: string; timeframe: string }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/portfolio/${address}/analytics?timeframe=${timeframe}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch analytics")
    }

    return response.json()
  },
)

export const fetchChartData = createAsyncThunk(
  "portfolio/fetchChartData",
  async ({ address, timeframe }: { address: string; timeframe: string }, { getState }) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch(`/api/portfolio/${address}/chart?timeframe=${timeframe}`, {
      headers: {
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch chart data")
    }

    return response.json()
  },
)

export const executeTransfer = createAsyncThunk(
  "portfolio/executeTransfer",
  async (
    {
      tokenAddress,
      toAddress,
      amount,
      notes,
    }: {
      tokenAddress: string
      toAddress: string
      amount: string
      notes?: string
    },
    { getState },
  ) => {
    const state = getState() as { auth: { accessToken: string } }
    const response = await fetch("/api/portfolio/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.auth.accessToken}`,
      },
      body: JSON.stringify({
        tokenAddress,
        toAddress,
        amount,
        notes,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to execute transfer")
    }

    return response.json()
  },
)

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setTimeframe: (state, action: PayloadAction<"1D" | "1W" | "1M" | "3M" | "1Y" | "ALL">) => {
      state.selectedTimeframe = action.payload
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload)
    },
    updateTransaction: (state, action: PayloadAction<{ id: string; updates: Partial<Transaction> }>) => {
      const { id, updates } = action.payload
      const index = state.transactions.findIndex((tx) => tx.id === id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...updates }
      }
    },
    updateHolding: (state, action: PayloadAction<{ tokenAddress: string; updates: Partial<TokenHolding> }>) => {
      const { tokenAddress, updates } = action.payload
      const index = state.holdings.findIndex((holding) => holding.tokenAddress === tokenAddress)
      if (index !== -1) {
        state.holdings[index] = { ...state.holdings[index], ...updates }
      }
    },
    refreshPrices: (state, action: PayloadAction<{ [tokenAddress: string]: number }>) => {
      const prices = action.payload
      state.holdings = state.holdings.map((holding) => {
        const newPrice = prices[holding.tokenAddress]
        if (newPrice) {
          const oldValue = holding.value
          const newValue = holding.balance * newPrice
          const change24h = ((newValue - oldValue) / oldValue) * 100
          return {
            ...holding,
            price: newPrice,
            value: newValue,
            change24h,
          }
        }
        return holding
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch portfolio data
      .addCase(fetchPortfolioData.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPortfolioData.fulfilled, (state, action) => {
        state.isLoading = false
        state.holdings = action.payload.holdings
        state.analytics = action.payload.analytics
      })
      .addCase(fetchPortfolioData.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch portfolio data"
      })
      // Fetch transactions
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch transactions"
      })
      // Fetch analytics
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch analytics"
      })
      // Fetch chart data
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.chartData = action.payload.chartData
        state.performanceData = action.payload.performanceData
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch chart data"
      })
      // Execute transfer
      .addCase(executeTransfer.pending, (state) => {
        state.isLoading = true
      })
      .addCase(executeTransfer.fulfilled, (state, action) => {
        state.isLoading = false
        state.transactions.unshift(action.payload.transaction)
        // Update holding balance
        const tokenAddress = action.payload.transaction.tokenAddress
        const amount = Number.parseFloat(action.payload.transaction.amount)
        const holdingIndex = state.holdings.findIndex((h) => h.tokenAddress === tokenAddress)
        if (holdingIndex !== -1) {
          state.holdings[holdingIndex].balance -= amount
          state.holdings[holdingIndex].value = state.holdings[holdingIndex].balance * state.holdings[holdingIndex].price
        }
      })
      .addCase(executeTransfer.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to execute transfer"
      })
  },
})

export const { clearError, setTimeframe, addTransaction, updateTransaction, updateHolding, refreshPrices } =
  portfolioSlice.actions
export default portfolioSlice.reducer
