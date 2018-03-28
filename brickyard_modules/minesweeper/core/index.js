const assert = require('assert')
const _ = require('lodash')

function getValue(map, y, x) {
	return map[y] ? map[y][x] : null
}

class Tile {
	constructor(x, y) {
		this.x = x
		this.y = y
		this.covered = true
		this.mine = false
		this.flag = false
	}

	indexAround(map) {
		this.around = _.compact([
			getValue(map, this.y, this.x + 1),
			getValue(map, this.y + 1, this.x + 1),
			getValue(map, this.y + 1, this.x),
			getValue(map, this.y + 1, this.x - 1),
			getValue(map, this.y, this.x - 1),
			getValue(map, this.y - 1, this.x - 1),
			getValue(map, this.y - 1, this.x),
			getValue(map, this.y - 1, this.x + 1),
		])
		this.aroundMinesCount = _.countBy(this.around, 'mine').true || 0
	}

	toString() {
		if (this.flag) {
			return !this.covered && !this.mine ? 'X' : 'F'
		}
		if (this.covered) return '-'
		if (this.mine) return '*'
		return String(this.aroundMinesCount)
	}
}

class Grid {
	constructor(height = 9, width = 9, minesCount = 10) {
		this.height = null
		this.width = null
		this.tiles = null
		this.map = null
		this.reset(height, width, minesCount)
	}

	reset(height, width, minesCount) {
		assert(minesCount <= width * height, `minesCount:${minesCount} must smaller than grid size:${width}*${height}`)
		this.isGameOver = false
		this.height = height
		this.width = width
		this.minesCount = minesCount
		this.tiles = []
		for (let y = 0; y < this.height; y += 1) {
			for (let x = 0; x < this.width; x += 1) {
				const tile = new Tile(x, y)
				this.tiles.push(tile)
			}
		}
		_.forEach(_.sampleSize(this.tiles, minesCount), (tile) => { tile.mine = true })
		this.indexTileMap()
	}

	indexTileMap() {
		const map = _.times(this.height, () => _.times(this.width, _.constant(null)))
		_.forEach(this.tiles, (tile) => { map[tile.y][tile.x] = tile })
		_.forEach(this.tiles, (tile) => { tile.indexAround(map) })
		this.map = map
	}

	toString() {
		let rs = ''
		for (const row of this.map) {
			for (const cell of row) {
				rs += cell.toString()
			}
			rs += '\n'
		}
		return rs
	}

	assertRange(y, x) {
		assert(0 <= y && y < this.height && 0 <= x && x < this.width, `tile[${y}][${x}] is out of grid range`)
	}

	open(y, x) {
		this.assertRange(y, x)
		const tile = this.map[y][x]
		if (this.isGameOver) {
			return false
		}
		if (tile.flag) {
			return false
		}
		if (!tile.covered) {
			return false
		}
		tile.covered = false
		if (tile.mine) {
			this.gameOver()
		}
		if (!tile.aroundMinesCount) {
			const candidates = _.chain(tile.around)
				.filter('covered')
				.reject('mine')
				.reject('flag')
				.value()
			_.forEach(candidates, (e) => { this.open(e.y, e.x) })
		}
		return true
	}

	flag(y, x) {
		if (this.isGameOver) {
			return false
		}
		this.assertRange(y, x)
		const tile = this.map[y][x]
		if (!tile.covered) {
			return false
		}
		tile.flag = !tile.flag
		return true
	}

	gameOver() {
		_.forEach(_.filter(this.tiles, tile => tile.mine || tile.flag), (tile) => { tile.covered = false })
		this.isGameOver = true
	}

	flagAllMine() {
		_.forEach(_.filter(this.tiles, 'mine'), (tile) => { tile.flag = true })
	}

	get remainMinesCount() {
		return this.minesCount - _.filter(this.tiles, 'flag').length
	}

	get isWin() {
		return _.filter(this.tiles, 'covered').length === this.minesCount
	}

	get isStart() {
		return _.reject(this.tiles, 'covered').length !== 0
	}

	get isEnd() {
		return this.isWin || this.isGameOver
	}
}

module.exports = {
	Tile,
	Grid,
}
