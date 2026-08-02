export type ThemeName = 
'tammat' |
 'orange'| 
  'dark' 
  //  'neutral' | 'minimal' |
    'tammatOfficial'
// export type ThemeName = keyof typeof themes
// export type Theme = typeof themes[ThemeName]
export interface ThemeTokens {
  name: string

  /* Brand */
  primary: string
  primaryHover: string
  primaryActive: string
  secondary: string
  secondaryHover: string
  accent: string
  accentHover?: string

  /* Text */
  text: string
  textSecondary: string
  textMuted: string
  caption: string
  heading: string
  foreground: string
  /* Backgrounds / Surfaces */
  background: string
  surface: string
  surfaceLight: string
  overlay: string // modal/backdrop

  /* Buttons & controls */
  buttonText: string
  buttonHoverText: string
  disabledBackground: string
  disabledText: string
  inputBackground: string
  inputBorder: string

  /* Borders */
  border: string
  borderLight: string

  /* Feedback */
  success: string
  warning: string
  error: string
  info: string

  /* Statuses */
  statusPending: string
  statusInProgress: string
  statusApproved: string
  statusRejected: string

  /* Navigation / shell */
  navbarBackground: string
  navbarText: string
  sidebarBackground: string
  sidebarText: string
  sidebarActive: string

  /* Dialogs */
  dialogBackground: string
  dialogBorder: string

  /* Charts / data visual */
  chartPrimary: string
  chartSecondary: string
  chartAccent: string
  chartWarning: string
  chartSuccess: string

  /* Gradients / highlights */
  gradient: string
  gradientSubtle: string
  gradientButton?: string
  highlight?: string

  /* Shadows */
  shadowSm: string
  shadowMd: string
  shadowLg: string
}

// Comprehensive Theme System Based on Canva Color Palette
// export const themes = {
//   // TAMMAT Green Theme (#bbf451 #B68A35 white and black)
//   tammat: {
//     name: 'TAMMAT Green',
//     primary: '#bbf451', // Bright lime green
//     secondary: '#B68A35', // Golden brown
//     accent: '#0f172a', // Dark green
//     background: '#FFFFFF', // White
//     surface: '#F8F9F9', // Light Gray
//     surfaceLight: '#FFFFFF', // White
//     text: '#000000', // Black
//     textSecondary: '#6B7280', // Gray
//     textMuted: '#9CA3AF', // Light gray
//     border: '#E5E7EB', // Light border
//     borderLight: '#F3F4F6', // Very light border
//     success: '#21A663', // Green
//     warning: '#FFD200', // Yellow
//     error: '#FF5055', // Red
//     info: '#3B82F6', // Blue
//     gradient: 'linear-gradient(135deg, #bbf451 0%, #B68A35 50%, #00500A 100%)',
//     gradientSubtle: 'linear-gradient(135deg, #bbf45120 0%, #B68A3520 50%, #00500A20 100%)',
//   },

//   // Orange Professional Theme (#F97316 and #09090B)
//   orange: {
//     name: 'Orange Professional',
//     primary: '#F97316', // Orange
//     secondary: '#000000', // Golden brown
//     accent: '#bbf451', // Bright lime
//     background: '#FFFFFF', // White
//     surface: '#FEF3C7', // Light orange
//     surfaceLight: '#FFFBEB', // Very light orange
//     text: '#09090B', // Near black
//     textSecondary: '#78716C', // Brown gray
//     textMuted: '#A8A29E', // Light brown gray
//     border: '#D6D3D1', // Light brown
//     borderLight: '#F5F5F4', // Very light brown
//     success: '#22C55E', // Green
//     warning: '#EAB308', // Yellow
//     error: '#EF4444', // Red
//     info: '#3B82F6', // Blue
//     gradient: 'linear-gradient(135deg, #F97316 0%, #B68A35 50%, #bbf451 100%)',
//     gradientSubtle: 'linear-gradient(135deg, #F9731620 0%, #B68A3520 50%, #bbf45120 100%)',
//   },

  

//   // Dark Theme (#00500A and white)
//   dark: {
//     name: 'Dark Professional',
//     primary: '#BBF451', // Dark green
//     secondary: '#FFFFFF', // Warm gray
//     accent: '#bbf451', // Bright lime
//     background: '#09090B', // Near black
//     surface: '#1E1E1E', // Dark gray
//     surfaceLight: '#2A2A2A', // Medium dark gray
//     text: '#FFFFFF', // White
//     buttonText: '#000000', // Near black
//     buttonHoverText: '#FFFFFF', // White
//     textSecondary: '#A1A1AA', // Light gray
//     textMuted: '#71717A', // Medium gray
//     border: '#27272A', // Dark border
//     borderLight: '#3F3F46', // Medium dark border
//     success: '#10B981', // Green
//     warning: '#F59E0B', // Yellow
//     error: '#F87171', // Red
//     info: '#60A5FA', // Blue
//     gradient: 'linear-gradient(135deg, #00500A 0%, #AB9A85 50%, #bbf451 100%)',
//     gradientSubtle: 'linear-gradient(135deg, #00500A20 0%, #AB9A8520 50%, #bbf45120 100%)',
//   },

//   // Neutral Elegance (#AB9A85 with gray shades)
//   neutral: {
//     name: 'Neutral Elegance',
//     primary: '#AB9A85', // Warm beige
//     secondary: '#6B7280', // Medium gray
//     accent: '#F97316', // Orange accent
//     background: '#FAFAFA', // Off white
//     surface: '#F5F5F5', // Light gray
//     surfaceLight: '#FFFFFF', // White
//     text: '#18181B', // Near black
//     textSecondary: '#71717A', // Medium gray
//     textMuted: '#A1A1AA', // Light gray
//     border: '#E4E4E7', // Light border
//     borderLight: '#F4F4F5', // Very light border
//     success: '#10B981', // Green
//     warning: '#F59E0B', // Yellow
//     error: '#F87171', // Red
//     info: '#3B82F6', // Blue
//     gradient: 'linear-gradient(135deg, #AB9A85 0%, #6B7280 50%, #F97316 100%)',
//     gradientSubtle: 'linear-gradient(135deg, #AB9A8520 0%, #6B728020 50%, #F9731620 100%)',
//   },

//   // Minimal Clean (Black and White)
//   minimal: {
//     name: 'Minimal Clean',
//     primary: '#000000', // Black
//     secondary: '#AB9A85', // Warm gray
//     accent: '#F97316', // Orange
//     background: '#FFFFFF', // White
//     surface: '#F8F9FA', // Very light gray
//     surfaceLight: '#FFFFFF', // White
//     text: '#000000', // Black
//     textSecondary: '#6B7280', // Gray
//     textMuted: '#9CA3AF', // Light gray
//     border: '#E5E7EB', // Light border
//     borderLight: '#F3F4F6', // Very light border
//     success: '#059669', // Green
//     warning: '#D97706', // Yellow
//     error: '#DC2626', // Red
//     info: '#2563EB', // Blue
//     gradient: 'linear-gradient(135deg, #000000 0%, #AB9A85 50%, #F97316 100%)',
//     gradientSubtle: 'linear-gradient(135deg, #00000020 0%, #AB9A8520 50%, #F9731620 100%)',
//   }
// } as const

export const themes: Record<ThemeName, ThemeTokens> = {
  tammat: {
   

      name: 'TAMMAT Global',
  
      /* Core Brand - Identity & Trust */
      primary: '#0F2A44',           // Brand Authority (The Navy)
      primaryHover: '#163B5F',
      primaryActive: '#0A1E32',
      onPrimary: '#FFFFFF',         // Logo/Text on Navy
  
      /* Action - Momentum & Energy */
      action: '#BBF451',            // The "Go" Green (For CTAs)
      actionHover: '#A8DC45',
      actionText: '#0F2A44',        // High-contrast Navy text on Green buttons
  
      /* Premium - Express / VIP Services */
      accent: '#B68A35',            // Gold for "Express Processing"
      accentLight: '#FAF3E0',
  
      /* Typography */
      text: '#0F2A44',              // Navy for all primary reading
      textSecondary: '#4B5563',     // Slate for metadata
      textMuted: '#94A3B8',         // For labels and hints
      heading: '#0F2A44',
  
      /* Surfaces & Backgrounds */
      background: '#F8FAFC',        // Ultra-light Slate
      surface: '#FFFFFF',           // Pure white cards
      surfaceDark: '#0F2A44',       // Dark mode or sidebar surface
      overlay: 'rgba(15, 42, 68, 0.6)',
  
      /* Buttons & Controls */
      buttonPrimary: '#BBF451',     // Green for "Submit" or "Continue"
      buttonSecondary: '#0F2A44',   // Navy for "Download" or "View"
      inputBorder: '#E2E8F0',
      inputFocus: '#BBF451',
  
      /* Status - Semantic Clarity */
      statusSuccess: '#10B981',     // Standard Green (Trust)
      statusPending: '#F59E0B',     // Amber (Wait)
      statusError: '#EF4444',       // Red (Issue)
      statusProcessing: '#0F2A44',  // Navy (Official Work)
  
      /* Navigation Shell */
      navBackground: '#0F2A44',     // The Navy Identity
      navText: '#FFFFFF',           // Logo White
      navActive: '#BBF451',         // The Green Highlight
  
      /* Gradients & Depth */
      gradientNavy: 'linear-gradient(135deg, #0F2A44 0%, #1A446D 100%)',
      gradientAction: 'linear-gradient(90deg, #BBF451, #D8F9A1)',
      shadow: '0 8px 30px rgba(15, 42, 68, 0.12)', // Signature Navy shadow

  },


  orange: {
    name: 'Blue Elite',
  
    /* Core Brand */
    primary: '#0A3269',          // deep royal blue from logo
    primaryHover: '#124582F',
    primaryActive: '#08264F',
  
    secondary: '#071426',        // near navy black
    secondaryHover: '#10233F',
  
    accent: '#5DA9FF',           // electric blue accent
    accentHover: '#3F8EF5',
    foreground: '#000000',
    /* Typography */
    text: '#0B1220',
    textSecondary: '#4B5563',
    textMuted: '#94A3B8',
    caption: '#64748B',
    heading: '#050816',
  
    /* Backgrounds */
    background: '#FFFFFF',
    surface: '#F4F8FF',          // subtle blue tint
    surfaceLight: '#FAFCFF',
    overlay: 'rgba(2,6,23,0.62)',
  
    /* Buttons */
    buttonText: '#FFFFFF',
    buttonHoverText: '#FFFFFF',
  
    disabledBackground: '#E5E7EB',
    disabledText: '#94A3B8',
  
    
    /* Inputs */
    inputBackground: '#FFFFFF',
    inputBorder: '#CBD5E1',
  
    /* Borders */
    border: '#D6E0F0',
    borderLight: '#EDF2F7',
  
    /* States */
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#2563EB',
  
    /* Status */
    statusPending: '#F59E0B',
    statusInProgress: '#2563EB',
    statusApproved: '#16A34A',
    statusRejected: '#DC2626',
  
    /* Navigation */
    navbarBackground: '#FFFFFF',
    navbarText: '#0B1220',
  
    sidebarBackground: '#08182D',
    sidebarText: '#E2E8F0',
    sidebarActive: '#0A3269',
  
    /* Dialogs */
    dialogBackground: '#FFFFFF',
    dialogBorder: '#D9E2F2',
  
    /* Charts */
    chartPrimary: '#0A3269',
    chartSecondary: '#2563EB',
    chartAccent: '#5DA9FF',
    chartWarning: '#F59E0B',
    chartSuccess: '#16A34A',
  
    /* Gradients */
    gradient:
      'linear-gradient(135deg, #071426 0%, #0A3269 45%, #2563EB 100%)',
  
    gradientSubtle:
      'linear-gradient(135deg, rgba(7,20,38,0.08) 0%, rgba(10,50,105,0.08) 50%, rgba(37,99,235,0.08) 100%)',
  
    gradientButton:
      'linear-gradient(90deg, #0A3269 0%, #12458F 100%)',
  
    highlight: '#EAF2FF',
  
    /* Shadows */
    shadowSm: '0 1px 2px rgba(2,6,23,0.05)',
    shadowMd: '0 10px 30px rgba(10,50,105,0.12)',
    shadowLg: '0 24px 80px rgba(2,6,23,0.18)',
  },

 
  dark: {
    name: 'Dark Professional',
  

    primary: '#0A3269',         // neon-lime (accent, 10%)
    primaryHover: '#A6DD3A',
    primaryActive: '#8CC92C',
    accent: '#F97316',          // secondary accent (optional usage)
    accentHover: '#EA580C',
    secondary: '#FFFFFF',
    /* === Text Colors === */
    text: '#F5F5F5',            // main text (white-gray)
    textSecondary: '#A1A1AA',   // for paragraphs, inputs, etc.
    textMuted: '#71717A',       // low emphasis (placeholders)
    caption: '#9CA3AF',         // caption / timestamp
    heading: '#FFFFFF',         // headings pure white
  
    /* === Backgrounds (60%) === */
    background: '#0B0B0B',      // main page background
    surface: '#141414',         // cards / panels
    surfaceLight: '#1E1E1E',    // input / field backgrounds
    overlay: 'rgba(0,0,0,0.6)', // modal overlay
    
    foreground: '#FFFFFF',
    /* === Buttons & Controls (10%) === */
    // buttonBackground: '#BBF451',
    // buttonHover: '#A6DD3A',
    buttonText: '#000000',
    buttonHoverText: '#000000',
    disabledBackground: '#2A2A2A',
    disabledText: '#71717A',
    inputBackground: '#1A1A1A',
    inputBorder: '#2E2E2E',
  
    /* === Borders === */
    border: '#27272A',
    borderLight: '#3F3F46',
  
    /* === Feedback === */
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
  
    /* === Status Colors === */
    statusPending: '#F59E0B',
    statusInProgress: '#60A5FA',
    statusApproved: '#10B981',
    statusRejected: '#EF4444',
  
    /* === Navigation / Shell === */
    navbarBackground: '#0B0B0B',
    navbarText: '#F5F5F5',
    sidebarBackground: '#111111',
    sidebarText: '#D4D4D8',
    sidebarActive: '#BBF451',
  
    /* === Dialogs === */
    dialogBackground: '#111111',
    dialogBorder: '#2D2D2D',
  
    /* === Charts / Data Visual === */
    chartPrimary: '#BBF451',
    chartSecondary: '#F97316',
    chartAccent: '#60A5FA',
    chartWarning: '#F59E0B',
    chartSuccess: '#10B981',
  
    /* === Highlights / Shadows === */
    highlight: '#1A1A1A',
    shadowSm: '0 1px 2px rgba(0,0,0,0.5)',
    shadowMd: '0 6px 20px rgba(0,0,0,0.6)',
    shadowLg: '0 18px 50px rgba(0,0,0,0.7)',
  },

  tammatOfficial: {
    name: 'Tammat Official',

    /* === Brand === */
    primary: '#b68a35',        // AEGold-500
    primaryHover: '#92722a',   // AEGold-600
    primaryActive: '#7c5e24',  // AEGold-700

    secondary: '#1b1d21',      // AEBLack-900
    secondaryHover: '#232528', // AEBLack-800

    accent: '#4a9d5c',         // AEGreen-500
    accentHover: '#3f8c53',

    /* === Text === */
    text: '#1b1d21',           // AEBLack-900
    textSecondary: '#5f646d',  // AEBLack-500
    textMuted: '#9ea2a9',      // AEBLack-300
    caption: '#797e86',       // AEBLack-400
    heading: '#0e0f12',        // AEBLack-950

    /* === Backgrounds / Surfaces === */
    background: '#f7f7f7',     // AEBLack-50
    surface: '#ffffff',
    surfaceLight: '#ffffff',
    overlay: 'rgba(0,0,0,0.5)',

    /* === Buttons & Controls === */
    buttonText: '#ffffff',
    buttonHoverText: '#ffffff',
    disabledBackground: '#e1e3e5', // AEBLack-100
    disabledText: '#9ea2a9',
    inputBackground: '#ffffff',
    inputBorder: '#e1e3e5',

    /* === Borders === */
    border: '#e1e3e5',
    borderLight: '#f3f4f6',

    /* === Feedback === */
    success: '#4a9d5c',    // AEGreen-500
    warning: '#f59e0b',
    error: '#ea4f49',      // AERed-500
    info: '#3b82f6',

    /* === Status === */
    statusPending: '#f59e0b',
    statusInProgress: '#3b82f6',
    statusApproved: '#4a9d5c',
    statusRejected: '#ea4f49',

    /* === Navigation / Shell === */
    navbarBackground: '#ffffff',
    navbarText: '#0e0f12',
    sidebarBackground: '#ffffff',
    sidebarText: '#0e0f12',
    sidebarActive: '#b68a35',

    /* === Dialogs === */
    dialogBackground: '#ffffff',
    dialogBorder: '#e1e3e5',

    /* === Charts === */
    chartPrimary: '#b68a35',
    chartSecondary: '#1b1d21',
    chartAccent: '#4a9d5c',
    chartWarning: '#f59e0b',
    chartSuccess: '#4a9d5c',

    /* === Gradients / Highlights === */
    gradient: 'linear-gradient(135deg, #b68a35 0%, #1b1d21 50%, #4a9d5c 100%)',
    gradientSubtle: 'linear-gradient(135deg, #b68a3520 0%, #1b1d2120 50%, #4a9d5c20 100%)',
    gradientButton: 'linear-gradient(90deg, #b68a35, #92722a)',
    highlight: '#fff7e0',

    /* === Shadows === */
    shadowSm: '0 1px 2px rgba(0,0,0,0.06)',
    shadowMd: '0 6px 24px rgba(0,0,0,0.10)',
    shadowLg: '0 20px 60px rgba(0,0,0,0.15)',
  },
} as const




// Color palette for reference
export const colorPalette = {
  // Brand Colors
  canvaTurquoise: '#00C4CC',
  canvaBlendBlue: '#5A32FA',
  canvaPurple: '#7D2AE8',
  
  // Neutrals
  black: '#0E1318',
  darkGreen: '#00500A',
  darkTurq: '#003C64',
  darkGray: '#293039',
  gray: '#EDF0F2',
  lightGray: '#F8F9F9',
  white: '#FFFFFF',

  // Playground Colors - Dark
  darkBlue: '#280F91',
  darkPurple: '#3C0F78',
  darkViolet: '#69005A',
  darkRed: '#6E0F2D',
  darkPink: '#FF5055',
  darkYellow: '#FF7828',

  // Playground Colors - Mid
  green: '#21A663',
  turq: '#0FB8CE',
  blue: '#597CFF',
  purple: '#A548FF',
  violet: '#D269E6',
  red: '#FF877D',
  pink: '#FFA5F0',
  yellow: '#FFD200',

  // Playground Colors - Light
  lightGreen: '#D2FFE6',
  lightTurq: '#B4F0F0',
  lightBlue: '#B4D7FF',
  lightPurple: '#E1C3FF',
  lightViolet: '#F0CDFF',
  lightRed: '#FFD7DC',
  lightPink: '#FFE6FF',
  lightYellow: '#FFFACD',
} as const

// Accessibility helpers
export const getContrastRatio = (foreground: string, background: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  return 4.5 // Placeholder - meets WCAG AA standard
}

export const isAccessible = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5
}

// Theme utilities
export const applyTheme = (themeName: ThemeName) => {
  const theme = themes[themeName]
  const root = document.documentElement
  // Apply CSS custom properties
  Object.entries(theme)?.forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--${key}`, value)
    }
  })

  root.classList.remove(...Object.keys(themes))
  // Add the new theme class
  root.classList.add(themeName)

  // Apply CSS vars
  Object.entries(theme).forEach(([key, value]) => {
    if (typeof value === "string") {
      root.style.setProperty(`--${key}`, value)
    }
  })
  
  // Store theme preference
  localStorage.setItem('tammat-theme', themeName)
}

export const getCurrentTheme = (): ThemeName => {
  const stored = localStorage.getItem('tammat-theme') as ThemeName
  return stored && themes[stored] ? stored : 'orange'
}

export const getThemeColors = (themeName: ThemeName) => themes[themeName]
