'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useForm } from '@/contexts/FormContext'
import type { FormState, ServiceType } from '@/types'

/**
 * useFormDraft Hook
 *
 * Provides localStorage-based form draft functionality:
 * - Auto-saves form state to localStorage on changes (debounced 500ms)
 * - Loads draft from localStorage on component mount
 * - Supports resuming incomplete applications
 * - Clears draft after successful submission
 *
 * @returns Object with clearDraft function
 */
export const useFormDraft = () => {
  const { state, selectService, setStep, setIdentifier, setSpeedTier, addDocument } = useForm()
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDraftLoadedRef = useRef(false)

  const getDraftKey = (serviceType: ServiceType | null): string => {
    if (!serviceType) return ''
    return `tmmat_form_draft_${serviceType}`
  }

  /**
   * Save form state to localStorage (debounced)
   */
  const saveDraft = useCallback(() => {
    if (!state.selectedService) return

    const draftKey = getDraftKey(state.selectedService)
    const draftData = {
      selectedService: state.selectedService,
      step: state.step,
      identifiers: state.identifiers,
      speedTier: state.speedTier,
      documentIds: state.documents.map((doc) => doc.id),
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(draftKey, JSON.stringify(draftData))
    } catch (error) {
      console.error('Failed to save form draft to localStorage:', error)
    }
  }, [state.selectedService, state.step, state.identifiers, state.speedTier, state.documents])

  /**
   * Clear draft from localStorage
   */
  const clearDraft = useCallback(() => {
    if (!state.selectedService) return

    const draftKey = getDraftKey(state.selectedService)
    try {
      localStorage.removeItem(draftKey)
    } catch (error) {
      console.error('Failed to clear form draft from localStorage:', error)
    }
  }, [state.selectedService])

  /**
   * Load draft from localStorage on mount or when service changes
   */
  useEffect(() => {
    // Only load draft once per component mount
    if (isDraftLoadedRef.current) return

    const draftKey = getDraftKey(state.selectedService)
    if (!draftKey) return

    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft) as {
          selectedService: ServiceType
          step: number
          identifiers: Record<string, any>
          speedTier: string
          documentIds: string[]
          savedAt: string
        }

        // Restore form state from draft
        if (draftData.selectedService) {
          selectService(draftData.selectedService)
        }

        if (draftData.step) {
          setStep(draftData.step)
        }

        if (draftData.identifiers) {
          Object.entries(draftData.identifiers).forEach(([field, value]) => {
            setIdentifier(field, value)
          })
        }

        if (draftData.speedTier) {
          setSpeedTier(draftData.speedTier as any)
        }

        // Note: Documents are not restored automatically due to file handling complexity
        // TODO: Implement resume draft prompt for document recovery

        isDraftLoadedRef.current = true
      }
    } catch (error) {
      console.error('Failed to load form draft from localStorage:', error)
    }
  }, [])

  /**
   * Auto-save on form state changes (debounced)
   */
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer for debounced save
    debounceTimerRef.current = setTimeout(() => {
      saveDraft()
    }, 500)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [state.selectedService, state.step, state.identifiers, state.speedTier, state.documents, saveDraft])

  return { clearDraft }
}
