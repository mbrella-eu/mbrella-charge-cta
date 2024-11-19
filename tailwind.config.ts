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
			colors: {
				rootLevel: '#1e2228',
				secondLevel: '#2b3038',
				thirdLevel: '#3d5266',
				primary: '#4789e3',
				accent: '#e67e55',
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
		},
	},
	plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;