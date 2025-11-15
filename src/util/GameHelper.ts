export const gameStatus = Object.freeze({
    NOT_STARTED: 0,
    STARTED: 1,
    WON: 2,
    LOST: 3
})

export type gameStatus = "NOT_STARTED" | "STARTED" | "WON" | "LOST"

export function hasGameEnded(status: gameStatus) {
    return status === "WON" || status === "LOST"
}