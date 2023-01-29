'use strict'

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
            
            if (!isHintMode) {
                if (i === celli && j === cellj) continue
                if (board[i][j].isMine) countNegs++
            } else {
                if (board[i][j].wasShown) continue
                board[i][j].isShown = false
                renderBoard(board)
            }

        }
    }
    return countNegs
}