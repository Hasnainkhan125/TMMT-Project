import React, { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import type { ApplicationStatus } from '@/types'
import { SERVICE_METADATA } from '@/config/services'
import { useApplications, type EnhancedVisaApplication } from '@/hooks/useApplications'

/**
 * ApplicationsList Component
 *
 * Displays user's applications with tracking and filtering
 *
 * Features:
 * - Header: "My Applications" with filter chips
 * - Filter Chips: All, Pending Payment, Submitted, Processing, Completed, Failed
 * - Each application card shows:
 *   - Left: Service icon + name
 *   - Middle: Submitted date + estimated completion
 *   - Right: Status pill (color-coded) + action button
 *
 * Status-specific action buttons:
 * - Pending Payment: "Pay" button
 * - Submitted/Processing: "Track" button with progress indicator
 * - Completed: "View Result" button (green)
 * - Failed: "Retry" button (red)
 *
 * - Expandable results for completed applications
 * - Empty state: Icon + "No applications yet" + helpful text
 * - Responsive: Full width cards, actions stack on mobile
 */
const ApplicationsList: React.FC = () => {
  const { applications, loading, error } = useApplications()
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [expandedApplicationId, setExpandedApplicationId] = useState<string | null>(null)

  // Filter chips configuration
  const filterChips = [
    { label: 'All', value: null },
    { label: 'Pending Payment', value: 'pending_payment' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Processing', value: 'processing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Failed', value: 'failed' },
  ]

  // Filter applications based on active filter
  const filteredApplications = activeFilter
    ? applications.filter((app) => app.status === activeFilter)
    : applications

  // Get status color based on application status
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get status display label
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending_payment':
        return 'Pending Payment'
      case 'submitted':
        return 'Submitted'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  // Get service metadata for application
  const getServiceInfo = (app: EnhancedVisaApplication) => {
    const serviceId = app.metadata?.serviceId
    // Try to find service by ID or name match
    const service = Object.values(SERVICE_METADATA).find(
      (s) => s.id === serviceId || s.title === app.metadata?.serviceName
    )
    return service
  }

  // Handle action button click
  const handleActionClick = (app: EnhancedVisaApplication, action: string) => {
    // This would be connected to actual business logic
    // For now, just log the action
    console.log(`Action ${action} triggered for application ${app.id}`)

    if (action === 'view-result') {
      setExpandedApplicationId(
        expandedApplicationId === app.id ? null : app.id
      )
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Applications</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 inline-block animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 h-10 w-10"></div>
            <p className="text-gray-600">Loading your applications...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="w-full">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">My Applications</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error || 'Failed to load applications'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <h2 className="mb-6 text-2xl font-bold text-gray-900">My Applications</h2>

      {/* Filter Chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => setActiveFilter(chip.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              activeFilter === chip.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Applications List or Empty State */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mb-3 text-4xl">📋</div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No applications yet
          </h3>
          <p className="text-sm text-gray-600">
            Start your first check above to begin tracking your applications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const service = getServiceInfo(app)
            const isExpanded = expandedApplicationId === app.id
            const submittedDate = app.createdAt
              ? new Date(app.createdAt)
              : new Date()
            const estimatedCompletionDate = app.updatedAt
              ? new Date(app.updatedAt)
              : new Date()

            return (
              <div key={app.id} className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                {/* Main Application Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
                  {/* Left: Service Icon and Name */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0 text-3xl">
                      {service?.icon || '📋'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {service?.title || app.metadata?.serviceName || 'Application'}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ID: {app.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>

                  {/* Middle: Dates (hidden on mobile, shown on sm+) */}
                  <div className="hidden sm:flex flex-col gap-1 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {format(submittedDate, 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Est. completion:</span>{' '}
                      {formatDistanceToNow(estimatedCompletionDate, {
                        addSuffix: true,
                      })}
                    </div>
                  </div>

                  {/* Right: Status and Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                    {/* Status Pill */}
                    <div
                      className={`flex-shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {getStatusLabel(app.status)}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        const actionMap: Record<string, string> = {
                          'pending_payment': 'pay',
                          'submitted': 'track',
                          'processing': 'track',
                          'completed': 'view-result',
                          'failed': 'retry',
                        }
                        const action = actionMap[app.status] || 'view'
                        handleActionClick(app, action)
                      }}
                      className={`flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                        app.status === 'pending_payment'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : app.status === 'submitted' || app.status === 'processing'
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : app.status === 'completed'
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : app.status === 'failed'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {app.status === 'pending_payment'
                        ? 'Pay'
                        : app.status === 'submitted' || app.status === 'processing'
                          ? 'Track'
                          : app.status === 'completed'
                            ? 'View Result'
                            : app.status === 'failed'
                              ? 'Retry'
                              : 'View'}
                    </button>
                  </div>
                </div>

                {/* Expandable Results Section for Completed Applications */}
                {app.status === 'completed' && app.metadata?.serviceName && (
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => handleActionClick(app, 'view-result')}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                    >
                      {isExpanded ? '▼' : '▶'} {isExpanded ? 'Hide' : 'Show'} Results
                    </button>

                    {isExpanded && (
                      <div className="bg-blue-50 px-4 py-3 text-xs">
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium text-gray-700">Service:</span>
                            <p className="text-gray-600 mt-1">
                              {service?.title || app.metadata?.serviceName}
                            </p>
                          </div>

                          {app.metadata?.submittedAt && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Completed On:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {format(
                                  new Date(app.metadata.submittedAt),
                                  'MMMM dd, yyyy HH:mm'
                                )}
                              </p>
                            </div>
                          )}

                          {app.metadata?.additionalNotes && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Notes:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {app.metadata.additionalNotes}
                              </p>
                            </div>
                          )}

                          {app.metadata?.fraudRisk && (
                            <div>
                              <span className="font-medium text-gray-700">
                                Status:
                              </span>
                              <p className="text-gray-600 mt-1">
                                {app.metadata.fraudRisk}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Dates Section */}
                {app.status === 'submitted' || app.status === 'processing' ? (
                  <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 sm:hidden text-xs text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Submitted:</span>{' '}
                      {format(submittedDate, 'MMM dd, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Est. completion:</span>{' '}
                      {formatDistanceToNow(estimatedCompletionDate, {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ApplicationsList
