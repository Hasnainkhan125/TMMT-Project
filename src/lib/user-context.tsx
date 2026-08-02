"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ServiceId } from './services';

export type ApplicationStatus = 
  | 'pending_payment'
  | 'submitted'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Application {
  id: string;
  serviceId: ServiceId;
  serviceTitle: string;
  status: ApplicationStatus;
  submittedAt: Date;
  completedAt?: Date;
  estimatedCompletion: Date;
  speedTier: 'standard' | 'fast-track';
  amount: number;
  formData: Record<string, unknown>;
  result?: Record<string, unknown>;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  subscription?: {
    plan: 'unlimited';
    expiresAt: Date;
  };
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  applications: Application[];
  login: (user: User) => void;
  logout: () => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, updates: Partial<Application>) => void;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Demo user for showcase
const DEMO_USER: User = {
  id: 'demo-user-001',
  firstName: 'Ahmed',
  lastName: 'Al Rashid',
  email: 'ahmed.alrashid@email.com',
  phone: '+971 50 123 4567',
};

// Demo applications
const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'app-001',
    serviceId: 'overstay-fine',
    serviceTitle: 'Overstay Fine Checker',
    status: 'completed',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    speedTier: 'fast-track',
    amount: 50,
    formData: { passportNumber: 'A1234567', nationality: 'IN' },
    result: {
      fineAmount: 'AED 0',
      overstayDays: 0,
      status: 'No overstay detected',
      lastEntryDate: '2024-01-15',
      visaExpiryDate: '2025-01-14',
    },
  },
  {
    id: 'app-002',
    serviceId: 'travel-ban',
    serviceTitle: 'Travel Ban Checker',
    status: 'processing',
    submittedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() + 18 * 60 * 60 * 1000),
    speedTier: 'standard',
    amount: 20,
    formData: { emiratesId: '784-1234-1234567-1' },
  },
  {
    id: 'app-003',
    serviceId: 'expiry-checker',
    serviceTitle: 'Document Expiry Checker',
    status: 'completed',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    estimatedCompletion: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    speedTier: 'standard',
    amount: 20,
    formData: { documentsToCheck: ['visa', 'emiratesId'] },
    result: {
      visaExpiry: '2025-01-14',
      emiratesIdExpiry: '2027-05-20',
      daysRemaining: { visa: 249, emiratesId: 1106 },
      status: 'All documents valid',
    },
  },
];

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEMO_USER);
  const [applications, setApplications] = useState<Application[]>(DEMO_APPLICATIONS);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setApplications([]);
  }, []);

  const addApplication = useCallback((app: Application) => {
    setApplications(prev => [app, ...prev]);
  }, []);

  const updateApplication = useCallback((id: string, updates: Partial<Application>) => {
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
  }, []);

  const getApplicationsByStatus = useCallback(
    (status: ApplicationStatus) => applications.filter(app => app.status === status),
    [applications]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        applications,
        login,
        logout,
        addApplication,
        updateApplication,
        getApplicationsByStatus,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
