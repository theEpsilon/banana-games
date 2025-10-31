import { useState, useRef, useEffect } from "react";
import WordleCell from "../views/WordleCell";
import { evalTryRules, evalTry, evalGameStatus } from "../util/WordleHelper";
import "./wordle.css"
import { FormCheck } from "react-bootstrap";
import WordNet from "../assets/wordnet-core.json"
import externalLink from "../assets/external-link.svg"
import GameFinishedModal from "../views/GameFinishedModal";
import { gameStatus, hasGameEnded } from "../util/GameHelper";
import RestartButton from "../views/RestartButton";

const rows = 6;
const letters = 5;
function getButtonIndex(rowIndex, columnIndex) {
    return rowIndex * (rows - 1) + columnIndex;
}

function Wordle() {
    const emptyState = {
        letters: Array(rows * letters).fill(null),
        markings: [],
        blocked: new Set(),
        status: gameStatus.NOT_STARTED
    }
    const [gameState, setGameState] = useState({...emptyState});
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [hardMode, setHardMode] = useState(false)
    const [showModal, setShowModal] = useState(true)
    const wordleButtons = useRef([])
    const solveWord = useRef(WordNet[letters][Math.floor(Math.random() * WordNet[letters].length - 1)].toUpperCase());

    useEffect(() => {
        wordleButtons.current[currentRowIndex * letters].focus();
    }, [currentRowIndex])

    async function onKeyPressed(event, i) {
        if(i >= wordleButtons.current.length) return;

        const value = event.key;

        //Handle keys without game state updates
        if(value.substring(0, 5) === "Arrow") {
            handleArrows(i, value.substring(5).toLowerCase());
            return;
        }

        const newState = {
            letters: [...gameState.letters],
            markings: [...gameState.markings],
            blocked: new Set(gameState.blocked),
            status: gameStatus.NOT_STARTED
        }

        //Handle keys requiring game state updates
        if(value === "Enter") {
            const { markings, blocked, errors } = await handleEnter();
            if(errors.length || !markings) {
                console.log(errors);
                return;
            }

            newState.markings = newState.markings.concat(markings)
            newState.blocked = newState.blocked.union(blocked)
            newState.status = evalGameStatus(markings);

            if(!hasGameEnded(newState.status)) {
                setCurrentRowIndex(currentRowIndex + 1);
            } else {
                setShowModal(true)
            }

        } else if(value === "Backspace") {
            const delIndex = handleBackspace(i);
            newState.letters[delIndex] = null;
        } else if (!value || value.length > 1 || value.match(/[a-zA-ZöäüÖÄÜß]/g) === null) {
            return;
        } else {
            newState.letters[i] = value.toUpperCase();
            if(i < wordleButtons.current.length - 1) {
                wordleButtons.current[i + 1].focus();
            }
        }

        setGameState(newState);
    }

    async function handleEnter() {
        const rowLetters = gameState.letters.slice(currentRowIndex * letters, (currentRowIndex + 1) * letters);
        for (let letter of rowLetters) {
            if (!letter) {
                return {
                    errors: ["Invalid letter"]
                };
            }
        }

        if(hardMode) {
            const prevLetters = currentRowIndex > 0 ? gameState.letters.slice(0, currentRowIndex * letters) : [];
            const prevMarkings = currentRowIndex > 0 ? gameState.markings.slice(0, currentRowIndex * letters) : [];
            const errors = evalTryRules(rowLetters, prevLetters, prevMarkings, blockedLetters)

            if(errors.length) {
                return {
                    errors
                };
            }
        }
        return await evalTry(rowLetters, solveWord.current)
    }

    function handleBackspace(index) {
        let delIndex = index;

        if(gameState.letters[index] === null) {
            if (index > currentRowIndex * letters) {
                delIndex = index - 1;
                wordleButtons.current[index - 1].focus();
            }
        }
        return delIndex;
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

    function handleRestart() {
        solveWord.current = WordNet[letters][Math.floor(Math.random() * WordNet[letters].length - 1)].toUpperCase();
        setGameState({...emptyState})
        setShowModal(false)
        setCurrentRowIndex(0)
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
                        letter={gameState.letters[getButtonIndex(ri, ci)] || ""}
                        onKeyDown={(event) => onKeyPressed(event, getButtonIndex(ri, ci))}
                        disabled={currentRowIndex !== ri || hasGameEnded(gameState.status)}
                        color={gameState.markings[getButtonIndex(ri, ci)] || 0}
                    />
                )}
                </div>
            )}
            </div>
            <div className="game-footer mt-2">
                Powered by 
                <span><a target="_blank" href="https://wordnet.princeton.edu/"> WordNet Core <img src={externalLink}></img></a></span> and 
                <span><a target="_blank" href="https://www.mediawiki.org/wiki/REST_API"> Wikimedia REST API <img src={externalLink}></img></a></span>
            </div>
            <GameFinishedModal 
                show={hasGameEnded(gameState.status) && showModal} 
                gameWon={gameState.status === gameStatus.WON}
                onHide={() => setShowModal(false)}
                onRestart={handleRestart}
            >
                <div>The word was:</div>
                <div>{solveWord.current}</div>
            </GameFinishedModal>
            <RestartButton className="mt-4" onRestart={handleRestart} text={"Play again!"} bgColor={"#242424"} hide={!hasGameEnded(gameState.status)}></RestartButton>
        </div>
    );
}

export default Wordle;