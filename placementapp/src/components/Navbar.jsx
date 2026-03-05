import React from "react";
import { Navbar, Container } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faUser } from "@fortawesome/free-solid-svg-icons";

function TopNavbar() {
    const username = "Karthik"
return (
    <Navbar expand="lg" className="top-navbar shadow">
    <Container fluid>
        <Navbar.Brand className="brand">SSSIT</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
        <div className="navbar-user">
            <FontAwesomeIcon icon={faBell} />
            <FontAwesomeIcon icon={faUser} />
            <span>{username}</span>
        </div>
        </Navbar.Collapse>
    </Container>
    </Navbar>
);
}

export default TopNavbar;