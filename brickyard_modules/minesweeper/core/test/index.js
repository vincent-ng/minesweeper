const { Grid } = require('../')

const grid = new Grid()
console.log(grid.toString())

process.stdin.on('data', (data) => {
	const input = String(data).trim().split(/\s+/)
	const cmd = input.shift()
	switch (cmd) {
		case 'exit':
			process.exit(0)
			break
		case 'eval':
			eval(input.join(' ')) // eslint-disable-line no-eval
			break
		case 'open':
			grid.open(Number(input.shift()), Number(input.shift()))
			break
		case 'flag':
			grid.flag(Number(input.shift()), Number(input.shift()))
			break
		case 'reset':
			grid.reset(Number(input.shift()), Number(input.shift()), Number(input.shift()))
			break
		default:
			break
	}
	console.log(grid.toString())
})
