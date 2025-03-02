const board = document.querySelector('.board');
const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restart-btn');
const endScreen = document.querySelector('.end-screen');
const resultMessage = document.querySelector('.result-message');
const background = document.querySelector('.background');
const modeSelection = document.querySelector('.mode-selection');
const onePlayerBtn = document.getElementById('one-player-btn');
const twoPlayerBtn = document.getElementById('two-player-btn');
const difficultySelection = document.querySelector('.difficulty-selection');
const easyBtn = document.getElementById('easy-btn');
const mediumBtn = document.getElementById('medium-btn');
const hardBtn = document.getElementById('hard-btn');
const container = document.querySelector('.container');
const backBtn = document.getElementById('back-btn');
const turnIndicator = document.querySelector('.turn-indicator');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];
let isOnePlayerMode = false;
let difficulty = 'easy'; // Default difficulty

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

// Add floating X and O in the background
for (let i = 0; i < 20; i++) {
  const xo = document.createElement('div');
  xo.classList.add('floating-xo');
  xo.textContent = Math.random() > 0.5 ? 'X' : 'O';
  xo.style.top = `${Math.random() * 100}%`;
  xo.style.left = `${Math.random() * 100}%`;
  xo.style.animationDuration = `${Math.random() * 5 + 3}s`;
  background.appendChild(xo);
}

// Handle cell click
const handleCellClick = (e) => {
  const cell = e.target;
  const index = cell.getAttribute('data-index');

  if (gameState[index] !== '' || !gameActive) return;

  gameState[index] = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.textContent = currentPlayer;

  checkForWinner();

  if (isOnePlayerMode && gameActive && currentPlayer === 'X') {
    currentPlayer = 'O';
    turnIndicator.textContent = "Computer's Turn";
    setTimeout(computerMove, 500); // Computer makes a move after 0.5 seconds
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  }
};

// Computer's move (AI)
const computerMove = () => {
  let move;
  switch (difficulty) {
    case 'easy':
      move = getRandomMove();
      break;
    case 'medium':
      move = getMediumMove();
      break;
    case 'hard':
      move = getHardMove();
      break;
    default:
      move = getRandomMove();
  }

  if (move !== null) {
    gameState[move] = 'O';
    cells[move].classList.add('o');
    cells[move].textContent = 'O';

    checkForWinner();
    currentPlayer = 'X';
    turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  }
};

// Easy: Random move
const getRandomMove = () => {
  const emptyCells = gameState
    .map((val, index) => (val === '' ? index : null))
    .filter((val) => val !== null);
  return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
};

// Medium: Random move, but tries to win or block
const getMediumMove = () => {
  // Check if computer can win
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === 'O' && gameState[b] === 'O' && gameState[c] === '') return c;
    if (gameState[a] === 'O' && gameState[c] === 'O' && gameState[b] === '') return b;
    if (gameState[b] === 'O' && gameState[c] === 'O' && gameState[a] === '') return a;
  }

  // Check if player can win and block
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === 'X' && gameState[b] === 'X' && gameState[c] === '') return c;
    if (gameState[a] === 'X' && gameState[c] === 'X' && gameState[b] === '') return b;
    if (gameState[b] === 'X' && gameState[c] === 'X' && gameState[a] === '') return a;
  }

  // Otherwise, make a random move
  return getRandomMove();
};

// Hard: Minimax algorithm for optimal play
const getHardMove = () => {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < 9; i++) {
    if (gameState[i] === '') {
      gameState[i] = 'O';
      let score = minimax(gameState, 0, false);
      gameState[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
};

// Minimax algorithm
const minimax = (board, depth, isMaximizing) => {
  const scores = {
    X: -1,
    O: 1,
    draw: 0
  };

  const result = checkWinner(board);
  if (result !== null) {
    return scores[result];
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};

// Check for winner
const checkForWinner = () => {
  let roundWon = false;

  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (gameState[a] === '' || gameState[b] === '' || gameState[c] === '') continue;
    if (gameState[a] === gameState[b] && gameState[b] === gameState[c]) {
      roundWon = true;
      // Add blow-up animation to winning cells
      cells[a].classList.add('blow-up');
      cells[b].classList.add('blow-up');
      cells[c].classList.add('blow-up');
      break;
    }
  }

  if (roundWon) {
    endGame(false);
    return;
  }

  if (!gameState.includes('')) {
    endGame(true);
    return;
  }
};

// Check winner helper function
const checkWinner = (board) => {
  for (let condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] !== '' && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return board.includes('') ? null : 'draw';
};

// End game
const endGame = (draw) => {
  gameActive = false;
  endScreen.style.display = 'flex';
  if (draw) {
    resultMessage.textContent = 'It\'s a Draw!';
  } else {
    resultMessage.textContent = `Player ${currentPlayer} Wins!`;
  }
};

// Restart game
const restartGame = () => {
  gameState = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'blow-up');
  });
  endScreen.style.display = 'none';
};

// Back to mode selection
const backToModeSelection = () => {
  gameState = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  turnIndicator.textContent = `Player ${currentPlayer}'s Turn`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'blow-up');
  });
  container.style.display = 'none';
  modeSelection.style.display = 'flex';
};

// Mode selection
onePlayerBtn.addEventListener('click', () => {
  isOnePlayerMode = true;
  modeSelection.style.display = 'none';
  difficultySelection.style.display = 'flex';
});

twoPlayerBtn.addEventListener('click', () => {
  isOnePlayerMode = false;
  modeSelection.style.display = 'none';
  container.style.display = 'block';
});

// Difficulty selection
easyBtn.addEventListener('click', () => {
  difficulty = 'easy';
  difficultySelection.style.display = 'none';
  container.style.display = 'block';
});

mediumBtn.addEventListener('click', () => {
  difficulty = 'medium';
  difficultySelection.style.display = 'none';
  container.style.display = 'block';
});

hardBtn.addEventListener('click', () => {
  difficulty = 'hard';
  difficultySelection.style.display = 'none';
  container.style.display = 'block';
});

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', restartGame);
backBtn.addEventListener('click', backToModeSelection);