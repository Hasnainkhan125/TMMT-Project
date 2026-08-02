import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { SERVICE_SCHEMAS, getServiceMetadata, PRICING } from '@/config/services'
import { useForm } from '@/contexts/FormContext'
import { useAuth } from '@/contexts/AuthContext'
import { checksApi } from '@/api/checks'

/**
 * FormStep4Review Component
 *
 * Fourth step of multi-step form wizard - Order Review & Submission
 * - Summary card with:
 *   - Service name and icon
 *   - Identifiers (masked: last 4 of passport, last 4 of Emirates ID)
 *   - Uploaded files list (name, size)
 *   - Speed tier and pricing
 * - Show total price prominently (gold, large font)
 * - Trust line: "🔒 Submitted to ICP-authorized typing centre..."
 * - CTA button: "Pay AED X & Submit" (full width, gold, calls checksApi.createApplication)
 * - Handle submission: show spinner, call API, redirect to Stripe checkout
 */
const FormStep4Review: React.FC = () => {
  const navigate = useNavigate()
  const { state, setStep, setSubmitting, resetForm } = useForm()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setLocalSubmitting] = useState(false)

  if (!state.selectedService) {
    return <div className="text-center text-red-500">No service selected</div>
  }

  const schema = SERVICE_SCHEMAS[state.selectedService]
  const metadata = getServiceMetadata(state.selectedService)

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Mask sensitive identifiers (show only last 4 chars)
   */
  const maskIdentifier = (value: string | undefined, label: string): string => {
    if (!value) return 'Not provided'
    if (value.length <= 4) return value
    const masked = '*'.repeat(value.length - 4) + value.slice(-4)
    return `${masked} (last 4: ${value.slice(-4)})`
  }

  /**
   * Get identifier display name
   */
  const getIdentifierLabel = (fieldName: string): string => {
    const field = schema.identifierFields.find((f) => f.name === fieldName)
    return field?.label || fieldName
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      setError(null)
      setLocalSubmitting(true)
      setSubmitting(true)

      // Prepare request payload
      const payload = {
        serviceType: state.selectedService,
        identifiers: state.identifiers,
        documentIds: state.documents
          .filter((doc) => doc.status === 'success')
          .map((doc) => doc.id),
        speedTier: state.speedTier,
        pricing: {
          amount: state.totalPrice,
          currency: 'AED',
        },
      }

      // Call API to create application
      const response = await checksApi.createApplication(payload)

      // Redirect to checkout URL
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl
      } else {
        throw new Error('No checkout URL received from server')
      }

      // Reset form after successful submission
      resetForm()
    } catch (err) {
      console.error('Submission error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while submitting your application. Please try again.'
      )
    } finally {
      setLocalSubmitting(false)
      setSubmitting(false)
    }
  }

  /**
   * Handle back button
   */
  const handleBack = () => {
    if (!isSubmitting) {
      setStep(3)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Order</h1>
        <p className="text-gray-600">Step 4 of 4: Confirm and submit</p>
      </div>

      {/* Summary Card */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Service Header */}
        <div className="bg-gradient-to-r from-gold-50 to-gold-100 p-6 border-b border-gold-200">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{metadata.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{metadata.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {state.speedTier === 'fast_track'
                  ? '⚡ Fast-Track Processing'
                  : '📋 Standard Processing'}
              </p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="divide-y divide-gray-200">
          {/* Identifiers */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Details</h3>
            <div className="space-y-3">
              {Object.entries(state.identifiers).map(([key, value]) => {
                // Skip empty or null values
                if (!value) return null
                // Mask sensitive fields
                const isSensitive =
                  key.includes('emiratesId') ||
                  key.includes('passport') ||
                  key.includes('card')
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-gray-600">{getIdentifierLabel(key)}:</span>
                    <span className="font-medium text-gray-900">
                      {isSensitive
                        ? maskIdentifier(String(value), getIdentifierLabel(key))
                        : String(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documents */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Uploaded Files</h3>
            {state.documents.filter((doc) => doc.status === 'success').length > 0 ? (
              <div className="space-y-3">
                {state.documents
                  .filter((doc) => doc.status === 'success')
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">✓</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            )}
          </div>

          {/* Pricing Summary */}
          <div className="p-6 bg-gray-50">
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Service Type:</span>
                <span className="font-medium text-gray-900">
                  {metadata.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Processing Speed:</span>
                <span className="font-medium text-gray-900">
                  {state.speedTier === 'fast_track'
                    ? `Fast-Track (AED ${PRICING.FAST_TRACK})`
                    : `Standard (AED ${PRICING.STANDARD})`}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-300 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Amount:</span>
                <span className="text-4xl font-bold text-gold-600">
                  AED {state.totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Security Line */}
      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl leading-none">🔒</span>
          <div>
            <p className="text-sm text-gray-700">
              Submitted to <strong>ICP-authorized typing centre</strong> via secure encryption.
              Your data is protected with industry-standard security protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg mt-1">💳</span>
          <div>
            <p className="text-sm text-gray-700">
              You'll be redirected to our secure payment gateway. We accept all major
              credit and debit cards. Your payment is encrypted and safe.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-lg mt-1">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          disabled={isSubmitting}
          className={`
            flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold
            transition ${isSubmitting
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`
            flex-1 px-6 py-4 rounded-lg font-semibold text-white text-lg
            transition flex items-center justify-center gap-2
            ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gold-500 hover:bg-gold-600'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>💳 Pay AED {state.totalPrice} & Submit</span>
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Questions? <a href="#" className="text-gold-600 hover:underline">Contact support</a></p>
      </div>
    </div>
  )
}

export default FormStep4Review
