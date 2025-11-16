import { gameStatus } from "../util/GameHelper"

export type evalTryResult = {
    markings: number[],
    blocked: Set<string> | null,
    errors: string[]
}

export type wordleState = {
    letters: string[],
    markings: number[],
    blocked: Set<string>,
    status: gameStatus
}