import React, { useContext, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Palette, 
  Check, 
  Sun, 
  Moon, 
  Sparkles, 
  Monitor,
  Zap,
  ChevronDown,
  Eye
} from 'lucide-react'
import { ThemeContext } from '@/contexts/ThemeContext'

interface ThemeSelectorProps {
  className?: string
  showPreview?: boolean
  compact?: boolean
}


export const useTheme = () => {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  className = '', 
  showPreview = true,
  compact = false
}) => {
  const { currentTheme, setTheme, availableThemes, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'tammat': return <Monitor className="w-4 h-4" />
      case 'orange': return <Sun className="w-4 h-4" />
      case 'neutral': return <Sparkles className="w-4 h-4" />
      case 'minimal': return <Moon className="w-4 h-4" />
      case 'dark': return <Zap className="w-4 h-4" />
      default: return <Palette className="w-4 h-4" />
    }
  }

  const getThemePreview = (themeName: string) => {
    const previewTheme = availableThemes.find(t => t.name === themeName)
    if (!previewTheme) return null

    const colors = {
      tammat: ['#00500A', '#003C64', '#00C4CC'],
      orange: ['#FF7828', '#FFD200', '#FF877D'],
      neutral: ['#7D2AE8', '#5A32FA', '#00C4CC'],
      professional: ['#597CFF', '#280F91', '#0FB8CE'],
      minimal: ['#A548FF', '#D269E6', '#FFA5F0'],
      dark: ['#A548FF', '#D269E6', '#FFA5F0'],
    }

    return (
      <div className="flex space-x-1">
        {colors[themeName as keyof typeof colors]?.map((color, index) => (
          <div
            key={index}
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    )
  }

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/10 backdrop-blur-sm border-white/20 text-white hover:bg-background/20"
          style={{
            backgroundColor: `${theme?.surface}20`,
            borderColor: `${theme?.border}40`,
            color: theme?.text
          }}
        >
          <Palette className="w-4 h-4 mr-2" />
          Themes
          <ChevronDown className={`w-3 h-3 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card 
                className="w-64 shadow-xl border"
                style={{
                  backgroundColor: theme?.surface,
                  borderColor: theme?.border
                }}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {availableThemes.map((themeOption) => (
                      <Button
                        key={themeOption.name}
                        variant="ghost"
                        onClick={() => {
                          setTheme(themeOption.name)
                          setIsOpen(false)
                        }}
                        className={`w-full justify-start p-3 h-auto transition-all duration-200 ${
                          currentTheme === themeOption.name 
                            ? 'bg-opacity-20 ring-2' 
                            : 'hover:bg-opacity-10'
                        }`}
                        style={{
                          backgroundColor: currentTheme === themeOption.name 
                            ? `${theme.primary}20` 
                            : 'transparent',
                          color: theme.text,
                          ringColor: currentTheme === themeOption.name ? theme?.primary : 'transparent'
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            {getThemeIcon(themeOption.name)}
                            <span className="font-medium">{themeOption.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {showPreview && getThemePreview(themeOption.name)}
                            {currentTheme === themeOption.name && (
                              <Check className="w-4 h-4" style={{ color: theme.primary }} />
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Card className={`${className}`} style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5" style={{ color: theme.primary }} />
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>Theme Selector</h3>
          </div>
          <Badge 
            variant="secondary" 
            className="text-xs"
            style={{ 
              backgroundColor: `${theme.primary}20`, 
              color: theme.primary,
              borderColor: `${theme.primary}40`
            }}
          >
            <Eye className="w-3 h-3 mr-1" />
            Live Preview
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {availableThemes.map((themeOption) => (
            <motion.div
              key={themeOption.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="outline"
                onClick={() => setTheme(themeOption.name)}
                className={`w-full justify-start p-4 h-auto transition-all duration-300 ${
                  currentTheme === themeOption.name 
                    ? 'ring-2 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                style={{
                  backgroundColor: currentTheme === themeOption.name 
                    ? `${theme.primary}10` 
                    : theme.surfaceLight,
                  borderColor: currentTheme === themeOption.name 
                    ? theme.primary 
                    : theme.border,
                  color: theme.text,
                  ringColor: currentTheme === themeOption.name ? theme.primary : 'transparent'
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    {getThemeIcon(themeOption.name)}
                    <div className="text-left">
                      <div className="font-medium">{themeOption.label}</div>
                      {currentTheme === themeOption.name && (
                        <div className="text-xs opacity-70">Current theme</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {showPreview && (
                      <div className="flex items-center space-x-1">
                        {getThemePreview(themeOption.name)}
                      </div>
                    )}
                    {currentTheme === themeOption.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <Check className="w-5 h-5" style={{ color: theme.primary }} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${theme.primary}10` }}>
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm font-medium" style={{ color: theme.text }}>Current Theme</span>
          </div>
          <div className="text-xs opacity-70" style={{ color: theme.textSecondary }}>
            {availableThemes.find(t => t.name === currentTheme)?.label} theme is active
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
