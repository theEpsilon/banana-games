import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Wordle from "../pages/Wordle"
import '@testing-library/jest-dom'

describe("Wordle", () => {
    it("renders Wordle component", () => {
        render(<Wordle></Wordle>);
        expect(screen.getByText("Wordle")).toBeInTheDocument();
    })
})