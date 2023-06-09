import React, { useEffect, useRef, useState } from "react";
import useInterval from "../../hooks/useInterval";
import "./App.css";
import AppleLogo from "./applePixels.png";

const canvasX = 1000;
const canvasY = 1000;
const initialSnake = [[4, 10], [4, 10]];
const initialApple = [14, 10];
const scale = 50;
const initGameSpeed = 100;
const MAX_GAME_SPEED = 200;
const MIN_GAME_SPEED = 50;
const GAME_SPEED_STEP = 10;

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameSpeed, setGameSpeed] = useState(initGameSpeed);
  const [snake, setSnake] = useState(initialSnake);
  const [apple, setApple] = useState(initialApple);
  const [direction, setDirection] = useState([0, -1]);
  const [delay, setDelay] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useInterval(() => runGame(), delay);

  useEffect(() => {
    let fruit = document.getElementById("fruit") as HTMLCanvasElement;

    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.fillStyle = "#a3d001";
        snake.forEach(([x, y]) => ctx.fillRect(x, y, 1, 1));
        ctx.drawImage(fruit, apple[0], apple[1], 1, 1);
      }
    }
  },
    [snake, apple, gameOver])

  function handleSetScore() {
    if (score > Number(localStorage.getItem("snakeScore"))) {
      localStorage.setItem("snakeScore", JSON.stringify(score));
    }
  }

  function play() {
    setSnake(initialSnake);
    setApple(initialApple);
    setDirection([1, 0]);
    setDelay(gameSpeed);
    setScore(0);
    setGameOver(false);
  }

  function checkCollision(head: number[]) {
    for (let i = 0; i < head.length; i++) {
      if (head[i] < 0 || head[i] * scale >= canvasX) return true;
    }

    for (const s of snake) {
      if (head[0] === s[0] && head[1] === s[1]) return true;
    }

    return false;
  }

  function appleAte(newSnake: number[][]) {
    let coord = apple.map(() => Math.floor(Math.random() * canvasX / scale));

    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      let newApple = coord;
      setScore(score + 1);
      setApple(newApple);
      return true;
    }

    return false;
  }

  function runGame() {
    const newSnake = [...snake];
    const newSnakeHead = [newSnake[0][0] + direction[0], newSnake[0][1] + direction[1]];
    newSnake.unshift(newSnakeHead);

    if (checkCollision(newSnakeHead)) {
      setDelay(null);
      setGameOver(true);
      handleSetScore();
    }

    if (!appleAte(newSnake)) {
      newSnake.pop();
    }

    setSnake(newSnake);
  }

  function changeDirection(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowLeft":
        if (direction[0] === 1 && direction[1] === 0) {
          break;
        }
        setDirection([-1, 0]);
        break;
      case "ArrowUp":
        if (direction[0] === 0 && direction[1] === 1) {
          break;
        }
        setDirection([0, -1]);
        break;
      case "ArrowRight":
        if (direction[0] === -1 && direction[1] === 0) {
          break;
        }
        setDirection([1, 0]);
        break;
      case "ArrowDown":
        if (direction[0] === 0 && direction[1] === -1) {
          break;
        }
        setDirection([0, 1]);
        break;
    }
  }

  const decreaseGameSpeed = () => {
    if (gameSpeed >= MAX_GAME_SPEED) {
      return;
    }

    setGameSpeed((prev) => prev + GAME_SPEED_STEP);
  }

  const increaceGameSpeed = () => {
    if (gameSpeed <= MIN_GAME_SPEED) {
      return;
    }

    setGameSpeed((prev) => prev - GAME_SPEED_STEP);
  }

  return (
    <div className="playWrapper" onKeyDown={(e) => changeDirection(e)}>
      <div className="controlWrapper">
        <h2>Game speed control</h2>
        <div>
          <button className="controlButton" onClick={decreaseGameSpeed}>-</button>
          <button className="controlButton" onClick={increaceGameSpeed}>+</button>
        </div>
      </div>
      <p>Game speed is {Math.round((MAX_GAME_SPEED / gameSpeed) * 10)}</p>
        <div className="scoreBox">
          <h2>Score: {score}</h2>
          <h2>High Score: {localStorage.getItem("snakeScore")}</h2>
        </div>
      <img id="fruit" src={AppleLogo} alt="fruit" width="30" />
      <canvas className="playArea" ref={canvasRef} width={`${canvasX}px`} height={`${canvasY}px`} />
      {gameOver && <div className="gameOver">Game Over</div>}
      <button onClick={play} className="playButton">
        Play
      </button>
    </div>
  )
}

export default App