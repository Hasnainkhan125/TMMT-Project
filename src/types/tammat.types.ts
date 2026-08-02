// TAMMAT Application Types

export interface UserProfile {
  id: string;
  clerkId: string;
  personalInfo: PersonalInfo;
  documents: UserDocument[];
  applications: Application[];
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  emiratesId: string;
  residencyVisa: string;
  tradeLicense?: string;
  moa?: string;
  mom?: string;
  establishmentCard?: string;
  address: Address;
  employment: EmploymentInfo;
}

export interface Address {
  street: string;
  city: string;
  emirate: string;
  postalCode: string;
  country: string;
}

export interface EmploymentInfo {
  company: string;
  position: string;
  salary: number;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  startDate: Date;
}

export interface UserDocument {
  id: string;
  userId: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  status: DocumentStatus;
  verifiedAt?: Date;
}

export type DocumentCategory = 
  | 'emirates-id' 
  | 'residency-visa' 
  | 'trade-license' 
  | 'moa' 
  | 'mom' 
  | 'establishment-card'
  | 'passport'
  | 'marriage-certificate'
  | 'birth-certificate'
  | 'photos'
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface Application {
  id: string;
  userId: string;
  serviceId: string;
  status: ApplicationStatus;
  formData: Record<string, any>;
  documents: string[];
  submittedAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  notes?: string;
}

export type ApplicationStatus = 'draft' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'completed';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  requirements: DocumentRequirement[];
  estimatedTime: string;
  cost: number;
  icon: string;
  features: string[];
  eligibility: EligibilityCriteria;
  process: ProcessStep[];
}

export type ServiceCategory = 'family' | 'business' | 'employment' | 'investment' | 'other';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  fileTypes: string[];
  maxSize: number;
  category: 'personal' | 'sponsor' | 'sponsored';
  conditional?: ConditionalLogic;
}

export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide' | 'require' | 'optional';
}

export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  minSalary?: number;
  minResidencyYears?: number;
  requiredDocuments: string[];
  restrictions: string[];
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  estimatedTime: string;
  requiredDocuments: string[];
}

export interface UserPreferences {
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  applicationUpdates: boolean;
  documentReminders: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  marketingEmails: boolean;
  thirdPartySharing: boolean;
}

// Chat and AI Types
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    serviceId?: string;
    formData?: any;
    documents?: string[];
    intent?: string;
  };
}

export interface ChatPrompt {
  id: string;
  text: string;
  category: string;
  serviceId?: string;
  icon?: string;
  description?: string;
}

export interface AIResponse {
  message: string;
  suggestions: string[];
  nextSteps: string[];
  formData?: any;
  requiredDocuments?: string[];
}

// Form Types
export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'date' | 'file' | 'textarea' | 'number' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule[];
  conditional?: ConditionalLogic;
  options?: SelectOption[];
  helpText?: string;
  defaultValue?: any;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload Types
export interface UploadedDocument {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'failed';
  progress?: number;
}

export interface FileUploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  maxFiles: number;
  autoUpload: boolean;
}

// UI State Types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  modal: {
    isOpen: boolean;
    type: string;
    data?: any;
  };
  sidebar: {
    isOpen: boolean;
    activeTab: string;
  };
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  children?: NavigationItem[];
  badge?: number;
  disabled?: boolean;
}

// Dashboard Types
export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  completedApplications: number;
  totalDocuments: number;
  verifiedDocuments: number;
  upcomingDeadlines: number;
}

export interface RecentActivity {
  id: string;
  type: 'application' | 'document' | 'status-change';
  title: string;
  description: string;
  timestamp: Date;
  actionUrl?: string;
} 