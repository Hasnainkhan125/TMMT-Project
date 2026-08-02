import React, { createContext, useContext, useReducer } from "react"
import type { FormState, ServiceType, UploadedFile } from "../types"
import { SpeedTier } from "../types"

/**
 * Form Action Types
 */
export type FormAction =
  | { type: "SELECT_SERVICE"; payload: ServiceType }
  | { type: "SET_STEP"; payload: number }
  | { type: "SET_IDENTIFIER"; payload: { field: string; value: any } }
  | { type: "ADD_DOCUMENT"; payload: UploadedFile }
  | { type: "REMOVE_DOCUMENT"; payload: string } // document id
  | { type: "UPDATE_DOCUMENT_PROGRESS"; payload: { documentId: string; progress: number } }
  | { type: "COMPLETE_DOCUMENT_UPLOAD"; payload: { documentId: string; uploadedUrl: string; uploadedAt: Date } }
  | { type: "FAIL_DOCUMENT_UPLOAD"; payload: { documentId: string; error: string } }
  | { type: "SET_SPEED_TIER"; payload: SpeedTier }
  | { type: "SET_TOTAL_PRICE"; payload: number }
  | { type: "SET_ERROR"; payload: { field: string; message: string } }
  | { type: "CLEAR_ERROR"; payload: string } // field
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "RESET_FORM" }

/**
 * Form Context Type
 */
export interface FormContextType {
  state: FormState
  dispatch: React.Dispatch<FormAction>
  selectService: (service: ServiceType) => void
  setStep: (step: number) => void
  setIdentifier: (field: string, value: any) => void
  addDocument: (document: UploadedFile) => void
  removeDocument: (documentId: string) => void
  updateDocumentProgress: (documentId: string, progress: number) => void
  completeDocumentUpload: (documentId: string, uploadedUrl: string, uploadedAt: Date) => void
  failDocumentUpload: (documentId: string, error: string) => void
  setSpeedTier: (tier: SpeedTier) => void
  setTotalPrice: (price: number) => void
  setError: (field: string, message: string) => void
  clearError: (field: string) => void
  setSubmitting: (submitting: boolean) => void
  resetForm: () => void
}

/**
 * Initial Form State
 */
const initialFormState: FormState = {
  selectedService: null,
  step: 1,
  identifiers: {},
  documents: [],
  speedTier: SpeedTier.STANDARD,
  totalPrice: 0,
  isSubmitting: false,
  errors: {},
}

/**
 * Form Reducer
 */
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SELECT_SERVICE":
      return {
        ...initialFormState,
        selectedService: action.payload,
        step: 1,
      }

    case "SET_STEP":
      return {
        ...state,
        step: action.payload,
      }

    case "SET_IDENTIFIER":
      return {
        ...state,
        identifiers: {
          ...state.identifiers,
          [action.payload.field]: action.payload.value,
        },
        // Clear error for this field when it's being edited
        errors: {
          ...state.errors,
          [action.payload.field]: undefined,
        },
      }

    case "ADD_DOCUMENT":
      return {
        ...state,
        documents: [...state.documents, action.payload],
      }

    case "REMOVE_DOCUMENT":
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload),
      }

    case "UPDATE_DOCUMENT_PROGRESS":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.documentId
            ? { ...doc, uploadProgress: action.payload.progress }
            : doc
        ),
      }

    case "COMPLETE_DOCUMENT_UPLOAD":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                status: "success",
                uploadedUrl: action.payload.uploadedUrl,
                uploadedAt: action.payload.uploadedAt,
                uploadProgress: 100,
              }
            : doc
        ),
      }

    case "FAIL_DOCUMENT_UPLOAD":
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.documentId
            ? {
                ...doc,
                status: "error",
                error: action.payload.error,
              }
            : doc
        ),
      }

    case "SET_SPEED_TIER":
      return {
        ...state,
        speedTier: action.payload,
      }

    case "SET_TOTAL_PRICE":
      return {
        ...state,
        totalPrice: action.payload,
      }

    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: undefined,
        },
      }

    case "SET_SUBMITTING":
      return {
        ...state,
        isSubmitting: action.payload,
      }

    case "RESET_FORM":
      return initialFormState

    default:
      return state
  }
}

/**
 * Form Context
 */
const FormContext = createContext<FormContextType | undefined>(undefined)

/**
 * useForm Hook
 */
export const useForm = () => {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider")
  }
  return context
}

/**
 * FormProvider Component
 */
export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(formReducer, initialFormState)

  const selectService = (service: ServiceType) => {
    dispatch({ type: "SELECT_SERVICE", payload: service })
  }

  const setStep = (step: number) => {
    dispatch({ type: "SET_STEP", payload: step })
  }

  const setIdentifier = (field: string, value: any) => {
    dispatch({ type: "SET_IDENTIFIER", payload: { field, value } })
  }

  const addDocument = (document: UploadedFile) => {
    dispatch({ type: "ADD_DOCUMENT", payload: document })
  }

  const removeDocument = (documentId: string) => {
    dispatch({ type: "REMOVE_DOCUMENT", payload: documentId })
  }

  const updateDocumentProgress = (documentId: string, progress: number) => {
    dispatch({ type: "UPDATE_DOCUMENT_PROGRESS", payload: { documentId, progress } })
  }

  const completeDocumentUpload = (documentId: string, uploadedUrl: string, uploadedAt: Date) => {
    dispatch({
      type: "COMPLETE_DOCUMENT_UPLOAD",
      payload: { documentId, uploadedUrl, uploadedAt },
    })
  }

  const failDocumentUpload = (documentId: string, error: string) => {
    dispatch({ type: "FAIL_DOCUMENT_UPLOAD", payload: { documentId, error } })
  }

  const setSpeedTier = (tier: SpeedTier) => {
    dispatch({ type: "SET_SPEED_TIER", payload: tier })
  }

  const setTotalPrice = (price: number) => {
    dispatch({ type: "SET_TOTAL_PRICE", payload: price })
  }

  const setError = (field: string, message: string) => {
    dispatch({ type: "SET_ERROR", payload: { field, message } })
  }

  const clearError = (field: string) => {
    dispatch({ type: "CLEAR_ERROR", payload: field })
  }

  const setSubmitting = (submitting: boolean) => {
    dispatch({ type: "SET_SUBMITTING", payload: submitting })
  }

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" })
  }

  const value: FormContextType = {
    state,
    dispatch,
    selectService,
    setStep,
    setIdentifier,
    addDocument,
    removeDocument,
    updateDocumentProgress,
    completeDocumentUpload,
    failDocumentUpload,
    setSpeedTier,
    setTotalPrice,
    setError,
    clearError,
    setSubmitting,
    resetForm,
  }

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export { FormContext }
