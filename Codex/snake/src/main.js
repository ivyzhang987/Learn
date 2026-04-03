import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  getCellType,
  queueDirection,
  stepGame,
} from "./gameLogic.js";

const board = document.querySelector("#board");
const score = document.querySelector("#score");
const status = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const controlButtons = [...document.querySelectorAll("[data-direction]")];

let state = createInitialState();
let intervalId = null;

function renderBoard() {
  const cells = [];

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const cell = document.createElement("div");
      const cellType = getCellType(state, x, y);
      cell.className = "cell";

      if (cellType === "head") {
        cell.classList.add("cell--head");
      } else if (cellType === "snake") {
        cell.classList.add("cell--snake");
      } else if (cellType === "food") {
        cell.classList.add("cell--food");
      }

      cells.push(cell);
    }
  }

  board.replaceChildren(...cells);
}

function renderStatus() {
  score.textContent = String(state.score);

  if (state.isGameOver) {
    status.textContent = "Game over. Press restart to play again.";
    return;
  }

  if (!state.hasStarted) {
    status.textContent = "Use arrow keys or WASD to start.";
    return;
  }

  status.textContent = "Keep going.";
}

function render() {
  renderBoard();
  renderStatus();
}

function tick() {
  state = stepGame(state);
  render();

  if (state.isGameOver) {
    stopLoop();
  }
}

function startLoop() {
  if (intervalId !== null) {
    return;
  }

  intervalId = window.setInterval(tick, TICK_MS);
}

function stopLoop() {
  if (intervalId === null) {
    return;
  }

  window.clearInterval(intervalId);
  intervalId = null;
}

function handleDirectionInput(direction) {
  const nextState = queueDirection(state, direction);
  if (nextState === state) {
    return;
  }

  state = nextState;
  render();

  if (!state.hasStarted) {
    startLoop();
  }
}

function restart() {
  stopLoop();
  state = createInitialState();
  render();
}

const KEY_TO_DIRECTION = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

window.addEventListener("keydown", (event) => {
  const direction = KEY_TO_DIRECTION[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  handleDirectionInput(direction);
});

restartButton.addEventListener("click", restart);

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    handleDirectionInput(button.dataset.direction);
  });
}

render();
