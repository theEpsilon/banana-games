import refreshButtonIcon from "../assets/rotate-ccw.svg"

function RestartButton({onRestart, text, className, bgColor, hide}: {
    onRestart: () => void,
    text?: string,
    className?: string,
    bgColor?: string,
    hide?: boolean

}) {
    return (
        <button onClick={onRestart} className={`${className} restart-button ${hide ? "d-none" : ""}`} style={{backgroundColor: bgColor, color: "#ffffffde"}}>
            <img src={refreshButtonIcon}></img>
            {text}
        </button>
    )
}

export default RestartButton;