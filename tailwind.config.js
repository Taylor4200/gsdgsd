/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        neon: {
          blue: '#3b82f6',
          purple: '#6366f1',
          pink: '#ec4899',
          green: '#10b981',
          yellow: '#f59e0b',
          orange: '#f97316',
        },
        dark: {
          100: '#1a1a1a',
          200: '#2d2d2d',
          300: '#404040',
          400: '#525252',
          500: '#666666',
          600: '#808080',
          700: '#999999',
          800: '#b3b3b3',
          900: '#cccccc',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neon-gradient': 'linear-gradient(45deg, #3b82f6, #6366f1, #ec4899)',
        'casino-gradient': 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': {
            opacity: 1,
            boxShadow: '0 0 5px #3b82f6, 0 0 10px #3b82f6',
          },
          '50%': {
            opacity: 0.8,
            boxShadow: '0 0 15px #3b82f6, 0 0 30px #3b82f6',
          },
        },
        'glow': {
          'from': {
            textShadow: '0 0 5px #3b82f6, 0 0 10px #3b82f6',
          },
          'to': {
            textShadow: '0 0 15px #3b82f6, 0 0 25px #3b82f6',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      fontFamily: {
        'futuristic': ['Orbitron', 'monospace'],
        'gaming': ['Rajdhani', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon': '0 0 5px #3b82f6, 0 0 10px #3b82f6',
        'neon-purple': '0 0 5px #6366f1, 0 0 10px #6366f1',
        'neon-pink': '0 0 5px #ec4899, 0 0 10px #ec4899',
        'neon-hover': '0 0 20px #3b82f6, 0 0 40px #3b82f6',
        'neon-purple-hover': '0 0 20px #6366f1, 0 0 40px #6366f1',
        'neon-pink-hover': '0 0 20px #ec4899, 0 0 40px #ec4899',
        'card': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'card-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
