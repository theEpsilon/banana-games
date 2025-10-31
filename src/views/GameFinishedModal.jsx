import { Container, Modal, Row, Col, Button } from "react-bootstrap";
import "./modals.css"
import RestartButton from "./RestartButton";

function GameFinishedModal({show, onHide, onRestart, gameWon, children}) {
    return (
        <Modal
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show = {show}
            onHide = {onHide}
            className="game-finished-modal"
        >
            <Modal.Body>
                <Container>
                    <Row>
                        <Col className="text-center modal-title">{gameWon ? "Congratulations!" : "Try again!"}</Col>
                    </Row>
                    <Row>
                        <Col className="text-center mt-4 mb-4">
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