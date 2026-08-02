import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import type { Application, ApplicationUpdateEvent } from "../types"
import { useAuth } from "./AuthContext"
/**
 * Applications Context Type
 */
export interface ApplicationsContextType {
  applications: Application[]
  loading: boolean
  error: string | null
  fetchApplications: () => Promise<void>
  refetchApplications: () => Promise<void>
  getApplicationById: (id: string) => Application | undefined
  subscribeToUpdates: (callback: (event: ApplicationUpdateEvent) => void) => () => void
}

/**
 * Applications Context
 */
const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined)

/**
 * useApplications Hook
 */
export const useApplications = () => {
  const context = useContext(ApplicationsContext)
  if (context === undefined) {
    throw new Error("useApplications must be used within an ApplicationsProvider")
  }
  return context
}

/**
 * ApplicationsProvider Component
 */
export const ApplicationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const updateSubscribersRef = useRef<Set<(event: ApplicationUpdateEvent) => void>>(new Set())
  /**
   * Fetch applications from API
   */
  const fetchApplications = useCallback(async () => {
    try {

      const userData = localStorage.getItem('userData')
      const user = userData ? JSON.parse(userData) : null
      setError(null)
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001"
      const authToken = localStorage.getItem("authToken")
      const response = await fetch(`${apiBaseUrl}/api/v1/checks/user/${user?.id || ''}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Bearer ${authToken}` }),

        },
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please log in again")
        }
        throw new Error(`Failed to fetch applications: ${response.statusText}`)
      }
      
      const data = await response.json()

      // Transform API response to Application[] format
      const fetchedApplications: Application[] = (data.data.checks || []).map((app: any) => ({
        id: app._id,
        serviceType: app.serviceType,
        status: app.status,
        createdAt: new Date(app.createdAt),
        estimatedCompletionAt: new Date(app.estimatedCompletionAt),
        completedAt: app.completedAt ? new Date(app.completedAt) : undefined,
        result: app.result,
        speedTier: app.speedTier,
        price: app.price,
        identifiers: app.identifiers || {},
        amount: app.amount,
        attachments: app.attachments,
        requestedDocuments: app.requestedDocuments,
        isFreeService: app.isFreeService,
        officerAssignedId: app.officerAssignedId,
        resultDocuments: app.resultDocuments,
        serviceId: app.serviceId,
        updatedAt: new Date(app.updatedAt),
        userId: app.userId,
          history: app.history,
          officerComments: app.officerComments

      }))


      setApplications(fetchedApplications)
      setLoading(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch applications"
      setError(errorMessage)
      setLoading(false)
      console.error("Error fetching applications:", err)
    }
  }, [])

  /**
   * Refetch applications
   */
  const refetchApplications = useCallback(async () => {
    return fetchApplications()
  }, [fetchApplications])

  /**
   * Get application by ID
   */
  const getApplicationById = useCallback(
    (id: string): Application | undefined => {
      return applications.find((app) => app.id === id)
    },
    [applications]
  )

  /**
   * Subscribe to updates
   */
  const subscribeToUpdates = useCallback(
    (callback: (event: ApplicationUpdateEvent) => void): (() => void) => {
      updateSubscribersRef.current.add(callback)
      return () => {
        updateSubscribersRef.current.delete(callback)
      }
    },
    []
  )

  /**
   * Setup polling interval and WebSocket connection
   */
  useEffect(() => {
    // Initial fetch
    fetchApplications()

    // Setup polling interval (30 seconds)
    pollingIntervalRef.current = setInterval(() => {
      fetchApplications()
    }, 30000)

    // TODO: Setup WebSocket connection for real-time updates
    // Example:
    // const ws = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/visa/applications/updates`);
    // ws.onmessage = (event) => {
    //   const updateEvent: ApplicationUpdateEvent = JSON.parse(event.data);
    //   updateSubscribersRef.current.forEach(callback => callback(updateEvent));
    //   // Update local applications state
    //   setApplications(prev => prev.map(app =>
    //     app.id === updateEvent.applicationId
    //       ? { ...app, status: updateEvent.status, result: updateEvent.result, completedAt: updateEvent.completedAt }
    //       : app
    //   ));
    // };

    return () => {
      // Cleanup polling interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      // TODO: Cleanup WebSocket connection
    }
  }, [fetchApplications])

  const value: ApplicationsContextType = {
    applications,
    loading,
    error,
    fetchApplications,
    refetchApplications,
    getApplicationById,
    subscribeToUpdates,
  }

  return (
    <ApplicationsContext.Provider value={value}>{children}</ApplicationsContext.Provider>
  )
}

export { ApplicationsContext }
