import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface PersonalInfo {
  firstName: string
  lastName: string
  nationality: string
  birthPlace: string
  dateOfBirth: string
  idExpiration: string
  phoneNumber: string
  address: string
  city: string
  state: string
  zipCode: string
  sourceOfWealth: string
  sourceOfFunds: string
  taxId: string
}

export interface UploadedDocument {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  documentType: "identity" | "address" | "bank" | "funds"
  status: "uploaded" | "verified" | "rejected"
}

export interface KYCData {
  // Step 0: Basic Info
  investorType: "individual" | "institution" | ""
  countryOfResidence: string

  // Step 1: Agreements
  agreements: {
    riskDisclaimer: boolean
    termsOfService: boolean
    privacyPolicy: boolean
    kycConsent: boolean
  }

  // Step 2: Personal Information
  personalInfo: PersonalInfo

  // Step 3: Wallet Connection
  walletAccounts: string[]
  selectedAccount: string

  // Step 4: Documents
  documents: UploadedDocument[]

  // Progress tracking
  currentStep: number
  completedSteps: number[]
  submissionId?: string
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected"
  submittedAt?: Date
  lastUpdated: Date
}

interface KYCStore {
  data: KYCData
  isLoading: boolean
  error: string | null

  // Actions
  updateBasicInfo: (info: Partial<Pick<KYCData, "investorType" | "countryOfResidence">>) => void
  updateAgreements: (agreements: Partial<KYCData["agreements"]>) => void
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void
  updateWalletInfo: (info: Partial<Pick<KYCData, "walletAccounts" | "selectedAccount">>) => void
  addDocument: (document: UploadedDocument) => void
  removeDocument: (documentId: string) => void
  updateDocument: (documentId: string, updates: Partial<UploadedDocument>) => void

  // Step management
  setCurrentStep: (step: number) => void
  completeStep: (step: number) => void

  // Validation
  validateStep: (step: number) => { isValid: boolean; errors: string[] }

  // Submission
  submitKYC: () => Promise<void>

  // Utility
  resetData: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const initialData: KYCData = {
  investorType: "",
  countryOfResidence: "",
  agreements: {
    riskDisclaimer: false,
    termsOfService: false,
    privacyPolicy: false,
    kycConsent: false,
  },
  personalInfo: {
    firstName: "",
    lastName: "",
    nationality: "",
    birthPlace: "",
    dateOfBirth: "",
    idExpiration: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    sourceOfWealth: "",
    sourceOfFunds: "",
    taxId: "",
  },
  walletAccounts: [],
  selectedAccount: "",
  documents: [],
  currentStep: 0,
  completedSteps: [],
  status: "draft",
  lastUpdated: new Date(),
}

export const useKYCStore = create<KYCStore>()(
  persist(
    (set, get) => ({
      data: initialData,
      isLoading: false,
      error: null,

      updateBasicInfo: (info) => {
        set((state) => ({
          data: {
            ...state.data,
            ...info,
            lastUpdated: new Date(),
          },
        }))
      },

      updateAgreements: (agreements) => {
        set((state) => ({
          data: {
            ...state.data,
            agreements: { ...state.data.agreements, ...agreements },
            lastUpdated: new Date(),
          },
        }))
      },

      updatePersonalInfo: (info) => {
        set((state) => ({
          data: {
            ...state.data,
            personalInfo: { ...state.data.personalInfo, ...info },
            lastUpdated: new Date(),
          },
        }))
      },

      updateWalletInfo: (info) => {
        set((state) => ({
          data: {
            ...state.data,
            ...info,
            lastUpdated: new Date(),
          },
        }))
      },

      addDocument: (document) => {
        set((state) => ({
          data: {
            ...state.data,
            documents: [...state.data.documents, document],
            lastUpdated: new Date(),
          },
        }))
      },

      removeDocument: (documentId) => {
        set((state) => ({
          data: {
            ...state.data,
            documents: state.data.documents.filter((doc) => doc.id !== documentId),
            lastUpdated: new Date(),
          },
        }))
      },

      updateDocument: (documentId, updates) => {
        set((state) => ({
          data: {
            ...state.data,
            documents: state.data.documents.map((doc) => (doc.id === documentId ? { ...doc, ...updates } : doc)),
            lastUpdated: new Date(),
          },
        }))
      },

      setCurrentStep: (step) => {
        set((state) => ({
          data: {
            ...state.data,
            currentStep: step,
            lastUpdated: new Date(),
          },
        }))
      },

      completeStep: (step) => {
        set((state) => ({
          data: {
            ...state.data,
            completedSteps: [...new Set([...state.data.completedSteps, step])],
            lastUpdated: new Date(),
          },
        }))
      },

      validateStep: (step) => {
        const { data } = get()
        const errors: string[] = []

        switch (step) {
          case 0:
            if (!data.investorType) errors.push("Investor type is required")
            if (!data.countryOfResidence) errors.push("Country of residence is required")
            break
          case 1:
            if (!Object.values(data.agreements).every(Boolean)) {
              errors.push("All agreements must be accepted")
            }
            break
          case 2:
            if (!data.personalInfo.firstName) errors.push("First name is required")
            if (!data.personalInfo.lastName) errors.push("Last name is required")
            if (!data.personalInfo.nationality) errors.push("Nationality is required")
            if (!data.personalInfo.dateOfBirth) errors.push("Date of birth is required")
            if (!data.personalInfo.phoneNumber) errors.push("Phone number is required")
            if (!data.personalInfo.address) errors.push("Address is required")
            break
          case 3:
            if (!data.selectedAccount) errors.push("Wallet account must be selected")
            break
          case 4:
            const requiredDocs = ["identity", "address", "bank", "funds"]
            const uploadedTypes = data.documents.map((doc) => doc.documentType)
            const missingDocs = requiredDocs.filter((type) => !uploadedTypes.includes(type as any))
            if (missingDocs.length > 0) {
              errors.push(`Missing documents: ${missingDocs.join(", ")}`)
            }
            break
        }

        return { isValid: errors.length === 0, errors }
      },

      submitKYC: async () => {
        set({ isLoading: true, error: null })

        try {
          const { data } = get()

          // Validate all steps
        //   for (let i = 0; i <= 4; i++) {
        //     const validation = get().validateStep(i)
        //     if (!validation.isValid) {
        //       throw new Error(`Step ${i + 1} validation failed: ${validation.errors.join(", ")}`)
        //     }
        //   }

          // Prepare submission data
          const submissionData = {
            ...data,
            submittedAt: new Date(),
            status: "submitted" as const,
          }

          // Here you would make the API call to your backend
          // const response = await submitToClaimIssuer(submissionData)

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000))

          set((state) => ({
            data: {
              ...state.data,
              status: "submitted",
              submittedAt: new Date(),
              submissionId: `KYC-${Date.now()}`,
            },
            isLoading: false,
          }))
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Submission failed",
          })
          throw error
        }
      },

      resetData: () => {
        set({ data: initialData, error: null, isLoading: false })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },
    }),
    {
      name: "kyc-qualification-storage",
      partialize: (state) => ({ data: state.data }),
    },
  ),
)
