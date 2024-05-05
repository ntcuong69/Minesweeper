let timerInterval;
let seconds = 0;

function startTimer() {
  timerInterval = setInterval(function () {
    seconds++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  seconds = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  document.querySelector(".timer").textContent = seconds;
}

let square = 11;
let difficulty = "easy";
let isFirstMove = true;
let flagsPlaced = 18;
updateFlagCount();

document.addEventListener("DOMContentLoaded", startGame());

document.getElementById("difficulty").addEventListener("change", function () {
  if (document.querySelector("#difficulty option:checked").value === "easy") {
    clearBoard();
    square = 11;
    difficulty = "easy";
    flagsPlaced = 18;
    updateFlagCount();
    isFirstMove = true;
    startGame();
    board.className = "easy";
    resetTimer();
  }
  if (document.querySelector("#difficulty option:checked").value === "normal") {
    clearBoard();
    square = 15;
    difficulty = "normal";
    flagsPlaced = 33;
    updateFlagCount();
    isFirstMove = true;
    startGame();
    board.className = "normal";
    resetTimer();
  }
  if (document.querySelector("#difficulty option:checked").value === "hard") {
    clearBoard();
    square = 19;
    difficulty = "hard";
    flagsPlaced = 54;
    updateFlagCount();
    isFirstMove = true;
    startGame();
    board.className = "hard";
    resetTimer();
  }
});

function clearBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(function (cell) {
    cell.remove();
  });
}
function resetBoard() {
  clearBoard();
  isFirstMove = true;
  if (board.className === "easy") {
    flagsPlaced = 18;
    updateFlagCount();
  }
  if (board.className === "normal") {
    flagsPlaced = 33;
    updateFlagCount();
  }
  if (board.className === "hard") {
    flagsPlaced = 54;
    updateFlagCount();
  }
  startGame();
  resetTimer();
}

function startGame() {
  const totalCells = square * square;

  createCells(totalCells);
  eventHandler();
}

function createCells(totalCells) {
  const board = document.getElementById("board");

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
  }
}

function eventHandler() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell) => {
    cell.addEventListener("click", revealCell);
    cell.addEventListener("contextmenu", toggleFlag);
    cell.addEventListener("mouseover", highlightCell);
    cell.addEventListener("mouseout", unhighlightCell);
  });
}

function toggleFlag(event) {
  event.preventDefault();
  const cell = event.target;
  if (!cell.classList.contains("revealed")) {
    if (cell.classList.contains("flag")) {
      cell.textContent = "";
      flagsPlaced++;
      cell.classList.toggle("flag");
    } else {
      if (flagsPlaced > 0) {
        cell.textContent = "🚩";
        flagsPlaced--;
        cell.classList.toggle("flag");
      }
    }
    updateFlagCount();
  }
}

function updateFlagCount() {
  const flagCountElement = document.getElementById("flag-count");
  flagCountElement.textContent = flagsPlaced;
}

function clearFlags() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    if (cell.classList.contains("flag")) {
      cell.textContent = "";
      cell.classList.remove("flag");
      flagsPlaced++;
    }
  });
  updateFlagCount();
}

function highlightCell(event) {
  const cell = event.target;
  if (!cell.classList.contains("revealed")) {
    cell.style.backgroundColor = "#77c674";
  }
}

function unhighlightCell(event) {
  const cell = event.target;
  if (!cell.classList.contains("revealed")) {
    cell.style.backgroundColor = "";
  }
}

function getAdjacentCells(cell) {
  const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
  const rowIndex = Math.floor(cellIndex / square);
  const colIndex = cellIndex % square;
  const adjacentCells = [];
  for (
    let i = Math.max(0, rowIndex - 1);
    i <= Math.min(square - 1, rowIndex + 1);
    i++
  ) {
    for (
      let j = Math.max(0, colIndex - 1);
      j <= Math.min(square - 1, colIndex + 1);
      j++
    ) {
      if (i !== rowIndex || j !== colIndex) {
        adjacentCells.push(
          document.getElementById("board").children[i * square + j]
        );
      }
    }
  }
  return adjacentCells;
}

function countAdjacentBombs(cell) {
  const adjacentCells = getAdjacentCells(cell);
  return adjacentCells.filter(
    (adjacentCell) => adjacentCell.dataset.bomb === "true"
  ).length;
}

function revealCell(event) {
  const cell = event.target;
  if (cell.classList.contains("revealed") || cell.classList.contains("flag"))
    return;
  if (isFirstMove) {
    clearFlags();
    setFirstMove(cell);
    isFirstMove = false;
    shakeScreen();
    startTimer();
  }
  if (cell.dataset.bomb === "true") {
    shakeScreen();
    revealAllCells();
    setTimeout(function () {
      boxLose();
    }, 2000);
  } else {
    const bombCount = countAdjacentBombs(cell);
    cell.textContent = bombCount > 0 ? bombCount : "";
    cell.classList.add("revealed");
    cell.style.backgroundColor = "#b2dcb1";
    if (bombCount === 0) {
      const adjacentCells = getAdjacentCells(cell);
      adjacentCells.forEach((adjacentCell) =>
        revealCell({ target: adjacentCell })
      );
    }
    if (checkWin()) {
      revealAllCells();
      setTimeout(function () {
        boxWin();
      }, 2000);
      updateHighScore(difficulty, seconds);
    }
  }
}

function checkWin() {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.dataset.bomb === "false" && !cell.classList.contains("revealed")) {
      return false;
    }
  }
  return true;
}

function setFirstMove(firstCell) {
  const cellIndex = Array.from(firstCell.parentNode.children).indexOf(
    firstCell
  );
  const rowIndex = Math.floor(cellIndex / square);
  const colIndex = cellIndex % square;

  const totalCells = square * square;
  const bombsCount = Math.floor(totalCells * 0.15);

  const bombIndices = [];
  while (bombIndices.length < bombsCount) {
    const index = Math.floor(Math.random() * totalCells);
    if (!bombIndices.includes(index)) {
      if (
        index === cellIndex ||
        (Math.abs(Math.floor(index / square) - rowIndex) <= 1 &&
          Math.abs((index % square) - colIndex) <= 1)
      ) {
        continue;
      }
      bombIndices.push(index);
    }
  }

  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell, index) => {
    if (bombIndices.includes(index)) {
      cell.dataset.bomb = "true";
    } else {
      cell.dataset.bomb = "false";
    }
  });
}

function revealAllCells() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => {
    if (cell.classList.contains("flag")) {
      cell.textContent = "";
    }
    if (cell.dataset.bomb === "true") {
      cell.textContent = "💣";
    }
    cell.classList.add("revealed");
  });
  stopTimer();
}
function boxWin() {
  Swal.fire({
    title: "Congratulations!!! ",
    html: "<p>Your score: " + seconds + "</p>",
    confirmButtonText: "Continue",
    confirmButtonColor: "#00CC00",
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
    },
    backdrop: `
      rgba(0,0,123,0.4)
      url("./images/fireworks.gif")
      bottom
      no-repeat
  `,
  }).then((result) => {
    if (result.isConfirmed) resetBoard();
  });
}

function boxLose() {
  Swal.fire({
    title: "Oops!!! You've been hit by a bomb :((",
    confirmButtonText: "Try Again",
    confirmButtonColor: "#00CC00",
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
    },
  }).then((result) => {
    if (result.isConfirmed) resetBoard();
  });
}

function shakeScreen() {
  var shake = document.getElementById("board");
  shake.classList.add("shake-animation");
  setTimeout(function () {
    shake.classList.remove("shake-animation");
  }, 500);
}

let highScores = {
  easy: localStorage.getItem("highScore_easy") || Infinity,
  normal: localStorage.getItem("highScore_normal") || Infinity,
  hard: localStorage.getItem("highScore_hard") || Infinity,
};

function updateHighScore(difficulty, score) {
  if (score < highScores[difficulty]) {
    highScores[difficulty] = score;
    localStorage.setItem("highScore_" + difficulty, score);
  }
}

function highestScoreBox() {
  Swal.fire({
    title: "Highest Score 🥇",
    html:
      "<p>Easy: " +
      highScores["easy"] +
      "</p><p>Normal: " +
      highScores["normal"] +
      "</p><p>Hard: " +
      highScores["hard"] +
      "</p>",
    confirmButtonColor: "#00CC00",
  });
}
