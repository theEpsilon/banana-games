import { useState } from "react";
import WordleCell from "../views/WordleCell";

function Wordle() {
    const rows = 6;
    const letters = 5;

    const [gameState, setGameState] = useState(Array(rows * letters).fill(null));
    const [selectedButton, setSelectedButton] = useState(0)

    function onButtonClick(i) {
        const newState = gameState.slice();
        newState[i] = "A"
        setGameState(newState);
        setSelectedButton(i);
    }

    return (
        <div>
            {Array(rows).fill(0).map((_, ri) => 
                <div key={"row-" + ri}>
                    {Array(letters).fill(0).map((_, ci) => 
                    <WordleCell 
                        key={ri * rows + ci} 
                        letter={gameState[ri * rows + ci] || ""}
                        onButtonClick={() => onButtonClick(ri * rows + ci)} />
                )}
                </div>
            )}
        </div>
    );
}

export default Wordle;