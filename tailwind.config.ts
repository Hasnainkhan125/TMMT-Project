/** @type {import('tailwindcss').Config} */

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Font Configuration
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },

      // Custom Colors for Tammat Brand
      colors: {
        // Brand Colors
        primary: {
          DEFAULT: '#0F1B3D', // Navy blue
          50: '#F0F3F9',
          100: '#E1E7F3',
          200: '#C3CFE7',
          300: '#A5B7DB',
          400: '#879FCF',
          500: '#6987C3',
          600: '#4B6FB7',
          700: '#0F1B3D',
          800: '#0A1229',
          900: '#050815',
        },
        accent: {
          DEFAULT: '#D4A24C', // Gold
          50: '#FEF9F0',
          100: '#FDF3E1',
          200: '#FBE7C3',
          300: '#F9DBA5',
          400: '#F7CF87',
          500: '#D4A24C',
          600: '#C49839',
          700: '#B48E26',
          800: '#9A7A1D',
          900: '#806614',
        },
        background: {
          DEFAULT: '#FAFAF7', // Off-white
          secondary: '#F5F5F2',
          tertiary: '#EEEEEA',
        },
        // Status Colors
        status: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        // HSL Variables (for existing components)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },

      // Border Radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // Custom Shadows
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        button: '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'button-lg': '0 4px 12px 0 rgba(15, 27, 61, 0.15)',
        'input-focus': '0 0 0 3px rgba(15, 27, 61, 0.1), 0 0 0 1px rgba(15, 27, 61, 0.2)',
      },

      // Custom Spacing (for notch support and custom layouts)
      spacing: {
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-left': 'max(1rem, env(safe-area-inset-left))',
        'safe-right': 'max(1rem, env(safe-area-inset-right))',
      },

      // Custom Keyframes and Animations
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'bounce-soft': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-4px)',
          },
        },
        confetti: {
          '0%': {
            transform: 'translate3d(0, 0, 0) rotateZ(0deg)',
            opacity: '1',
          },
          '100%': {
            transform: 'translate3d(25px, 25px, 0) rotateZ(360deg)',
            opacity: '0',
          },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        confetti: 'confetti 2s ease-in forwards',
      },

      // Utility for RTL support
      direction: ['ltr', 'rtl'],
    },
  },

  // Safelist for dynamic class generation (status colors)
  safelist: [
    // Status color variants for yellow (warning)
    {
      pattern: /^(bg|text|border)-(yellow|amber)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Status color variants for blue (info)
    {
      pattern: /^(bg|text|border)-(blue)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Status color variants for purple (pending)
    {
      pattern: /^(bg|text|border)-(purple|violet)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Status color variants for green (success)
    {
      pattern: /^(bg|text|border)-(green|emerald)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Status color variants for red (error)
    {
      pattern: /^(bg|text|border)-(red|rose)-(50|100|200|300|400|500|600|700|800|900)$/,
    },
    // Ring variants for status colors
    {
      pattern: /^ring-(yellow|amber|blue|purple|violet|green|emerald|red|rose)/,
    },
  ],

  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    {
      // Custom plugin for RTL utilities
      handler: ({ addUtilities, e }: any) => {
        addUtilities({
          '.rtl': {
            direction: 'rtl',
            textAlign: 'right',
          },
          '.ltr': {
            direction: 'ltr',
            textAlign: 'left',
          },
          '.rtl @supports (padding: max(0px))': {
            '.rtl-safe-ml': {
              marginLeft: 'max(1rem, env(safe-area-inset-left))',
            },
            '.rtl-safe-mr': {
              marginRight: 'max(1rem, env(safe-area-inset-right))',
            },
          },
        });
      },
    },
  ],
};
  