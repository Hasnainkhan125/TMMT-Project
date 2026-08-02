// Service Type Enum - All 8 UAE visa/labour services
export enum ServiceType {
  OVERSTAY_FINE = 'overstay_fine',
  TRAVEL_BAN = 'travel_ban',
  ABSCONDING = 'absconding',
  INSIDE_OUTSIDE = 'inside_outside',
  APPLICATION_STATUS = 'application_status',
  NAWAKAS = 'nawakas',
  ESTABLISHMENT_CARD = 'establishment_card',
  EXPIRY_CHECKER = 'expiry_checker',
}

// Application Status Enum
export enum ApplicationStatus {
  PENDING_PAYMENT = 'pending_payment',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Speed Tier Enum
export enum SpeedTier {
  STANDARD = 'standard',
  FAST_TRACK = 'fast_track',
}

// Date Validation Configuration
export interface DateValidation {
  minDate?: Date;
  maxDate?: Date;
}

// Identifier Field Configuration
export interface IdentifierField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'toggle';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    custom?: (value: any) => boolean | string;
  };
  dateValidation?: DateValidation;
  options?: Array<{ value: string; label: string; icon?: string }>;
  mask?: string; // For auto-formatting (e.g., "784-XXXX-XXXXXXX-X")
  autoFormat?: (value: string) => string;
  helpText?: string;
  conditional?: {
    field: string;
    value: any;
    show: boolean;
  };
}

// File Input Configuration
export interface FileInputConfig {
  name: string;
  label: string;
  required: boolean;
  maxFiles: number;
  acceptedTypes: string[];
  maxFileSize: number; // bytes
  helpText?: string;
  conditional?: {
    field: string;
    value: any;
    show: boolean;
  };
}

// Uploaded File with Upload Status
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error' | 'pending';
  uploadProgress: number; // 0-100
  uploadedUrl?: string;
  uploadedAt?: Date;
  error?: string;
}

// Service Schema Definition (field mapping per service)
export interface ServiceSchema {
  identifierFields: IdentifierField[];
  fileInputs: FileInputConfig[];
}

// Form State - Entire multi-step form state
export interface FormState {
  selectedService: ServiceType | null;
  step: number; // 1-4
  identifiers: Record<string, any>; // Dynamic field values per service
  documents: UploadedFile[]; // Uploaded documents
  speedTier: SpeedTier;
  totalPrice: number; // Calculated AED amount
  isSubmitting: boolean;
  errors: Record<string, string>; // Field-level validation errors
}

// Application - Represents a submitted visa check application
export interface Application {
  id: string;
  serviceType: ServiceType;
  status: ApplicationStatus;
  estimatedCompletionAt: Date;
  completedAt?: Date;
  result?: Record<string, any>; // Service-specific result
  speedTier: SpeedTier;
  price: number; // AED
  identifiers: {
    passportNumber?: string;
    emiratesId?: string;
    nationality?: string;
    dateOfBirth?: string;
    passportExpiry?: string;
    mobileNumber?: string;
    tradeOnlyNumber?: string;
    labourCardNumber?: string;
    unifiedNumber?: string;
    [key: string]: string | undefined;
  };
  amount:number,
  attachments :Array<{
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
    uploadedBy: string;
  }>,
  isFreeService:boolean,
  officerAssignedId:string,
  resultDocuments:Array<{
    originalName: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    uploadedAt: Date;
    uploadedBy: string;
  }>,
  serviceId:string,
  updatedAt:Date,
  createdAt:Date,
  userId:string,
}

// Pricing Constants (exported from config)
export interface PricingTiers {
  STANDARD: number;
  FAST_TRACK: number;
  BUNDLE_5: number;
  SUBSCRIPTION_MONTHLY: number;
}

// Service Metadata - Data for UI display
export interface ServiceMetadata {
  id: ServiceType;
  title: string;
  description: string;
  icon: string;
  popular: boolean;
  priceRange: {
    standard: number;
    fastTrack: number;
  };
  turnaround: {
    standard: string;
    fastTrack: string;
  };
  features?: string[];
  imageUrl?: string;
}

// API Request/Response Types
export interface CreateApplicationRequest {
  serviceType: ServiceType;
  identifiers: Record<string, any>;
  documentIds: string[];
  speedTier: SpeedTier;
  pricing: {
    amount: number;
    currency: string;
  };
}

export interface CreateApplicationResponse {
  applicationId: string;
  checkoutUrl: string;
  estimatedCompletionAt: Date;
}

export interface UploadedFileResponse {
  attachmentId: string;
  uploadedUrl: string;
  filename: string;
  size: number;
  status: 'success' | 'error';
}

// WebSocket Event for Real-time Updates
export interface ApplicationUpdateEvent {
  applicationId: string;
  status: ApplicationStatus;
  result?: Record<string, any>;
  completedAt?: Date;
}
