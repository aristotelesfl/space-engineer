import { useEffect, useCallback } from "react";

type KeyPressCallback = () => void;

/**
 * Executa um callback sempre que uma tecla de letra (A-Z) é pressionada.
 * @param onKeyPress
 */

export const useKeyboardHandler = (onKeyPress: KeyPressCallback) => {
    const memoizedOnKeyPress = useCallback(onKeyPress, [onKeyPress]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Trata-se de uma expressão regular para verificar se a tecla pressionada é uma única letra do alfabeto, ignorando Shift, Ctrl, etc...
            if (/^[a-zA-Z]$/.test(event.key)) {
                memoizedOnKeyPress();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [memoizedOnKeyPress]);
};
