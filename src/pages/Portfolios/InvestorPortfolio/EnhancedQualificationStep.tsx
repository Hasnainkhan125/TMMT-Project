"use client"

import type React from "react"
import { useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Layout } from "@/layout/Layout"
import { Button } from "@/components/ui/button"
import { ProgressStepper } from "@/components/ui/progress-stepper"
import { InvestorTypeSelector } from "@/components/Onboarding/InvestorTypeSelector"
import { CountrySelector } from "@/components/Onboarding/CountrySelector"
import { Checkbox } from "@/components/ui/checkbox"
import { PersonalInfoForm } from "@/components/Onboarding/PersonalInfoForm"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  CheckCircle,
  Plus,
  Copy,
  Wallet,
  Eye,
  Download,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import { submitKYCVerification } from "@/api/kyc-api"

interface UploadedFile {
  id: string
  name: string  
  size: number
  type: string
  url: string
  uploadedAt: Date
  documentType: string
}

const EnhancedQualificationStep = () => {
  const navigate = useNavigate()
  const { open } = useAppKit()
  const { address } = useAccount()
  const {tokensymbol} = useParams()
  console.log(tokensymbol,"tokensymbol")
  // State management
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  // Form data
  const [investorType, setInvestorType] = useState("individual")
  const [country, setCountry] = useState("")
  const [agreements, setAgreements] = useState({
    agreement1: false,
    agreement2: false,
    agreement3: false,
  })
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    nationality: "",
    birthPlace: "",
    idExpiration: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    sourceOfWealth: "employment",
    sourceOfFunds: "property-sale",
    taxId: "",
    email: "",
  })

  // Wallet and documents
  const [walletConnected, setWalletConnected] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])
  const [walletAccounts, setWalletAccounts] = useState<string[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>("")
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccountAddress, setNewAccountAddress] = useState("")
  const [showAccountList, setShowAccountList] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState<string | null>(null)

  // Auth token - In production, this should come from your auth system
  const [authToken] = useState(
    process.env.NEXT_PUBLIC_KYC_AUTH_TOKEN ||
      "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3Ny1NUVdFRTNHZE5adGlsWU5IYmpsa2dVSkpaWUJWVmN1UmFZdHl5ejFjIn0.eyJleHAiOjE3NDg0NjgyMjUsImlhdCI6MTc0ODQzMjIyNSwianRpIjoiM2UxYTM0NDAtYzEzZC00NGRlLThkYjYtMTk2MmQwNzAzMmQ4IiwiaXNzIjoiaHR0cDovL2tleWNsb2FrLXNlcnZpY2Uua2V5Y2xvYWsuc3ZjLmNsdXN0ZXIubG9jYWw6ODA4MC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImJhNzc4OTZmLTdjMWYtNDUwMS1iNGY2LTU0N2E3ZDI2ZGRlNiIsInR5cCI6IkJlYXJlciIsImF6cCI6IkhPTEFDUkFDWV9tb2JpdXMiLCJzaWQiOiI0OGM5MzRiNy0zMmI4LTRjYjAtODc4Yi02MmUxMzVjOTJjMTUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbIi8qIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJIT0xBQ1JBQ1lfbW9iaXVzIjp7InJvbGVzIjpbIkhPTEFDUkFDWV9VU0VSIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJyZXF1ZXN0ZXJUeXBlIjoiVEVOQU5UIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJ4cHggeHB4IiwidGVuYW50SWQiOiJiYTc3ODk2Zi03YzFmLTQ1MDEtYjRmNi01NDdhN2QyNmRkZTYiLCJwbGF0Zm9ybUlkIjoibW9iaXVzIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicGFzc3dvcmRfdGVuYW50X3hweEBnYWlhbnNvbHV0aW9ucy5jb20iLCJnaXZlbl9uYW1lIjoieHB4IiwiZmFtaWx5X25hbWUiOiJ4cHgiLCJlbWFpbCI6InBhc3N3b3JkX3RlbmFudF94cHhAZ2FpYW5zb2x1dGlvbnMuY29tIn0.M34dj5aG86FdXd-Jkn3kxbazoRFDVztGvy916YfnZLIxGf2VLp2Z0GaDrXOvWXAk3DLgtJmbNrVg41wqtoYdlEXRbcymmo4fqD5a7KURmidPtBrtSqGrdWsz7xPmiuINpw04bOLir4I23HcyAJUbVL9tqdhJ_AnGNBlLnr5071wy1z0YY5Qi-_4oiOegm9mdsHFHdf9LFgBxvcDg36TQGw3LlhoJX6-_OVXP9f_K79gnTXDBbH6UtlA96bacVFeJyNYc3BG39YvRdJ4F1evibDTpzQcg9mL8bnYIDFDG9PhkX3wXaDZFB05j9WUH-MG08akcDiyJPXv7DY3tbaj0SQ",
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  const requiredDocuments = [
    {
      id: "identity",
      name: "Identity Document (Passport or ID Card)",
      description: "Required",
      acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: "address",
      name: "Proof of Address",
      description: "Required",
      acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: "bank",
      name: "Bank Statement",
      description: "Required",
      acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
    {
      id: "funds",
      name: "Source of Funds Documentation",
      description: "Required",
      acceptedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
      maxSize: 10 * 1024 * 1024, // 10MB
    },
  ]

  const getSteps = () => [
    {
      title: "Investor Type & Country",
      completed: completedSteps.includes(0),
      current: currentStep === 0,
    },
    {
      title: "Agreements",
      completed: completedSteps.includes(1),
      current: currentStep === 1,
    },
    {
      title: "Personal Information",
      completed: completedSteps.includes(2),
      current: currentStep === 2,
    },
    {
      title: "Wallet Connection",
      completed: completedSteps.includes(3),
      current: currentStep === 3,
    },
    {
      title: "Document Upload",
      completed: completedSteps.includes(4),
      current: currentStep === 4,
    },
    {
      title: "Complete",
      completed: completedSteps.includes(5),
      current: currentStep === 5,
    },
  ]

  const handleNext = () => {
      if (currentStep === 4) {
        console.log("handleNext kyc is being submitted")
        handleSubmitKYC();
      }

    if (currentStep < 5) {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSubmitKYC = async () => {
    console.log("Submitting KYC...")
    setIsSubmitting(true)
    setSubmissionError(null)
    console.log("handleSubmitKYC is being called")
    try {
      // Validate required fields
      if (!selectedAccount) {
        throw new Error("Please select a wallet account")
      }

      if (uploadedFiles.length < requiredDocuments.length) {
        throw new Error("Please upload all required documents")
      }

      if (!Object.values(agreements).every(Boolean)) {
        throw new Error("Please accept all agreements")
      }

      // Get token data and submit KYC
      toast.loading("Getting token information...", { id: "kyc-submit" })

      const result = await submitKYCVerification(
        tokensymbol!,
        investorType,
        country,
        agreements,
        personalData,
        selectedAccount,
        uploadedFiles,
        authToken,
      )

      toast.success("KYC verification submitted successfully!", { id: "kyc-submit" })

      console.log("KYC Submission Result:", result)

      // Navigate to success page or show success state
      setCurrentStep(5)
      setCompletedSteps((prev) => [...prev, 4, 5])
    } catch (error) {
      console.error("KYC Submission Error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to submit KYC verification"
      setSubmissionError(errorMessage)
      toast.error(errorMessage, { id: "kyc-submit" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setSubmissionError(null)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex) || stepIndex === currentStep) {
      setCurrentStep(stepIndex)
      setSubmissionError(null)
    }
  }

  const handleAgreementChange = (key: string, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }))
  }

  const handlePersonalDataChange = (data: Partial<typeof personalData>) => {
    setPersonalData((prev) => ({ ...prev, ...data }))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File, documentType: string): { valid: boolean; error?: string } => {
    const doc = requiredDocuments.find((d) => d.id === documentType)
    if (!doc) return { valid: false, error: "Invalid document type" }

    if (file.size > doc.maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${formatFileSize(doc.maxSize)}`,
      }
    }

    if (!doc.acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Accepted types: ${doc.acceptedTypes.join(", ")}`,
      }
    }

    return { valid: true }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const documentType = event.target.getAttribute("data-document-type")

    if (!file || !documentType) return

    const validation = validateFile(file, documentType)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }

    const existingFile = uploadedFiles.find((f) => f.documentType === documentType)

    if (existingFile) {
      toast.error("A file for this document type already exists. Please remove it first.")
      return
    }

    setUploading(documentType)

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const fileUrl = URL.createObjectURL(file)
      const uploadedFile: UploadedFile = {
        id: `${documentType}-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        uploadedAt: new Date(),
        documentType,
      }

      setUploadedFiles((prev) => [...prev, uploadedFile])
      setUploadedDocs((prev: any) => [...prev, uploadedFile?.documentType])

      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      toast.error("Failed to upload file. Please try again.")
    } finally {
      setUploading(null)
    }

    event.target.value = ""
  }

  const removeFile = (fileId: string) => {
    const file = uploadedFiles.find((f) => f.id === fileId)
    if (file) {
      URL.revokeObjectURL(file.url)
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
      setUploadedDocs((prev: any) => prev.filter((doc: any) => doc !== file?.documentType))
      toast.success("File removed")
    }
  }

  const previewFile = (file: UploadedFile) => {
    window.open(file.url, "_blank")
  }

  const downloadFile = (file: UploadedFile) => {
    const link = document.createElement("a")
    link.href = file.url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return "🖼️"
    } else if (fileType === "application/pdf") {
      return "📄"
    }
    return "📎"
  }

  // Wallet management functions
  const addCurrentAccount = () => {
    if (address && !walletAccounts.includes(address)) {
      setWalletAccounts((prev) => [...prev, address])
      setSelectedAccount(address)
      setWalletConnected(true)
      toast.success("Current wallet account added to list")
    }
  }

  const addManualAccount = () => {
    if (newAccountAddress && !walletAccounts.includes(newAccountAddress)) {
      setWalletAccounts((prev) => [...prev, newAccountAddress])
      setSelectedAccount(newAccountAddress)
      setNewAccountAddress("")
      setShowAddAccount(false)
      setWalletConnected(true)
      toast.success("Manual account added to list")
    } else if (walletAccounts.includes(newAccountAddress)) {
      toast.error("Account already exists in list")
    }
  }

  const selectAccount = (account: string) => {
    setSelectedAccount(account)
    setWalletConnected(true)
    toast.success("Account selected")
  }

  const removeAccount = (account: string) => {
    setWalletAccounts((prev) => prev.filter((acc) => acc !== account))
    if (selectedAccount === account) {
      setSelectedAccount("")
      setWalletConnected(false)
    }
    toast.success("Account removed from list")
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success("Address copied to clipboard")
  }

  const validateAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return investorType && country
      case 1:
        return Object.values(agreements).every(Boolean)
      case 2:
        return personalData.firstName && personalData.lastName && personalData.nationality
      case 3:
        return walletConnected && selectedAccount
      case 4:
        return uploadedDocs.length >= requiredDocuments.length
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Next, select your investor type: 'Individual' or 'Institution.' For this demo, we will proceed as
                'Individual.'
              </h3>
            </div>
            <InvestorTypeSelector value={investorType} onChange={setInvestorType} />
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">Next, select your country of residency from the dropdown list.</h3>
            </div>
            <CountrySelector value={country} onChange={setCountry} />
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                If the Issuer has configured any mandatory Agreement points, they will be displayed here. Please review
                them.
              </h3>
            </div>
            <div className="mb-6">
              <p className="mb-6 text-foreground">To begin, please review and accept the outlined agreements.</p>
              <div className="space-y-6">
                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement1"
                    checked={agreements.agreement1}
                    onCheckedChange={(checked) => handleAgreementChange("agreement1", checked as boolean)}
                  />
                  <div className="text-sm">
                    <p className="mb-2 font-medium">
                      Risk Disclosure Agreement: I acknowledge that investing in security tokens involves risk of loss
                      of capital, and past performance does not guarantee future results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement2"
                    checked={agreements.agreement2}
                    onCheckedChange={(checked) => handleAgreementChange("agreement2", checked as boolean)}
                  />
                  <div className="text-sm">
                    <p>
                      Terms of Service: I agree to the Terms of Service and understand my rights and obligations as an
                      investor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 rounded-lg border border-purple-300 bg-purple-50 p-4">
                  <Checkbox
                    id="agreement3"
                    checked={agreements.agreement3}
                    onCheckedChange={(checked) => handleAgreementChange("agreement3", checked as boolean)}
                  />
                  <div className="text-sm">
                    <p>
                      KYC Consent: I consent to identity verification and data processing for regulatory compliance
                      purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Complete the 'Main information' section by providing your investor profile and investment-related
                information.
              </h3>
            </div>
            <PersonalInfoForm data={personalData} onChange={handlePersonalDataChange} />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                Connect your wallet to proceed with the qualification process. This will be used for your ONCHAINID
                deployment.
              </h3>
            </div>
            <div className="space-y-6">
              {address && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Wallet className="h-6 w-6 text-green-500" />
                      <div>
                        <h3 className="font-medium text-foreground">Current Wallet</h3>
                        <p className="text-sm text-text-secondary">{address}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => copyAddress(address)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button onClick={addCurrentAccount} disabled={walletAccounts.includes(address)} size="sm">
                        {walletAccounts.includes(address) ? "Added" : "Add to List"}
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">Wallet Accounts</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setShowAccountList(!showAccountList)}>
                      {showAccountList ? "Hide" : "Show"} Accounts ({walletAccounts.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowAddAccount(!showAddAccount)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manual
                    </Button>
                  </div>
                </div>
              </Card>

              {showAddAccount && (
                <div className="mb-4 rounded-lg border border-border bg-surface-light p-4">
                  <h4 className="mb-2 font-medium text-foreground">Add Manual Account</h4>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter wallet address (0x...)"
                      value={newAccountAddress}
                      onChange={(e) => setNewAccountAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addManualAccount} disabled={!validateAddress(newAccountAddress)} size="sm">
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddAccount(false)
                        setNewAccountAddress("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                  {newAccountAddress && !validateAddress(newAccountAddress) && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid Ethereum address</p>
                  )}
                </div>
              )}

              {showAccountList && (
                <div className="space-y-3">
                  {walletAccounts.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No accounts added yet. Connect a wallet or add manually.
                    </p>
                  ) : (
                    walletAccounts.map((account, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          selectedAccount === account ? "border-green-500 bg-green-50" : "border-border bg-background"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                            <span className="text-xs font-medium">{account.slice(2, 6).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {account.slice(0, 6)}...{account.slice(-4)}
                            </p>
                            <p className="text-xs text-gray-500">{account}</p>
                          </div>
                          {selectedAccount === account && (
                            <Badge className="bg-green-100 text-green-800">Selected</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => copyAddress(account)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          {selectedAccount !== account && (
                            <Button onClick={() => selectAccount(account)} size="sm">
                              Select
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeAccount(account)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedAccount && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-900">Selected Account</h4>
                      <p className="text-sm text-green-700">{selectedAccount}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ready to Proceed</Badge>
                  </div>
                </div>
              )}

              {!address && (
                <div className="mt-4 text-center">
                  <p className="mb-4 text-text-secondary">Connect your wallet to add accounts automatically</p>
                  <Button onClick={() => open()} size="lg">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h3 className="mb-2 font-medium">
                These are the documents specified by the Issuer as mandatory for your investor qualification process.
                Please proceed to upload the required documents.
              </h3>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">Required Documents</h3>
              <p className="text-text-secondary">Please upload the following documents to complete your qualification:</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                {requiredDocuments.map((doc, index) => {
                  const uploadedFile = uploadedFiles.find((f) => f.documentType === doc.id)
                  const isUploading = uploading === doc.id

                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <h4 className="text-sm font-medium">{doc.name}</h4>
                              <p className="text-xs text-gray-500">Required</p>
                            </div>
                          </div>
                          <div className="flex ml-0 mt-2 items-center space-x-2">
                            {uploadedFile ? (
                              <div>
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-6 w-6 text-green-500" />
                                  <span className="text-sm text-gray-500">
                                    {getFileIcon(uploadedFile.type)} {uploadedFile.name.slice(0, 10)}...
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="space-y-2 text-sm">
                                  <Input className="hidden" id="file" type="file" placeholder="File" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadedFile ? (
                            <>
                              <Button variant="outline" size="sm" onClick={() => previewFile(uploadedFile)}>
                                <Eye className="mr-1 h-4 w-4" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => downloadFile(uploadedFile)}>
                                <Download className="mr-1 h-4 w-4" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFile(uploadedFile.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="mr-1 h-4 w-4" />
                                Remove
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              {isUploading ? (
                                <>
                                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-border border-t-blue-600" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 border border-border rounded-md p-2 bg-slate-100 cursor-pointer">
                                    <input
                                      type="file"
                                      id="file"
                                      data-document-type={doc.id}
                                      className=""
                                      onChange={handleFileSelect}
                                      accept=".jpg,.jpeg,.png,.pdf"
                                    />
                                    <Upload className="mr-2 h-4 w-4" />
                                    <span className="text-sm">Upload</span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> At this stage, the Issuer can choose to proceed without activation or opt to
                activate one of the integrated third-party KYC solutions.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground">Application Submitted Successfully!</h1>
              <p className="text-text-secondary">
                You submitted your Investor profile for review. Great job! The Issuer will now initiate their KYC/AML
                verification process.
              </p>
            </div>
            <div className="rounded-lg bg-purple-500 p-6 text-white">
              <h4 className="mb-2 font-medium">
                Congratulations! Your self-managed blockchain-based and reusable investment passport, ONCHAINID, has
                been successfully deployed. You are now a qualified investor and can begin investing in the Green Brew
                Token.
              </h4>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Layout>
      <div className="mx-auto p-8">
        <div className="mb-8">
          <div className="mb-6 flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-sm font-bold text-white">
              GBB
            </div>
            <span className="text-text-secondary">Green Brew Bond</span>
            <span className="text-gray-400">› Qualification</span>
          </div>
          <ProgressStepper steps={getSteps()} onStepClick={handleStepClick} allowStepNavigation={true} />
        </div>

        {/* Error Display */}
        {submissionError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{submissionError}</AlertDescription>
          </Alert>
        )}

        <div className="rounded-lg border border-border bg-background p-8">
          {renderStepContent()}
          <div className="mt-8 flex justify-between">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {currentStep < 5 ? (
              <Button onClick={handleNext} disabled={!canProceedToNext() || isSubmitting} className="px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentStep === 4 ? "Submitting..." : "Processing..."}
                  </>
                ) : currentStep === 4 ? (
                  "Complete Application"
                ) : (
                  "Continue"
                )}
              </Button>
            ) : (
              <Button onClick={() => navigate("/qualification/kyc-status")} className="px-8">
                Return to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EnhancedQualificationStep
