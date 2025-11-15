export type evalTryResult = {
    markings?: number[],
    blocked?: Set<string>,
    errors?: string[]
}