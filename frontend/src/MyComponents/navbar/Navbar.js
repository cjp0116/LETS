import React, { useContext, useEffect, useState } from "react";
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
  DropdownMenu,

} from "reactstrap";
import AuthContext from "UserContext";
import Search from "MyComponents/search/Search";
import Api from "api/api";
import Notifications from "MyComponents/notifications/Notifications";
import "./navBarDesign.css";

function NavbarOrange({ logout }) {
  const { currentUser, socket } = useContext(AuthContext);
  const [collapseOpen, toggleCollapseOpen] = React.useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("getNotification", (data) => {
      setNotifications(prev => [...prev, data]);
    });
  }, []);

  useEffect(() => {
    const getCurrentUnreadNotifications = async () => {
      try {
        const notifications = await Api.getUserNotifications(currentUser?.username);
        setNotifications(notifications);
      } catch(e) {}
    }
    getCurrentUnreadNotifications();
  }, [currentUser?.username]);

  const toggle = () => {
    toggleCollapseOpen((open) => !open);
  };

  const handleReadAll = async () => {
    try {
      await Promise.all(notifications.map((n) => Api.markAsRead(currentUser.username, n.id)));
      setNotifications([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReadOne = async (id) => {
    try {
      await Api.markAsRead(currentUser.username, id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  console.debug("notifications=",notifications)
  const loggedInNav = () => {
    return (
      <Nav className="ml-lg-auto" navbar>
        <NavItem>
          <Search />
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/messenger" style={{ color : "white"}}>
            <i className="ni ni-chat-round" />
            Chat
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to="/friends" style={{ color : "white" }}>
            <i className="fas fa-users" />
            Friends
          </NavLink>
        </NavItem>

        <UncontrolledDropdown nav>
          <DropdownToggle className="nav-link" color="transparent" role="button" size="sm">
            <span style={{ color: "white" }}>
              <i className="ni ni-single-02" /> {currentUser.username}
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
            <DropdownItem divider></DropdownItem>
            <DropdownItem onClick={logout} >
              <i className="ni ni-user-run"></i>
              <span>Logout</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <Notifications
          notifications={notifications}
          handleReadAll={handleReadAll}
          handleReadOne={handleReadOne}
        />
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
      <Navbar expand="lg">
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
