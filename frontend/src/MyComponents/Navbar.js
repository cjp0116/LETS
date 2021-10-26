import React, { useContext } from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu
} from "reactstrap";
import AuthContext from "UserContext";
import Search from "MyComponents/search/Search";
import './navBarDesign.css'

function NavbarOrange({ logout }) {
  const { currentUser } = useContext(AuthContext);
  const [collapseOpen, toggleCollapseOpen] = React.useState(false);
  const toggle = () => {
    toggleCollapseOpen((open) => !open);
  };
  const loggedInNav = () => {
    return (
      <Nav className="ml-lg-auto" navbar>
        <NavItem>
          <Search />
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to={`/profile/${currentUser.username}`}>
            <i className="ni ni-bell-55" />
            
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink tag={Link} to={`/profile/${currentUser.username}`}>
            <i className="ni ni-circle-08" />
            Profile
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/messenger">
            <i className="ni ni-chat-round" />
            Chat
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/schedules">
            <i className="ni ni-calendar-grid-58" />
            My Schedule
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/friends">
            <i className="fas fa-users"></i>
            Friends
          </NavLink>
        </NavItem>

        <UncontrolledDropdown>
          <DropdownToggle color="transparent" role="button">
            <span style={{ color: "white" }}>
              <i className="ni ni-single-02" />{" "}
              {currentUser.username}
            </span>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem tag={Link} to={`/profile/${currentUser.username}`}>
              <i className="ni ni-single-02"></i>
              <span>My profile</span>
            </DropdownItem>
            <DropdownItem tag={Link} to="/edit-profile">
              <i className="ni ni-settings-gear-65"></i>
              <span>Edit Profile</span>
            </DropdownItem>
            <DropdownItem tag={Link} onClick={(e) => e.preventDefault()}>
              <i className="ni ni-calendar-grid-58"></i>
              <span>Activity</span>
            </DropdownItem>
            <DropdownItem tag={Link} onClick={(e) => e.preventDefault()}>
              <i className="ni ni-support-16"></i>
              <span>Support</span>
            </DropdownItem>
            <DropdownItem divider></DropdownItem>
            <DropdownItem tag={Link} onClick={logout}>
              <i className="ni ni-user-run"></i>
              <span>Logout</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Nav>
    );
  };
  const loggedOutNav = () => (
    <Nav className="ml-auto" navbar>
      <NavItem>
        <NavLink tag={Link} to="/login">
          Login
        </NavLink>
      </NavItem>
      <NavItem>
        <NavLink tag={Link} to="/register">
          Register
        </NavLink>
      </NavItem>
    </Nav>
  );
  return (
    <>
      <Navbar  expand="lg">
        <Container>
          <NavbarBrand tag={Link} to="/">
            GAINS
          </NavbarBrand>
          <button className="navbar-toggler" onClick={toggle}>
            <span className="navbar-toggler-icon"></span>
          </button>

          <Collapse navbar isOpen={collapseOpen}>
            {!currentUser ? loggedOutNav() : null}
          </Collapse>
          {currentUser ? loggedInNav() : null}
        </Container>
      </Navbar>
    </>
  );
}

export default NavbarOrange;
