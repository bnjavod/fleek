"use client";

import React, { useState, useEffect, useCallback } from "react";

const ROWS = 6;
const COLS = 10;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 10;

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

const createBricks = () => {
  return Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({
      x: col * BRICK_WIDTH,
      y: row * BRICK_HEIGHT,
      destroyed: false,
    }))
  );
};

const BreakoutGame: React.FC = () => {
  const [bricks, setBricks] = useState(createBricks());
  const [paddleX, setPaddleX] = useState(250);
  const [ball, setBall] = useState<Ball>({ x: 300, y: 400, dx: 2, dy: -2 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Move the paddle
  const movePaddle = useCallback(
    (direction: "LEFT" | "RIGHT") => {
      setPaddleX((prev) =>
        direction === "LEFT"
          ? Math.max(0, prev - 20)
          : Math.min(600 - PADDLE_WIDTH, prev + 20)
      );
    },
    []
  );

  // Update the ball position
  const updateBall = useCallback(() => {
  setBall((prev) => {
    const { x, y, dx, dy } = prev; // Keep x and y as const
    let newDx = dx; // Declare new variables for updated dx and dy
    let newDy = dy;

    // Ball-wall collision
    if (x + dx < BALL_RADIUS || x + dx > 600 - BALL_RADIUS) newDx = -dx; // Left/Right walls
    if (y + dy < BALL_RADIUS) newDy = -dy; // Top wall

    // Ball-paddle collision
    if (
      y + dy > 580 - BALL_RADIUS && // Ball touches paddle height
      x > paddleX && // Ball is within paddle width
      x < paddleX + PADDLE_WIDTH
    ) {
      newDy = -dy;
    }

    // Ball-brick collision
    let hitBrick = false;
    setBricks((prevBricks) =>
      prevBricks.map((row) =>
        row.map((brick) => {
          if (
            !brick.destroyed &&
            x + dx > brick.x &&
            x + dx < brick.x + BRICK_WIDTH &&
            y + dy > brick.y &&
            y + dy < brick.y + BRICK_HEIGHT
          ) {
            hitBrick = true;
            setScore((prevScore) => prevScore + 10);
            return { ...brick, destroyed: true };
          }
          return brick;
        })
      )
    );
    if (hitBrick) newDy = -dy;

    // Ball out of bounds (game over)
    if (y + dy > 600 - BALL_RADIUS) {
      setGameOver(true);
      return prev;
    }

    return { x: x + newDx, y: y + newDy, dx: newDx, dy: newDy };
  });
}, [paddleX]);
  // Restart the game
  const restartGame = () => {
    setBricks(createBricks());
    setPaddleX(250);
    setBall({ x: 300, y: 400, dx: 2, dy: -2 });
    setScore(0);
    setGameOver(false);
  };

  // Handle key events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === "ArrowLeft") movePaddle("LEFT");
      if (e.key === "ArrowRight") movePaddle("RIGHT");
    },
    [movePaddle, gameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(updateBall, 10);
    return () => clearInterval(interval);
  }, [updateBall, gameOver]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1>Breakout Game</h1>
      <div style={{ marginBottom: "20px" }}>
        <p>
          <strong>Controls:</strong>
        </p>
        <p>Arrow Left: Move Paddle Left</p>
        <p>Arrow Right: Move Paddle Right</p>
      </div>
      <h2>Score: {score}</h2>
      {gameOver && <h3>Game Over! Press &quot;Restart&quot; to play again.</h3>}
      <div
        style={{
          position: "relative",
          width: "600px",
          height: "600px",
          backgroundColor: "#333",
        }}
      >
        {/* Bricks */}
        {bricks.flat().map((brick, index) =>
          !brick.destroyed ? (
            <div
              key={index}
              style={{
                position: "absolute",
                top: brick.y,
                left: brick.x,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                backgroundColor: "orange",
                border: "1px solid #000",
              }}
            />
          ) : null
        )}

        {/* Paddle */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: paddleX,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            backgroundColor: "blue",
          }}
        />

        {/* Ball */}
        <div
          style={{
            position: "absolute",
            top: ball.y - BALL_RADIUS,
            left: ball.x - BALL_RADIUS,
            width: BALL_RADIUS * 2,
            height: BALL_RADIUS * 2,
            backgroundColor: "red",
            borderRadius: "50%",
          }}
        />
      </div>
      <button
        onClick={restartGame}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Restart
      </button>
    </div>
  );
};

export default BreakoutGame;
