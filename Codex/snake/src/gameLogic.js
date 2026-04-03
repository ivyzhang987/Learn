export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function positionsEqual(a, b) {
  if (!a || !b) {
    return false;
  }

  return a.x === b.x && a.y === b.y;
}

function includesPosition(positions, candidate) {
  return positions.some((position) => positionsEqual(position, candidate));
}

export function createInitialState(random = Math.random) {
  const snake = [
    { x: 4, y: 8 },
    { x: 3, y: 8 },
    { x: 2, y: 8 },
  ];

  return {
    gridSize: GRID_SIZE,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: placeFood(snake, GRID_SIZE, random),
    score: 0,
    isGameOver: false,
    hasStarted: false,
  };
}

export function queueDirection(state, nextDirection) {
  if (!VECTORS[nextDirection] || state.isGameOver) {
    return state;
  }

  const activeDirection = state.pendingDirection ?? state.direction;
  if (OPPOSITES[activeDirection] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver) {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const vector = VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  const grows = positionsEqual(nextHead, state.food);
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);
  const hitsWall =
    nextHead.x < 0 ||
    nextHead.x >= state.gridSize ||
    nextHead.y < 0 ||
    nextHead.y >= state.gridSize;
  const hitsSelf = includesPosition(bodyToCheck, nextHead);

  if (hitsWall || hitsSelf) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      hasStarted: true,
      isGameOver: true,
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!grows) {
    snake.pop();
  }

  return {
    ...state,
    snake,
    direction,
    pendingDirection: direction,
    food: grows ? placeFood(snake, state.gridSize, random) : state.food,
    score: grows ? state.score + 1 : state.score,
    hasStarted: true,
  };
}

export function placeFood(snake, gridSize, random = Math.random) {
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const candidate = { x, y };
      if (!includesPosition(snake, candidate)) {
        openCells.push(candidate);
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function getCellType(state, x, y) {
  if (state.food && state.food.x === x && state.food.y === y) {
    return "food";
  }

  const snakeIndex = state.snake.findIndex(
    (segment) => segment.x === x && segment.y === y,
  );
  if (snakeIndex === 0) {
    return "head";
  }
  if (snakeIndex > 0) {
    return "snake";
  }

  return "empty";
}
