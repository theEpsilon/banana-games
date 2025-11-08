export const gameStatus = Object.freeze({
    NOT_STARTED: 0,
    STARTED: 1,
    WON: 2,
    LOST: 3
})

export function hasGameEnded(status) {
    return status === gameStatus.WON || status === gameStatus.LOST
}