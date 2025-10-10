// src/presentation/components/GameWrapper.tsx

import React, { useEffect, useRef } from "react";
import Game, { handlePlayerShoot } from "../game/Game";
import { useKeyboardHandler } from "../core/usecases/usekeyboardHandler";

export default function GameWrapper() {
    const gameContainerRef = useRef<HTMLDivElement>(null);

    useKeyboardHandler(handlePlayerShoot);

    useEffect(() => {
        if (gameContainerRef.current) {
            if (Game.canvas?.parentNode) {
                Game.canvas.parentNode.removeChild(Game.canvas);
            }
            gameContainerRef.current.appendChild(Game.canvas);
        }
    }, []);

    return (
        <div
            id="game-container"
            ref={gameContainerRef}
            style={{
                maxWidth: "100vw",
                height: "100vh",
                backgroundColor: "#0d081dff",
                cursor: "none",
            }}
        />
    );
}
