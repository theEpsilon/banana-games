import { evalTry, evalTryRules } from "../util/WordleHelper";
import { expect, test, describe } from "vitest";

describe("Wordle Game Logic (WordleHelper.js)", () => {
    test("Try Evaluation - Error Handling", async () => {
        expect((await evalTry(["A", "A"], "A", false)).errors).toHaveLength(1);
        expect((await evalTry(["A", "A"], "", false)).errors).toHaveLength(1);
        expect((await evalTry([], "A", false)).errors).toHaveLength(1);
        expect((await evalTry(["A", "A"], undefined, false)).errors).toHaveLength(1);
        expect((await evalTry(undefined, "A", false)).errors).toHaveLength(1);
    });

    test("Try Evaluation - Green Letters & Blocks", async () => {
        const oneGreen = await evalTry(["A", "A", "A"], "BAB", false)

        expect(oneGreen).toBeDefined();
        expect(oneGreen).toMatchObject({
            markings: [0,2,0],
            blocked: new Set(["A"])
        });

        const allGreen = await evalTry(["A", "A", "A"], "AAA", false)

        expect(allGreen).toBeDefined();
        expect(allGreen).toMatchObject({
            markings: [2,2,2],
            blocked: new Set([])
        });
    });

    test("Try Evaluation - Yellow Letters & Blocks", async () => {
        const oneYellow = await evalTry(["D", "E", "A"], "ABC", false)

        expect(oneYellow).toBeDefined();
        expect(oneYellow).toMatchObject({
            markings: [0,0,1],
            blocked: new Set(["D", "E"])
        });

        const allYellow = await evalTry(["B", "C", "A"], "ABC", false)

        expect(allYellow).toBeDefined();
        expect(allYellow).toMatchObject({
            markings: [1,1,1],
            blocked: new Set([])
        });

        const complexYellow = await evalTry(["F", "A", "E", "A", "A"], "ABACD", false)

        expect(complexYellow).toBeDefined();
        expect(complexYellow).toMatchObject({
            markings: [0,1,0,1,0],
            blocked: new Set(["A", "E", "F"])
        });

        const complexYellow2 = await evalTry(["F", "A", "E", "F", "F"], "ABACD", false)

        expect(complexYellow2).toBeDefined();
        expect(complexYellow2).toMatchObject({
            markings: [0,1,0,0,0],
            blocked: new Set(["E", "F"])
        });
    });

    test("Try Evaluation - Mixed Letters & Blocks", async () => {
        const mixedSimple = await evalTry(["A", "B", "D"], "DBE", false)

        expect(mixedSimple).toBeDefined();
        expect(mixedSimple).toMatchObject({
            markings: [0,2,1],
            blocked: new Set(["A"])
        });

        // yellow and green of same letter
        const mixedComplex = await evalTry(["A", "A", "D", "E", "D", "Y"], "DBEDDX", false)

        expect(mixedComplex).toBeDefined();
        expect(mixedComplex).toMatchObject({
            markings: [0,0,1,1,2,0],
            blocked: new Set(["A", "Y"])
        });

        // yellow, green and blocked of same letter
        const mixedComplex2 = await evalTry(["A", "X", "A", "A", "X"], "BAABB", false)

        expect(mixedComplex2).toBeDefined();
        expect(mixedComplex2).toMatchObject({
            markings: [1,0,2,1,0],
            blocked: new Set(["A", "X"])
        });
    });

    test("Try Evaluation - Word Validity", async () => {
        const invalidWord = await evalTry(["A", "A", "A", "A"], "AAAB")

        expect(invalidWord).toBeDefined();
        expect(invalidWord.errors).toHaveLength(1)

        const validWord = await evalTry(["A", "A", "A"], "AAA")

        expect(validWord).toBeDefined();
        expect(validWord).toMatchObject({
            markings: [2,2,2],
            blocked: new Set([])
        });
    });

    test("Rule Evaluation - Valid Try", () => {
        const oneGreenEval = evalTryRules(["F", "A", "E", "A", "A", "X"], ["A", "B", "A", "C", "D", "X"], [1, 0, 1, 0, 0, 2], new Set(["B", "C", "D"]))
        expect(oneGreenEval).toBeDefined();
        expect(oneGreenEval).toHaveLength(0)
    })

    test("Rule Evaluation - Green Error", () => {
        const oneGreenEval = evalTryRules(["X", "X"], ["A", "B"], [2, 0], new Set(["B"]))
        expect(oneGreenEval).toBeDefined();
        expect(oneGreenEval).toHaveLength(1)

        const multiGreenEval = evalTryRules(["X", "X", "C"], ["A", "B", "C"], [2, 0, 2], new Set(["B"]))
        expect(multiGreenEval).toBeDefined();
        expect(multiGreenEval).toHaveLength(1)
    })

    test("Rule Evaluation - Yellow Error", () => {
        const yellowSameIndex = evalTryRules(["X", "B"], ["A", "B"], [0, 1], new Set(["A"]))
        expect(yellowSameIndex).toBeDefined();
        expect(yellowSameIndex).toHaveLength(1);

        const yellowMixedIndex = evalTryRules(["X", "B", "X", "B"], ["A", "B", "B", "A"], [0, 1, 1, 0], new Set(["A"]))
        expect(yellowMixedIndex).toBeDefined();
        expect(yellowMixedIndex).toHaveLength(1);

        const yellowMultiSameIndex = evalTryRules(["X", "B", "B", "X"], ["A", "B", "B", "A"], [0, 1, 1, 0], new Set(["A"]))
        expect(yellowMultiSameIndex).toBeDefined();
        expect(yellowMultiSameIndex).toHaveLength(2);

        const historicalSameIndex = evalTryRules(["A", "D", "D"], ["A", "B", "B", "C", "A", "C"], [1, 0, 0, 0, 1, 0], new Set(["B", "C"]))
        expect(historicalSameIndex).toBeDefined();
        expect(historicalSameIndex).toHaveLength(1);

        const yellowMissing = evalTryRules(["B", "X", "X", "X"], ["A", "B", "B", "A"], [0, 1, 1, 0], new Set(["A"]))
        expect(yellowMissing).toBeDefined();
        expect(yellowMissing).toHaveLength(1);
    })

    test("Rule Evaluation - Blocked Error", () => {
        const singleBlocked = evalTryRules(["A", "B"], ["B", "C"], [0, 0], new Set(["B", "C"]))
        expect(singleBlocked).toBeDefined();
        expect(singleBlocked).toHaveLength(1);

        const singleBlockedHistorical = evalTryRules(["A", "B"], ["X", "A", "Y", "Z"], [0, 0, 0, 0], new Set(["A", "X", "Y", "Z"]))
        expect(singleBlockedHistorical).toBeDefined();
        expect(singleBlockedHistorical).toHaveLength(1);
    })

    test("Rule Evaluation - Yellow + Blocked Error", () => {
        const oneYellowOneBlocked = evalTryRules(["B", "X", "X", "B"], ["A", "B", "B", "A"], [0, 1, 0, 0], new Set(["A", "B"]))
        expect(oneYellowOneBlocked).toBeDefined();
        expect(oneYellowOneBlocked).toHaveLength(1);
    })

    test("Rule Evaluation - Identical Try", () => {
        const identicalTry = evalTryRules(["E", "A", "G", "L", "E"], ["E", "A", "G", "L", "E"], [1, 1, 0, 0, 0], new Set(["G", "L", "E"]))
        expect(identicalTry).toHaveLength(5)
    })
    
})