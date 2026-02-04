import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';

interface Position {
  x: number;
  y: number;
}

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  speed: number;
  type: 'boat' | 'crab' | 'seagull' | 'wave';
  direction: 1 | -1;
}

interface Lane {
  y: number;
  type: 'water' | 'sand' | 'safe';
  obstacles: Obstacle[];
  speed: number;
  direction: 1 | -1;
}

const GRID_SIZE = 50;
const PLAYER_SIZE = 40;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const LANES_COUNT = 12;

const Lobster: React.FC<{ x: number; y: number; direction: number }> = ({ x, y, direction }) => (
  <div
    className="lobster"
    style={{
      left: x,
      top: y,
      transform: `scaleX(${direction})`
    }}
  >
    <svg viewBox="0 0 40 40" width="40" height="40">
      {/* Body */}
      <ellipse cx="20" cy="22" rx="10" ry="12" fill="#e74c3c" />
      <ellipse cx="20" cy="22" rx="8" ry="10" fill="#c0392b" />

      {/* Tail segments */}
      <ellipse cx="20" cy="35" rx="8" ry="4" fill="#e74c3c" />
      <ellipse cx="20" cy="38" rx="6" ry="3" fill="#c0392b" />

      {/* Head */}
      <ellipse cx="20" cy="10" rx="6" ry="5" fill="#e74c3c" />

      {/* Eyes */}
      <circle cx="16" cy="7" r="3" fill="#fff" />
      <circle cx="24" cy="7" r="3" fill="#fff" />
      <circle cx="16" cy="7" r="1.5" fill="#1a3a52" />
      <circle cx="24" cy="7" r="1.5" fill="#1a3a52" />

      {/* Antennae */}
      <line x1="15" y1="5" x2="10" y2="0" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="5" x2="30" y2="0" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />

      {/* Claws */}
      <ellipse cx="5" cy="18" rx="5" ry="4" fill="#e74c3c" />
      <ellipse cx="35" cy="18" rx="5" ry="4" fill="#e74c3c" />
      <path d="M 2 16 Q 0 18 2 20" stroke="#c0392b" strokeWidth="2" fill="none" />
      <path d="M 38 16 Q 40 18 38 20" stroke="#c0392b" strokeWidth="2" fill="none" />

      {/* Legs */}
      <line x1="12" y1="25" x2="6" y2="28" stroke="#e74c3c" strokeWidth="2" />
      <line x1="12" y1="30" x2="6" y2="33" stroke="#e74c3c" strokeWidth="2" />
      <line x1="28" y1="25" x2="34" y2="28" stroke="#e74c3c" strokeWidth="2" />
      <line x1="28" y1="30" x2="34" y2="33" stroke="#e74c3c" strokeWidth="2" />
    </svg>
  </div>
);

const ObstacleSprite: React.FC<{ obstacle: Obstacle }> = ({ obstacle }) => {
  const renderObstacle = () => {
    switch (obstacle.type) {
      case 'boat':
        return (
          <svg viewBox="0 0 80 40" width={obstacle.width} height="40">
            <path d="M 5 25 Q 40 35 75 25 L 70 30 Q 40 40 10 30 Z" fill="#8b4513" />
            <rect x="15" y="10" width="50" height="15" fill="#deb887" />
            <rect x="35" y="0" width="5" height="25" fill="#654321" />
            <polygon points="40,5 40,20 60,15" fill="#fff" />
          </svg>
        );
      case 'crab':
        return (
          <svg viewBox="0 0 40 30" width={obstacle.width} height="30">
            <ellipse cx="20" cy="18" rx="12" ry="10" fill="#ff6b35" />
            <circle cx="12" cy="8" r="4" fill="#ff6b35" />
            <circle cx="28" cy="8" r="4" fill="#ff6b35" />
            <circle cx="12" cy="7" r="2" fill="#fff" />
            <circle cx="28" cy="7" r="2" fill="#fff" />
            <circle cx="12" cy="7" r="1" fill="#000" />
            <circle cx="28" cy="7" r="1" fill="#000" />
            <ellipse cx="3" cy="15" rx="4" ry="3" fill="#ff6b35" />
            <ellipse cx="37" cy="15" rx="4" ry="3" fill="#ff6b35" />
            <line x1="10" y1="25" x2="6" y2="30" stroke="#ff6b35" strokeWidth="3" />
            <line x1="15" y1="26" x2="12" y2="30" stroke="#ff6b35" strokeWidth="3" />
            <line x1="25" y1="26" x2="28" y2="30" stroke="#ff6b35" strokeWidth="3" />
            <line x1="30" y1="25" x2="34" y2="30" stroke="#ff6b35" strokeWidth="3" />
          </svg>
        );
      case 'seagull':
        return (
          <svg viewBox="0 0 50 30" width={obstacle.width} height="30">
            <ellipse cx="25" cy="18" rx="10" ry="8" fill="#f5f5f5" />
            <ellipse cx="32" cy="15" rx="6" ry="5" fill="#f5f5f5" />
            <circle cx="35" cy="13" r="2" fill="#000" />
            <polygon points="40,15 48,14 40,17" fill="#f39c12" />
            <path d="M 15 18 Q 5 10 0 15" stroke="#e0e0e0" strokeWidth="3" fill="none" />
            <path d="M 15 18 Q 5 25 0 20" stroke="#e0e0e0" strokeWidth="3" fill="none" />
          </svg>
        );
      case 'wave':
        return (
          <svg viewBox="0 0 60 30" width={obstacle.width} height="30">
            <path
              d="M 0 20 Q 15 10 30 20 Q 45 30 60 20 L 60 30 L 0 30 Z"
              fill="rgba(127, 205, 205, 0.7)"
            />
            <path
              d="M 0 20 Q 15 10 30 20 Q 45 30 60 20"
              stroke="#fff"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className="obstacle"
      style={{
        left: obstacle.x,
        top: obstacle.y,
        transform: `scaleX(${obstacle.direction})`
      }}
    >
      {renderObstacle()}
    </div>
  );
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerPos, setPlayerPos] = useState<Position>({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - GRID_SIZE });
  const [playerDirection, setPlayerDirection] = useState(1);
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [maxY, setMaxY] = useState(GAME_HEIGHT - GRID_SIZE);
  const gameRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const initializeLanes = useCallback(() => {
    const newLanes: Lane[] = [];
    for (let i = 0; i < LANES_COUNT; i++) {
      const y = i * GRID_SIZE;
      let type: 'water' | 'sand' | 'safe' = 'sand';

      if (i === 0 || i === LANES_COUNT - 1) {
        type = 'safe';
      } else if (i % 3 === 0 || i % 3 === 1) {
        type = 'water';
      }

      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = 1 + Math.random() * 2;

      const obstacles: Obstacle[] = [];
      if (type !== 'safe') {
        const obstacleCount = Math.floor(Math.random() * 2) + 1;
        const obstacleTypes: Array<'boat' | 'crab' | 'seagull' | 'wave'> =
          type === 'water' ? ['boat', 'wave'] : ['crab', 'seagull'];

        for (let j = 0; j < obstacleCount; j++) {
          const obsType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const width = obsType === 'boat' ? 80 : obsType === 'wave' ? 60 : 40;
          obstacles.push({
            id: i * 100 + j,
            x: (j * (GAME_WIDTH / obstacleCount)) + Math.random() * 50,
            y: y + 5,
            width,
            speed,
            type: obsType,
            direction: direction as 1 | -1,
          });
        }
      }

      newLanes.push({ y, type, obstacles, speed, direction: direction as 1 | -1 });
    }
    return newLanes;
  }, []);

  const resetGame = useCallback(() => {
    setPlayerPos({ x: GAME_WIDTH / 2 - PLAYER_SIZE / 2, y: GAME_HEIGHT - GRID_SIZE });
    setScore(0);
    setMaxY(GAME_HEIGHT - GRID_SIZE);
    setLanes(initializeLanes());
    setGameState('playing');
  }, [initializeLanes]);

  const checkCollision = useCallback((pos: Position, currentLanes: Lane[]) => {
    const playerBox = {
      left: pos.x + 5,
      right: pos.x + PLAYER_SIZE - 5,
      top: pos.y + 5,
      bottom: pos.y + PLAYER_SIZE - 5,
    };

    for (const lane of currentLanes) {
      for (const obs of lane.obstacles) {
        const obsBox = {
          left: obs.x,
          right: obs.x + obs.width,
          top: obs.y,
          bottom: obs.y + 35,
        };

        if (
          playerBox.left < obsBox.right &&
          playerBox.right > obsBox.left &&
          playerBox.top < obsBox.bottom &&
          playerBox.bottom > obsBox.top
        ) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    let newPos = { ...playerPos };
    let newDirection = playerDirection;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        newPos.y = Math.max(0, playerPos.y - GRID_SIZE);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newPos.y = Math.min(GAME_HEIGHT - GRID_SIZE, playerPos.y + GRID_SIZE);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newPos.x = Math.max(0, playerPos.x - GRID_SIZE);
        newDirection = -1;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newPos.x = Math.min(GAME_WIDTH - PLAYER_SIZE, playerPos.x + GRID_SIZE);
        newDirection = 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    setPlayerDirection(newDirection);
    setPlayerPos(newPos);

    if (newPos.y < maxY) {
      const newScore = score + 10;
      setScore(newScore);
      setMaxY(newPos.y);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    }
  }, [gameState, playerPos, playerDirection, maxY, score, highScore]);

  useEffect(() => {
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState, handleKeyDown]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const updateGame = () => {
      setLanes(prevLanes => {
        const newLanes = prevLanes.map(lane => ({
          ...lane,
          obstacles: lane.obstacles.map(obs => {
            let newX = obs.x + obs.speed * obs.direction;

            if (obs.direction === 1 && newX > GAME_WIDTH) {
              newX = -obs.width;
            } else if (obs.direction === -1 && newX < -obs.width) {
              newX = GAME_WIDTH;
            }

            return { ...obs, x: newX };
          }),
        }));

        if (checkCollision(playerPos, newLanes)) {
          setGameState('gameover');
        }

        return newLanes;
      });

      animationRef.current = requestAnimationFrame(updateGame);
    };

    animationRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameState, playerPos, checkCollision]);

  const handleTouch = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return;

    let newPos = { ...playerPos };
    let newDirection = playerDirection;

    switch (direction) {
      case 'up':
        newPos.y = Math.max(0, playerPos.y - GRID_SIZE);
        break;
      case 'down':
        newPos.y = Math.min(GAME_HEIGHT - GRID_SIZE, playerPos.y + GRID_SIZE);
        break;
      case 'left':
        newPos.x = Math.max(0, playerPos.x - GRID_SIZE);
        newDirection = -1;
        break;
      case 'right':
        newPos.x = Math.min(GAME_WIDTH - PLAYER_SIZE, playerPos.x + GRID_SIZE);
        newDirection = 1;
        break;
    }

    setPlayerDirection(newDirection);
    setPlayerPos(newPos);

    if (newPos.y < maxY) {
      const newScore = score + 10;
      setScore(newScore);
      setMaxY(newPos.y);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
    }
  }, [gameState, playerPos, playerDirection, maxY, score, highScore]);

  return (
    <div className="app-container">
      <div className="ocean-bg" />
      <div className="bubbles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="bubble" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
            width: `${10 + Math.random() * 20}px`,
            height: `${10 + Math.random() * 20}px`,
          }} />
        ))}
      </div>

      <header className="game-header">
        <h1 className="title">
          <span className="title-icon">🦞</span>
          Lobster Crossing
          <span className="title-icon">🦞</span>
        </h1>
        <div className="score-display">
          <div className="score-item">
            <span className="score-label">Score</span>
            <span className="score-value">{score}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Best</span>
            <span className="score-value high">{highScore}</span>
          </div>
        </div>
      </header>

      <main className="game-area">
        {gameState === 'menu' && (
          <div className="menu-overlay">
            <div className="menu-content">
              <div className="menu-lobster">
                <Lobster x={0} y={0} direction={1} />
              </div>
              <h2>Ready to Cross?</h2>
              <p>Help Larry the Lobster navigate through boats, waves, crabs, and seagulls!</p>
              <div className="controls-info">
                <p><strong>Controls:</strong></p>
                <p>Arrow Keys or WASD to move</p>
              </div>
              <button className="start-btn" onClick={resetGame}>
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="menu-overlay gameover">
            <div className="menu-content">
              <h2>Oh No!</h2>
              <p>Larry got caught!</p>
              <div className="final-score">
                <span>Final Score: {score}</span>
              </div>
              <button className="start-btn" onClick={resetGame}>
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="game-board" ref={gameRef}>
          {lanes.map((lane, index) => (
            <div
              key={index}
              className={`lane lane-${lane.type}`}
              style={{ top: lane.y }}
            >
              {lane.obstacles.map(obs => (
                <ObstacleSprite key={obs.id} obstacle={obs} />
              ))}
            </div>
          ))}

          {gameState === 'playing' && (
            <Lobster x={playerPos.x} y={playerPos.y} direction={playerDirection} />
          )}
        </div>

        {gameState === 'playing' && (
          <div className="touch-controls">
            <button className="touch-btn up" onClick={() => handleTouch('up')}>▲</button>
            <div className="touch-row">
              <button className="touch-btn left" onClick={() => handleTouch('left')}>◀</button>
              <button className="touch-btn right" onClick={() => handleTouch('right')}>▶</button>
            </div>
            <button className="touch-btn down" onClick={() => handleTouch('down')}>▼</button>
          </div>
        )}
      </main>

      <footer className="game-footer">
        Requested by @thokani · Built by @clonkbot
      </footer>
    </div>
  );
};

export default App;