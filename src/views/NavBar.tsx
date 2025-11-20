import backArrow from "../assets/arrow-left.svg"
import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router";
import "./navbar.css"

export default function NavBar() {
    return (
       <Navbar className="navbar">
            <Nav>
            <Nav.Link as={Link} to="/">
                    <img src={backArrow}></img>
                </Nav.Link>
            </Nav>
       </Navbar>
    );
}