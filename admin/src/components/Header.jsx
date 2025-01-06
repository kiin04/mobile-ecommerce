import { Navbar, Nav, Button } from 'react-bootstrap';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  return (
    <Navbar bg="white" expand="lg" className="border-bottom">
      <Navbar.Brand href="#home" className="d-flex align-items-center" style={{ marginLeft: '20px' }}>
        <span className="text-primary fw-bold fs-4">Trang quản lý</span>
        <span className="ms-2 fw-bold">SPhoneC</span>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Button variant="link" className="nav-link">
            <i className="bi bi-list fs-4"></i>
          </Button>
        </Nav>
        <Nav>
          <Nav.Link href="#profile" className="d-flex align-items-center" style={{marginRight: '20px'}}>
            <img
              src="https://via.placeholder.com/30"
              alt="Profile"
              className="rounded-circle me-2"
              width="30"
              height="30"
            />
            <span>Chào mừng admin</span>
            <ChevronDown size={16} className="ms-1" />
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;