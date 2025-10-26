export async function evalTry(tryWordArr = [], solveWord = "", checkDictionary = true) {
    if(!tryWordArr?.length || !solveWord?.length) {
        return {
            errors: ["Try word or solve word not defined."]
        }
    }

    if(tryWordArr.length != solveWord.length) {
        return {
            errors: ["Try word and solve word length do not match."]
        }
    }

    if(checkDictionary) {
        let isValidWord = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${tryWordArr.join("").toLowerCase()}`, {
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
                errors: [`${tryWordArr.join("")} is not a valid word.`]
            } 
        }
    }

    const markings = Array(solveWord.length).fill(null)
    const undiscoveredLetters = new Map()
    const nonGreenLetters = new Map()
    const newBlocked = new Set()

    const markAll = (indices, markings, color) => {
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
            let diff = indices.length - undiscoveredLetters.get(letter).length

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

export function evalTryRules(tryWordArr, prevLetters, prevMarkings, blocked) {

    const errors = []
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

function addToMap(map, key, val) {
    if(!map.has(key)) {
        map.set(key, [])
    }
    map.get(key).push(val)
}