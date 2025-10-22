export function evaluateWord(wordArr) {
    const testWord = new Map()
    testWord.set("C", [0])
    testWord.set("R", [1])
    testWord.set("A", [2])
    testWord.set("N", [3])
    testWord.set("E", [4])

    const yellowMap = new Map()
    const greenMap = new Map()

    const result = Array(5).fill(null)
    const blocked = new Array(26).fill(null)

    for(let [index, letter] of wordArr.entries()) {
        if(testWord.has(letter) && testWord.get(letter).includes(index)) {
            if(!greenMap.has(letter)) {
                greenMap.set(letter, [])
            }
            greenMap.get(letter).push(index)
            result[index] = 2
        } else {
            if(!yellowMap.has(letter)) {
                yellowMap.set(letter, [])
            }
            yellowMap.get(letter).push(index)
        }
    }



    console.log("letter maps", yellowMap, greenMap)

    for(let [letter, indices] of yellowMap.entries()) {
        if(testWord.has(letter)) {
                const greenCount = greenMap.has(letter) ? greenMap.get(letter).length : 0
            
                // neg: first -x yellow, rest grey
                // pos: all yellow
                // 0:   all yellow
                const countDiff = testWord.get(letter).length - (indices.length + greenCount)
                if(countDiff >= 0) {
                    for(let index of indices) {
                        result[index] = 1
                    }
                } else {
                    let yellowCount = testWord.get(letter).length - greenCount
                    for(let i = 0; i < indices.length; i++) {
                        result[yellowMap.get(letter)[i]] = i < yellowCount ? 1 : 0;
                    }
                }
        } else {
            for(let i of indices) {
                result[i] = 0
            }
        }
    }

    return {
        markings: result,
        blocked: blocked
    };
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