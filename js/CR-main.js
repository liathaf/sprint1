'use strict'
const FLAGE = '🚩';
const MINE = '💥';
const EMPTY = ' ';
const HINT = '💡'
const SMILY_HAPPY = '😃'
const SMILY_SAD = '☹️'
const SMILY_WIN = '😎'

var gCountHint;
var countHintForRender = 3;
var gTimerFun;

var level = {
    size: 4,
    mine: 2
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    isHint: false
}

//the model
var gBoard;



function initGame() {
    gGame.isOn = true;
    gBoard = creatBoard()
    renderBoard(gBoard);
    renderHint(countHintForRender);
    clearInterval(gTimerFun);
    document.querySelector('.time span').innerText = '00.00';
    document.querySelector('.smile').innerHTML = SMILY_HAPPY;
    document.querySelector('h1').innerText = '';
}

function playAgain(){
    //CR: good use of initGame function
    initGame();
    timer();
    gGame.shownCount = 0;
    gGame.isOn = true;
    clearInterval(gTimerFun);
    document.querySelector('.time span').innerText = '00.00';
    document.querySelector('.smile').innerHTML = SMILY_HAPPY;
    document.querySelector('h1').innerText = '';
}




// creat board 
function creatBoard() {
    var board = [];
    var cell;
    for (var i = 0; i < level.size; i++) {
        board[i] = [];
        for (var j = 0; j < level.size; j++) {
            board[i][j] = cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
            }
        }
    }
    return board;
}

// add main to board
function addMine() {
    for (var i = 0; i < level.mine; i++) {
        var posMainI = getRandomInteger(0, level.size - 1);
        var posMainJ = getRandomInteger(0, level.size - 1);
        while (gBoard[posMainI][posMainJ].isMine) {
            posMainI = getRandomInteger(0, level.size - 1);
            posMainJ = getRandomInteger(0, level.size - 1);

        }
        gBoard[posMainI][posMainJ].isMine = true;
    }
    return gBoard;
}


// render board
function renderBoard(board) {
    var strHTML = '';
    var elTbody = document.querySelector('.game-board');
    //CR: you are not using the cellContent var
    var cellContent;
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                strHTML += `<td class = "cell cell${i}-${j} mine"  onmousedown = "cellClicked(event,this,${i},${j})">${MINE}</td>`
            } else {
                strHTML += `<td class = "cell cell${i}-${j}" onmousedown = "cellClicked(event,this,${i},${j})">${EMPTY}</td>`
            }
        }
        strHTML += `<tr>`
    }
    elTbody.innerHTML = strHTML;

}

// set neighbor count on every cell on mat
function setBoardMinesNegsCount(board) {
    //CR: too many loops and we are not running in loops with x or y, you can us row and col
    var cell;
    for (var x = 0; x < board.length; x++) {
        for (var y = 0; y < board[x].length; y++) {
            cell = { i: x, j: y };
            for (var i = cell.i - 1; i <= cell.i + 1; i++) {
                if (i < 0 || i > board.length - 1) continue;
                else {
                    for (var j = cell.j - 1; j <= cell.j + 1; j++) {
                        if (j < 0 || j > board.length - 1) continue;
                        else {
                            if (i === cell.i && j === cell.j) continue;
                            if (board[i][j].isMine) {
                                board[cell.i][cell.j].minesAroundCount++;
                            }
                        }
                    }
                }
            }
        }
    }
}

// if cell clicked 
//CR: you need to render cell or render board by your model status and not change it by css or html
function cellClicked(ev, elCell, i, j) {
    // left clicked?
    
    if (ev.button === 0 && gGame.isOn) {

        //work only on load
        if (gGame.shownCount === 0) {
            addMine();
            setBoardMinesNegsCount(gBoard);
            renderBoard(gBoard);
            timer();
        }

        // if clicked on mine ,show all mines
        if (elCell.classList.contains('mine') && !gGame.isHint) {
            var elMins = document.querySelectorAll('.mine');
            for (var i = 0; i < elMins.length; i++) {
                
                //if .main has a flag ,replace it in mine
                if (elMins[i].innerText === FLAGE) elMins[i].innerText = MINE;
                else elMins[i].style.fontSize = 12 + 'px';
            }
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
                }
            }
            gGame.isOn = false;

            // if the user pressed hints
        } else if (gGame.isHint) {
            function onHint() {
                for (var x = i - 1; x <= i + 1; x++) {
                    if (x < 0 || x > gBoard.length - 1) continue;
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (y < 0 || y > gBoard.length - 1) continue;
                        var pos = { i: x, j: y }
                        var elcell = document.querySelector(creatClass(pos))
                        if (elcell.classList.contains('mine')) {
                            if (gCountHint === 0) elcell.style.fontSize = 12 + 'px';
                            if (gCountHint !== 0) elcell.style.fontSize = 0 + 'px';
                        } else {
                            if (gCountHint === 0) elcell.innerText = gBoard[pos.i][pos.j].minesAroundCount;
                            if (gCountHint !== 0) {
                                if (!gBoard[x][y].isShown) elcell.innerText = EMPTY;
                            }
                        }
                    }
                }
                while (gCountHint === 0) {
                    setTimeout(onHint, 1000);
                    renderHint(countHintForRender);
                    gCountHint++
                    gGame.isHint = false;
                }


            }
            onHint();



        } else {
            // if the cell is not mine , show all the nighbars
            for (var x = i - 1; x <= i + 1; x++) {
                if (x < 0 || x > gBoard.length - 1) continue;
                for (var y = j - 1; y <= j + 1; y++) {
                    if (y < 0 || y > gBoard.length - 1) continue;
                    var pos = { i: x, j: y }
                    var elcell = document.querySelector(creatClass(pos))
                    if (!elcell.classList.contains('mine') && !gBoard[x][y].isShown) {
                        gBoard[x][y].isShown = true;
                        elcell.innerText = gBoard[pos.i][pos.j].minesAroundCount;
                        gGame.shownCount++

                    }
                }
            }
        }
        // rigth clicked?
        //CR: you need to use another funcion instead - cellMarked()
    } else if (ev.button === 2 && gGame.isOn) {
        // if mine is shown , no flag is added , if not add flag
        if (!(elCell.style.fontSize === (12 + 'px') && elCell.innerText === MINE)) {
            if (!gBoard[i][j].isShown) {
                if (!gBoard[i][j].isMarked) {
                    gBoard[i][j].isMarked = true;
                    elCell.style.fontSize = 12 + 'px';
                    elCell.innerText = FLAGE;
                    gGame.markedCount++

                }
                else if (gBoard[i][j].isMarked) {
                    elCell.innerText = EMPTY;
                    gBoard[i][j].isMarked = false;
                    gGame.markedCount--

                }
            }

        }
    }
    
    gameOver();

}


//on click the difficulties the size board change
function choseDiff(elDiff) {
    if (elDiff.innerText === 'Biginner') {
        level.size = 4;
        level.mine = 2;
        gBoard = creatBoard()
        playAgain()
    }
    if (elDiff.innerText === 'Medium') {
        level.size = 8;
        level.mine = 12;
        gBoard = creatBoard()
        playAgain()
    }
    if (elDiff.innerText === 'Expert') {
        level.size = 12;
        level.mine = 30;
        gBoard = creatBoard()
        playAgain()
    }
    //CR: you can call here the function playAgain one time instead of 3 time;
}

function gameOver() {
    var gameOverMsg = document.querySelector('h1');
    // if you reveal all the cell, except marked cell with mine , end game
    if (gGame.shownCount === ((Math.pow(level.size, 2)) - 2)
        && gGame.markedCount === level.mine) {
        gameOverMsg.innerText = 'You Won!!'
        document.querySelector('.smile').innerHTML = SMILY_WIN;
        gGame.shownCount = 0;
        gGame.isOn = false;
        clearInterval(gTimerFun);

        // if you pressed on mine , end game
    } else if (!gGame.isOn) {
        gameOverMsg.innerText = 'You lose'
        document.querySelector('.smile').innerHTML = SMILY_SAD;
        gGame.shownCount = 0;
        clearInterval(gTimerFun)


    }
    
}

function getHint() {
    gCountHint = 0;
    gGame.isHint = true;
    countHintForRender--

}


function renderHint(countHintForRender) {
    var strHTML = '';
    for (var i = 0; i < countHintForRender; i++) {
        strHTML += HINT
    }
    document.querySelector('.hint').innerText = strHTML;
}

function timer() {
    var startNow = new Date().getTime();
    var curTime;
    gTimerFun = setInterval(function () {
        var timeNow = new Date().getTime();
        curTime = (timeNow - startNow) / 1000;
        document.querySelector('.time span').innerText = curTime;
    }, 1)


}

//utile
function creatClass(cellObj) {
    var cellClass = '.cell' + cellObj.i + '-' + cellObj.j;
    return cellClass;
}

function getRandomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

