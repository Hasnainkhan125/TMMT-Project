import React, { useState, useEffect } from 'react'
import { SpeedTier, type ServiceType } from '@/types'
import { PRICING, getServiceMetadata } from '@/config/services'
import { useForm } from '@/contexts/FormContext'

/**
 * FormStep3Pricing Component
 *
 * Third step of multi-step form wizard
 * - Two radio card options: Standard (24-48h, AED 20) vs Fast-track (24h, AED 50)
 * - Calculate price based on selection
 * - Show dismissible bundle offer banner: "💰 Save 50% — Get 5 checks for AED 50"
 * - Show info note for fast-track: "Priority queue · Start within 2 hours"
 * - Include Back and Continue (Review Order) buttons
 */
const FormStep3Pricing: React.FC = () => {
  const { state, setStep, setSpeedTier, setTotalPrice } = useForm()
  const [showBundleOffer, setShowBundleOffer] = useState(true)

  if (!state.selectedService) {
    return <div className="text-center text-red-500">No service selected</div>
  }

  const metadata = getServiceMetadata(state.selectedService)
  const standardPrice = PRICING.STANDARD
  const fastTrackPrice = PRICING.FAST_TRACK

  /**
   * Handle speed tier selection
   */
  const handleSpeedTierSelect = (tier: SpeedTier) => {
    setSpeedTier(tier)

    // Calculate and set total price
    const price = tier === SpeedTier.STANDARD ? standardPrice : fastTrackPrice
    setTotalPrice(price)
  }

  /**
   * Handle continue to review
   */
  const handleContinue = () => {
    setStep(4)
  }

  /**
   * Handle back button
   */
  const handleBack = () => {
    setStep(2)
  }

  const currentPrice =
    state.speedTier === SpeedTier.STANDARD ? standardPrice : fastTrackPrice

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{metadata.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{metadata.title}</h1>
        </div>
        <p className="text-gray-600">Step 3 of 4: Select Speed & Price</p>
      </div>

      {/* Bundle Offer Banner */}
      {showBundleOffer && (
        <div className="mb-8 p-4 bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-300 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold text-gray-900">Save 50%</p>
              <p className="text-sm text-gray-700">
                Get 5 checks for AED 50 (instead of AED 100)
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBundleOffer(false)}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Pricing Options */}
      <div className="space-y-4 mb-8">
        {/* Standard Option */}
        <label
          className={`
            block p-6 border-2 rounded-lg cursor-pointer transition
            ${
              state.speedTier === SpeedTier.STANDARD
                ? 'border-gold-500 bg-gold-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          <div className="flex items-start gap-4">
            <input
              type="radio"
              name="speedTier"
              value={SpeedTier.STANDARD}
              checked={state.speedTier === SpeedTier.STANDARD}
              onChange={() => handleSpeedTierSelect(SpeedTier.STANDARD)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Standard Processing</h3>
                <span className="text-2xl font-bold text-gray-900">AED {standardPrice}</span>
              </div>
              <p className="text-gray-600 mb-3">
                Get your result within 5-10 minutes
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full">
                  ⏱️ 5-10 minutes
                </span>
                <span className="inline-block px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full">
                  📋 Regular queue
                </span>
                <span className="inline-block px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded-full">
                  ✅ ICP-verified
                </span>
              </div>
            </div>
          </div>
        </label>

        {/* Fast-track Option */}
        <label
          className={`
            block p-6 border-2 rounded-lg cursor-pointer transition relative
            ${
              state.speedTier === SpeedTier.FAST_TRACK
                ? 'border-gold-500 bg-gold-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }
          `}
        >
          {/* Popular Badge */}
          <div className="absolute -top-3 right-4 bg-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Popular
          </div>

          <div className="flex items-start gap-4">
            <input
              type="radio"
              name="speedTier"
              value={SpeedTier.FAST_TRACK}
              checked={state.speedTier === SpeedTier.FAST_TRACK}
              onChange={() => handleSpeedTierSelect(SpeedTier.FAST_TRACK)}
              className="mt-1 w-5 h-5 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900">Fast-Track Processing</h3>
                <span className="text-2xl font-bold text-gold-600">AED {fastTrackPrice}</span>
              </div>
              <p className="text-gray-600 mb-3">
                Priority processing with guaranteed completion within 10 minutes
              </p>

              {/* Fast-track features */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">🚀</span>
                  <span>Priority queue · Start within 5 minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">⏰</span>
                  <span>Guaranteed 15-minute completion</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-lg">📞</span>
                  <span>Direct support included</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-block px-3 py-1 bg-gold-100 text-sm text-gold-700 rounded-full">
                  ⚡ 10 minutes max
                </span>
                <span className="inline-block px-3 py-1 bg-gold-100 text-sm text-gold-700 rounded-full">
                  👑 Priority
                </span>
                <span className="inline-block px-3 py-1 bg-gold-100 text-sm text-gold-700 rounded-full">
                  🎯 Start in 2h
                </span>
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Price Summary */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Service Fee ({state.speedTier === SpeedTier.STANDARD ? 'Standard' : 'Fast-Track'}):</span>
          <span className="text-2xl font-bold text-gold-600">AED {currentPrice}</span>
        </div>
        <div className="border-t border-gray-300 pt-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">Total Amount:</span>
            <span className="text-4xl font-bold text-gold-600">AED {state.totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Payment Note */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg mt-1">ℹ️</span>
          <div>
            <p className="font-semibold text-gray-900">Payment Details</p>
            <p className="text-sm text-gray-700 mt-1">
              You'll be redirected to our secure payment gateway to complete your purchase.
              We accept all major credit and debit cards.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 px-6 py-3 bg-gold-500 hover:bg-gold-600 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2"
        >
          <span>Review Order</span>
          <span>→</span>
        </button>
      </div>
    </div>
  )
}

export default FormStep3Pricing
