'use strict'
const FLAGE = '🚩';
const MINE = '💥';
const EMPTY = ' ';
const HINT = '💡'
const SMILY_HAPPY = '😃'
const SMILY_SAD = '☹️'
const SMILY_WIN = '😎'
const TIMER = '⏱️'


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

var gCountHint = 3;
var isHintStart;
var gTimerFun;


function initGame() {
    gGame.isOn = true;
    gCountHint = 3;
    gBoard = creatBoard()
    renderBoard(gBoard);
    clearInterval(gTimerFun);
    renderText('icon-time', TIMER)
    renderHint(gCountHint);
    renderText('timer', '')
    renderText('smile', SMILY_HAPPY)
}

function playAgain() {
    initGame();
    gGame.shownCount = 0;
    gGame.isOn = true;
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
    for (var i = 0; i < board.length; i++) {
        strHTML += `<tr>`;
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                strHTML += `<td class = "cell cell${i}-${j} mine game-on"  
                onmousedown = "cellClicked(event,this,${i},${j})">${MINE}</td>`
            } else {
                strHTML += `<td class = "cell cell${i}-${j} game-on" 
                onmousedown = "cellClicked(event,this,${i},${j})">${EMPTY}</td>`
            }
        }
        strHTML += `<tr>`
    }
    elTbody.innerHTML = strHTML;
}

// set neighbor count on every cell on mat
function setBoardMinesNegsCount(board) {
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
function cellClicked(ev, elCell, i, j) {
    
    // left clicked?
    if (ev.button === 0 && gGame.isOn) {
        
        //work only on the first click on cell with or without press hint 
        if (gGame.shownCount === 0 && gCountHint===3) {
            addMine();
            setBoardMinesNegsCount(gBoard);
            renderBoard(gBoard);
            timer();
            
        }

        // if clicked on mine ,show all mines
        if (elCell.classList.contains('mine') && !gGame.isHint) {
            var elMins = document.querySelectorAll('.mine');
            for (var i = 0; i < elMins.length; i++) {
                //if mine has a flag ,replace it in mine
                if (elMins[i].innerText === FLAGE) elMins[i].innerText = MINE;
                // show mine - from 0px to 12px font size
                else elMins[i].style.fontSize = 12 + 'px';
                // border mine cells - colored orange
                elMins[i].style.borderColor = 'orange';
            }
            // update mine apprance on the model
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard[i].length; j++) {
                    if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
                }
            }
            gGame.isOn = false;

            // if the user pressed hint
        } else if (gGame.isHint) {
           
            function onHint() {
                for (var x = i - 1; x <= i + 1; x++) {
                    if (x < 0 || x > gBoard.length - 1) continue;
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (y < 0 || y > gBoard.length - 1) continue;
                        var pos = { i: x, j: y }
                        var elcell = document.querySelector(creatClass(pos))
                        if (elcell.classList.contains('mine')) {
                            if (isHintStart) elcell.style.fontSize = 12 + 'px';
                            if (!isHintStart) elcell.style.fontSize = 0 + 'px';
                        } else {
                            if (isHintStart) elcell.innerText = gBoard[pos.i][pos.j].minesAroundCount;
                            if (!isHintStart) {
                                if (!gBoard[x][y].isShown) elcell.innerText = EMPTY;
                            }
                        }
                    }
                }
                while (isHintStart) {
                    setTimeout(onHint, 1000);
                    gCountHint--
                    renderHint(gCountHint);
                    isHintStart = false;
                    gGame.isHint = false;
                }

            }
            onHint();

        } else {
            if (!gBoard[i][j].isShown){
                // if the cell is not mine and hints is't on, show all nighbars
                for (var x = i - 1; x <= i + 1; x++) {
                    if (x < 0 || x > gBoard.length - 1) continue;
                    for (var y = j - 1; y <= j + 1; y++) {
                        if (y < 0 || y > gBoard.length - 1) continue;
                        var pos = { i: x, j: y }
                        var elcell = document.querySelector(creatClass(pos))
                        if (!elcell.classList.contains('mine') && !gBoard[x][y].isShown) {
                            if (gBoard[pos.i][pos.j].minesAroundCount!==0) elcell.innerText = gBoard[pos.i][pos.j].minesAroundCount;
                            gBoard[x][y].isShown = true;
                            // border mine cells - colored blue
                            elcell.style.borderColor = 'rgb(74, 159, 180)';
                            elcell.classList.remove('game-on');
                            elcell.classList.add('game-over');
                            gGame.shownCount++
    
                        }
                    }
                }   
            }
        }
        

        // rigth clicked?
    } else if (ev.button === 2){
        elCell.addEventListener('contextmenu', e => {
            e.preventDefault();
        });
        if (gGame.isOn && gGame.shownCount !== 0) {
            // if mine is shown , no flag is added , if not add flag
            if (!(elCell.style.fontSize === (12 + 'px') && elCell.innerText === MINE)) {
                // add flag only on not shown cells
                if (!gBoard[i][j].isShown) {    
                    // if cell is not marked already
                    if (!gBoard[i][j].isMarked) {
                        elCell.innerText = FLAGE;
                        elCell.style.fontSize = 12 + 'px';
                        gBoard[i][j].isMarked = true;
                        gGame.markedCount++

                    }
                    // if cell is marked already
                    else if (gBoard[i][j].isMarked) {
                        if (gBoard[i][j].isMine) {
                            elCell.style.fontSize = 0 + 'px';
                            elCell.innerText = MINE;
                        }
                        else elCell.innerText = EMPTY;
                        gBoard[i][j].isMarked = false;
                        gGame.markedCount--
                        
                    }
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

}

function gameOver() {
    var elSmile = document.querySelector('.smile');
    // if you reveal all the cell, except marked cell with mine , end game
    if (gGame.shownCount === ((Math.pow(level.size, 2)) - level.mine)
        && gGame.markedCount === level.mine) {
        elSmile.innerHTML = SMILY_WIN;
        gGame.shownCount = 0;
        gGame.markedCount = 0;
        gGame.isOn = false;
        clearInterval(gTimerFun);
        endhoverOnCells();
   
        
        // if you pressed on mine , end game
    } else if (!gGame.isOn) {
        if (elSmile.innerHTML !== SMILY_WIN) elSmile.innerHTML = SMILY_SAD;
        gGame.shownCount = 0;
        gGame.markedCount = 0;
        clearInterval(gTimerFun);
        endhoverOnCells();

    }

}

function getHint() {
    if (gCountHint!==0){
        isHintStart = true;
        gGame.isHint = true;
    }
    

}

function renderHint(countHintForRender) {
    var strHTML = '';
    for (var i = 0; i < countHintForRender; i++) {
        strHTML += HINT
    }
    document.querySelector('.hint span').innerText = strHTML;
}

function timer() {
    var startNow = new Date().getTime();
    var curTime;
    gTimerFun = setInterval(function () {
        var timeNow = new Date().getTime();
        curTime = parseInt((timeNow - startNow) / 1000);
        document.querySelector('.timer').innerText = 1 + curTime;
    }, 1)
}

function endhoverOnCells(){
    var elCellls = document.querySelectorAll('.cell');
    for (var i=0; i<elCellls.length; i++) {
        elCellls[i].classList.remove('game-on');
        elCellls[i].classList.add('game-over'); 
    }
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

function renderText(elClass, textStr) {
    document.querySelector('.' + elClass).innerText = textStr;
}
