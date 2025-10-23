const knowledgeState = () => {
    const state = new Map();

    const addMin = (letter, min) => {
        if(!state.has(letter)) {
            state.set(letter, { min })
        } else {
            state.get(letter)["min"] = state.get(letter)["min"] + min
        }
    }

    const setMin = (letter, min) => {
        if(!state.has(letter)) {
            state.set(letter, {})
        }
        state.set(letter, {...state.get(letter), min})
    }

    const setMax = (letter, max) => {
        if(!state.has(letter)) {
            state.set(letter, {})
        }
        state.set(letter, {...state.get(letter), max})
    }

    const addConfirmedIndex = (letter, index) => {
        if(!state.has(letter)) {
            state.set(letter, {})
        }
        if(!state.get(letter)["confirmed"]) {
            state.set(letter, {...state.get(letter), confirmed: [index]})
        } else {
            state.get(letter)["confirmed"].push(index)
        }
    }

    return {
        state,
        addMin,
        setMin,
        setMax,
        addConfirmedIndex
    }
}

export function evalTry(wordArr) {
    const word = "CRANN"
    const testWord = new Map()
    testWord.set("C", [0])
    testWord.set("R", [1])
    testWord.set("A", [2])
    testWord.set("N", [3])
    testWord.set("N", [4])

    const markings = Array(5).fill(null)
    const undiscoveredLetters = new Map()
    const nonGreenLetters = new Map()
    const newBlocked = new Set()

    const markAll = (indices, markings, color) => {
        for (const index of indices) {
            markings[index] = color
        }
    }

    for(let i = 0; i < word.length; i++) {
        if (word[i] === wordArr[i]) {
            markings[i] = 2
        } else {
            addToMap(nonGreenLetters, wordArr[i], i)
            addToMap(undiscoveredLetters, word[i], i)
        }
    }

    for(const [letter, indices] of nonGreenLetters.entries()) {
        if (!undiscoveredLetters.has(letter)) {
            markAll(indices, markings, 0)
            newBlocked.add(letter)
        } else {
            let diff = indices.length - undiscoveredLetters.get(letter).length

            if(diff <= 0) {
                markAll(indices, markings, 1)
            } else {
                markAll(indices.slice(0, diff), markings, 1)
                markAll(indices.slice(diff), markings, 0)
                newBlocked.add(letter)
            }
        }
    }

    return {
        markings,
        blocked: newBlocked
    }
}

export function evalTryRules(wordArr, prevLetters, prevMarkings, blocked) {

    const errors = []

    // preprocess
    const yellowMap = new Map()
    const checkedIndices = new Set()
    const prevWord = prevLetters.slice(-5)
    const prevWordMarkings = prevMarkings.slice(-5)

    if(prevWord.length === 0 && prevWordMarkings.length === 0) {
        return errors;
    }

    console.log(prevWord, blocked)

    // Build index map of all yellow marked in gamestate
    for(let i = 0; i < prevLetters.length; i++) {
        if(prevMarkings[i] === 1) {
            addToMap(yellowMap, i % 5, prevLetters[i], )
        }
    }

    for(const [i, letter] of wordArr.entries()) {
        // check if position is green and letters match
        if(prevWordMarkings[i] === 2) {
            if(prevWord[i] === letter) {
                checkedIndices.add(i);
                continue;
            } else {
                // green error
                // include in checkInd ?
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
                        errors.push(`${letter} at index ${i} is yellow`)
                        break;
                    }
                }
            }
        }

        if(blocked.has(letter) && !validated) {
            //letter blocked
            errors.push(`${letter} at index ${i} is blocked;`)
        }
    }

    

    return errors;
}

export function evaluateRules(wordArr, prevWordArr, markings, blockedLetters) {
    console.log(wordArr, prevWordArr, markings, blockedLetters)
    let errorMessages = []
    for (let [index, letter] of wordArr.entries()) {
        console.log(index, letter)
        
        // yellow letter in same position
        if (markings[index] === 1 && letter === prevWordArr[index]) {
            errorMessages.push(`The ${getReadableIndex(index)} cannot be ${letter}.`)
        
        // different letter in green position
        } else if (markings[index] === 2 && letter !== prevWordArr[index]) {
            errorMessages.push(`The ${getReadableIndex(index)} letter must be ${letter}.`)

        // letter on blocklist (exceptions)
        } else if (blockedLetters.has(letter) && (letter !== prevWordArr[index] || markings[index] !== 2)) {
            errorMessages.push(`Letter ${letter} is not included in the word.`)
        }
    }
    return errorMessages;
}

function addToMap(map, key, val) {
    if(!map.has(key)) {
        map.set(key, [])
    }
    map.get(key).push(val)
}

function getReadableIndex(number) {
    if (number == 0) {
        return "1st"
    }
    if (number == 1) {
        return "2nd"
    }
    if (number == 2) {
        return "3rd"
    }
    return `${number}th`
}