'use strict'
// GLOBAL MODEL VAR
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}
// console.log('gGame', gGame)

const gLevel = {
    SIZE: 4,
    MINES: 2
}
// console.log('gLevel', gLevel)

var gBoard

var timerIntervalId

function onInit() {
    console.log('hi from onInit')
    // INITIALIZE
    document.querySelector('.btn-restart').innerHTML = '😃'
    
    gGame.shownCount = 0
    
    document.querySelector('.btn-basic').classList.add('selected')
    
    gGame.markedCount = 0

    showCount()
    
    gGame.secsPassed = 0
    // BUILD MODEL

    gBoard = buildBoard()
    // console.log('gBoard after build:', gBoard)
    // console.log('getClassName(gBoard[0][0]):', getClassName(gBoard[0][0]))

    // RENDER TO DOM
    renderBoard(gBoard)

    if (gGame.isOn) {
        timer()
        addMines(gBoard)

        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
    }
}

function showCount() {
    var count = (gLevel.MINES - gGame.markedCount < 0) ? 0 : gLevel.MINES - gGame.markedCount
    
    var elCount = document.querySelector('.flag-decount')
    elCount.innerText = `000${count}`.slice(-3)
    
    console.log(count)
}

function buildBoard() {
    const size = gLevel.SIZE
    const board = []

    for (var i = 0; i < size; i++) {
        board.push([])

        for (var j = 0; j < size; j++) {
            board[i][j] = createCellObj()

        }
    }
    // console.log('matwithcellobjs:', board)

    // PLACING 2 MINES
    board[0][0].isMine = true
    board[2][2].isMine = true

    return board
}

function createCellObj(minesarcnt = 0, isshown = false, ismine = false, ismarked = false) {
    var cell = {
        minesAroundCount: minesarcnt,
        isShown: isshown,
        isMine: ismine,
        isMarked: ismarked,
    }
    return cell
}

function timer() {
    var startTime = Date.now()

    timerIntervalId = setInterval(() => {
        // CALC SECONDS PASSED
        var elapsedTime = Date.now() - startTime
        gGame.secsPassed = elapsedTime / 1000
        // RENDER IN DOM
        document.querySelector('.timer').innerText =
            ('00' + (elapsedTime / 1000).toFixed(0)).slice(-3)
    }, 37)
}

function addMines(board) {
    for (var i = 1; i < gLevel.MINES; i++) {
        var celli = getRandomInt(0, gLevel.SIZE)
        var cellj = getRandomInt(0, gLevel.SIZE)
        if (board[celli][cellj].isMine) {
            i--
            continue
        }
        board[celli][cellj].isMine = true
    }
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            // if (i === 2 && j === 1) currCell.isMarked = true
            var strClass = getClassName(currCell)

            strHTML += `\t<td class="cell ${strClass}" onmouseup="onCellClicked(event, this, ${i}, ${j})"
                 oncontextmenu="event.preventDefault();">`

            if (currCell.isMarked) strHTML += `🏳️`
            else if (currCell.isShown) {
                if (currCell.isMine) strHTML += `💥`
                else strHTML += currCell.minesAroundCount
            }

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
    // console.log('strHTML is:')
    // console.log(strHTML)

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML

}

function getClassName(cellObj) {
    var classIsShown = (cellObj.isShown) ? `isShown ` : ``
    var classIsMine = (cellObj.isMine) ? `isMine ` : ``
    var classIsMarked = (cellObj.isMarked) ? `isMarked ` : ``

    const cellClass = `${classIsShown}${classIsMine}${classIsMarked}negs-${cellObj.minesAroundCount}`
    return cellClass
}

function setMinesNegsCount(board) {

    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue
            board[i][j].minesAroundCount = countMinesNegs(board, i, j)
        }
    }
    console.log(board)
}
function countMinesNegs(board, celli, cellj) {
    var countNegs = 0
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === celli && j === cellj) continue

            
        }
    }
}


function onCellClicked(ev, elCell, i, j) {

    if (!gGame.isOn) gGame.isOn = true

    const currCell = gBoard[i][j]

    if (ev.button === 0) {
        if (currCell.isMine && !currCell.isMarked) {
            gameOver('lost')
            return
        }

        if (currCell.isMarked || currCell.isShown) return

        if (!currCell.IsShown) {
            currCell.isShown = true
            gGame.shownCount++
        }

    } else if (ev.button === 2) {
        if (!(currCell.isMarked || currCell.isShown)) {
            currCell.isMarked = true
            elCell.innerHTML = `🏳️`
            gGame.markedCount++
        }
    }
    renderBoard(gBoard)
    checkGameOver()
}

function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === (gLevel.SIZE - gLevel.MINES)) gameOver('won')
}

function gameOver(status) {
    gGame.isOn = false
    //STOP TIMER
    clearInterval(timerIntervalId)

    if (status === 'lost') {
        // SHOW ALL THE CELLS
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                gBoard[i][j].isShown = true // UPDATE MODEL
                renderBoard(gBoard) //UPDATE DOM
            }
        }
        // CHANGE SMILEY FACE TO DISAPPOINTED
        var elBtn = document.querySelector('.btn-restart')
        elBtn.innerHTML = `😞`
        console.log('Game Over you lost...');
    }
    if (status === 'won') alert('YOU WON!')

}