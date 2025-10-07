// src/presentation/components/GameWrapper.tsx

import React, { useEffect, useRef } from "react";
import Game from "./Game";

export default function GameWrapper() {
    const gameContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (gameContainerRef.current) {
            Game.canvas?.parentNode?.removeChild(Game.canvas);
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
            }}
        />
    );
}
