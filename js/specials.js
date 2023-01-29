'use strict'
var gLives
var gHints
var isHintMode

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

function showLives(gLives) {
    var elLives = document.querySelector('.lives')
    var strHTML = ''
    for (var i = 0; i < gLives; i++) {
        strHTML += '♥️'
    }
    for (var i = 0; i < 3 - gLives; i++) {
        strHTML += '_'
    }
    elLives.innerHTML = strHTML
}

function addHints() {
    var strHtml = ''
    for (var i = 0; i < 3; i++) {
        strHtml += `<button class="hint-${i + 1}" onclick="takeHint(this, ${i + 1})">💡</button>`
    }
    document.querySelector('.hints').innerHTML = strHtml
}

function takeHint(elHintBtn, i) {
    debugger
    if (!gHints[i - 1]) return
    gHints[i - 1] = false
    elHintBtn.classList.add('viewed')
    isHintMode = true
}

function changeLevel(elBtn) {
    if (gGame.isOn) return

    var levelClass = elBtn.classList[0]

    const cListBtnB = document.querySelector('.btn-basic').classList
    const cListBtnH = document.querySelector('.btn-hard').classList
    const cListBtnE = document.querySelector('.btn-extreme').classList
    const s = 'selected'
    
    switch (levelClass) {
        case `btn-basic`:
            gLevel.SIZE = 4
            gLevel.MINES = 2

            cListBtnB.add(s)
            cListBtnH.remove(s)
            cListBtnE.remove(s)

            break;
        case `btn-hard`:
            gLevel.SIZE = 8
            gLevel.MINES = 14

            cListBtnB.remove(s)
            cListBtnH.add(s)
            cListBtnE.remove(s)

            break;
        case `btn-extreme`:
            gLevel.SIZE = 12
            gLevel.MINES = 32

            cListBtnB.remove(s)
            cListBtnH.remove(s)
            cListBtnE.add(s)

            break;
        default:
            break;
    }
    showCount()
    onInit()
}

