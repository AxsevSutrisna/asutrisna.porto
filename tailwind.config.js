/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backdropBlur: {
				sm: '4px',
			},
			colors: {
				theme: {
					'primary-dark': 'var(--color-primary-dark)',
					'primary-light': 'var(--color-primary-light)',
					'primary-accent': 'var(--color-primary-accent)',
					'secondary-dark': 'var(--color-secondary-dark)',
					'secondary-light': 'var(--color-secondary-light)',
					'success': 'var(--color-success)',
					'warning': 'var(--color-warning)',
					'danger': 'var(--color-danger)',
					'info': 'var(--color-info)',
					'text-primary': 'var(--color-text-primary)',
					'text-secondary': 'var(--color-text-secondary)',
					'text-muted': 'var(--color-text-muted)',
					'border-light': 'var(--color-border-light)',
					'border-dark': 'var(--color-border-dark)',
				},
			},
		},
	},
	plugins: [],
}
