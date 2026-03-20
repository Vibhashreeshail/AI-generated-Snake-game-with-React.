import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Database, Play, RotateCcw, AlertTriangle } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };

type Point = { x: number; y: number };
type SpeedMode = 'SLOW' | 'MED' | 'FAST';
const SPEED_MAP: Record<SpeedMode, number> = { SLOW: 150, MED: 90, FAST: 50 };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('MED');
  const [speed, setSpeed] = useState(SPEED_MAP.MED);

  const directionRef = useRef(direction);
  const lastMoveTimeRef = useRef(0);
  const requestRef = useRef<number>();

  // Prevent rapid direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setIsPaused(false);
    setHasStarted(true);
    setSpeed(SPEED_MAP[speedMode]);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      // Prevent default scrolling for arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' || e.key === 'Escape') {
        if (hasStarted) {
          setIsPaused((p) => !p);
        } else {
          resetGame();
        }
        return;
      }

      if (isPaused) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    },
    [gameOver, isPaused, hasStarted]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameLoop = useCallback(
    (time: number) => {
      if (isPaused || gameOver) {
        requestRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      if (time - lastMoveTimeRef.current >= speed) {
        lastMoveTimeRef.current = time;

        const head = snake[0];
        if (!head) return;

        const currentDir = directionRef.current;
        const newHead = {
          x: head.x + currentDir.x,
          y: head.y + currentDir.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return;
        }

        // Check self collision
        if (
          snake.some(
            (segment) => segment.x === newHead.x && segment.y === newHead.y
          )
        ) {
          setGameOver(true);
          return;
        }

        const newSnake = [newHead, ...snake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => {
            const newScore = s + 10;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setSpeed((prev) => Math.max(30, prev - 2));
          setFood(generateFood(newSnake));
          setSnake(newSnake);
        } else {
          newSnake.pop(); // Remove tail if no food eaten
          setSnake(newSnake);
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [isPaused, gameOver, speed, highScore, generateFood, snake, food]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameLoop]);

  const renderSpeedSelector = () => (
    <div className="flex flex-col items-center mb-8">
      <span className="text-cyan-400 text-xs uppercase tracking-[0.2em] mb-2">CLOCK_SPEED</span>
      <div className="flex gap-3">
        {(['SLOW', 'MED', 'FAST'] as SpeedMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSpeedMode(mode)}
            className={`px-4 py-1 font-bold tracking-widest uppercase border-2 shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-colors ${
              speedMode === mode
                ? 'bg-fuchsia-500 text-black border-fuchsia-500'
                : 'bg-black text-cyan-400 border-cyan-500 hover:bg-cyan-900/50'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Score Board */}
      <div className="flex items-center justify-between w-full max-w-md mb-6 px-6 py-4 bg-black border-2 border-fuchsia-500 shadow-[4px_4px_0_#0ff]">
        <div className="flex flex-col">
          <span className="text-cyan-400 text-sm uppercase tracking-[0.2em] font-bold mb-1">DATA_COLLECTED</span>
          <span className="text-fuchsia-500 text-4xl font-bold leading-none slashed-zero">
            {score.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-fuchsia-500 text-sm uppercase tracking-[0.2em] font-bold flex items-center gap-1 mb-1">
            <Database className="w-4 h-4" /> MAX_CAPACITY
          </span>
          <span className="text-cyan-400 text-4xl font-bold leading-none slashed-zero">
            {highScore.toString().padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      <div className="relative p-2 bg-black border-2 border-cyan-500 shadow-[4px_4px_0_#f0f]">
        {/* The Grid */}
        <div
          className="grid bg-black overflow-hidden relative"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(80vw, 400px)',
            height: 'min(80vw, 400px)',
          }}
        >
          {/* Grid lines for glitch aesthetic */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ff_1px,transparent_1px),linear-gradient(to_bottom,#0ff_1px,transparent_1px)] bg-[size:5%_5%] opacity-10 pointer-events-none" />
          
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const snakeIndex = snake.findIndex((segment) => segment.x === x && segment.y === y);
            const isSnake = snakeIndex !== -1;
            const isHead = snakeIndex === 0;
            const isFood = food.x === x && food.y === y;

            let inlineStyle = {};
            if (isSnake && !isHead) {
              const intensity = Math.max(0.15, 1 - (snakeIndex / snake.length));
              inlineStyle = {
                opacity: intensity,
                backgroundColor: '#f0f',
                boxShadow: `0 0 ${10 * intensity}px #f0f`
              };
            }

            return (
              <div
                key={i}
                className={`w-full h-full border-[0.5px] border-cyan-500/10 ${
                  isHead
                    ? 'bg-cyan-400 shadow-[0_0_10px_#0ff] z-10'
                    : isSnake
                    ? 'bg-fuchsia-500'
                    : isFood
                    ? 'bg-white shadow-[0_0_15px_#fff] animate-pulse'
                    : 'bg-transparent'
                }`}
                style={inlineStyle}
              />
            );
          })}
        </div>

        {/* Overlays */}
        {(!hasStarted || gameOver || isPaused) && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center p-8 bg-black border-2 border-fuchsia-500 shadow-[4px_4px_0_#0ff] flex flex-col items-center min-w-[300px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-fuchsia-500 opacity-50 screen-tear" />
              
              {gameOver ? (
                <>
                  <AlertTriangle className="w-12 h-12 text-fuchsia-500 mb-4 animate-pulse" />
                  <h2 
                    className="text-fuchsia-500 text-3xl font-bold mb-2 tracking-wider glitch-text uppercase"
                    data-text="CRITICAL ERROR"
                  >
                    CRITICAL ERROR
                  </h2>
                  <p className="text-cyan-400 font-mono mb-8 uppercase tracking-widest">// SECTOR CORRUPTED</p>
                  <p className="text-white font-mono mb-8 text-xl">DATA LOST: {score}</p>
                  
                  {renderSpeedSelector()}

                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-3 bg-fuchsia-500 text-black hover:bg-cyan-400 transition-colors border-2 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] font-bold tracking-widest uppercase"
                  >
                    <RotateCcw className="w-5 h-5" /> REINITIALIZE_NODE
                  </button>
                </>
              ) : !hasStarted ? (
                <>
                  <h2 
                    className="text-cyan-400 text-4xl font-bold mb-8 tracking-widest glitch-text uppercase"
                    data-text="PROTOCOL: OROBOROS"
                  >
                    PROTOCOL: OROBOROS
                  </h2>
                  
                  {renderSpeedSelector()}

                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-3 bg-cyan-400 text-black hover:bg-fuchsia-500 transition-colors border-2 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] font-bold tracking-widest uppercase"
                  >
                    <Play className="w-5 h-5 fill-black" /> EXECUTE SEQUENCE
                  </button>
                  <p className="text-fuchsia-500 text-sm mt-8 uppercase tracking-widest">
                    INPUT: ARROWS // WASD
                  </p>
                </>
              ) : (
                <>
                  <h2 
                    className="text-fuchsia-500 text-4xl font-bold mb-8 tracking-widest glitch-text uppercase"
                    data-text="SYSTEM HALTED"
                  >
                    SYSTEM HALTED
                  </h2>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-8 py-3 bg-cyan-400 text-black hover:bg-fuchsia-500 transition-colors border-2 border-black shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#000] font-bold tracking-widest uppercase"
                  >
                    <Play className="w-5 h-5 fill-black" /> OVERRIDE HALT
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Controls */}
      <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-[200px] sm:hidden">
        <div />
        <button 
          className="bg-black border-2 border-cyan-500 p-4 active:bg-fuchsia-500/20 text-cyan-400 flex justify-center shadow-[2px_2px_0_#f0f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#f0f]"
          onClick={() => { if (!isPaused && !gameOver && directionRef.current.y !== 1) setDirection({x: 0, y: -1}) }}
        >
          ▲
        </button>
        <div />
        <button 
          className="bg-black border-2 border-cyan-500 p-4 active:bg-fuchsia-500/20 text-cyan-400 flex justify-center shadow-[2px_2px_0_#f0f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#f0f]"
          onClick={() => { if (!isPaused && !gameOver && directionRef.current.x !== 1) setDirection({x: -1, y: 0}) }}
        >
          ◀
        </button>
        <button 
          className="bg-black border-2 border-cyan-500 p-4 active:bg-fuchsia-500/20 text-cyan-400 flex justify-center shadow-[2px_2px_0_#f0f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#f0f]"
          onClick={() => { if (!isPaused && !gameOver && directionRef.current.y !== -1) setDirection({x: 0, y: 1}) }}
        >
          ▼
        </button>
        <button 
          className="bg-black border-2 border-cyan-500 p-4 active:bg-fuchsia-500/20 text-cyan-400 flex justify-center shadow-[2px_2px_0_#f0f] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_#f0f]"
          onClick={() => { if (!isPaused && !gameOver && directionRef.current.x !== -1) setDirection({x: 1, y: 0}) }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
