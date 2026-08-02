"use client"

import { useState, useEffect } from "react"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Separator } from "../../../components/ui/separator"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import {
  DollarSign,
  Wallet,
  CreditCard,
  Shield,
  CheckCircle,
  Loader2,
  Calculator,
  Info,
  Building2,
  ArrowRight,
  Send,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { submitInvestment, createInvestmentPayload, type InvestmentData } from "../../../api/investment-api"
import { ethers } from "ethers"
import { useWalletClient, useAccount } from "wagmi"
import { Button } from "../../../components/ui/button"
import { FileText, AlertTriangle, ShoppingCart } from "lucide-react"

// Token contract addresses on Sepolia testnet
const TOKEN_CONTRACTS = {
  USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Example USDC on Sepolia
  USDT: "0x110a13FC3efE6A245B50102D2d79B3E76125Ae83", // Example USDT on Sepolia  
  DAI: "0x68194a729C2450ad26072b3D33ADaCbcef39D574", // Example DAI on Sepolia
  ETH: "0x0000000000000000000000000000000000000000" // ETH doesn't have a contract address
}

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
]

interface TokenData {
  symbol: string
  name: string
  tokenAddress: string
  initialPrice: number
  apy: string
  maturity: string
  riskLevel: "Low" | "Medium" | "High"
  type: string
  minInvestment: number
  maxInvestment: number
  totalSupply: string
  availableSupply: string
  issuer: string
  description: string
  decimals: number
  logo: string
  ownerAddress?: string // Add token owner address field
  claimData: {
    data: Array<{
      contract: string
      issuer: string
      name: string
    }>
  }
}

interface InvestorData {
  InvestorDetails: {
    fullName: string
    email: string
    walletAddress: string
    countryOfResidence: string
    accreditedInvestorStatus: boolean
  }
  claimStatus: {
    kycVerified: boolean
    amlVerified: boolean
    termsAccepted: boolean
    jurisdictionCompliant: boolean
  }
  investorIdentityAddress: string
}

interface BankDetails {
  bankName: string
  accountNumber: string
  routingNumber: string
  accountHolderName: string
  swiftCode: string
  iban: string
  bankAddress: string
  currency: string
}

interface BalanceInfo {
  balance: string
  formattedBalance: string
  hasInsufficientFunds: boolean
}

interface EnhancedInvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  token: TokenData | null
  investorData: InvestorData | null
  onInvestmentComplete: (transaction: any) => void
}

const currencies = [
  { symbol: "USDC", name: "USD Coin", icon: "💵", chainId: "11155111", decimals: 6 },
  { symbol: "USDT", name: "Tether USD", icon: "💰", chainId: "11155111", decimals: 6 },
  { symbol: "ETH", name: "Ethereum", icon: "⟠", chainId: "11155111", decimals: 18 },
  { symbol: "DAI", name: "Dai Stablecoin", icon: "🏛️", chainId: "11155111", decimals: 18 },
]

const fiatCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
]

const paymentMethods = [
  {
    id: "stablecoin",
    name: "Stablecoin Transfer",
    icon: <DollarSign className="h-4 w-4" />,
    description: "Direct transfer from your wallet",
    requiresBlockchain: true,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: <Building2 className="h-4 w-4" />,
    description: "Traditional bank wire transfer",
    requiresBankDetails: true,
  },
  {
    id: "crypto_wallet",
    name: "Crypto Wallet",
    icon: <Wallet className="h-4 w-4" />,
    description: "Pay with cryptocurrency",
    requiresBlockchain: true,
  },
]

export const InvestmentModal = ({
  isOpen,
  onClose,
  token,
  investorData,
  onInvestmentComplete,
}: EnhancedInvestmentModalProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isCheckingBalance, setIsCheckingBalance] = useState(false)
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo | null>(null)

  // Form state
  const [investmentAmount, setInvestmentAmount] = useState("")
  const [selectedCurrency, setSelectedCurrency] = useState("USDC")
  const [paymentMethod, setPaymentMethod] = useState("stablecoin")
  const [notes, setNotes] = useState("")
  const [referenceId, setReferenceId] = useState("")

  // Bank details state
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    swiftCode: "",
    iban: "",
    bankAddress: "",
    currency: "USD",
  })

  const { data: walletClient } = useWalletClient()
  const { address: userAddress } = useAccount()

  // Check user's balance for selected currency
  const checkUserBalance = async () => {
    if (!walletClient || !userAddress || !investmentAmount || !selectedCurrency) {
      return
    }

    setIsCheckingBalance(true)
    try {
      const provider = new ethers.BrowserProvider(walletClient)
      const selectedCurrencyData = currencies.find(c => c.symbol === selectedCurrency)
      
      if (!selectedCurrencyData) {
        throw new Error("Currency not found")
      }

      let balance = "0"
      let decimals = selectedCurrencyData.decimals

      if (selectedCurrency === "ETH") {
        // Check ETH balance
        const ethBalance = await provider.getBalance(userAddress)
        balance = ethers.formatEther(ethBalance)
        decimals = 18
      } else {
        // Check token balance
        const tokenAddress = TOKEN_CONTRACTS[selectedCurrency as keyof typeof TOKEN_CONTRACTS]
        if (!tokenAddress) {
          throw new Error(`Token contract not found for ${selectedCurrency}`)
        }

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
        const tokenBalance = await tokenContract.balanceOf(userAddress)
        balance = ethers.formatUnits(tokenBalance, decimals)
      }

      const requiredAmount = Number.parseFloat(investmentAmount)
      const userBalance = Number.parseFloat(balance)
      const hasInsufficientFunds = userBalance < requiredAmount

      setBalanceInfo({
        balance,
        formattedBalance: Number.parseFloat(balance).toFixed(6),
        hasInsufficientFunds
      })

      if (hasInsufficientFunds) {
        toast.warning(`Insufficient ${selectedCurrency} balance. Required: ${requiredAmount}, Available: ${userBalance.toFixed(6)}`)
      }

    } catch (error) {
      console.error("Error checking balance:", error)
      toast.error("Failed to check wallet balance")
      setBalanceInfo(null)
    } finally {
      setIsCheckingBalance(false)
    }
  }

  // Check balance when currency or amount changes
  useEffect(() => {
    if ((paymentMethod === "stablecoin" || paymentMethod === "crypto_wallet") && investmentAmount && selectedCurrency) {
      const timeoutId = setTimeout(() => {
        checkUserBalance()
      }, 500) // Debounce balance check

      return () => clearTimeout(timeoutId)
    } else {
      setBalanceInfo(null)
    }
  }, [selectedCurrency, investmentAmount, paymentMethod, userAddress])

  const getSteps = () => {
    const baseSteps = [
      { title: "Investment Details", icon: <Calculator className="h-4 w-4" /> },
      { title: "Payment Method", icon: <CreditCard className="h-4 w-4" /> },
    ]

    if (paymentMethod === "bank_transfer") {
      baseSteps.push({ title: "Bank Details", icon: <Building2 className="h-4 w-4" /> })
    } else if (paymentMethod === "stablecoin" || paymentMethod === "crypto_wallet") {
      baseSteps.push({ title: "Blockchain Transfer", icon: <Send className="h-4 w-4" /> })
    }

    baseSteps.push({ title: "Review & Confirm", icon: <CheckCircle className="h-4 w-4" /> })
    return baseSteps
  }

  const steps = getSteps()

  const resetForm = () => {
    setCurrentStep(0)
    setInvestmentAmount("")
    setSelectedCurrency("USDC")
    setPaymentMethod("stablecoin")
    setNotes("")
    setReferenceId("")
    setBankDetails({
      bankName: "",
      accountNumber: "",
      routingNumber: "",
      accountHolderName: "",
      swiftCode: "",
      iban: "",
      bankAddress: "",
      currency: "USD",
    })
    setIsSubmitting(false)
    setIsProcessingPayment(false)
    setBalanceInfo(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const calculateTokenAmount = () => {
    if (!token || !investmentAmount) return 0
    return Number.parseFloat(investmentAmount) / (token.initialPrice||1)
  }

  const calculateFees = () => {
    if (!investmentAmount) return 0
    const baseFee = Number.parseFloat(investmentAmount) * 0.005 // 0.5% platform fee
    const paymentFee = paymentMethod === "bank_transfer" ? 25 : paymentMethod === "stablecoin" ? 2 : 5
    return baseFee + paymentFee
  }

  const calculateTotal = () => {
    if (!investmentAmount) return 0
    return Number.parseFloat(investmentAmount) + calculateFees()
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        if (!investmentAmount || Number.parseFloat(investmentAmount) <= 0) {
          toast.error("Please enter a valid investment amount")
          return false
        }
        if (!token) return false
        if (Number.parseFloat(investmentAmount) < token.minInvestment) {
          // toast.error(`Minimum investment is $${token.minInvestment.toLocaleString()}`)
          return false
        }
        if (Number.parseFloat(investmentAmount) > token.maxInvestment) {
          // toast.error(`Maximum investment is $${token.maxInvestment.toLocaleString()}`)
          return false
        }
        return true
      case 1:
        if (!selectedCurrency || !paymentMethod) {
          toast.error("Please select currency and payment method")
          return false
        }
        return true
      case 2:
        if (paymentMethod === "bank_transfer") {
          const requiredFields = ["bankName", "accountNumber", "accountHolderName", "currency"]
          const missingFields = requiredFields.filter((field) => !bankDetails[field as keyof BankDetails])
          if (missingFields.length > 0) {
            toast.error("Please fill in all required bank details")
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const executeTokenTransfer = async () => {
    if (!walletClient || !userAddress || !token || !investmentAmount) {
      throw new Error("Missing required data for transfer")
    }

    const provider = new ethers.BrowserProvider(walletClient)
    const signer = await provider.getSigner()
    
    // Get token owner address (fallback to a default if not provided)
    const tokenOwnerAddress = token.ownerAddress || token.issuer || "0x742d35Cc6734C2932C3E29A2659c29b8D7D1B82F" // fallback address

    const selectedCurrencyData = currencies.find(c => c.symbol === selectedCurrency)
    if (!selectedCurrencyData) {
      throw new Error("Currency not found")
    }

    const transferAmount = ethers.parseUnits(investmentAmount, selectedCurrencyData.decimals)

    let tx
    if (selectedCurrency === "ETH") {
      // Transfer ETH
      tx = await signer.sendTransaction({
        to: tokenOwnerAddress,
        value: transferAmount
      })
    } else {
      // Transfer ERC20 token
      const tokenAddress = TOKEN_CONTRACTS[selectedCurrency as keyof typeof TOKEN_CONTRACTS]
      if (!tokenAddress) {
        throw new Error(`Token contract not found for ${selectedCurrency}`)
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer)
      tx = await tokenContract.transfer(tokenOwnerAddress, transferAmount)
    }

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    return receipt.hash
  }

  const handleBlockchainTransfer = async () => {
    if (!token || !walletClient || !investorData) return false

    setIsProcessingPayment(true)
    try {
      // Check if user has sufficient balance
      if (balanceInfo?.hasInsufficientFunds) {
        toast.error(`Insufficient ${selectedCurrency} balance. Order will be placed as pending.`)
        return "INSUFFICIENT_FUNDS"
      }

      toast.loading("Processing blockchain transfer...", { id: "blockchain-transfer" })

      // Execute the actual token transfer
      const txHash = await executeTokenTransfer()
      
      toast.success("Blockchain transfer completed!", { id: "blockchain-transfer" })
      return txHash
    } catch (error: any) {
      console.error("Blockchain transfer error:", error)
      
      // Handle specific error types
      if (error.code === "ACTION_REJECTED" || error.code === 4001) {
        toast.error("Transaction was rejected by user", { id: "blockchain-transfer" })
        return false
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient funds for gas fees", { id: "blockchain-transfer" })
        return "INSUFFICIENT_FUNDS"
      } else {
        toast.error("Blockchain transfer failed", { id: "blockchain-transfer" })
        return false
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleSubmit = async () => {
    if (!token || !investorData || !validateStep(currentStep)) return

    setIsSubmitting(true)

    try {
      let txHash = ""
      let investmentStatus = "1" // Default: processing

      // Handle payment processing based on method
      if (paymentMethod === "stablecoin" || paymentMethod === "crypto_wallet") {
        const result = await handleBlockchainTransfer()
        if (result === false) {
          setIsSubmitting(false)
          return
        } else if (result === "INSUFFICIENT_FUNDS") {
          txHash = `PENDING_${Date.now()}`
          investmentStatus = "0" // Pending payment
          toast.info("Order placed with pending payment status due to insufficient funds.")
        } else {
          txHash = result
          investmentStatus = "1" // Processing (payment completed)
        }
      } else if (paymentMethod === "bank_transfer") {
        // For bank transfer, always pending payment
        txHash = `BANK_${Date.now()}`
        investmentStatus = "0" // Pending payment
        toast.info("Bank transfer order created. Processing will begin once payment is received.")
      }

      toast.loading("Submitting investment to API...", { id: "investment-submit" })

      // Generate reference ID if not provided
      const finalReferenceId = referenceId || `INV-${Date.now()}`

      // Get selected currency details
      const selectedCurrencyData = currencies.find((c) => c.symbol === selectedCurrency)

      // Create investment payload
      const investmentData: Partial<InvestmentData> = {
        purchaseByToken: paymentMethod === "bank_transfer" ? bankDetails.currency : selectedCurrency,
        AdditionalInfo: {
          notes: notes || `Investment in ${token.symbol}`,
          referenceId: finalReferenceId,
        },
        purchaseByNetworkId: selectedCurrencyData?.chainId || "11155111",
        purchaseByTokenAmt: investmentAmount,
        investmentStatus: investmentStatus,
        usdAmt: investmentAmount,
        ComplianceAttestations: {
          amlVerified: investorData.claimStatus.amlVerified,
          jurisdictionCompliant: investorData.claimStatus.jurisdictionCompliant,
          kycVerified: investorData.claimStatus.kycVerified,
          termsAccepted: investorData.claimStatus.termsAccepted,
        },
        InvestorDetails: {
          accreditedInvestorStatus: investorData.InvestorDetails.accreditedInvestorStatus,
          countryOfResidence: investorData.InvestorDetails.countryOfResidence,
          email: investorData.InvestorDetails.email,
          fullName: investorData.InvestorDetails.fullName,
          identityDocument: "kyc_verified",
          walletAddress: investorData.InvestorDetails.walletAddress,
        },
        toAddress: token.tokenAddress,
        investingToken: token.tokenAddress,
        TokenDetails: {
          decimals: token.decimals,
          network: {
            chainId: selectedCurrencyData?.chainId || "11155111",
            networkName: "Ethereum Sepolia",
          },
          tokenName: token.name,
        },
        InvestmentDetails: {
          investmentAmount: investmentAmount,
          paymentMethod: paymentMethod,
          requestedTokenAmount: calculateTokenAmount().toString(),
          tokenAddress: token.tokenAddress,
          tokenSymbol: token.symbol,
        },
        type: investorData.InvestorDetails.accreditedInvestorStatus ? "accredited" : "individual",
        fromAddress: investorData.InvestorDetails.walletAddress,
        txHash: txHash,
      }

      const payload = createInvestmentPayload(investmentData)
      const response = await submitInvestment(payload)

      if (response.success) {
        // Determine transaction status based on payment result
        let transactionStatus: "pending" | "processing" | "completed" = "pending"
        if (investmentStatus === "1") {
          transactionStatus = "processing"
        } else {
          transactionStatus = "pending"
        }

        // Create transaction record for local state
        const transaction = {
          id: finalReferenceId,
          type: "investment" as const,
          tokenSymbol: token.symbol,
          tokenName: token.name,
          amount: calculateTokenAmount().toFixed(4),
          investmentAmount: investmentAmount,
          value: investmentAmount,
          currency: paymentMethod === "bank_transfer" ? bankDetails.currency : selectedCurrency,
          status: transactionStatus,
          date: new Date().toISOString().split("T")[0],
          txHash: txHash,
          toAddress: token.tokenAddress,
          fromAddress: investorData.InvestorDetails.walletAddress,
          fees: calculateFees().toFixed(2),
          paymentMethod: paymentMethod,
          expectedCompletion: new Date(Date.now() + (transactionStatus === "pending" ? 5 : 1) * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          referenceId: finalReferenceId,
          notes: notes,
          apiResponse: response.data,
          tokenPrice: token?.initialPrice?.toString()||"",
          issuer: token.issuer,
          apy: token.apy,
          maturity: token.maturity,
          riskLevel: token.riskLevel,
          bankDetails: paymentMethod === "bank_transfer" ? bankDetails : undefined,
          balanceInfo: balanceInfo,
        }

        onInvestmentComplete(transaction)

        toast.success("Investment submitted successfully!", { id: "investment-submit" })
        handleClose()

        // Simulate status updates for successful payments
        if (transactionStatus === "processing") {
          setTimeout(() => {
            toast.info("Investment is being processed...")
          }, 3000)
        }
      } else {
        throw new Error(response.error || "Investment submission failed")
      }
    } catch (error) {
      console.error("Investment submission error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit investment", { id: "investment-submit" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset step when payment method changes
  useEffect(() => {
    if (currentStep > 1) {
      setCurrentStep(1)
    }
  }, [paymentMethod])

  if (!token) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
              {token.symbol.slice(0, 2)}
            </div>
            <div>
              <span>Invest in {token.symbol}</span>
              <p className="text-sm text-muted-foreground font-normal">{token.name}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Complete your investment in {token.name} by {token.issuer}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center min-w-0">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  index <= currentStep
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-background border-border text-gray-400"
                }`}
              >
                {index < currentStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>
              <div className="ml-2 min-w-0">
                <p className={`text-sm font-medium ${index <= currentStep ? "text-purple-600" : "text-gray-400"}`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className={`w-4 h-4 mx-4 ${index < currentStep ? "text-purple-600" : "text-gray-300"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Token Overview Card */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Token Price</p>
                  <p className="text-lg font-bold text-purple-700">${token.initialPrice}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Expected APY</p>
                  <p className="text-lg font-bold text-green-600">{token.apy}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Risk Level</p>
                  <Badge
                    variant="outline"
                    className={`${
                      token.riskLevel === "Low"
                        ? "border-green-300 text-green-700"
                        : token.riskLevel === "Medium"
                          ? "border-yellow-300 text-yellow-700"
                          : "border-red-300 text-red-700"
                    }`}
                  >
                    {token.riskLevel}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Maturity</p>
                  <p className="text-sm font-medium">{token.maturity}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Investment Amount</span>
                  </CardTitle>
                  <CardDescription>Enter the amount you want to invest in USD</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="investment-amount">Investment Amount (USD)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="investment-amount"
                        type="number"
                        placeholder="0.00"
                        value={investmentAmount}
                        onChange={(e) => setInvestmentAmount(e.target.value)}
                        className="pl-10"
                        min={token.minInvestment}
                        max={token.maxInvestment}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {/* Min: ${token.minInvestment.toLocaleString()} • Max: ${token.maxInvestment.toLocaleString()} */}
                    </p>
                  </div>

                  {investmentAmount && Number.parseFloat(investmentAmount) > 0 && (
                    <Card className="bg-slate-50">
                      <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Investment Amount:</span>
                            {/* <span className="font-mono">${Number.parseFloat(investmentAmount).toLocaleString()}</span> */}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token Price:</span>
                            <span className="font-mono">${token.initialPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tokens to Receive:</span>
                            <span className="font-mono font-medium text-purple-700">
                              {calculateTokenAmount().toFixed(4)} {token.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform Fee (0.5%):</span>
                            <span className="font-mono">
                              ${(Number.parseFloat(investmentAmount) * 0.005).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your investment will be processed after payment confirmation. Tokens will be minted to your
                      OnChainID.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                  <CardDescription>Choose your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                            <div className="p-2 rounded-full bg-surface">{method.icon}</div>
                            <div>
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {(paymentMethod === "stablecoin" || paymentMethod === "crypto_wallet") && (
                    <div className="space-y-4">
                      <div>
                        <Label>Payment Currency</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.symbol} value={currency.symbol}>
                                <div className="flex items-center space-x-2">
                                  <span>{currency.icon}</span>
                                  <span>{currency.symbol}</span>
                                  <span className="text-muted-foreground">- {currency.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Balance Display */}
                      {investmentAmount && (balanceInfo || isCheckingBalance) && (
                        <Card className={`${balanceInfo?.hasInsufficientFunds ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Wallet className="h-4 w-4" />
                                <span className="text-sm font-medium">Wallet Balance</span>
                              </div>
                              {isCheckingBalance ? (
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm">Checking...</span>
                                </div>
                              ) : balanceInfo ? (
                                <div className="text-right">
                                  <p className="text-sm font-mono">
                                    {balanceInfo.formattedBalance} {selectedCurrency}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Required: {Number.parseFloat(investmentAmount).toFixed(6)} {selectedCurrency}
                                  </p>
                                </div>
                              ) : null}
                            </div>
                            
                            {balanceInfo?.hasInsufficientFunds && (
                              <Alert className="mt-3 border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">
                                  Insufficient {selectedCurrency} balance. Your order will be placed as pending until you have sufficient funds.
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            {balanceInfo && !balanceInfo.hasInsufficientFunds && (
                              <Alert className="mt-3 border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                  Sufficient balance available. Transaction will be processed immediately.
                                </AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reference-id">Reference ID (Optional)</Label>
                      <Input
                        id="reference-id"
                        placeholder="Your reference ID"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Additional notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && paymentMethod === "bank_transfer" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Bank Details</span>
                  </CardTitle>
                  <CardDescription>Enter your bank account details for wire transfer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Your bank details are encrypted and secure. We'll use this information to process your wire
                      transfer.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bank-name">
                        Bank Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bank-name"
                        placeholder="Enter bank name"
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-holder">
                        Account Holder Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="account-holder"
                        placeholder="Full name on account"
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number">
                        Account Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="account-number"
                        placeholder="Account number"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="routing-number">Routing Number</Label>
                      <Input
                        id="routing-number"
                        placeholder="Routing number (US banks)"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="swift-code">SWIFT Code</Label>
                      <Input
                        id="swift-code"
                        placeholder="International transfers"
                        value={bankDetails.swiftCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, swiftCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        placeholder="International Bank Account Number"
                        value={bankDetails.iban}
                        onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="bank-address">Bank Address</Label>
                      <Input
                        id="bank-address"
                        placeholder="Bank's full address"
                        value={bankDetails.bankAddress}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">
                        Currency <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={bankDetails.currency}
                        onValueChange={(value) => setBankDetails({ ...bankDetails, currency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fiatCurrencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center space-x-2">
                                <span>{currency.symbol}</span>
                                <span>{currency.code}</span>
                                <span className="text-muted-foreground">- {currency.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Bank transfers typically take 3-5 business days to process. Your investment will be confirmed once
                      payment is received.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (paymentMethod === "stablecoin" || paymentMethod === "crypto_wallet") && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Blockchain Transfer</span>
                  </CardTitle>
                  <CardDescription>Complete the cryptocurrency transfer to proceed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert>
                    <Wallet className="h-4 w-4" />
                    <AlertDescription>
                      You'll need to approve the transaction in your wallet. Make sure you have enough{" "}
                      {selectedCurrency} and ETH for gas fees.
                    </AlertDescription>
                  </Alert>

                  <Card className="bg-slate-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Currency:</span>
                          <span className="font-medium">{selectedCurrency}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Amount to Transfer:</span>
                          <span className="font-mono font-medium">
                            {Number.parseFloat(investmentAmount).toFixed(2)} {selectedCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Network:</span>
                          <span className="font-medium">Ethereum Sepolia</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Estimated Gas:</span>
                          <span className="font-mono">~0.002 ETH</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {isProcessingPayment && (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Processing blockchain transfer... Please confirm the transaction in your wallet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === steps.length - 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Review & Confirm</span>
                  </CardTitle>
                  <CardDescription>Please review your investment details before confirming</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Investment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Investment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Token:</span>
                          <span className="font-medium">
                            {token.symbol} - {token.name}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Investment Amount:</span>
                          {/* <span className="font-mono">${Number.parseFloat(investmentAmount).toLocaleString()}</span> */}
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tokens to Receive:</span>
                          <span className="font-mono font-medium">
                            {calculateTokenAmount().toFixed(4)} {token.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Token Price:</span>
                          <span className="font-mono">${token.initialPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Expected APY:</span>
                          <span className="font-medium text-green-600">{token.apy}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Payment Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Method:</span>
                          <span className="font-medium capitalize">{paymentMethod.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Currency:</span>
                          <span className="font-medium">
                            {paymentMethod === "bank_transfer" ? bankDetails.currency : selectedCurrency}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Platform Fee:</span>
                          <span className="font-mono">${(Number.parseFloat(investmentAmount) * 0.005).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Payment Fee:</span>
                          <span className="font-mono">
                            $
                            {paymentMethod === "bank_transfer"
                              ? "25.00"
                              : paymentMethod === "stablecoin"
                                ? "2.00"
                                : "5.00"}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total Amount:</span>
                          <span className="font-mono text-lg">${calculateTotal().toFixed(2)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bank Details Summary */}
                  {paymentMethod === "bank_transfer" && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <span>Bank Transfer Details</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Bank:</span>
                            <p className="font-medium">{bankDetails.bankName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Holder:</span>
                            <p className="font-medium">{bankDetails.accountHolderName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Account Number:</span>
                            <p className="font-mono">****{bankDetails.accountNumber.slice(-4)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Currency:</span>
                            <p className="font-medium">{bankDetails.currency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compliance Check */}
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span>Compliance Status</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {investorData &&
                          Object.entries(investorData.claimStatus).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              {value ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                              )}
                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      By confirming this investment, you acknowledge that you have read and agree to the terms and
                      conditions, understand the risks involved, and confirm that all provided information is accurate.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={currentStep === 0 ? handleClose : handleBack} disabled={isSubmitting}>
              {currentStep === 0 ? "Cancel" : "Back"}
            </Button>

            <Button
              onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
              disabled={isSubmitting || isProcessingPayment}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Confirm Investment
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default InvestmentModal