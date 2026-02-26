import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				// CSS Variables (from admin config)
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					// Extended with user app colors
					500: '#2563eb',
					600: '#1d4ed8',
					400: '#60a5fa',
					300: '#93c5fd',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				// User app background colors (light theme)
				surface: {
					900: 'rgb(248, 250, 252)',
					800: 'rgb(255, 255, 255)',
					700: 'rgb(241, 245, 249)',
					750: 'rgb(241, 245, 249)',
				},
				// User app text colors (light theme)
				text: {
					white: 'rgb(15, 23, 42)',
					gray: 'rgb(71, 85, 105)',
					light: 'rgb(71, 85, 105)',
					muted: 'rgb(148, 163, 184)',
				},
				// User app background alias
				background: {
					600: 'rgb(226, 232, 240)',
					700: 'rgb(241, 245, 249)',
				}
			},
		}
	},
	plugins: [tailwindAnimate],
}