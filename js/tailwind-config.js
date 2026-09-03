/** Tailwind theme extension — load before CDN */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        lab: { bg: '#0B0F19', card: '#111827', border: '#1F2937', muted: '#6B7280' },
        neon: { blue: '#3B82F6', orange: '#F97316', green: '#22C55E', red: '#EF4444', cyan: '#06B6D4', purple: '#A855F7' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px rgba(59,130,246,0.35)',
        'glow-red': '0 0 24px rgba(239,68,68,0.5)',
        'glow-green': '0 0 24px rgba(34,197,94,0.5)',
        'glow-orange': '0 0 24px rgba(249,115,22,0.45)'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        scan: 'scan 4s linear infinite',
        float: 'float 6s ease-in-out infinite'
      },
      keyframes: {
        scan: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } }
      }
    }
  }
};
