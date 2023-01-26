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
    // console.log('hi from onInit')
    // INITIALIZE
    document.querySelector('.btn-restart').innerHTML = '😃'
    clearInterval(timerIntervalId)
    document.querySelector('.timer').innerHTML = '000'

    gGame.isOn = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    showCount()
    gGame.secsPassed = 0

    // BUILD MODEL
    gBoard = buildBoard()

    // RENDER TO DOM
    renderBoard(gBoard)

    console.log('before start', gBoard)
}

function startGame() {
    // console.log('hi from startgame');
    timer()
    addMines(gBoard)

    setMinesNegsCount(gBoard)
    renderBoard(gBoard)

    // console.log('after start', gBoard)
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
    // board[2][2].isMine = true

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
    for (var i = 1; i <= gLevel.MINES; i++) {
        var celli = getRandomInt(0, gLevel.SIZE)
        var cellj = getRandomInt(0, gLevel.SIZE)
        if (board[celli][cellj].isMine ||
            board[celli][cellj].isShown) {
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

function setMinesNegsCount(board) {
    // console.log('hi setminenegs');
    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) continue
            var negsCount = countMinesNegs(board, i, j)

            board[i][j].minesAroundCount = (negsCount === 0) ? '' : negsCount
        }
    }
    // console.log(board)
}

function countMinesNegs(board, celli, cellj) {
    var countNegs = 0
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === celli && j === cellj) continue

            if (board[i][j].isMine) countNegs++
        }
    }
    return countNegs
}


function onCellClicked(elCell, i, j) { // LEFT CLICK ON CELL
    const currCell = gBoard[i][j]

    if (!gGame.isOn) {
        gGame.isOn = true
        currCell.isShown = true
        gGame.shownCount++
        elCell.classList.add('isShown')
        startGame()
    }


    if (elCell.classList.contains('isMarked') || currCell.isShown) return
    if (elCell.classList.contains('isMarked')) currCell.isMarked = true

    if (currCell.isMine && !currCell.isMarked) {
        gameOver('lost')
        return
    }

    if (!currCell.IsShown) {
        currCell.isShown = true
        gGame.shownCount++
        if (currCell.minesAroundCount === '') expandShown(i, j)

    }

    renderBoard(gBoard)
    checkGameOver()
}

function expandShown(celli, cellj) {
    console.log('HI expandcell')
    // SHOW NEIGHBORS
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue

        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === celli && j === cellj) continue
            if (gBoard[i][j].isShown) continue
            gBoard[i][j].isShown = true
            gGame.shownCount++
        }
    }
}


function onCellMarked(elCell, i, j) { // RIGHT CLICK ON CELL
    // console.log('hi from cellmarked');
    // DON'T OPEN CONTXT MENU
    document.addEventListener('contextmenu', event => event.preventDefault());
    var currCell = gBoard[i][j]
    if (elCell.classList.contains('isMarked')) {
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

    showCount()
    checkGameOver()

}


function checkGameOver() {
    if (gGame.markedCount === gLevel.MINES &&
        gGame.shownCount === (gLevel.SIZE ** 2 - gLevel.MINES)) gameOver('won')
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

    var elBtnRestart = document.querySelector('.btn-restart')
    elBtnRestart.innerHTML = (status === 'lost') ? `😞` : `🥳`
    if (status === 'won') {
        document.querySelector('.victory-box').style.display = 'block'
        // document.querySelector('.victory-box').classList.add('won')
        setTimeout(() => {
            document.querySelector('.victory-box').style.display = 'none'
            // document.querySelector('.victory-box').classList.remove('won')
        }, 3000)
    }
}

function changeLevel(elBtn) {
    if (gGame.isOn) return

    var levelClass = elBtn.classList[0]

    switch (levelClass) {
        case `btn-basic`:
            gLevel.SIZE = 4
            gLevel.MINES = 2

            document.querySelector('.btn-basic').classList.add('selected')
            document.querySelector('.btn-hard').classList.remove('selected')
            document.querySelector('.btn-extreme').classList.remove('selected')


            break;
        case `btn-hard`:
            gLevel.SIZE = 8
            gLevel.MINES = 4

            document.querySelector('.btn-basic').classList.remove('selected')
            document.querySelector('.btn-hard').classList.add('selected')
            document.querySelector('.btn-extreme').classList.remove('selected')

            break;
        case `btn-extreme`:
            gLevel.SIZE = 16
            gLevel.MINES = 8

            document.querySelector('.btn-basic').classList.remove('selected')
            document.querySelector('.btn-hard').classList.remove('selected')
            document.querySelector('.btn-extreme').classList.add('selected')

            break;
        default:
            break;
    }
    showCount()
    onInit()
}