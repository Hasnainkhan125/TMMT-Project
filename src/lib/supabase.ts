import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqwqecmahaqzuyzkojmc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxxd3FlY21haGFxenV5emtvam1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTE4MzQsImV4cCI6MjA3MjE2NzgzNH0.kY2d-w_kLq_y40dL9oRJQfdswpOeIafQGTnGQU9ZPsk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced types for applications
export interface VisaApplication {
  id: string;
  applicationType: 'family_visa' | 'residence_visa' | 'entry_permit' | 'emirates_id' | 'medical';
  status: 'draft' | 'submitted' | 'under_review' | 'docs_required' | 'approved' | 'rejected' | 'closed' | 'fraud_detected' | 'penalty_issued';
  sponsor: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    emiratesId?: string;
    passportNumber?: string;
  };
  sponsored?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    emiratesId?: string;
    passportNumber?: string;
  };
  attachments: Array<{
    path: string;
    filename: string;
    type: string;
    verificationStatus: 'pending' | 'verified' | 'fraudulent' | 'expired';
    fraudScore?: number;
  }>;
  metadata: {
    serviceId: string;
    personalInfo: any;
    sponsorInfo: any;
    submittedAt: string;
    fraudRisk: 'low' | 'medium' | 'high';
    blacklistStatus: 'clean' | 'flagged' | 'blacklisted';
    requiredDocuments?: string[];
  };
  history: Array<{
    action: string;
    by: string;
    note: string;
    at: string;
    otpVerified?: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  docs_required: number;
  approved: number;
  rejected: number;
  closed: number;
  fraud_detected: number;
  penalty_issued: number;
}

export interface FraudAlert {
  id: string;
  applicationId: string;
  type: 'document_forgery' | 'identity_theft' | 'multiple_applications' | 'blacklisted_documents';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  createdAt: string;
  assignedTo?: string;
}

export interface Penalty {
  id: string;
  applicationId: string;
  type: 'fine' | 'ban' | 'blacklist' | 'legal_action';
  amount?: number;
  currency?: string;
  duration?: string;
  reason: string;
  status: 'pending' | 'issued' | 'paid' | 'disputed';
  issuedAt: string;
  dueDate?: string;
  applicantName: string;
  documentType: string;
  fraudEvidence: string[];
}

export interface OTPRequest {
  id: string;
  applicationId: string;
  type: 'establishment_card' | 'esignature_card' | 'phone_verification';
  status: 'pending' | 'sent' | 'verified' | 'expired';
  otp: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  applicantName: string;
  contactInfo: string;
  purpose: string;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'amer' | 'admin';
  phoneNumber?: string;
  emiratesId?: string;
  country?: string;
  company?: string;
  passportNumber?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const requireAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireRole = async (requiredRole: string) => {
  const user = await requireAuth();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (!profile || profile.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
};
