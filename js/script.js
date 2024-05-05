// Thiết lập bộ đếm thời gian
let timerInterval;
let seconds = 0;
let flagsPlaced = 18; // Biến để theo dõi số cờ đã đặt
updateFlagCount();
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

//Thiết lập các luật của trò chơi
let square = 11;
let isFirstMove = true;

document.addEventListener("DOMContentLoaded", startGame());

document.getElementById("difficulty").addEventListener("change", function () {
  if (document.querySelector("#difficulty option:checked").value === "easy") {
    clearBoard();
    square = 11;
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

//Thiết lập các sự kiện
function eventHandler() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell) => {
    cell.addEventListener("click", revealCell);
    cell.addEventListener("contextmenu", toggleFlag);
  });

  cells.forEach((cell) => {
    cell.addEventListener("click", revealCell);
    cell.addEventListener("contextmenu", toggleFlag);
    cell.addEventListener("mouseover", highlightCell);
    cell.addEventListener("mouseout", unhighlightCell);
  });
}

function toggleFlag(event) {
  event.preventDefault(); // Ngăn chặn hiển thị menu chuột phải mặc định
  const cell = event.target;
  if (!cell.classList.contains("revealed")) {
    if (cell.classList.contains("flag")) {
      cell.textContent = ""; // Gỡ cờ nếu ô đã có cờ
      flagsPlaced++;
      cell.classList.toggle("flag");
    } else {
      if (flagsPlaced > 0) { // Chỉ đặt cờ nếu số cờ đã đặt còn lớn hơn 0
        cell.textContent = "🚩";
        flagsPlaced--; // Trừ 1 từ số cờ đã đặt
        cell.classList.toggle("flag");
      }
    }
    updateFlagCount();
  }
}

function updateFlagCount() {
  const flagCountElement = document.getElementById("flag-count");
  flagCountElement.textContent = flagsPlaced; // Cập nhật số lượng cờ đã đặt trong giao diện người dùng
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
    setFirstMove(cell); // Nếu đây là nước đi đầu tiên, thiết lập ô đầu tiên và các ô lân cận không có bom
    isFirstMove = false; // Đánh dấu rằng không phải là nước đi đầu tiên nữa
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
    }
  }
}

function checkWin() {
  const cells = document.querySelectorAll(".cell");
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.dataset.bomb === "false" && !cell.classList.contains("revealed")) {
      return false; // Nếu còn ô không được mở và không phải là bom, chưa thắng
    }
  }
  return true; // Nếu tất cả các ô không có bom đã được mở, thì người chơi đã thắng
}

function setFirstMove(firstCell) {
  // Lấy vị trí của ô đầu tiên
  const cellIndex = Array.from(firstCell.parentNode.children).indexOf(
    firstCell
  );
  const rowIndex = Math.floor(cellIndex / square);
  const colIndex = cellIndex % square;

  const totalCells = square * square;
  const bombsCount = Math.floor(totalCells * 0.15); // 15% tổng số ô là bom

  const bombIndices = [];
  while (bombIndices.length < bombsCount) {
    const index = Math.floor(Math.random() * totalCells);
    if (!bombIndices.includes(index)) {
      if (
        index === cellIndex || // Ô đầu tiên không chứa bom
        // 8 ô lân cận của ô đầu tiên không chứa bom
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
      cell.dataset.bomb = "true"; // Đặt bom cho các ô được chọn ngẫu nhiên
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
//ALert khi win game va lose game
function boxWin() {
  Swal.fire({
    title: "You win!!! Your score: " + seconds,
    confirmButtonText: "Continue",
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

function boxLose() {
  Swal.fire({
    title: "You lose",
    confirmButtonText: "Try Again",
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
  // Thêm lớp "shake-animation" để kích hoạt animation
  shake.classList.add("shake-animation");
  // Sau 0.5 giây, loại bỏ lớp "shake-animation" để dừng animation
  setTimeout(function () {
    shake.classList.remove("shake-animation");
  }, 500);
}