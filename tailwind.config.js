/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./assets/ts/**/*.ts', './handlers/templates/**/*.gohtml'],
	theme: {
		extend: {
			colors: {
				neutral: {
					50: '#F0F0F0',
					950: '#101113',
				},
			},
		},
	},
	plugins: [],
}
