import { expect, describe, afterEach, afterAll, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event"
import Wordle from "../pages/Wordle"
import '@testing-library/jest-dom'
import * as wordleHelper from "../util/WordleHelper";
import { vi } from "vitest";

function setup(jsx) {
  return {
    user: userEvent.setup(),
    component: render(jsx),
  }
}

beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
        json: () => Promise.resolve({ en: [] }),
    })))
    vi.spyOn(wordleHelper, "generateSolveWord").mockImplementation(() => "CRANE")
})

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
        const wordleComponent = render(<Wordle></Wordle>);
        expect(screen.getAllByRole("textbox")).toHaveLength(30);
        expect(wordleComponent).toMatchSnapshot();
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
        const {user} = setup(<Wordle></Wordle>)

        let firstRow = screen.getAllByRole("textbox").slice(0, 5);
        let secondRow = screen.getAllByRole("textbox").slice(5, 10);

        expect(firstRow[0]).toHaveFocus();

        // Valid word
        await user.keyboard("eagle{Enter}");

        expect(fetch).toHaveBeenCalled();
        expect(secondRow[0]).toHaveFocus();
        expect(firstRow[0]).toBeDisabled();

        // Invalid word
        vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
            json: () => Promise.resolve({ error: "" }),
        })))

        await user.keyboard("xxxxx{Enter}");

        expect(fetch).toHaveBeenCalled();
        expect(secondRow[4]).toHaveFocus();

    });

    it("enforces hard mode rules", async () => {
        const {user} = setup(<Wordle></Wordle>)
        const firstTextBox = screen.getAllByRole("textbox")[0]
        const secondRowTextBox = screen.getAllByRole("textbox")[5]
        const hardModeSwitch = screen.getByLabelText("Hard Mode")

        const spy = vi.spyOn(wordleHelper, "evalTryRules")

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

    it("shows game win splash screen", async () => {
        const {user, component} = setup(<Wordle></Wordle>)

        let firstTextBox = screen.getAllByRole("textbox")[0]
        expect(firstTextBox).toHaveFocus();

        expect(screen.getByText("Play again!")).toHaveClass("d-none");
        expect(screen.queryByTestId("game-ended-modal")).not.toBeInTheDocument();

        await user.keyboard("crane{Enter}");

        expect(screen.queryByTestId("game-ended-modal")).toBeVisible();
        expect(screen.getByTestId("game-ended-modal")).toHaveTextContent("Congratulations!")

        let restartBtns = screen.getAllByRole("button").filter(btn => btn.classList.contains("restart-button"))
        expect(restartBtns).toHaveLength(2)

        for(let btn of restartBtns) {
            expect(btn).toBeVisible();
        }

        await user.click(restartBtns[0]);

        expect(component).toMatchSnapshot();
    })

    it("shows game lost splash screen", async () => {
        const {user, component} = setup(<Wordle></Wordle>)

        let firstTextBox = screen.getAllByRole("textbox")[0]
        expect(firstTextBox).toHaveFocus();

        expect(screen.getByText("Play again!")).toHaveClass("d-none");
        expect(screen.queryByTestId("game-ended-modal")).not.toBeInTheDocument();

        await user.keyboard("eagle{Enter}");
        await user.keyboard("eagle{Enter}");
        await user.keyboard("eagle{Enter}");
        await user.keyboard("eagle{Enter}");
        await user.keyboard("eagle{Enter}");
        await user.keyboard("eagle{Enter}");

        expect(screen.queryByTestId("game-ended-modal")).toBeVisible();
        expect(screen.getByTestId("game-ended-modal")).toHaveTextContent("Try again!")

        let restartBtns = screen.getAllByRole("button").filter(btn => btn.classList.contains("restart-button"))
        expect(restartBtns).toHaveLength(2)

        for(let btn of restartBtns) {
            expect(btn).toBeVisible();
        }

        await user.click(restartBtns[1]);

        expect(component).toMatchSnapshot();
    })
})