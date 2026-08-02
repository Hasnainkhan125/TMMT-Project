import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeName, Theme, themes, applyTheme, getCurrentTheme } from '@/styles/themes'

interface ThemeContextType {
  currentTheme: ThemeName
  theme: Theme
  setTheme: (themeName: ThemeName) => void
  toggleTheme: () => void
  availableThemes: Array<{ name: ThemeName; label: string }>
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined)



interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeName
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'orange' 
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>(() => {
    return getCurrentTheme() || defaultTheme
  })

  const theme = themes[currentTheme]

  const availableThemes = [
    // { name: 'tammatOfficial' as ThemeName, label: 'TAMMAT Official' },
    // { name: 'tammat' as ThemeName, label: 'TAMMAT Navy' },
    { name: 'orange' as ThemeName, label: 'Orange Burst' },
    // { name: 'neutral' as ThemeName, label: 'Canva Brand' },
    { name: 'dark' as ThemeName, label: 'Professional Dark' },
    // { name: 'minimal' as ThemeName, label: 'Vibrant Playground' },
  ]

  const setTheme = (themeName: ThemeName) => {
    setCurrentTheme(themeName)
    applyTheme(themeName)
  }

  const toggleTheme = () => {
    const currentIndex = availableThemes.findIndex(t => t.name === currentTheme)
    const nextIndex = currentIndex === availableThemes.length - 1 ? 0 : currentIndex + 1
    setTheme(availableThemes[nextIndex].name)
  }

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme])

  // Apply initial theme
  useEffect(() => {
    applyTheme(currentTheme)
  }, [])

  const value: ThemeContextType = {
    currentTheme,
    theme,
    setTheme,
    toggleTheme,
    availableThemes,
  }

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className="min-h-screen transition-all duration-300 ease-in-out"
        style={{
          backgroundColor: theme?.background,
          color: theme?.text,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}