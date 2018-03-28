const $ = require('jquery')
const { Grid } = require('brickyard/minesweeper-core')
const boardHtml = require('html-loader!./board.html')
require('./style.css')

function renderGrid(gridElm, grid) {
	gridElm.html('')
	const renderContent = grid.toString().replace(/\n/g, '')
	for (let i = 0; i < renderContent.length; i += 1) {
		const y = Math.floor(i / grid.width)
		const x = i % grid.width
		const elm = $('<div>').addClass('cell').attr('id', `${y}_${x}`)
		const c = renderContent[i]
		switch (c) {
			case '-':
				elm.addClass('covered')
				break
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
				elm.addClass(`uncovered${c}`)
				break
			case 'F':
				elm.addClass('flag')
				break
			case '*':
				elm.addClass('mine')
				break
			case 'X':
				elm.addClass('flag').addClass('error')
				break
			default:
				break
		}
		elm.mouseenter(() => elm.addClass('mouseover'))
		elm.mouseleave(() => elm.removeClass('mouseover'))
		elm.mouseup((e) => {
			if (grid.isEnd) {
				return
			}
			if (e.which === 1) {
				if (grid.open(y, x)) {
					if (grid.isWin) {
						grid.flagAllMine()
					}
					renderGrid(gridElm, grid)
				}
			} else if (e.which === 3) {
				if (grid.flag(y, x)) {
					renderGrid(gridElm, grid)
				}
			}
		})
		gridElm.append(elm)
	}
}

function setCounter(elm, number) {
	const hundreds = Math.floor(number / 100) % 10
	const tens = Math.floor(number / 10) % 10
	const ones = Math.floor(number) % 10
	elm.find('.hundreds').attr('id', `d${hundreds}`)
	elm.find('.tens').attr('id', `d${tens}`)
	elm.find('.ones').attr('id', `d${ones}`)
}

function restart(height, width, minesCount) {
	let intervalHandle = null
	let startTime = null
	const boardElm = $('.board')
	const gridElm = boardElm.find('.grid')
	const toolElm = boardElm.find('.tool-bar')
	const mineCounter = toolElm.find('.mine')
	const faceBtn = toolElm.find('.face-button')
	const timeCounter = toolElm.find('.time')

	const grid = new Grid(height, width, minesCount)

	boardElm.width((grid.width * 16) + 14)
	gridElm.width(grid.width * 16)
	toolElm.width(grid.width * 16)
	gridElm.mousedown((e) => {
		if (e.which === 1) {
			gridElm.addClass('press')
			faceBtn.addClass('oops')
		}
	})
	const onMouseUp = () => {
		gridElm.removeClass('press')
		faceBtn.removeClass('oops')
		if (grid.isGameOver) {
			faceBtn.addClass('gameover')
		} else if (grid.isWin) {
			faceBtn.addClass('win')
		}
		if (grid.isStart) {
			if (!intervalHandle) {
				startTime = Date.now()
				intervalHandle = setInterval(() => setCounter(timeCounter, Math.floor(Date.now() - startTime) / 1000), 500)
			}
		}
		if (grid.isEnd) {
			if (intervalHandle) {
				clearInterval(intervalHandle)
			}
		}
		setCounter(mineCounter, grid.remainMinesCount)
	}
	gridElm.mouseleave(onMouseUp)
	gridElm.mouseup(onMouseUp)

	const beginnerBtn = $('.menu #beginner')
	const intermediateBtn = $('.menu #intermediate')
	const expertBtn = $('.menu #expert')

	const beforeRestart = () => {
		if (intervalHandle) {
			clearInterval(intervalHandle)
		}
		gridElm.off('mouseleave')
		gridElm.off('mousedown')
		gridElm.off('mouseup')

		beginnerBtn.off('click')
		intermediateBtn.off('click')
		expertBtn.off('click')
		faceBtn.off('click')
		faceBtn.removeClass('gameover')
		faceBtn.removeClass('win')
	}
	beginnerBtn.click(() => beforeRestart() || restart(9, 9, 10))
	intermediateBtn.click(() => beforeRestart() || restart(16, 16, 40))
	expertBtn.click(() => beforeRestart() || restart(16, 30, 99))
	faceBtn.click(() => beforeRestart() || restart(height, width, minesCount))

	setCounter(mineCounter, grid.remainMinesCount)
	setCounter(timeCounter, 0)
	renderGrid(gridElm, grid)
}

$(() => {
	$('title').html('Minesweeper')
	const appElm = $('#brickyard-app')
	appElm.html('').append($(boardHtml))
	appElm.attr('ondragstart', 'return false;')
	appElm.attr('oncontextmenu', 'return false;')

	restart(9, 9, 10)
})
