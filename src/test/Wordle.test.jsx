import { expect, describe, afterEach, afterAll } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event"
import Wordle from "../pages/Wordle"
import '@testing-library/jest-dom'
import * as wordleHelper from "../util/WordleHelper";

function setup(jsx) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  }
}

afterEach(() => {
    cleanup();
    vi.resetAllMocks();
})

describe("Wordle", () => {
    it("renders Wordle component", () => {
        render(<Wordle></Wordle>);
        expect(screen.getByText("Wordle")).toBeInTheDocument();
    });

    it("renders Wordle grid", () => {
        render(<Wordle></Wordle>)
        expect(screen.getAllByRole("textbox")).toHaveLength(30)
    });

    it("can navigate the Wordle grid", async () => {
        const {user} = setup(<Wordle></Wordle>)
        let firstTextBox = screen.getAllByRole("textbox")[0]
        let secondTextBox = screen.getAllByRole("textbox")[1]
        let lastTextBox = screen.getAllByRole("textbox")[4]

        expect(firstTextBox).toHaveFocus()
        await user.click(secondTextBox);

        expect(firstTextBox).not.toHaveFocus()
        expect(secondTextBox).toHaveFocus()

        await user.keyboard("{ArrowLeft}");
        expect(firstTextBox).toHaveFocus();
        await user.keyboard("{ArrowLeft}");
        expect(firstTextBox).toHaveFocus();

        await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");
        expect(lastTextBox).toHaveFocus();
        await user.keyboard("{ArrowRight}");
        expect(lastTextBox).toHaveFocus();

        await user.keyboard("{ArrowDown}");
        expect(lastTextBox).toHaveFocus();
    });

    it("can type in letters", async () => {
        const {user} = setup(<Wordle></Wordle>)
        let firstRow = screen.getAllByRole("textbox").slice(0, 5);

        expect(firstRow[0]).toHaveFocus();

        await user.keyboard("eagle");

        expect(firstRow[0]).toHaveValue("E")
        expect(firstRow[1]).toHaveValue("A")
        expect(firstRow[2]).toHaveValue("G")
        expect(firstRow[3]).toHaveValue("L")
        expect(firstRow[4]).toHaveValue("E")

        await user.keyboard("x");

        expect(firstRow[4]).toHaveValue("X");

        await user.keyboard("{Backspace}");

        expect(firstRow[4]).toHaveValue("");

        await user.keyboard("{Backspace}");

        expect(firstRow[3]).toHaveValue("");
    });

    it("can check a try word", async () => {
        const {user} = setup(<Wordle testWord={"CRANE"}></Wordle>)

        const mockSuccessFetch = vi.fn(() => Promise.resolve({
            json: () => Promise.resolve({ en: [] }),
        }))
        const mockFailFetch = vi.fn(() => Promise.resolve({
            json: () => Promise.resolve({ error: "" }),
        }))
        global.fetch = mockSuccessFetch

        let firstRow = screen.getAllByRole("textbox").slice(0, 5);
        let secondRow = screen.getAllByRole("textbox").slice(5, 10);

        expect(firstRow[0]).toHaveFocus();

        // Valid word
        await user.keyboard("eagle{Enter}");

        expect(mockSuccessFetch).toHaveBeenCalled();
        expect(secondRow[0]).toHaveFocus();
        expect(firstRow[0]).toBeDisabled();

        // Invalid word
        global.fetch = mockFailFetch

        await user.keyboard("xxxxx{Enter}");

        expect(mockFailFetch).toHaveBeenCalled();
        expect(secondRow[4]).toHaveFocus();

    });

    it("enforces hard mode rules", async () => {
        const {user} = setup(<Wordle testWord={"CRANE"}></Wordle>)
        const firstTextBox = screen.getAllByRole("textbox")[0]
        const secondRowTextBox = screen.getAllByRole("textbox")[5]
        const hardModeSwitch = screen.getByLabelText("Hard Mode")

        const spy = vi.spyOn(wordleHelper, "evalTryRules")
        const mockFetch = vi.fn(() => Promise.resolve({
            json: () => Promise.resolve({ en: [] }),
        }))
        global.fetch = mockFetch

        await user.click(hardModeSwitch)
        expect(hardModeSwitch).toBeChecked()

        await user.click(firstTextBox)

        expect(firstTextBox).toHaveFocus();

        await user.keyboard("eagle{Enter}");

        expect(spy).toHaveBeenCalledTimes(1);
        expect(secondRowTextBox).toHaveFocus();

        await user.keyboard("eagle{Enter}");

        expect(spy).toHaveBeenCalledTimes(2);
        expect(screen.getAllByRole("textbox")[9]).toHaveFocus();
    })
})