// Utility to help replace hardcoded colors with theme-aware classes
export const THEME_COLOR_MAP = {
  // Background colors
  'bg-background': 'bg-background',
  'bg-surface-light': 'bg-surface-light',
  'bg-surface': 'bg-surface',
  'bg-surface': 'bg-background',
  'bg-slate-900': 'bg-primary',
  'bg-blue-50': 'bg-surface-light',
  'bg-green-50': 'bg-surface-light',
  'bg-red-50': 'bg-surface-light',
  'bg-yellow-50': 'bg-surface-light',
  'bg-orange-50': 'bg-surface-light',
  
  // Text colors
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  'text-text-secondary': 'text-text-secondary',
  'text-foreground': 'text-foreground',
  'text-foreground': 'text-foreground',
  'text-foreground': 'text-foreground',
  'text-text-secondary': 'text-text-secondary',
  'text-foreground': 'text-foreground',
  'text-foreground': 'text-foreground',
  'text-foreground': 'text-foreground',
  
  // Border colors
  'border-white': 'border-border',
  'border-border': 'border-border',
  'border-border': 'border-border',
  'border-border': 'border-border',
  'border-border': 'border-border',
  
  // Hardcoded theme colors that should be replaced
  'text-primary': 'text-primary',
  'bg-primary': 'bg-primary',
  'border-primary': 'border-primary',
  'text-accent': 'text-accent',
  'bg-accent': 'bg-accent',
  'border-accent': 'border-accent',
  'text-secondary': 'text-secondary',
  'bg-secondary': 'bg-secondary',
  'border-secondary': 'border-secondary',
  
  // With opacity
  'bg-primary/10': 'bg-primary/10',
  'bg-primary/20': 'bg-primary/20',
  'bg-primary/30': 'bg-primary/30',
  'border-primary/30': 'border-primary/30',
  'border-primary/20': 'border-primary/20',
  'hover:bg-primary': 'hover:bg-primary',
  'hover:bg-primary/10': 'hover:bg-primary/10',
  'hover:bg-primary/90': 'hover:bg-primary/90',
  'hover:text-primary': 'hover:text-primary',
} as const

// Common theme-aware component classes
export const THEME_COMPONENT_CLASSES = {
  card: 'bg-surface border-border text-foreground',
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border-border text-foreground hover:bg-surface',
    ghost: 'hover:bg-surface text-foreground',
  },
  input: 'bg-background border-border text-foreground placeholder:text-text-muted',
  badge: {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-surface text-text-secondary',
    success: 'bg-success text-background',
    warning: 'bg-warning text-background',
    error: 'bg-error text-background',
  },
  avatar: 'bg-surface border-border',
  dialog: 'bg-background border-border text-foreground',
  tabs: {
    list: 'bg-surface border-border',
    trigger: 'text-text-secondary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
  }
} as const

// Function to get theme-aware classes
export const getThemeClass = (originalClass: string): string => {
  return THEME_COLOR_MAP[originalClass as keyof typeof THEME_COLOR_MAP] || originalClass
}

// Function to replace multiple classes
export const replaceHardcodedColors = (className: string): string => {
  let result = className
  Object.entries(THEME_COLOR_MAP).forEach(([hardcoded, themed]) => {
    result = result.replace(new RegExp(hardcoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), themed)
  })
  return result
}
