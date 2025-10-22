function WordleCell({letter, inputRef, onKeyDown, disabled, color}) {
    return (
        <input className={`wordle-${color}`} onKeyDown={onKeyDown} ref={inputRef} value={letter} disabled={disabled} readOnly></input>
    )
}

export default WordleCell