/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#0f0e2a',
        },
        night: {
          50:  '#eeeef5',
          100: '#d3d3e8',
          200: '#acacd0',
          300: '#7c7cb0',
          400: '#565698',
          500: '#3d3d8a',
          600: '#2e2e7b',
          700: '#1f1f60',
          800: '#131343',
          900: '#0a0a2e',
          950: '#050516',
        }
      },
      backgroundImage: {
        'mesh-1': 'radial-gradient(at 40% 20%, hsla(240,80%,25%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(260,90%,20%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(220,70%,15%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(240,60%,12%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(250,80%,18%,1) 0px, transparent 50%)',
      },
      keyframes: {
        pulse2: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(1.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%': { transform: 'translateX(-6px)' },
          '30%': { transform: 'translateX(6px)' },
          '45%': { transform: 'translateX(-5px)' },
          '60%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-3px)' },
          '90%': { transform: 'translateX(3px)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse2 2s cubic-bezier(0.4,0,0.6,1) infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 4s ease-in-out infinite',
        shake: 'shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.35)',
        'inner-light': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      }
    },
  },
  plugins: [],
}
