function WordleCell({letter, inputRef, onKeyDown, disabled, color}: {
    letter?: string,
    inputRef: any,
    onKeyDown: (event: any) => any,
    disabled?: boolean,
    color?: number
}) {
    return (
        <input className={`wordle-${color ? color : "0"}`} onKeyDown={onKeyDown} ref={inputRef} value={letter} disabled={disabled ? disabled : false} readOnly></input>
    )
}

export default WordleCell