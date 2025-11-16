export type gameStatus = "NOT_STARTED" | "STARTED" | "WON" | "LOST"

export function hasGameEnded(status: gameStatus): boolean {
    return status === "WON" || status === "LOST"
}