function WordleCell({letter, onButtonClick}) {
    return (
        <input onClick={onButtonClick} value={letter} readOnly></input>
    )
}

export default WordleCell