import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const NavBar = ({ handleShowLogin, handleLogout }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userName = localStorage.getItem('userName');

  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">Delivery Tracking App</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/">Home</Nav.Link>
            {token && userRole === 'admin' && (
              <>
            <Nav.Link href="/objects/-100">Manage Users</Nav.Link>

            <NavDropdown title="Setup" id="collapsible-nav-dropdown">
              <NavDropdown.Item as={Link} to="/setup/tables/objecttypes">Object Types</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/setup/tables/properties">Properties</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/setup/tables/propertysets">Property Sets</NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
            </>
            )}
          </Nav>
          <Nav>
          {token ? (
            <>
            <Navbar.Text>
              Signed in as: <a href="/login">{userName}</a>
            </Navbar.Text>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </>
        ) : (
          <>
            <Nav.Link onClick={handleShowLogin}>Login</Nav.Link>
            </>)}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
