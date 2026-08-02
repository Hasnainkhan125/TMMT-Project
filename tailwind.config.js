// /** @type {import('tailwindcss').Config} */
// export default {
//   darkMode: ["class"],
//   content: [
//     './pages/**/*.{ts,tsx}',
//     './components/**/*.{ts,tsx}',
//     './app/**/*.{ts,tsx}',
//     './src/**/*.{ts,tsx}',
//   ],
//   prefix: "",
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       // Custom color palette based on UAE Government Brand
//       colors: {
//         // Primary brand colors (UAE Government Blue)
//         primary: {
//           50: '#f0f8ff',
//           100: '#e0f0ff',
//           200: '#bae0ff',
//           300: '#7dc8ff',
//           400: '#38a8ff',
//           500: '#0d8aff', // UAE Government Blue
//           600: '#0066cc',
//           700: '#0052a3',
//           800: '#004080',
//           900: '#002e5c',
//           950: '#001a33',
//         },

//         // Secondary colors (Professional Greens)
//         secondary: {
//           50: '#f0fdf4',
//           100: '#dcfce7',
//           200: '#bbf7d0',
//           300: '#86efac',
//           400: '#4ade80',
//           500: '#22c55e', // Success green
//           600: '#16a34a',
//           700: '#15803d',
//           800: '#166534',
//           900: '#14532d',
//           950: '#052e16',
//         },

//         // Accent colors (Warm Gold)
//         accent: {
//           50: '#fffbeb',
//           100: '#fef3c7',
//           200: '#fde68a',
//           300: '#fcd34d',
//           400: '#fbbf24',
//           500: '#f59e0b', // Brand gold
//           600: '#d97706',
//           700: '#b45309',
//           800: '#92400e',
//           900: '#78350f',
//           950: '#451a03',
//         },
        
//         // Neutral colors (Professional Grays)
//         neutral: {
//           50: '#fafafa',
//           100: '#f5f5f5',
//           200: '#e5e5e5',
//           300: '#d4d4d4',
//           400: '#a3a3a3',
//           500: '#737373',
//           600: '#525252',
//           700: '#404040',
//           800: '#262626',
//           900: '#171717',
//           950: '#0a0a0a',
//         },

//         // Semantic colors
//         success: {
//           50: '#f0fdf4',
//           100: '#dcfce7',
//           200: '#bbf7d0',
//           300: '#86efac',
//           400: '#4ade80',
//           500: '#22c55e',
//           600: '#16a34a',
//           700: '#15803d',
//           800: '#166534',
//           900: '#14532d',
//         },
        
//         warning: {
//           50: '#fffbeb',
//           100: '#fef3c7',
//           200: '#fde68a',
//           300: '#fcd34d',
//           400: '#fbbf24',
//           500: '#f59e0b',
//           600: '#d97706',
//           700: '#b45309',
//           800: '#92400e',
//           900: '#78350f',
//         },
        
//         error: {
//           50: '#fef2f2',
//           100: '#fee2e2',
//           200: '#fecaca',
//           300: '#fca5a5',
//           400: '#f87171',
//           500: '#ef4444',
//           600: '#dc2626',
//           700: '#b91c1c',
//           800: '#991b1b',
//           900: '#7f1d1d',
//         },
        
//         info: {
//           50: '#eff6ff',
//           100: '#dbeafe',
//           200: '#bfdbfe',
//           300: '#93c5fd',
//           400: '#60a5fa',
//           500: '#3b82f6',
//           600: '#2563eb',
//           700: '#1d4ed8',
//           800: '#1e40af',
//           900: '#1e3a8a',
//         },
        
//         // Border colors
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//       },
      
//       // Custom spacing scale (4px grid)
//       spacing: {
//         '18': '4.5rem',   // 72px
//         '88': '22rem',    // 352px
//         '128': '32rem',   // 512px
//       },
      
//       // Custom border radius
//       borderRadius: {
//         '4xl': '2rem',    // 32px
//         '5xl': '2.5rem',  // 40px
//         '6xl': '3rem',    // 48px
//       },
      
//       // Custom shadows
//       boxShadow: {
//         'primary': '0 4px 14px 0 rgb(14 165 233 / 0.25)',
//         'secondary': '0 4px 14px 0 rgb(34 197 94 / 0.25)',
//         'accent': '0 4px 14px 0 rgb(245 158 11 / 0.25)',
//         'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
//         'medium': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
//         'strong': '0 8px 32px 0 rgb(0 0 0 / 0.16)',
//         'glow': '0 0 20px 0 rgb(14 165 233 / 0.3)',
//       },
      
//       // Custom animations
//       animation: {
//         'fade-in': 'fadeIn 0.5s ease-in-out',
//         'fade-in-up': 'fadeInUp 0.5s ease-out',
//         'fade-in-down': 'fadeInDown 0.5s ease-out',
//         'slide-in-left': 'slideInLeft 0.3s ease-out',
//         'slide-in-right': 'slideInRight 0.3s ease-out',
//         'scale-in': 'scaleIn 0.2s ease-out',
//         'bounce-gentle': 'bounceGentle 2s infinite',
//         'pulse-gentle': 'pulseGentle 3s ease-in-out infinite',
//         'float': 'float 6s ease-in-out infinite',
//         'shimmer': 'shimmer 2s linear infinite',
//       },
      
//       // Custom keyframes
//       keyframes: {
//         fadeIn: {
//           '0%': { opacity: '0' },
//           '100%': { opacity: '1' },
//         },
//         fadeInUp: {
//           '0%': { opacity: '0', transform: 'translateY(20px)' },
//           '100%': { opacity: '1', transform: 'translateY(0)' },
//         },
//         fadeInDown: {
//           '0%': { opacity: '0', transform: 'translateY(-20px)' },
//           '100%': { opacity: '1', transform: 'translateY(0)' },
//         },
//         slideInLeft: {
//           '0%': { opacity: '0', transform: 'translateX(-20px)' },
//           '100%': { opacity: '1', transform: 'translateX(0)' },
//         },
//         slideInRight: {
//           '0%': { opacity: '0', transform: 'translateX(20px)' },
//           '100%': { opacity: '1', transform: 'translateX(0)' },
//         },
//         scaleIn: {
//           '0%': { opacity: '0', transform: 'scale(0.9)' },
//           '100%': { opacity: '1', transform: 'scale(1)' },
//         },
//         bounceGentle: {
//           '0%, 100%': { transform: 'translateY(0)' },
//           '50%': { transform: 'translateY(-10px)' },
//         },
//         pulseGentle: {
//           '0%, 100%': { opacity: '1' },
//           '50%': { opacity: '0.8' },
//         },
//         float: {
//           '0%, 100%': { transform: 'translateY(0px)' },
//           '50%': { transform: 'translateY(-20px)' },
//         },
//         shimmer: {
//           '0%': { transform: 'translateX(-100%)' },
//           '100%': { transform: 'translateX(100%)' },
//         },
//       },
      
//       // Custom font families
//       fontFamily: {
//         'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
//         'display': ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
//         'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
//       },
      
//       // Custom font sizes
//       fontSize: {
//         'xs': ['0.75rem', { lineHeight: '1rem' }],
//         'sm': ['0.875rem', { lineHeight: '1.25rem' }],
//         'base': ['1rem', { lineHeight: '1.5rem' }],
//         'lg': ['1.125rem', { lineHeight: '1.75rem' }],
//         'xl': ['1.25rem', { lineHeight: '1.75rem' }],
//         '2xl': ['1.5rem', { lineHeight: '2rem' }],
//         '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
//         '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
//         '5xl': ['3rem', { lineHeight: '1' }],
//         '6xl': ['3.75rem', { lineHeight: '1' }],
//         '7xl': ['4.5rem', { lineHeight: '1' }],
//         '8xl': ['6rem', { lineHeight: '1' }],
//         '9xl': ['8rem', { lineHeight: '1' }],
//       },
      
//       // Custom line heights
//       lineHeight: {
//         'tight': '1.25',
//         'snug': '1.375',
//         'normal': '1.5',
//         'relaxed': '1.625',
//         'loose': '2',
//       },
      
//       // Custom letter spacing
//       letterSpacing: {
//         'tighter': '-0.05em',
//         'tight': '-0.025em',
//         'normal': '0em',
//         'wide': '0.025em',
//         'wider': '0.05em',
//         'widest': '0.1em',
//       },
      
//       // Custom backdrop blur
//       backdropBlur: {
//         'xs': '2px',
//         'sm': '4px',
//         'md': '8px',
//         'lg': '12px',
//         'xl': '16px',
//         '2xl': '24px',
//         '3xl': '40px',
//       },
      
//       // Custom gradients
//       backgroundImage: {
//         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//         'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
//         'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
//         'gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
//         'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
//         'gradient-neutral': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
//         'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
//       },
      
//       // Custom transitions
//       transitionDuration: {
//         '75': '75ms',
//         '100': '100ms',
//         '150': '150ms',
//         '200': '200ms',
//         '300': '300ms',
//         '500': '500ms',
//         '700': '700ms',
//         '1000': '1000ms',
//       },
      
//       transitionTimingFunction: {
//         'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
//         'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
//         'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
//       },
      
//       // Custom z-index
//       zIndex: {
//         '60': '60',
//         '70': '70',
//         '80': '80',
//         '90': '90',
//         '100': '100',
//       },
      
//       // Custom max widths
//       maxWidth: {
//         '8xl': '88rem',
//         '9xl': '96rem',
//       },
      
//       // Custom min heights
//       minHeight: {
//         'screen-75': '75vh',
//         'screen-90': '90vh',
//       },
      
//       // Custom heights
//       height: {
//         'screen-75': '75vh',
//         'screen-90': '90vh',
//       },
      
//       // Custom widths
//       width: {
//         '18': '4.5rem',
//         '88': '22rem',
//         '128': '32rem',
//       },
      
//       // Custom grid templates
//       gridTemplateColumns: {
//         '13': 'repeat(13, minmax(0, 1fr))',
//         '14': 'repeat(14, minmax(0, 1fr))',
//         '15': 'repeat(15, minmax(0, 1fr))',
//         '16': 'repeat(16, minmax(0, 1fr))',
//       },
      
//       // Custom grid template rows
//       gridTemplateRows: {
//         '7': 'repeat(7, minmax(0, 1fr))',
//         '8': 'repeat(8, minmax(0, 1fr))',
//         '9': 'repeat(9, minmax(0, 1fr))',
//         '10': 'repeat(10, minmax(0, 1fr))',
//       },
      
//       // Custom flex basis
//       flexBasis: {
//         '1/7': '14.2857143%',
//         '2/7': '28.5714286%',
//         '3/7': '42.8571429%',
//         '4/7': '57.1428571%',
//         '5/7': '71.4285714%',
//         '6/7': '85.7142857%',
//       },
      
//       // Custom aspect ratios
//       aspectRatio: {
//         '4/3': '4 / 3',
//         '3/2': '3 / 2',
//         '2/3': '2 / 3',
//         '9/16': '9 / 16',
//         '16/9': '16 / 9',
//       },
      
//       // Custom scrollbar
//       scrollbar: {
//         'thin': '8px',
//         'none': 'none',
//       },
      
//       // Custom scrollbar thumb
//       scrollbarThumb: {
//         'primary': '#0ea5e9',
//         'secondary': '#22c55e',
//         'accent': '#f59e0b',
//       },
      
//       // Custom scrollbar track
//       scrollbarTrack: {
//         'primary': '#f0f9ff',
//         'secondary': '#f0fdf4',
//         'accent': '#fffbeb',
//       },
//     },
//   },
//   plugins: [
//     require("tailwindcss-animate"),
//     require("@tailwindcss/forms"),
//     require("@tailwindcss/typography"),
//     require("@tailwindcss/aspect-ratio"),
//   ],
// }
  






/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
   "./src/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
  "./pages/**/*.{js,jsx,ts,tsx}",
  "./app/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Theme-aware color system using CSS custom properties
      colors: {
        // Theme-aware colors (updated by ThemeContext)
        // primary: {
        //   DEFAULT: 'var(--theme-primary)',
        //   foreground: 'var(--theme-text)',
        // },
        // secondary: {
        //   DEFAULT: 'var(--theme-secondary)',
        //   foreground: 'var(--theme-text)',
        // },
        // accent: {
        //   DEFAULT: 'var(--theme-accent)',
        //   foreground: 'var(--theme-text)',
        // },
        // textSecondary: {
        //   DEFAULT: 'var(--theme-textSecondary)',
        //   foreground: 'var(--theme-text)',
        //   hover: 'var(--theme-buttonHoverText)',
        // },
        

        // foreground: "var(--foreground)",
        // background: "var(--background)",
        // surface: "var(--surface)",
        // primary: "var(--primary)",
        // secondary: "var(--secondary)",
        // accent: "var(--accent)",
        // text: "var(--text)",
        // border: "var(--border)",
        // textSecondary: "var(--textSecondary)",
        // textMuted: "var(--textMuted)",
        // textPrimary: "var(--textPrimary)",
        // textSecondary: "var(--textSecondary)",
        // textMuted: "var(--textMuted)",
        // buttonText: "var(--buttonText)",
        // buttonHoverText: "var(--buttonHoverText)",

        // foreground: 'var(--theme-text)',
        // surface: 'var(--theme-surface)',
        // 'surface-light': 'var(--theme-surfaceLight)',
        // 'text-secondary': 'var(--theme-textSecondary)',
        // 'text-muted': 'var(--theme-textMuted)',
        // border: 'var(--theme-border)',
        // 'border-light': 'var(--theme-borderLight)',
        // success: 'var(--theme-success)',
        // warning: 'var(--theme-warning)',
        // error: 'var(--theme-error)',
        // info: 'var(--theme-info)',
        
          primary: 'var(--primary)',
          'primary-hover': 'var(--primaryHover)',
          'primary-active': 'var(--primaryActive)',
      
          'button-text': 'var(--buttonText)',
        'button-hover-text': 'var(--buttonHoverText)',
        
          secondary: 'var(--secondary)',
          accent: 'var(--accent)',
      
          background: 'var(--background)',
          surface: 'var(--surface)',
          'surface-light': 'var(--surfaceLight)',
      
          text: 'var(--text)',
          'text-secondary': 'var(--textSecondary)',
          'text-muted': 'var(--textMuted)',
          caption: 'var(--caption)',
          heading: 'var(--heading)',
      
          border: 'var(--border)',
          'border-light': 'var(--borderLight)',
      
          success: 'var(--success)',
          warning: 'var(--warning)',
          error: 'var(--error)',
          info: 'var(--info)',
      
          // additional tokens
          'status-pending': 'var(--statusPending)',
          'status-inprogress': 'var(--statusInProgress)',
          'status-approved': 'var(--statusApproved)',
          'status-rejected': 'var(--statusRejected)',
      
          // charts
          'chart-primary': 'var(--chartPrimary)',
          'chart-secondary': 'var(--chartSecondary)',
          'chart-accent': 'var(--chartAccent)',
      
          // gradients (used with bg-[var(--color-gradient)] if needed)
          gradient: 'var(--gradient)',
          'gradient-subtle': 'var(--gradientSubtle)',
        

        // Gradient support
        'gradient-from': 'var(--theme-primary)',
        'gradient-via': 'var(--theme-secondary)',
        'gradient-to': 'var(--theme-accent)',
        
        // Standard shadcn/ui colors (fallbacks)
        input: "hsl(var(--input, 255 255 255))",
          ring: 'var(--theme-primary)',
        destructive: {
          DEFAULT: 'var(--theme-error)',
          foreground: 'var(--theme-text)',
        },
        muted: {
          DEFAULT: 'var(--theme-surface)',
          foreground: 'var(--theme-textMuted)',
        },
        popover: {
          DEFAULT: 'var(--theme-surface)',
          foreground: 'var(--theme-text)',
        },
        card: {
          DEFAULT: 'var(--theme-surface)',
          foreground: 'var(--theme-text)',
        },
        
        // Static colors for consistency
        white: '#ffffff',
        black: '#000000',
        transparent: 'transparent',
        current: 'currentColor',
        
        // Neutral grays (always available)
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
      },
      
      // Custom spacing scale (4px grid)
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '128': '32rem',   // 512px
      },
      
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',    // 32px
        '5xl': '2.5rem',  // 40px
        '6xl': '3rem',    // 48px
      },
      
      // Custom shadows
      boxShadow: {
        'primary': '0 4px 14px 0 rgb(14 165 233 / 0.25)',
        'secondary': '0 4px 14px 0 rgb(34 197 94 / 0.25)',
        'accent': '0 4px 14px 0 rgb(245 158 11 / 0.25)',
        'soft': '0 2px 8px 0 rgb(0 0 0 / 0.08)',
        'medium': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        'strong': '0 8px 32px 0 rgb(0 0 0 / 0.16)',
        'glow': '0 0 20px 0 rgb(14 165 233 / 0.3)',
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-out',
        'fade-in-down': 'fadeInDown 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-gentle': 'pulseGentle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      // Custom font families
      fontFamily: {
        'sans': ['Poppins', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'display': ['Poppins', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
      },
      
      // Custom font sizes
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Custom line heights
      lineHeight: {
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      
      // Custom letter spacing
      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      
      // Custom backdrop blur
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // Custom gradients
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-neutral': 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      
      // Custom transitions
      transitionDuration: {
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },
      
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Custom z-index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      
      // Custom max widths
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      
      // Custom min heights
      minHeight: {
        'screen-75': '75vh',
        'screen-90': '90vh',
      },
      
      // Custom heights
      height: {
        'screen-75': '75vh',
        'screen-90': '90vh',
      },
      
      // Custom widths
      width: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom grid templates
      gridTemplateColumns: {
        '13': 'repeat(13, minmax(0, 1fr))',
        '14': 'repeat(14, minmax(0, 1fr))',
        '15': 'repeat(15, minmax(0, 1fr))',
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      
      // Custom grid template rows
      gridTemplateRows: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
        '9': 'repeat(9, minmax(0, 1fr))',
        '10': 'repeat(10, minmax(0, 1fr))',
      },
      
      // Custom flex basis
      flexBasis: {
        '1/7': '14.2857143%',
        '2/7': '28.5714286%',
        '3/7': '42.8571429%',
        '4/7': '57.1428571%',
        '5/7': '71.4285714%',
        '6/7': '85.7142857%',
      },
      
      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
        '16/9': '16 / 9',
      },
      
      // Custom scrollbar
      scrollbar: {
        'thin': '8px',
        'none': 'none',
      },
      
      // Custom scrollbar thumb
      scrollbarThumb: {
        'primary': '#0ea5e9',
        'secondary': '#22c55e',
        'accent': '#f59e0b',
      },
      
      // Custom scrollbar track
      scrollbarTrack: {
        'primary': '#f0f9ff',
        'secondary': '#f0fdf4',
        'accent': '#fffbeb',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
}
  