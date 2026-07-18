import type { Lang } from "@/lib/content"

export type GameId = "snake" | "guess" | "quiz"

export type Point = { x: number; y: number }

export type SnakeGame = {
  type: "snake"
  snake: Point[]
  dir: Point
  food: Point
  width: number
  height: number
  score: number
  gameOver: boolean
}

export type GuessGame = {
  type: "guess"
  secret: number
  attempts: number
  min: number
  max: number
}

export type QuizGame = {
  type: "quiz"
  index: number
  score: number
  total: number
}

export type ActiveGame = SnakeGame | GuessGame | QuizGame

type QuizQuestion = {
  q: string
  options: [string, string, string, string]
  answer: 0 | 1 | 2 | 3
}

const QUIZ: Record<Lang, QuizQuestion[]> = {
  es: [
    {
      q: "¿Qué lenguaje uso más en backend?",
      options: ["JavaScript", "Python", "Go", "Ruby"],
      answer: 1,
    },
    {
      q: "¿Qué framework web uso con Python?",
      options: ["Django", "Flask", "FastAPI", "Tornado"],
      answer: 2,
    },
    {
      q: "¿Dónde está desplegado este portfolio?",
      options: ["Vercel", "Netlify", "GitHub Pages", "Cloudflare"],
      answer: 2,
    },
    {
      q: "¿Qué bundler usa el frontend?",
      options: ["Webpack", "Vite", "Parcel", "Rollup"],
      answer: 1,
    },
    {
      q: "Atajo para salir de un juego:",
      options: ["exit", "quit", "stop", "todas las anteriores"],
      answer: 3,
    },
  ],
  en: [
    {
      q: "Which language do I use most on the backend?",
      options: ["JavaScript", "Python", "Go", "Ruby"],
      answer: 1,
    },
    {
      q: "Which Python web framework do I use?",
      options: ["Django", "Flask", "FastAPI", "Tornado"],
      answer: 2,
    },
    {
      q: "Where is this portfolio deployed?",
      options: ["Vercel", "Netlify", "GitHub Pages", "Cloudflare"],
      answer: 2,
    },
    {
      q: "Which bundler does the frontend use?",
      options: ["Webpack", "Vite", "Parcel", "Rollup"],
      answer: 1,
    },
    {
      q: "Shortcut to leave a game:",
      options: ["exit", "quit", "stop", "all of the above"],
      answer: 3,
    },
  ],
}

const GAME_COPY = {
  es: {
    listTitle: "Minijuegos disponibles:",
    listLines: [
      "  play snake  — snake clásico (↑↓←→, q para salir)",
      "  play guess  — adivina el número (1-100)",
      "  play quiz   — trivia dev (responde a/b/c/d)",
    ],
    unknownGame: (g: string) =>
      `juego desconocido: ${g}. Prueba 'games'.`,
    started: (g: GameId) => `iniciando ${g}…`,
    quit: "juego terminado.",
    snakeHint: "controles: flechas · q = salir",
    snakeOver: (score: number) => `game over — puntuación: ${score}`,
    guessStart: "Adivina un número entre 1 y 100.",
    guessHint: "Escribe un número o 'quit' para salir.",
    guessLow: (n: number) => `más alto que ${n}`,
    guessHigh: (n: number) => `más bajo que ${n}`,
    guessWin: (attempts: number) => `¡correcto! intentos: ${attempts}`,
    guessInvalid: "escribe un entero entre 1 y 100.",
    quizDone: (score: number, total: number) =>
      `quiz terminado — ${score}/${total} aciertos`,
    quizInvalid: "responde con a, b, c o d.",
    quizCorrect: "✓ correcto",
    quizWrong: (opt: string) => `✗ incorrecto — era ${opt}`,
  },
  en: {
    listTitle: "Available mini-games:",
    listLines: [
      "  play snake  — classic snake (↑↓←→, q to quit)",
      "  play guess  — guess the number (1-100)",
      "  play quiz   — dev trivia (answer a/b/c/d)",
    ],
    unknownGame: (g: string) => `unknown game: ${g}. Try 'games'.`,
    started: (g: GameId) => `starting ${g}…`,
    quit: "game ended.",
    snakeHint: "controls: arrows · q = quit",
    snakeOver: (score: number) => `game over — score: ${score}`,
    guessStart: "Guess a number between 1 and 100.",
    guessHint: "Type a number or 'quit' to exit.",
    guessLow: (n: number) => `higher than ${n}`,
    guessHigh: (n: number) => `lower than ${n}`,
    guessWin: (attempts: number) => `correct! attempts: ${attempts}`,
    guessInvalid: "enter an integer between 1 and 100.",
    quizDone: (score: number, total: number) =>
      `quiz finished — ${score}/${total} correct`,
    quizInvalid: "answer with a, b, c, or d.",
    quizCorrect: "✓ correct",
    quizWrong: (opt: string) => `✗ wrong — it was ${opt}`,
  },
} as const

export function gameCopy(lang: Lang) {
  return GAME_COPY[lang]
}

export function isGameId(value: string): value is GameId {
  return value === "snake" || value === "guess" || value === "quiz"
}

function randFood(width: number, height: number, snake: Point[]): Point {
  for (let i = 0; i < 200; i++) {
    const p = {
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
    }
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p
  }
  return { x: 0, y: 0 }
}

export function createSnakeGame(): SnakeGame {
  const width = 18
  const height = 10
  const snake = [
    { x: 9, y: 5 },
    { x: 8, y: 5 },
    { x: 7, y: 5 },
  ]
  return {
    type: "snake",
    snake,
    dir: { x: 1, y: 0 },
    food: randFood(width, height, snake),
    width,
    height,
    score: 0,
    gameOver: false,
  }
}

export function createGuessGame(): GuessGame {
  return {
    type: "guess",
    secret: Math.floor(Math.random() * 100) + 1,
    attempts: 0,
    min: 1,
    max: 100,
  }
}

export function createQuizGame(lang: Lang): QuizGame {
  return {
    type: "quiz",
    index: 0,
    score: 0,
    total: QUIZ[lang].length,
  }
}

export function renderSnake(game: SnakeGame): string[] {
  const grid = Array.from({ length: game.height }, () =>
    Array.from({ length: game.width }, () => "·"),
  )
  grid[game.food.y][game.food.x] = "●"
  game.snake.forEach((seg, i) => {
    grid[seg.y][seg.x] = i === 0 ? "█" : "▓"
  })
  const border = "─".repeat(game.width + 2)
  const rows = grid.map((row) => `│${row.join("")}│`)
  return [`┌${border}┐`, ...rows, `└${border}┘`, `score: ${game.score}`]
}

export function setSnakeDir(game: SnakeGame, dir: Point): SnakeGame {
  if (game.gameOver) return game
  const opposite =
    dir.x === -game.dir.x && dir.y === -game.dir.y && (dir.x || dir.y)
  if (opposite) return game
  return { ...game, dir }
}

export function tickSnake(game: SnakeGame): SnakeGame {
  if (game.gameOver) return game

  const head = game.snake[0]
  const next = { x: head.x + game.dir.x, y: head.y + game.dir.y }

  const hitWall =
    next.x < 0 ||
    next.y < 0 ||
    next.x >= game.width ||
    next.y >= game.height
  const hitSelf = game.snake.some((s) => s.x === next.x && s.y === next.y)

  if (hitWall || hitSelf) {
    return { ...game, gameOver: true }
  }

  const ate = next.x === game.food.x && next.y === game.food.y
  const snake = [next, ...game.snake]
  if (!ate) snake.pop()

  const score = ate ? game.score + 1 : game.score
  const food = ate ? randFood(game.width, game.height, snake) : game.food

  return { ...game, snake, food, score }
}

export function formatQuizQuestion(lang: Lang, game: QuizGame): string[] {
  const q = QUIZ[lang][game.index]
  if (!q) return []
  const labels = ["a", "b", "c", "d"] as const
  return [
    `[${game.index + 1}/${game.total}] ${q.q}`,
    ...q.options.map((opt, i) => `  ${labels[i]}) ${opt}`),
  ]
}

export function answerQuiz(
  lang: Lang,
  game: QuizGame,
  letter: string,
): { game: QuizGame | null; lines: string[] } {
  const c = gameCopy(lang)
  const idx = "abcd".indexOf(letter.toLowerCase())
  if (idx < 0) return { game, lines: [c.quizInvalid] }

  const q = QUIZ[lang][game.index]
  const labels = ["a", "b", "c", "d"] as const
  const correct = idx === q.answer
  const lines = correct
    ? [c.quizCorrect]
    : [c.quizWrong(labels[q.answer])]

  const nextIndex = game.index + 1
  const score = game.score + (correct ? 1 : 0)

  if (nextIndex >= game.total) {
    return {
      game: null,
      lines: [...lines, c.quizDone(score, game.total)],
    }
  }

  const next: QuizGame = { ...game, index: nextIndex, score }
  return {
    game: next,
    lines: [...lines, ...formatQuizQuestion(lang, next)],
  }
}

export function guessNumber(
  lang: Lang,
  game: GuessGame,
  raw: string,
): { game: GuessGame | null; lines: string[] } {
  const c = gameCopy(lang)
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < game.min || n > game.max) {
    return { game, lines: [c.guessInvalid] }
  }

  const attempts = game.attempts + 1
  if (n === game.secret) {
    return { game: null, lines: [c.guessWin(attempts)] }
  }
  if (n < game.secret) {
    return { game: { ...game, attempts }, lines: [c.guessLow(n)] }
  }
  return { game: { ...game, attempts }, lines: [c.guessHigh(n)] }
}

export function snakeDirFromKey(key: string): Point | null {
  switch (key) {
    case "ArrowUp":
      return { x: 0, y: -1 }
    case "ArrowDown":
      return { x: 0, y: 1 }
    case "ArrowLeft":
      return { x: -1, y: 0 }
    case "ArrowRight":
      return { x: 1, y: 0 }
    default:
      return null
  }
}

export function startGameLines(lang: Lang, id: GameId): string[] {
  const c = gameCopy(lang)
  const lines = [c.started(id)]
  if (id === "guess") lines.push(c.guessStart, c.guessHint)
  if (id === "snake") lines.push(c.snakeHint)
  if (id === "quiz") {
    const game = createQuizGame(lang)
    lines.push(...formatQuizQuestion(lang, game))
  }
  return lines
}
