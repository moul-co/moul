module.exports = {
	useTabs: true,
	semi: false,
	singleQuote: true,
	overrides: [
		{
			files: ['*.gohtml'],
			options: {
				parser: 'go-template',
			},
		},
	],
}
