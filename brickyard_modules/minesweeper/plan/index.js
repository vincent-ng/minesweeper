module.exports = {
	includes: ['webpack-agile'],
	modules: [
		'minesweeper',
	],
	config: {
		'webpack-dev-server': {
			hot: false,
			redirectToRoot: false,
		},
	},
}
