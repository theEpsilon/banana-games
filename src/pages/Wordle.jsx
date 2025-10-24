import { useState, useRef, useEffect } from "react";
import WordleCell from "../views/WordleCell";
import { evalTryRules, evalTry } from "../util/WordleHelper";
import "./wordle.css"
import { Button, Form, FormCheck } from "react-bootstrap";

const rows = 6;
const letters = 5;
function getButtonIndex(rowIndex, columnIndex) {
    return rowIndex * (rows - 1) + columnIndex;
}
let colors = []
let blockedLetters = new Set()

function Wordle() {
    const [gameState, setGameState] = useState(Array(rows * letters).fill(null));
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [hardMode, setHardMode] = useState(false)
    const wordleButtons = useRef([])

    useEffect(() => {
        wordleButtons.current[currentRowIndex * letters].focus();
    }, [currentRowIndex])

    function onKeyPressed(event, i) {
        if(i >= wordleButtons.current.length - 1) return;

        const value = event.key

        if(value === "Enter") {
            handleEnter();
            return;
        }

        if(value === "Backspace") {
            handleBackspace(i);
            return;
        }

        if(value.substring(0, 5) === "Arrow") {
            handleArrows(i, value.substring(5).toLowerCase());
            return;
        }

        if (!value || value.length > 1 || value.match(/[a-zA-ZöäüÖÄÜß]/g) === null) {
            return;
        }

        const newState = gameState.slice()
        newState[i] = value.toUpperCase()

        setGameState(newState);
        wordleButtons.current[i + 1].focus();
    }

    function handleEnter() {
        const rowLetters = gameState.slice(currentRowIndex * letters, (currentRowIndex + 1) * letters);
        for (let letter of rowLetters) {
            if (!letter) {
                return;
            }
        }

        if(hardMode) {
            const prevLetters = currentRowIndex > 0 ? gameState.slice(0, currentRowIndex * letters) : [];
            const prevMarkings = currentRowIndex > 0 ? colors.slice(0, currentRowIndex * letters) : [];
            const errors = evalTryRules(rowLetters, prevLetters, prevMarkings, blockedLetters)

            if(errors.length) {
                // display errors
                return;
            }
        }

        const { markings, blocked } = evalTry(rowLetters, "ABACD")

        colors = colors.concat(markings)
        blockedLetters = blockedLetters.union(blocked)

        if (currentRowIndex === rows - 1) {
            //handle game over
        }

        setCurrentRowIndex(currentRowIndex + 1)
    }

    function handleBackspace(index) {
        const newState = gameState.slice()

        if(gameState[index] === null) {
            if (index > currentRowIndex * letters) {
                newState[index - 1] = null;
                setGameState(newState);
                wordleButtons.current[index - 1].focus();
            }
        } else {
            newState[index] = null;
            setGameState(newState);
        }
    }

    function handleArrows(index, direction) {
        if(direction === "right") {
            if(index + 1 < (currentRowIndex + 1) * letters) {
                wordleButtons.current[index + 1].focus();
            }
        }

        if (direction === "left") {
            if(index > currentRowIndex * letters) {
                wordleButtons.current[index - 1].focus();
            }
        }
    }

    function handleHardModeChange(event) {
        setHardMode(event.target.checked);
    }

    return (
        <div id="wordle-grid">
            <div className="game-header">
                <h1>Wordle</h1>
                <div>
                    <FormCheck
                        type="switch"
                        id="hard-mode-switch"
                        label="Hard Mode"
                        checked={hardMode}
                        onChange={handleHardModeChange}
                        disabled={currentRowIndex > 0}
                    ></FormCheck>
                </div>
            </div>
            <div className="game-container">
            {Array(rows).fill(0).map((_, ri) => 
                <div key={"row-" + ri}>
                    {Array(letters).fill(0).map((_, ci) => 
                    <WordleCell 
                        inputRef={(el) => wordleButtons.current[getButtonIndex(ri, ci)] = el}
                        key={getButtonIndex(ri, ci)} 
                        letter={gameState[getButtonIndex(ri, ci)] || ""}
                        onKeyDown={(event) => onKeyPressed(event, getButtonIndex(ri, ci))}
                        disabled={currentRowIndex !== ri}
                        color={colors[getButtonIndex(ri, ci)] || 0}
                    />
                )}
                </div>
            )}
            </div>
        </div>
    );
}

export default Wordle;