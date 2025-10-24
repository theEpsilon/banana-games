import { evalTry, evalTryRules } from "../util/WordleHelper";
import { expect, test, describe } from "vitest";

describe("WordleHelper", () => {
    test("Try Evaluation - Error Handling", () => {
        expect(evalTry(["A", "A"], "A").error).toBeDefined();
        expect(evalTry(["A", "A"], "").error).toBeDefined();
        expect(evalTry([], "A").error).toBeDefined();
        expect(evalTry(["A", "A"], null).error).toBeDefined();
        expect(evalTry(null, "A").error).toBeDefined();
    });

    test("Try Evaluation - Green Letters & Blocks", () => {
        const oneGreen = evalTry(["A", "A", "A"], "BAB")

        expect(oneGreen).toBeDefined();
        expect(oneGreen).toMatchObject({
            markings: [0,2,0],
            blocked: new Set(["A"])
        });

        const allGreen = evalTry(["A", "A", "A"], "AAA")

        expect(allGreen).toBeDefined();
        expect(allGreen).toMatchObject({
            markings: [2,2,2],
            blocked: new Set([])
        });
    });

    test("Try Evaluation - Yellow Letters & Blocks", () => {
        const oneYellow = evalTry(["D", "E", "A"], "ABC")

        expect(oneYellow).toBeDefined();
        expect(oneYellow).toMatchObject({
            markings: [0,0,1],
            blocked: new Set(["D", "E"])
        });

        const allYellow = evalTry(["B", "C", "A"], "ABC")

        expect(allYellow).toBeDefined();
        expect(allYellow).toMatchObject({
            markings: [1,1,1],
            blocked: new Set([])
        });

        const complexYellow = evalTry(["F", "A", "E", "A", "A"], "ABACD")

        expect(complexYellow).toBeDefined();
        expect(complexYellow).toMatchObject({
            markings: [0,1,0,1,0],
            blocked: new Set(["A", "E", "F"])
        });

        const complexYellow2 = evalTry(["F", "A", "E", "F", "F"], "ABACD")

        expect(complexYellow2).toBeDefined();
        expect(complexYellow2).toMatchObject({
            markings: [0,1,0,0,0],
            blocked: new Set(["E", "F"])
        });
    });

    test("Try Evaluation - Mixed Letters & Blocks", () => {
        const mixedSimple = evalTry(["A", "B", "D"], "DBE")

        expect(mixedSimple).toBeDefined();
        expect(mixedSimple).toMatchObject({
            markings: [0,2,1],
            blocked: new Set(["A"])
        });

        // yellow and green of same letter
        const mixedComplex = evalTry(["A", "A", "D", "E", "D", "Y"], "DBEDDX")

        expect(mixedComplex).toBeDefined();
        expect(mixedComplex).toMatchObject({
            markings: [0,0,1,1,2,0],
            blocked: new Set(["A", "Y"])
        });

        // yellow, green and blocked of same letter
        const mixedComplex2 = evalTry(["A", "X", "A", "A", "X"], "BAABB")

        expect(mixedComplex2).toBeDefined();
        expect(mixedComplex2).toMatchObject({
            markings: [1,0,2,1,0],
            blocked: new Set(["A", "X"])
        });
    });
})