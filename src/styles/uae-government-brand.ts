// UAE Ministry of Interior - Official Brand Identity System
// Based on MOE UAE Government Visual Identity Guidelines

export const uaeGovernmentBrand = {
  // Official UAE Government Colors
  colors: {
    // Primary Brand Colors (UAE Flag Inspired)
    primary: {
      50: '#f0f8ff',
      100: '#e0f0ff',
      200: '#bae0ff',
      300: '#7dc8ff',
      400: '#38a8ff',
      500: '#0d8aff', // UAE Blue - Primary Brand Color
      600: '#0066cc',
      700: '#0052a3',
      800: '#004080',
      900: '#002e5c',
      950: '#001a33',
    },
    
    // Secondary Colors (UAE Flag Green)
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // UAE Green - Secondary Brand Color
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    // Accent Colors (UAE Flag Red)
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // UAE Red - Accent Color
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
    
    // Neutral Colors (Professional Government Grays)
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
    
    // Government Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Government Success Green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Government Warning Orange
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Government Error Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Government Info Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Special Government Colors
    government: {
      gold: '#ffd700', // UAE Government Gold
      silver: '#c0c0c0', // UAE Government Silver
      bronze: '#cd7f32', // UAE Government Bronze
      official: '#0d8aff', // Official UAE Blue
      authority: '#22c55e', // Authority Green
      security: '#ef4444', // Security Red
    },
  },
  
  // Official UAE Government Typography
  typography: {
    // Font Families (Government Standards)
    fonts: {
      primary: 'Dubai, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: '"Noto Sans Arabic", "Dubai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: '"Dubai Display", "Dubai", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, "Fira Code", Consolas, "Liberation Mono", Menlo, monospace',
      arabic: '"Noto Sans Arabic", "Dubai", Arial, sans-serif',
    },
    
    // Font Sizes (Government Standards)
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
      '7xl': '4.5rem',   // 72px
      '8xl': '6rem',     // 96px
      '9xl': '8rem',     // 128px
    },
    
    // Font Weights (Government Standards)
    weights: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    
    // Line Heights (Government Standards)
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    
    // Letter Spacing (Government Standards)
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Government Spacing System
  spacing: {
    // Base spacing scale (4px grid - Government Standard)
    0: '0px',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem',    // 256px
    72: '18rem',    // 288px
    80: '20rem',    // 320px
    96: '24rem',    // 384px
  },
  
  // Government Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Government Shadows
  shadows: {
    // Elevation shadows (Government Standards)
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
    
    // Government-specific shadows
    government: '0 4px 14px 0 rgb(13 138 255 / 0.25)',
    authority: '0 4px 14px 0 rgb(34 197 94 / 0.25)',
    security: '0 4px 14px 0 rgb(239 68 68 / 0.25)',
    official: '0 8px 32px 0 rgb(13 138 255 / 0.15)',
  },
  
  // Government Transitions
  transitions: {
    // Duration (Government Standards)
    duration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
      700: '700ms',
      1000: '1000ms',
    },
    
    // Easing functions (Government Standards)
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    
    // Common transitions (Government Standards)
    common: {
      fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      normal: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Government Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Government Z-Index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  
  // Government Component Variants
  components: {
    // Button variants (Government Standards)
    button: {
      primary: {
        background: '#0d8aff',
        hover: '#0066cc',
        text: '#ffffff',
        border: '#0d8aff',
      },
      secondary: {
        background: '#22c55e',
        hover: '#16a34a',
        text: '#ffffff',
        border: '#22c55e',
      },
      accent: {
        background: '#ef4444',
        hover: '#dc2626',
        text: '#ffffff',
        border: '#ef4444',
      },
      neutral: {
        background: '#f5f5f5',
        hover: '#e5e5e5',
        text: '#262626',
        border: '#d4d4d4',
      },
      outline: {
        background: 'transparent',
        hover: '#f0f8ff',
        text: '#0d8aff',
        border: '#0d8aff',
      },
    },
    
    // Card variants (Government Standards)
    card: {
      default: {
        background: '#ffffff',
        border: '#e5e5e5',
        shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      },
      elevated: {
        background: '#ffffff',
        border: '#e5e5e5',
        shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      government: {
        background: '#f0f8ff',
        border: '#0d8aff',
        shadow: '0 4px 14px 0 rgb(13 138 255 / 0.25)',
      },
      authority: {
        background: '#f0fdf4',
        border: '#22c55e',
        shadow: '0 4px 14px 0 rgb(34 197 94 / 0.25)',
      },
      security: {
        background: '#fef2f2',
        border: '#ef4444',
        shadow: '0 4px 14px 0 rgb(239 68 68 / 0.25)',
      },
    },
    
    // Input variants (Government Standards)
    input: {
      default: {
        background: '#ffffff',
        border: '#d4d4d4',
        focus: '#0d8aff',
        text: '#262626',
      },
      error: {
        background: '#fef2f2',
        border: '#ef4444',
        focus: '#ef4444',
        text: '#991b1b',
      },
      success: {
        background: '#f0fdf4',
        border: '#22c55e',
        focus: '#22c55e',
        text: '#14532d',
      },
      government: {
        background: '#f0f8ff',
        border: '#0d8aff',
        focus: '#0d8aff',
        text: '#002e5c',
      },
    },
  },
  
  // UAE Government Statistics (2025)
  statistics: {
    population: {
      total: '11.35 million',
      male: '7.24 million (63.8%)',
      female: '4.11 million (36.2%)',
      expatriate: '10.04 million (88.5%)',
      emirati: '1.31 million (11.5%)',
    },
    
    ageDistribution: {
      '0-14': '1.81 million (15.98%)',
      '15-24': '1.44 million (12.71%)',
      '25-54': '7.28 million (64.12%)',
      '55-64': '0.61 million (5.40%)',
      '65+': '0.20 million (1.79%)',
    },
    
    urbanRural: {
      urban: '10 million (88.1%)',
      rural: '1.35 million (11.9%)',
    },
    
    topNationalities: {
      indian: '4.36 million (38.45%)',
      pakistani: '1.5 million (13.2%)',
      bangladeshi: '0.8 million (7.1%)',
      filipino: '0.6 million (5.3%)',
      egyptian: '0.5 million (4.4%)',
    },
    
    visaProcessing: {
      averageTime: '24-72 hours',
      successRate: '98%',
      applicationsPerYear: '2.5+ million',
      processingCenters: '25+',
    },
  },
  
  // Government Service Categories
  serviceCategories: {
    immigration: {
      name: 'Immigration Services',
      description: 'Official UAE immigration and residency services',
      icon: '🏛️',
      color: '#0d8aff',
    },
    residency: {
      name: 'Residence Visa',
      description: 'UAE residence visa applications and renewals',
      icon: '🆔',
      color: '#22c55e',
    },
    entryPermit: {
      name: 'Entry Permits',
      description: 'Entry permits for family and business',
      icon: '✈️',
      color: '#f59e0b',
    },
    changeStatus: {
      name: 'Change Status',
      description: 'Visa status change services',
      icon: '🔄',
      color: '#8b5cf6',
    },
    visaStamping: {
      name: 'Visa Stamping',
      description: 'Final visa stamping services',
      icon: '📋',
      color: '#06b6d4',
    },
  },
  
  // Government Document Requirements
  documentRequirements: {
    sponsor: {
      emiratesId: 'Sponsor\'s Emirates ID Copy',
      passport: 'Sponsor\'s Passport Copy',
      visa: 'Sponsor\'s Visa Copy',
      salaryCertificate: 'Salary Certificate (Minimum AED 4,000)',
      bankStatement: '3-Month Bank Statement',
      tradeLicense: 'Trade License Copy',
      memorandum: 'Memorandum of Association (MOA)',
      establishmentCard: 'Establishment Card (Immigration Card)',
    },
    
    applicant: {
      passport: 'Applicant\'s Passport Copy (6+ months validity)',
      photo: 'Passport Photo (White Background)',
      birthCertificate: 'Attested Birth Certificate',
      marriageCertificate: 'Attested Marriage Certificate',
      nationalId: 'National ID (For specific nationalities)',
      medicalReport: 'Medical Fitness Report (18+ years)',
    },
    
    accommodation: {
      ejari: 'Ejari Rental Contract (2+ bedrooms)',
      tenancyContract: 'Registered Tenancy Contract',
      hotelBooking: 'Hotel Booking Confirmation',
    },
    
    financial: {
      securityDeposit: 'Security Deposit (Refundable)',
      iban: 'Sponsor\'s IBAN Number',
      financialProof: 'Financial Stability Proof',
    },
  },
  
  // Government Process Steps
  processSteps: {
    application: {
      step: 1,
      title: 'Application Submission',
      description: 'Submit required documents and application form',
      estimatedTime: '1-2 hours',
      requiredDocuments: 'All sponsor and applicant documents',
    },
    
    verification: {
      step: 2,
      title: 'Document Verification',
      description: 'Government verification of submitted documents',
      estimatedTime: '24-48 hours',
      requiredDocuments: 'Document authenticity verification',
    },
    
    approval: {
      step: 3,
      title: 'Application Approval',
      description: 'Government approval of visa application',
      estimatedTime: '24-72 hours',
      requiredDocuments: 'Approval notification',
    },
    
    processing: {
      step: 4,
      title: 'Visa Processing',
      description: 'Processing and issuance of visa',
      estimatedTime: '1-3 business days',
      requiredDocuments: 'Processing fees payment',
    },
    
    completion: {
      step: 5,
      title: 'Visa Issuance',
      description: 'Final visa issuance and delivery',
      estimatedTime: '1-2 business days',
      requiredDocuments: 'Visa collection or delivery',
    },
  },
};

// Export all government brand tokens
export const {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  statistics,
  serviceCategories,
  documentRequirements,
  processSteps,
} = uaeGovernmentBrand;

export default uaeGovernmentBrand;
