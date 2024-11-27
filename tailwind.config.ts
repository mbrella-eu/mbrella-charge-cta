import type { Config } from 'tailwindcss';

const config = {
	darkMode: ['class'],
	content: ['./src/**/*.{ts,tsx}'],
	prefix: '',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sora: ['Sora', 'sans-serif'],
			},
			colors: {
				chargePurple: '#2f243a',
				mbrellaGreen: '#32c28e',
				rootLevel: '#1e2228',
				secondLevel: '#2b3038',
				thirdLevel: '#3d5266',
				primary: '#4789e3',
				accent: '#f8b6a6',
				text: '#e6f0fa',
				textGray: '#8090a0',
				okcolor: '#4caf64',
				warningcolor: '#e0a030',
				modified: '#f0b620',
				danger: '#e86565',
				codeBackground: '#5a646f66',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			animation: {
				fadeIn: 'fadeIn 0.3s ease-in-out',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
		},
	},
	important: '.charge.sales.widget',
	plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
