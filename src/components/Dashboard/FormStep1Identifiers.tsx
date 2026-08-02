import React, { useState, useCallback } from 'react'
import type { IdentifierField } from '@/types'
import { SERVICE_SCHEMAS, getServiceMetadata } from '@/config/services'
import { useForm } from '@/contexts/FormContext'

/**
 * FormStep1Identifiers Component
 *
 * First step of multi-step form wizard
 * - Renders conditional form fields based on selected service
 * - Uses React Hook Form with Zod validation
 * - Shows only required fields per SERVICE_SCHEMAS
 * - Handles conditional fields (e.g., isEmployed toggle shows labour card field)
 * - Validates on blur with error messages
 * - Includes Back and Continue buttons
 */
const FormStep1Identifiers: React.FC = () => {
  const { state, setStep, setIdentifier, setError, clearError } = useForm()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  if (!state.selectedService) {
    return <div className="text-center text-red-500">No service selected</div>
  }

  const schema = SERVICE_SCHEMAS[state.selectedService]
  const metadata = getServiceMetadata(state.selectedService)

  // Get list of visible fields (considering conditionals)
  const getVisibleFields = (): IdentifierField[] => {
    return schema.identifierFields.filter((field) => {
      if (field.conditional) {
        const conditionValue = state.identifiers[field.conditional.field]
        return field.conditional.show ? !!conditionValue : !conditionValue
      }
      return true
    })
  }

  const visibleFields = getVisibleFields()

  /**
   * Validate a single field value
   */
  const validateField = useCallback((field: IdentifierField, value: any): string | null => {
    // Check required
    if (field.required && !value) {
      return `${field.label} is required`
    }

    if (!value) {
      return null
    }

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return `${field.label} is not a valid email`
      }
    }

    // Pattern validation
    if (field.validation?.pattern && typeof value === 'string') {
      if (!field.validation.pattern.test(value)) {
        return `${field.label} format is invalid`
      }
    }

    // Length validation
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `${field.label} must be at least ${field.validation.minLength} characters`
    }

    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `${field.label} must be at most ${field.validation.maxLength} characters`
    }

    // Number range validation
    if (field.type === 'date' && field.dateValidation) {
      const dateValue = new Date(value)
      if (field.dateValidation.minDate && dateValue < field.dateValidation.minDate) {
        return `${field.label} is before the minimum allowed date`
      }
      if (field.dateValidation.maxDate && dateValue > field.dateValidation.maxDate) {
        return `${field.label} is after the maximum allowed date`
      }
    }

    // Custom validation
    if (field.validation?.custom) {
      const result = field.validation.custom(value)
      if (result === true) return null
      if (typeof result === 'string') return result
      return `${field.label} is invalid`
    }

    return null
  }, [])

  /**
   * Handle field value change
   */
  const handleFieldChange = (fieldName: string, value: any, field: IdentifierField) => {
    // Apply auto-format if available
    let formattedValue = value
    if (field.autoFormat && typeof value === 'string') {
      formattedValue = field.autoFormat(value)
    }

    setIdentifier(fieldName, formattedValue)

    // Clear error when field is being edited
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
      clearError(fieldName)
    }
  }

  /**
   * Handle field blur validation
   */
  const handleFieldBlur = (field: IdentifierField) => {
    const value = state.identifiers[field.name]
    const error = validateField(field, value)

    setTouchedFields((prev) => ({
      ...prev,
      [field.name]: true,
    }))

    if (error) {
      setFieldErrors((prev) => ({
        ...prev,
        [field.name]: error,
      }))
      setError(field.name, error)
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field.name]
        return newErrors
      })
      clearError(field.name)
    }
  }

  /**
   * Validate all fields before continuing
   */
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {}
    const newTouchedFields: Record<string, boolean> = {}

    visibleFields.forEach((field) => {
      newTouchedFields[field.name] = true
      const value = state.identifiers[field.name]
      const error = validateField(field, value)
      if (error) {
        errors[field.name] = error
        setError(field.name, error)
      }
    })

    setTouchedFields(newTouchedFields)
    setFieldErrors(errors)

    return Object.keys(errors).length === 0
  }

  /**
   * Handle continue button
   */
  const handleContinue = () => {
    if (validateAllFields()) {
      setStep(2)
    }
  }

  /**
   * Handle back button
   */
  const handleBack = () => {
    setStep(0) // Go back to service selection
  }

  /**
   * Render form field based on type
   */
  const renderField = (field: IdentifierField) => {
    const value = state.identifiers[field.name] ?? ''
    const error = fieldErrors[field.name]
    const isTouched = touchedFields[field.name]

    const baseInputClasses = `
      w-full px-4 py-3 border rounded-lg transition
      focus:outline-none focus:ring-2 focus:ring-gold-500
      ${error && isTouched ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-gold-500'}
    `

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <input
            key={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field)}
            className={baseInputClasses}
          />
        )

      case 'date':
        return (
          <input
            key={field.name}
            type="date"
            value={value ? new Date(value).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field)}
            className={baseInputClasses}
          />
        )

      case 'select':
        return (
          <select
            key={field.name}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value, field)}
            onBlur={() => handleFieldBlur(field)}
            className={baseInputClasses}
          >
            <option value="">Select {field.label.toLowerCase()}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'toggle':
        return (
          <label key={field.name} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleFieldChange(field.name, e.target.checked, field)}
              onBlur={() => handleFieldBlur(field)}
              className="w-5 h-5 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-gray-700">{field.label}</span>
          </label>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{metadata.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{metadata.title}</h1>
        </div>
        <p className="text-gray-600">Step 1 of 4: Your Details</p>
      </div>

      {/* Form Fields */}
      <form className="space-y-6 mb-8">
        {visibleFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block mb-2 font-semibold text-gray-900">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {renderField(field)}

            {/* Help text */}
            {field.helpText && !fieldErrors[field.name] && (
              <p className="text-sm text-gray-500 mt-1">{field.helpText}</p>
            )}

            {/* Error message */}
            {fieldErrors[field.name] && touchedFields[field.name] && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}
      </form>

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
          className="flex-1 px-6 py-3 bg-gold-500 hover:bg-gold-600 rounded-lg font-semibold text-white transition"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default FormStep1Identifiers
