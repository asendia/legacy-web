/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			blue: 'rgb(25, 118, 210)',
			black: 'rgb(0, 0, 0)',
			white: 'rgb(255, 255, 255)',
			'grey-light': 'rgb(156, 156, 156)',
			grey: 'rgb(117, 117, 117)',
			'grey-dark': 'rgb(77, 77, 77)',
			red: '#f44336'
		},
		fontFamily: {
			sans: ['Roboto', 'sans-serif']
		},
		extend: {}
	},
	plugins: []
};
