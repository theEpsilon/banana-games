export function evalTry(wordArr) {
    const word = "CRANE"
    const testWord = new Map()
    testWord.set("C", [0])
    testWord.set("R", [1])
    testWord.set("A", [2])
    testWord.set("N", [3])
    testWord.set("E", [4])

    const markings = Array(5).fill(null)
    const undiscoveredLetters = new Map()
    const nonGreenLetters = new Map()
    const newBlocked = new Set()

    const addToMap = (map, key, val) => {
        if(!map.has(key)) {
            map.set(key, [])
        }
        map.get(key).push(val)
    }

    const markAll = (indices, markings, color) => {
        for(const index of indices) {
            markings[index] = color
        }
    }

    for(let i = 0; i < word.length; i++) {
        if(word[i] === wordArr[i]) {
            markings[i] = 2
        } else {
            addToMap(nonGreenLetters, wordArr[i], i)
            addToMap(undiscoveredLetters, word[i], i)
        }
    }

    for(const [letter, indices] of nonGreenLetters.entries()) {
        if(!undiscoveredLetters.has(letter)) {
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

export function evaluateRules(wordArr, prevWordArr, markings, blockedLetters) {
    console.log(wordArr, prevWordArr, markings, blockedLetters)
    let errorMessages = []
    for(let [index, letter] of wordArr.entries()) {
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