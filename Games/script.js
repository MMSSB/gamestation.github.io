const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset');
const oneVOneButton = document.getElementById('1v1');
const oneVAIButton = document.getElementById('1vAI');
const optionButtons = document.querySelectorAll('.option-button');
const difficultyButtons = document.querySelectorAll('.difficulty-button');
const nameInputs = document.getElementById('nameInputs');
const oneVOneInputs = document.getElementById('1v1Inputs');
const oneVAIInputs = document.getElementById('1vAIInputs');
const start1v1Button = document.getElementById('start1v1');
const start1vAIButton = document.getElementById('start1vAI');
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const playerNameInput = document.getElementById('playerName');
const difficultyOptions = document.getElementById('difficultyOptions');
const easyButton = document.getElementById('easy');
const normalButton = document.getElementById('normal');
const hardButton = document.getElementById('hard');

let gameActive = true;
let currentPlayer = "X";
let gameState = ["", "", "", "", "", "", "", "", ""];
let isAI = false;
let player1 = "";
let player2 = "";
let difficulty = 'normal';

// Winning combinations
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
}

const handlePlayerChange = () => {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
}

const handleResultValidation = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.innerHTML = `Player ${currentPlayer} (${currentPlayer === "X" ? player1 : player2}) has won!`;
        gameActive = false;
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusDisplay.innerHTML = "Game ended in a draw!";
        gameActive = false;
        return;
    }

    handlePlayerChange();

    if (isAI && currentPlayer === "O" && gameActive) {
        handleAIMove();
    }
}

const handleCellClick = (clickedCellEvent) => {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

const handleAIMove = () => {
    let availableCells = [];
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            availableCells.push(i);
        }
    }

    let moveIndex;
    if (difficulty === 'easy') {
        moveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficulty === 'normal') {
        moveIndex = normalAIMove();
    } else if (difficulty === 'hard') {
        moveIndex = hardAIMove();
    }

    const cell = document.querySelector(`.cell[data-index="${moveIndex}"]`);
    if (cell) {
        handleCellPlayed(cell, moveIndex);
        handleResultValidation();
    }
}

const normalAIMove = () => {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (gameState[a] === "O" && gameState[b] === "O" && gameState[c] === "") return c;
        if (gameState[a] === "O" && gameState[b] === "" && gameState[c] === "O") return b;
        if (gameState[a] === "" && gameState[b] === "O" && gameState[c] === "O") return a;
    }
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        if (gameState[a] === "X" && gameState[b] === "X" && gameState[c] === "") return c;
        if (gameState[a] === "X" && gameState[b] === "" && gameState[c] === "X") return b;
        if (gameState[a] === "" && gameState[b] === "X" && gameState[c] === "X") return a;
    }
    let availableCells = gameState.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

const hardAIMove = () => {
    return minimax(gameState, "O").index;
}

const minimax = (newBoard, player) => {
    const availSpots = newBoard.map((cell, index) => cell === "" ? index : null).filter(index => index !== null);

    const checkWin = (board, player) => {
        return winningConditions.some(condition => 
            condition.every(index => board[index] === player)
        );
    }

    if (checkWin(newBoard, "X")) {
        return { score: -10 };
    } else if (checkWin(newBoard, "O")) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        const move = {};
        move.index = availSpots[i];
        newBoard[availSpots[i]] = player;

        if (player === "O") {
            const result = minimax(newBoard, "X");
            move.score = result.score;
        } else {
            const result = minimax(newBoard, "O");
            move.score = result.score;
        }

        newBoard[availSpots[i]] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

const handleRestartGame = () => {
    gameActive = true;
    currentPlayer = "X";
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusDisplay.innerHTML = "";
    cells.forEach(cell => cell.innerHTML = "");
    optionButtons.forEach(button => button.classList.remove('active'));
    difficultyButtons.forEach(button => button.classList.remove('active'));
    nameInputs.style.display = 'none';
    oneVOneInputs.style.display = 'none';
    oneVAIInputs.style.display = 'none';
    difficultyOptions.style.display = 'none';
}

const handle1v1Click = () => {
    isAI = false;
    handleRestartGame();
    oneVOneButton.classList.add('active');
    nameInputs.style.display = 'block';
    oneVOneInputs.style.display = 'block';
    difficultyOptions.style.display = 'none'; // Hide difficulty options for 1v1
}

const handle1vAIClick = () => {
    isAI = true;
    handleRestartGame();
    oneVAIButton.classList.add('active');
    nameInputs.style.display = 'block';
    oneVAIInputs.style.display = 'block';
    difficultyOptions.style.display = 'block'; // Show difficulty options for 1vAI
}

const start1v1Game = () => {
    player1 = player1NameInput.value;
    player2 = player2NameInput.value;
    if (player1 && player2) {
        nameInputs.style.display = 'none';
    }
}

const start1vAIGame = () => {
    player1 = playerNameInput.value;
    player2 = "Computer";
    if (player1) {
        nameInputs.style.display = 'none';
    }
}

const handleDifficultyClick = (clickedDifficultyEvent) => {
    const clickedDifficulty = clickedDifficultyEvent.target;
    difficultyButtons.forEach(button => button.classList.remove('active'));
    clickedDifficulty.classList.add('active');
    difficulty = clickedDifficulty.id;
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', handleRestartGame);
oneVOneButton.addEventListener('click', handle1v1Click);
oneVAIButton.addEventListener('click', handle1vAIClick);
start1v1Button.addEventListener('click', start1v1Game);
start1vAIButton.addEventListener('click', start1vAIGame);
difficultyButtons.forEach(button => button.addEventListener('click', handleDifficultyClick));
