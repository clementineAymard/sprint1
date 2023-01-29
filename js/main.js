'use strict'
// GLOBAL MODEL VAR
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

const gLevel = {
    SIZE: 4,
    MINES: 2
}
var gBoard
var timerIntervalId


function onInit() {
    // console.log('hi from onInit')
    // INITIALIZE
    gLives = 3
    document.querySelector('.lives').innerHTML = '♥️♥️♥️'
    document.querySelector('.btn-restart').innerHTML = '😃'
    gHints = [true, true, true]
    isHintMode = false
    addHints()
    clearInterval(timerIntervalId)
    document.querySelector('.timer').innerHTML = '000'

    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    showCount()
    gGame.secsPassed = 0
    if (gLevel.SIZE === 4) document.querySelector('.btn-basic').classList.add('selected')

    // BUILD MODEL
    gBoard = buildBoard()

    // RENDER TO DOM
    renderBoard(gBoard)

    // renderHints()
    // console.log('before start', gBoard)
}

function startGame(firstCell) {
    timer()

    firstCell.isShown = true
    gGame.shownCount++

    addMines(gBoard)
    setMinesNegsCount(gBoard)

    renderBoard(gBoard)
}

function showCount() {
    var count = (gLevel.MINES - gGame.markedCount < 0) ? 0 : gLevel.MINES - gGame.markedCount

    var elCount = document.querySelector('.flag-decount')
    elCount.innerText = `000${count}`.slice(-3)
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
    // console.log('hi buildboard:', board)

    // PLACING 2 MINES
    // board[0][0].isMine = true
    // board[1][1].isMine = true
    // board[2][2].isMine = true
    // board[3][3].isMine = true

    return board
}

function createCellObj(minesarcnt = '', isshown = false, ismine = false, ismarked = false) {
    var cell = {
        minesAroundCount: minesarcnt,
        isShown: isshown,
        isMine: ismine,
        isMarked: ismarked,
    }
    return cell
}

function renderBoard(board) {
    var strHTML = ''

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var strClass = getClassName(currCell)

            //onmouseup="onCellClicked(event, this, ${i}, ${j})"
            // oncontextmenu="event.preventDefault();" 

            strHTML += `\t<td class="cell ${strClass}" onclick="onCellClicked(this, ${i}, ${j})"
                 oncontextmenu="onCellMarked(this,${i},${j})">`

            if (currCell.isMarked) strHTML += `🏳️`
            else if (currCell.isShown) {
                if (currCell.isMine) strHTML += `💥`
                else strHTML += currCell.minesAroundCount
            }

            strHTML += '</td>\n'
        }
        strHTML += '</tr>\n'
    }
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

function gameOn(cell, i, j,) {
    gGame.isOn = true
    startGame(cell)
    if (cell.minesAroundCount === '') expandShown(i, j)
    renderBoard(gBoard)
}

function onCellClicked(elCell, i, j) { // LEFT CLICK ON CELL
    const currCell = gBoard[i][j]

    // FIRST CELL IS NEVER A MINE:
    if (!gGame.isOn) gameOn(currCell, i, j)

    // HINT MODE
    if (gGame.isOn && isHintMode) {
        currCell.isShown = true
        expandShown(i, j)
        renderBoard(gBoard)
        setTimeout(() => {
            countMinesNegs(gBoard, i, j)
            isHintMode = false
        }, 1000)
        return
    }

    // CANT CLICK ON A FLAG OR ON A SHOWN CELL
    if (currCell.isMarked || currCell.isShown) return

    // IF CLICKED ON UNMARKED & UNSHOWN MINE
    if (currCell.isMine && !currCell.isMarked && !currCell.isShown) {
        if (gLives > 0) { // IF LIFE REMAINS
            gLives--
            gGame.markedCount++
            currCell.isShown = true // MODEL
            showCount()
            showLives(gLives)
        } else {
            gameOver('lost')
        }
    }

    // IF CLICKED ON SAFE UNSHOWN CELL
    if (!currCell.isShown) {
        currCell.isShown = true
        gGame.shownCount++
        if (currCell.minesAroundCount === '') expandShown(i, j)
    }

    renderBoard(gBoard)
    checkGameOver()
}

function expandShown(celli, cellj) {
    // SHOW NEIGHBORS / HIDE if HINT MODE
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue

            if (i === celli && j === cellj) continue

            if (isHintMode && gBoard[i][j].isShown) gBoard[i][j].wasShown = true

            gBoard[i][j].isShown = true

            if (!isHintMode) {
                gGame.shownCount++
                // if (gBoard[i][j].minesAroundCount === '') expandShown(i, j)
            }
        }
    }
    return
}

function onCellMarked(elCell, i, j) { // RIGHT CLICK ON CELL
    // DON'T OPEN CONTXT MENU
    document.addEventListener('contextmenu', event => event.preventDefault());
    // debugger
    var currCell = gBoard[i][j]
    
    // FIRST CELL IS NEVER A MINE:
    if (!gGame.isOn) gameOn(currCell, i, j)

    // MARK OR UNMARK CELLS
    if (currCell.isMarked = true) {
        currCell.isMarked = false
        gGame.markedCount--
        elCell.innerHTML = ``
    } else {
        if (gGame.markedCount >= gLevel.MINES) return
        currCell.isMarked = true
        gGame.markedCount++
        elCell.innerHTML = `🏳️`
    }

    elCell.classList.toggle('isMarked')
    // renderBoard(gBoard)
    showCount()
    checkGameOver()

}

function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount >= (gLevel.SIZE ** 2 - gLevel.MINES)) gameOver('won')
}

function gameOver(status) {
    gGame.isOn = false
    //STOP TIMER
    clearInterval(timerIntervalId)

    // SHOW ALL THE CELLS
    for (var i = 0; i < gBoard.length; i++) {

        for (var j = 0; j < gBoard[0].length; j++) {

            // UPDATE MODEL
            gBoard[i][j].isShown = true
            gBoard[i][j].isMarked = false

            //UPDATE DOM
            renderBoard(gBoard)
        }
    }

    renderResults(status)

}

function renderResults(status) {
    var elBtnRestart = document.querySelector('.btn-restart')
    elBtnRestart.innerHTML = (status === 'lost') ? `😞` : `🥳`

    var elVictBox = document.querySelector('.victory-box')
    elVictBox.innerHTML = (status === 'won') ? 'Bravo! <br/> You won!' : 'Sorry... <br/> You lost.'

    elVictBox.style.display = 'block'
    setTimeout(() => {
        elVictBox.style.display = 'none'
    }, 3000)
}

