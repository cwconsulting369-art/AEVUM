/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif']
      },
      colors: {
        gold: {
          50:  '#fdf6e7',
          100: '#fbecc8',
          200: '#f5d68d',
          300: '#eebe5a',
          400: '#e0a458',
          500: '#cf8c3a',
          600: '#a86d27',
          700: '#7a4f1c',
          800: '#553715',
          900: '#33200d'
        },
        ink: {
          950: '#08080a',
          900: '#0d0d11',
          850: '#111116',
          800: '#1a1a22',
          700: '#252531',
          600: '#34343f',
          500: '#4a4a55',
          400: '#7a7a85',
          300: '#a4a4ad',
          200: '#c9c9d0',
          100: '#e6e6ea',
          50:  '#f4f4f6'
        }
      },
      boxShadow: {
        'glow-gold': '0 0 0 1px rgba(224,164,88,0.4), 0 0 24px -4px rgba(224,164,88,0.35)',
        'glow-soft': '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.6)',
        'glass': '0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 32px -8px rgba(0,0,0,0.6)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f5d68d 0%, #e0a458 45%, #a86d27 100%)',
        'gold-radial': 'radial-gradient(circle at 30% 20%, rgba(224,164,88,0.18), transparent 60%)'
      },
      keyframes: {
        'fade-up':       { '0%': { opacity: '0', transform: 'translate3d(0,8px,0)' }, '100%': { opacity: '1', transform: 'translate3d(0,0,0)' } },
        'fade-in':       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'scale-in':      { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'slide-up':      { '0%': { opacity: '0', transform: 'translate3d(0,16px,0)' }, '100%': { opacity: '1', transform: 'translate3d(0,0,0)' } },
        'pulse-gold':    { '0%,100%': { boxShadow: '0 0 0 0 rgba(224,164,88,0.45)' }, '50%': { boxShadow: '0 0 0 10px rgba(224,164,88,0)' } },
        'shimmer':       { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'orbit':         { '0%': { transform: 'rotate(0deg) translateX(28px) rotate(0deg)' }, '100%': { transform: 'rotate(360deg) translateX(28px) rotate(-360deg)' } },
        'gradient-shift':{ '0%,100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        'shake':         { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-4px)' }, '40%,80%': { transform: 'translateX(4px)' } }
      },
      animation: {
        'fade-up':        'fade-up 360ms cubic-bezier(0.22,1,0.36,1) both',
        'fade-in':        'fade-in 300ms ease-out both',
        'scale-in':       'scale-in 220ms cubic-bezier(0.22,1,0.36,1) both',
        'slide-up':       'slide-up 360ms cubic-bezier(0.22,1,0.36,1) both',
        'pulse-gold':     'pulse-gold 1.8s ease-out infinite',
        'shimmer':        'shimmer 1.6s linear infinite',
        'orbit':          'orbit 1.8s linear infinite',
        'gradient-shift': 'gradient-shift 14s ease-in-out infinite',
        'shake':          'shake 0.45s ease-in-out both'
      }
    }
  }
};
