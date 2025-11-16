import { Container, Modal, Row, Col } from "react-bootstrap";
import "./modals.css"
import RestartButton from "./RestartButton";

function GameFinishedModal({show, onHide, onRestart, gameWon, children}: {
    show: boolean,
    onHide: () => void,
    onRestart: () => void,
    gameWon: boolean,
    children?: any
}) {
    return (
        <Modal
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show = {show}
            onHide = {onHide}
            className="game-finished-modal"
            data-testid="game-ended-modal"
        >
            <Modal.Body>
                <Container>
                    <Row>
                        <Col className="text-center modal-title">{gameWon ? "Congratulations!" : "Try again!"}</Col>
                    </Row>
                    <Row>
                        <Col className="text-center my-4">
                            {children}
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center">
                            <RestartButton onRestart={onRestart}></RestartButton>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
        </Modal>
    )
}

export default GameFinishedModal;