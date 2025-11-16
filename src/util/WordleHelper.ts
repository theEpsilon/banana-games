import { gameStatus } from "./GameHelper"
import WordNet from "../assets/wordnet-core.json"
import { evalTryResult } from "../types/wordleTypes"

export async function evalTry(tryWordArr: string[] = [], solveWord: string = "", checkDictionary: boolean = true): Promise<evalTryResult> {
    let result: evalTryResult = {
        markings: [],
        blocked: new Set(),
        errors: []
    }
    
    if(!tryWordArr?.length || !solveWord?.length) {
        return {
            ...result,
            errors: ["Try word or solve word not defined."]
        }
    }

    if(tryWordArr.length != solveWord.length) {
        return {
            ...result,
            errors: ["Try word and solve word length do not match."]
        }
    }

    if(checkDictionary) {
        let isValidWord: boolean = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${tryWordArr.join("").toLowerCase()}`, {
            headers: {
                "Api-User-Agent": "https://github.com/theEpsilon/banana-games"
            }
        })
        .then((res) => res.json())
        .then((res) => {
            return !!(res["en"])
        })

        if(!isValidWord) {
            return {
                ...result,
                errors: [`${tryWordArr.join("")} is not a valid word.`]
            } 
        }
    }

    const markings: number[] = Array(solveWord.length).fill(0)
    const undiscoveredLetters: Map<string, number[]> = new Map()
    const nonGreenLetters: Map<string, number[]> = new Map()
    const newBlocked: Set<string> = new Set()

    const markAll = (indices: number[], markings: number[], color: number) => {
        for (const index of indices) {
            markings[index] = color
        }
    }

    for(let i = 0; i < solveWord.length; i++) {
        if (solveWord[i] === tryWordArr[i]) {
            markings[i] = 2
        } else {
            addToMap(nonGreenLetters, tryWordArr[i], i)
            addToMap(undiscoveredLetters, solveWord[i], i)
        }
    }

    for(const [letter, indices] of nonGreenLetters.entries()) {
        if (!undiscoveredLetters.has(letter)) {
            markAll(indices, markings, 0)
            newBlocked.add(letter)
        } else {
            const undiscovered = undiscoveredLetters.get(letter);
            const diff: number = undiscovered ? indices.length - undiscovered.length : indices.length;

            if(diff <= 0) {
                markAll(indices, markings, 1)
            } else {
                markAll(indices.slice(0, diff + 1), markings, 1)
                markAll(indices.slice(diff + 1), markings, 0)
                newBlocked.add(letter)
            }
        }
    }

    return {
        markings,
        blocked: newBlocked,
        errors: []
    }
}

export function evalTryRules(tryWordArr: string[], prevLetters: string[], prevMarkings: number[], blocked: Set<string>): string[] {
    const errors: string[] = []
    const wordLength = tryWordArr.length

    // preprocess
    const yellowMap = new Map()
    const checkedIndices = new Set()
    const prevWord = prevLetters.slice(-wordLength)
    const prevWordMarkings = prevMarkings.slice(-wordLength)

    if(prevWord.length === 0 && prevWordMarkings.length === 0) {
        return errors;
    }

    // Build index map of all yellow marked in gamestate
    for(let i = 0; i < prevLetters.length; i++) {
        if(prevMarkings[i] === 1) {
            addToMap(yellowMap, prevLetters[i], i % wordLength)
        }
    }

    for(const [i, letter] of tryWordArr.entries()) {
        // check if position is green and letters match
        if(prevWordMarkings[i] === 2) {
            if(prevWord[i] === letter) {
                checkedIndices.add(i);
                continue;
            } else {
                errors.push(`${letter} at index ${i} is green;`)
                continue;
            }
        }

        // Position was not marked green, so
        // Iterate over previous word and find corresponding yellow letter
        // If none found and letter on blocklist, add error
        let validated = false
        for(const [j, prevWordLetter] of prevWord.entries()) {
            if(checkedIndices.has(j)) {
                continue;
            }
            if(prevWordLetter === letter) {
                if(prevWordMarkings[j] === 1) {
                    if(!yellowMap.get(letter)?.includes(i)) {
                        //valid case
                        checkedIndices.add(j)
                        validated = true;
                        break
                    } else {
                        checkedIndices.add(j)
                        errors.push(`${letter} at index ${i} is yellow`)
                        break;
                    }
                }
            }
        }

        if(blocked.has(letter) && !validated) {
            errors.push(`${letter} at index ${i} is blocked;`)
        }
    }

    //Check if all yellow letters were used
    for(let index = 0; index < wordLength; index++) {
        if(prevWordMarkings[index] === 1 && !checkedIndices.has(index)) {
            errors.push(`The word must include more of the letter ${prevWord[index]}.`)
        }
    }

    return errors;
}

export function evalGameStatus(newMarkings: number[], finalTry: boolean = false): gameStatus {
    if(newMarkings.every((el) => el === 2)) {
        return "WON";
    } else if (finalTry) {
        return "LOST";
    }

    return "STARTED";
}

function addToMap(map: Map<any, any>, key: any, val: any): void {
    if(!map.has(key)) {
        map.set(key, [])
    }
    map.get(key).push(val)
}

export function generateSolveWord(wordLength: number): string {
    const key = String(wordLength) as keyof typeof WordNet
    return WordNet[key][Math.floor(Math.random() * WordNet[key].length - 1)].toUpperCase();
}