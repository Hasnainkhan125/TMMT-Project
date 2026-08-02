import {
  ServiceType,
  ServiceMetadata,
  ServiceSchema,
  IdentifierField,
  FileInputConfig,
  PricingTiers,
} from '@/types';

// Pricing Constants
export const PRICING: PricingTiers = {
  STANDARD: 20,
  FAST_TRACK: 50,
  BUNDLE_5: 50,
  SUBSCRIPTION_MONTHLY: 99,
};

  

// Service Metadata - Display information for each of the 8 services
export const SERVICE_METADATA: Record<ServiceType, ServiceMetadata> = {
  [ServiceType.OVERSTAY_FINE]: {
    id: ServiceType.OVERSTAY_FINE,
    title: 'Overstay Fine Checker',
    description: 'Check if you have any outstanding overstay fines in UAE',
    icon: '🚨',
    popular: true,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '24-48 hours',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Real-time overstay calculation',
      'Fine amount breakdown',
      'Payment options',
      'ICP-verified data',
    ],
  },

  [ServiceType.TRAVEL_BAN]: {
    id: ServiceType.TRAVEL_BAN,
    title: 'Travel Ban Checker',
    description: 'Verify if you have any travel restrictions in UAE',
    icon: '✈️',
    popular: true,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '24-48 hours',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Travel ban status verification',
      'Immediate notification',
      'Legal guidance included',
      'ICP-authorized check',
    ],
  },

  [ServiceType.ABSCONDING]: {
    id: ServiceType.ABSCONDING,
    title: 'Absconding Case Checker',
    description: 'Check for any absconding cases or labour disputes',
    icon: '💼',
    popular: false,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '15-30 minutes',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'MOHRE database check',
      'Employment status verification',
      'Case details if any',
      'Next steps guidance',
    ],
  },

  [ServiceType.INSIDE_OUTSIDE]: {
    id: ServiceType.INSIDE_OUTSIDE,
    title: 'Inside/Outside UAE Checker',
    description: 'Verify your current UAE residence status',
    icon: '🗂️',
    popular: false,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '24-48 hours',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Real-time location status',
      'Entry/exit history',
      'Visa validity check',
      'ICP records verified',
    ],
  },

  [ServiceType.APPLICATION_STATUS]: {
    id: ServiceType.APPLICATION_STATUS,
    title: 'Application Status Checker',
    description: 'Track the status of your UAE visa applications',
    icon: '📋',
    popular: true,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '15-30 minutes',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Real-time status updates',
      'Application timeline',
      'Required documents list',
      'Automated notifications',
    ],
  },

  [ServiceType.NAWAKAS]: {
    id: ServiceType.NAWAKAS,
    title: 'Nawakas Service',
    description: 'Process Nawakas (documents organization) for businesses',
    icon: '📤',
    popular: false,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '15-30 minutes',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Document organization assistance',
      'Multi-file upload support',
      'Template guidance',
      'DAFZA/DED compliance check',
    ],
  },

  [ServiceType.ESTABLISHMENT_CARD]: {
    id: ServiceType.ESTABLISHMENT_CARD,
    title: 'Establishment Card Checker',
    description: 'Verify your business establishment card status',
    icon: '🏢',
    popular: false,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '15-30 minutes',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Card validity verification',
      'Business status confirmation',
      'Renewal date check',
      'DED records verified',
    ],
  },

  [ServiceType.EXPIRY_CHECKER]: {
    id: ServiceType.EXPIRY_CHECKER,
    title: 'Expiry Checker',
    description: 'Check expiration dates for all your documents',
    icon: '⏰',
    popular: true,
    priceRange: {
      standard: PRICING.STANDARD,
      fastTrack: PRICING.FAST_TRACK,
    },
    turnaround: {
      standard: '15-30 minutes',
      fastTrack: 'Guaranteed 15 minutes',
    },
    features: [
      'Multi-document expiry check',
      'Renewal reminders',
      'Calendar integration',
      'Automatic alerts',
    ],
  },
} as const satisfies Record<ServiceType, ServiceMetadata>;

// Service Schemas - Conditional field definitions per service
export const SERVICE_SCHEMAS: Record<ServiceType, ServiceSchema> = {
  [ServiceType.OVERSTAY_FINE]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
        helpText: 'Your 15-digit Emirates ID number',
      },
      {
        name: 'passportNumber',
        type: 'text',
        label: 'Passport Number',
        placeholder: 'XXXXXXXX',
        required: true,
        validation: {
          minLength: 6,
          maxLength: 9,
        },
        helpText: 'Your passport number from your home country',
      },
      {
        name: 'nationality',
        type: 'select',
        label: 'Nationality',
        required: true,
        options: [
          { value: 'IN', label: '🇮🇳 India', icon: '🇮🇳' },
          { value: 'PK', label: '🇵🇰 Pakistan', icon: '🇵🇰' },
          { value: 'PH', label: '🇵🇭 Philippines', icon: '🇵🇭' },
          { value: 'BD', label: '🇧🇩 Bangladesh', icon: '🇧🇩' },
          { value: 'EG', label: '🇪🇬 Egypt', icon: '🇪🇬' },
          { value: 'GB', label: '🇬🇧 United Kingdom', icon: '🇬🇧' },
          { value: 'US', label: '🇺🇸 United States', icon: '🇺🇸' },
          { value: 'CN', label: '🇨🇳 China', icon: '🇨🇳' },
          { value: 'JP', label: '🇯🇵 Japan', icon: '🇯🇵' },
        ],
        helpText: 'Select your country of citizenship',
      },
      {
        name: 'dateOfBirth',
        type: 'date',
        label: 'Date of Birth',
        required: true,
        dateValidation: {
          maxDate: new Date(),
        },
        helpText: 'Your full date of birth',
      },
    ],
    fileInputs: [
      {
        name: 'emiratesIdCopy',
        label: 'Emirates ID Copy (Front & Back)',
        required: true,
        maxFiles: 2,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024, // 10MB
        helpText: 'PDF or high-quality scan of both sides',
      },
      {
        name: 'passportCopy',
        label: 'Passport Copy (Signature Page)',
        required: true,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
        helpText: 'Scan of your passport signature page',
      },
    ],
  },

  [ServiceType.TRAVEL_BAN]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
        helpText: 'Your Emirates ID number',
      },
      {
        name: 'passportNumber',
        type: 'text',
        label: 'Passport Number',
        placeholder: 'XXXXXXXX',
        required: true,
        validation: {
          minLength: 6,
          maxLength: 9,
        },
        helpText: 'Your passport number',
      },
      {
        name: 'nationality',
        type: 'select',
        label: 'Nationality',
        required: true,
        options: [
          { value: 'IN', label: '🇮🇳 India' },
          { value: 'PK', label: '🇵🇰 Pakistan' },
          { value: 'PH', label: '🇵🇭 Philippines' },
          { value: 'BD', label: '🇧🇩 Bangladesh' },
          { value: 'EG', label: '🇪🇬 Egypt' },
          { value: 'GB', label: '🇬🇧 United Kingdom' },
          { value: 'US', label: '🇺🇸 United States' },
        ],
        helpText: 'Your nationality',
      },
    ],
    fileInputs: [
      {
        name: 'emiratesIdCopy',
        label: 'Emirates ID Copy',
        required: true,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
      },
      {
        name: 'passportCopy',
        label: 'Passport Copy',
        required: true,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
      },
    ],
  },

  [ServiceType.ABSCONDING]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'labourCardNumber',
        type: 'text',
        label: 'Labour Card / Person Code',
        placeholder: 'XXXXXXXXXXXXXX',
        required: true,
        validation: {
          pattern: /^\d{14}$/,
          minLength: 14,
          maxLength: 14,
        },
        helpText: 'Your 14-digit MOHRE labour card number',
      },
      {
        name: 'mobileNumber',
        type: 'tel',
        label: 'Mobile Number',
        placeholder: '+971 XX XXX XXXX',
        required: false,
        validation: {
          minLength: 10,
        },
        helpText: 'Optional: For status notifications',
      },
    ],
    fileInputs: [
      {
        name: 'labourCard',
        label: 'Labour Card Copy',
        required: false,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
      },
    ],
  },

  [ServiceType.INSIDE_OUTSIDE]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'passportNumber',
        type: 'text',
        label: 'Passport Number',
        placeholder: 'XXXXXXXX',
        required: false,
        validation: {
          minLength: 6,
          maxLength: 9,
        },
      },
    ],
    fileInputs: [
      {
        name: 'emiratesIdCopy',
        label: 'Emirates ID Copy',
        required: true,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
      },
    ],
  },

  [ServiceType.APPLICATION_STATUS]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'applicationReferenceNumber',
        type: 'text',
        label: 'Application Reference Number',
        placeholder: 'APP-XXXXXXXXX',
        required: true,
        helpText: 'From your application confirmation email',
      },
    ],
    fileInputs: [
      {
        name: 'supportingDocs',
        label: 'Supporting Documents (Optional)',
        required: false,
        maxFiles: 5,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSize: 10 * 1024 * 1024,
      },
    ],
  },

  [ServiceType.NAWAKAS]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true,
        helpText: 'Legal business name',
      },
      {
        name: 'tradeOnlyNumber',
        type: 'text',
        label: 'Trade License Number',
        placeholder: 'XXXXX-XXXXX-XXXXX',
        required: false,
        helpText: 'If applicable',
      },
    ],
    fileInputs: [
      {
        name: 'documents',
        label: 'Documents to Organize (Up to 10 files)',
        required: true,
        maxFiles: 10,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
        helpText: 'Upload all documents you need organized',
      },
    ],
  },

  [ServiceType.ESTABLISHMENT_CARD]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'companyName',
        type: 'text',
        label: 'Company Name',
        required: true,
      },
      {
        name: 'establishmentNumber',
        type: 'text',
        label: 'Establishment Number (Optional)',
        required: false,
        helpText: 'From your establishment card',
      },
    ],
    fileInputs: [
      {
        name: 'establishmentCardCopy',
        label: 'Establishment Card Copy',
        required: false,
        maxFiles: 1,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/heic'],
        maxFileSize: 10 * 1024 * 1024,
      },
    ],
  },

  [ServiceType.EXPIRY_CHECKER]: {
    identifierFields: [
      {
        name: 'emiratesId',
        type: 'text',
        label: 'Emirates ID',
        placeholder: '784-XXXX-XXXXXXX-X',
        required: true,
        validation: {
          pattern: /^784-\d{4}-\d{7}-\d$/,
          minLength: 15,
          maxLength: 23,
        },
        mask: '784-XXXX-XXXXXXX-X',
        autoFormat: (value: string) => {
          const cleaned = value.replace(/\D/g, '');
          if (cleaned.length === 0) return '';
          const formatted = cleaned.slice(0, 15);
          return `784-${formatted.slice(0, 4)}-${formatted.slice(4, 11)}-${formatted.slice(11, 15)}`;
        },
      },
      {
        name: 'passportNumber',
        type: 'text',
        label: 'Passport Number',
        placeholder: 'XXXXXXXX',
        required: false,
        validation: {
          minLength: 6,
          maxLength: 9,
        },
      },
      {
        name: 'residencyVisa',
        type: 'text',
        label: 'Visa Number (Optional)',
        required: false,
        helpText: 'From your residency visa',
      },
    ],
    fileInputs: [
      {
        name: 'documents',
        label: 'Document Copies (Optional)',
        required: false,
        maxFiles: 5,
        acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
        maxFileSize: 10 * 1024 * 1024,
        helpText: 'Upload documents to check their expiry',
      },
    ],
  },
};

// Service display order
export const SERVICE_DISPLAY_ORDER: ServiceType[] = [
  ServiceType.OVERSTAY_FINE,
  ServiceType.TRAVEL_BAN,
  ServiceType.ABSCONDING,
  ServiceType.INSIDE_OUTSIDE,
  ServiceType.APPLICATION_STATUS,
  ServiceType.NAWAKAS,
  ServiceType.ESTABLISHMENT_CARD,
  ServiceType.EXPIRY_CHECKER,
];

// Helper function to get service metadata
export const getServiceMetadata = (serviceType: ServiceType): ServiceMetadata => {
  return SERVICE_METADATA[serviceType];
};

// Helper function to get service schema
export const getServiceSchema = (serviceType: ServiceType): ServiceSchema => {
  return SERVICE_SCHEMAS[serviceType];
};

export const getAllServices = (): ServiceMetadata[] => {
  return Object.values(SERVICE_METADATA);
};

export const getLocalServices = (): ServiceMetadata[] => {
  return Object.values(SERVICE_METADATA).filter((service) => service.id === ServiceType.OVERSTAY_FINE || service.id === ServiceType.TRAVEL_BAN || service.id === ServiceType.ABSCONDING || service.id === ServiceType.INSIDE_OUTSIDE || service.id === ServiceType.APPLICATION_STATUS || service.id === ServiceType.NAWAKAS || service.id === ServiceType.ESTABLISHMENT_CARD || service.id === ServiceType.EXPIRY_CHECKER);
};

export const getServiceById = (id: ServiceType): any=> {
    const service = Object.values(SERVICE_METADATA).find((service) => service.id === id);
    if (service) {
        return service;
    }
    return null;
};