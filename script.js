document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const restartButton = document.getElementById('restart-button');
    const restartButtonDraw = document.getElementById('restart-button-draw');
    const menuButtonWin = document.getElementById('menu-button-win');
    const menuButtonDraw = document.getElementById('menu-button-draw');
    const timerElement = document.getElementById('timer');
    const currentTurnElement = document.getElementById('current-turn');
    const currentPlayerNameElement = document.getElementById('current-player-name');
    const gameBoard = document.getElementById('game-board');
    const pauseModal = document.getElementById('pause-modal');
    const winModal = document.getElementById('win-modal');
    const drawModal = document.getElementById('draw-modal');
    const playerNamesModal = document.getElementById('player-names-modal');
    const playerIcon = document.getElementById('player-icon');
    const playerTurnSpan = document.getElementById('player-turn');
    const playerNameInput = document.getElementById('player-name-input');
    const submitNameButton = document.getElementById('submit-name-button');
    const winMessage = document.getElementById('win-message');

    let timer;
    let time = 0;
    let isPaused = false;
    let isGameActive = false;
    let currentPlayer = 'X';
    let boardState = Array(9).fill(null);
    let playerXName = '';
    let playerOName = '';
    let isPlayerXTurn = true;

    let startingPlayer = 'X';

    startButton.addEventListener('click', showPlayerNamesModal);
    pauseButton.addEventListener('click', pauseGame);
    resumeButton.addEventListener('click', resumeGame);
    restartButton.addEventListener('click', startGame);
    restartButtonDraw.addEventListener('click', startGame);
    submitNameButton.addEventListener('click', handlePlayerNameSubmit);
    menuButtonWin.addEventListener('click', exitToMenu);
    menuButtonDraw.addEventListener('click', exitToMenu);

    createBoard();

    function showPlayerNamesModal() {
        isPlayerXTurn = true;
        playerTurnSpan.textContent = 'X';
        playerNameInput.value = '';
        playerIcon.innerHTML = `
            <line x1="10" y1="10" x2="90" y2="90" stroke="#2196F3" stroke-width="10" stroke-linecap="round" />
            <line x1="10" y1="90" x2="90" y2="10" stroke="#2196F3" stroke-width="10" stroke-linecap="round" />
        `;
        playerNamesModal.style.display = 'block';
    }

    function handlePlayerNameSubmit() {
        if (isPlayerXTurn) {
            playerXName = playerNameInput.value.trim() || 'Игрок X';
            document.getElementById('player-x-name').textContent = playerXName;
            isPlayerXTurn = false;
            playerTurnSpan.textContent = 'O';
            playerNameInput.value = '';
            playerIcon.innerHTML = `
                <circle cx="50" cy="50" r="40" stroke="#FFC107" stroke-width="10" fill="none" />
            `;
        } else {
            playerOName = playerNameInput.value.trim() || 'Игрок O';
            document.getElementById('player-o-name').textContent = playerOName;
            playerNamesModal.style.display = 'none';
            startGame();
        }
    }

    function startGame() {
        isGameActive = true;
        isPaused = false;
        currentPlayer = startingPlayer;
        startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
        time = 0;
        boardState.fill(null);
        renderBoard();
        updateTurnInfo();
        startButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        pauseModal.style.display = 'none';
        winModal.style.display = 'none';
        drawModal.style.display = 'none';
        startTimer();
    }

    function pauseGame() {
        if (!isGameActive) return;
        isPaused = true;
        clearInterval(timer);
        pauseModal.style.display = 'block';
    }

    function resumeGame() {
        isPaused = false;
        pauseModal.style.display = 'none';
        startTimer();
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => {
            if (!isPaused) {
                time++;
                timerElement.textContent = formatTime(time);
            }
        }, 1000);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTurnInfo() {
        currentTurnElement.className = currentPlayer.toLowerCase();
        currentTurnElement.innerHTML = getSVG(currentPlayer);
        currentPlayerNameElement.textContent = currentPlayer === 'X' ? `${playerXName}` : `${playerOName}`;
    }

    function createBoard() {
        gameBoard.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell-${i}`;
            cell.addEventListener('click', () => makeMove(i));
            gameBoard.appendChild(cell);
        }
    }

    function makeMove(index) {
        if (boardState[index] || !isGameActive || isPaused) return;
        boardState[index] = currentPlayer;
        renderBoard();
        if (checkWin()) {
            setTimeout(() => endGame(true), 300);
        } else if (boardState.every(cell => cell !== null)) {
            setTimeout(() => endGame(false), 300);
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateTurnInfo();
        }
    }

    function renderBoard() {
        const cells = gameBoard.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.innerHTML = boardState[index] ? getSVG(boardState[index]) : '';
            cell.classList.remove('winning', 'x-win', 'o-win');
        });
    }

    function getSVG(player) {
        if (player === 'X') {
            return `
                <svg viewBox="0 0 100 100">
                    <line x1="10" y1="10" x2="90" y2="90" stroke="#2196F3" stroke-width="10" stroke-linecap="round" filter="url(#drop-shadow)"/>
                    <line x1="10" y1="90" x2="90" y2="10" stroke="#2196F3" stroke-width="10" stroke-linecap="round" filter="url(#drop-shadow)"/>
                    <filter id="drop-shadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
                        <feOffset in="blur" dx="3" dy="3" result="offsetBlur"/>
                        <feMerge>
                            <feMergeNode in="offsetBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </svg>
            `;
        } else {
            return `
                <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#FFC107" stroke-width="10" fill="none" filter="url(#drop-shadow)"/>
                    <filter id="drop-shadow">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
                        <feOffset in="blur" dx="3" dy="3" result="offsetBlur"/>
                        <feMerge>
                            <feMergeNode in="offsetBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </svg>
            `;
        }
    }

    function checkWin() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        const isWin = winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
        });

        if (isWin) {
            const [a, b, c] = winPatterns.find(pattern => {
                const [a, b, c] = pattern;
                return boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c];
            });
            document.getElementById(`cell-${a}`).classList.add('winning', `${currentPlayer.toLowerCase()}-win`);
            document.getElementById(`cell-${b}`).classList.add('winning', `${currentPlayer.toLowerCase()}-win`);
            document.getElementById(`cell-${c}`).classList.add('winning', `${currentPlayer.toLowerCase()}-win`);
        }

        return isWin;
    }

    function endGame(isWin) {
        isGameActive = false;
        clearInterval(timer);
        if (isWin) {
            const winner = currentPlayer === 'X' ? playerXName : playerOName;
            winMessage.textContent = `${winner} победил!`;
            winModal.style.display = 'block';
            if (currentPlayer === 'X') {
                playerXWins++;
                document.getElementById('player-x-wins').textContent = playerXWins;
            } else {
                playerOWins++;
                document.getElementById('player-o-wins').textContent = playerOWins;
            }
        } else {
            drawModal.style.display = 'block';
        }
        startingPlayer = startingPlayer === 'X' ? 'O' : 'X';
    }

    function exitToMenu() {
        winModal.style.display = 'none';
        drawModal.style.display = 'none';
        startButton.style.display = 'inline-block';
        pauseButton.style.display = 'none';
        clearInterval(timer);
        timerElement.textContent = '00:00';
        time = 0;
        isPaused = false;
        isGameActive = false;
        currentPlayer = 'X';
        boardState.fill(null);
        renderBoard();
        updateTurnInfo();
        playerXWins = 0;
        playerOWins = 0;
        document.getElementById('player-x-wins').textContent = playerXWins;
        document.getElementById('player-o-wins').textContent = playerOWins;
    }
});

let playerXWins = 0;
let playerOWins = 0;

function handlePlayerNameSubmit() {
    if (isPlayerXTurn) {
        playerXName = playerNameInput.value.trim() || 'Игрок X';
        document.getElementById('player-x-name').textContent = playerXName; 
        isPlayerXTurn = false;
        playerTurnSpan.textContent = 'O';
        playerNameInput.value = '';
        playerIcon.innerHTML = `
            <circle cx="50" cy="50" r="40" stroke="#FFC107" stroke-width="10" fill="none" />
        `;
    } else {
        playerOName = playerNameInput.value.trim() || 'Игрок O';
        document.getElementById('player-o-name').textContent = playerOName;
        playerNamesModal.style.display = 'none';
        startGame();
    }
}
