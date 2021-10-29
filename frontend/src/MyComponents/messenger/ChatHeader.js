import React, { useState, useContext, useEffect } from "react";
import {
  Row,
  Media,
  Col,
  UncontrolledDropdown,
  DropdownMenu,
  UncontrolledTooltip,
  DropdownToggle,
  DropdownItem,
  Button,
  Modal,
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  CardHeader,
} from "reactstrap";

import { MoreVert } from "@material-ui/icons";
import { Link } from "react-router-dom";
import Api from "api/api";
import UserContext from "UserContext";

const ChatHeader = ({
  members,
  handleLeaveRoom,
  currentChat,
  setCurrentChat,
}) => {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const [modalOpen, setModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const { friendsUsernames } = useContext(UserContext);
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const allPromise = Promise.all(
          friendsUsernames.map((uName) => Api.getCurrentUser(uName))
        );
        const users = await allPromise;
        const nonParticipants = users.filter(
          (u) => !members.includes(u.username)
        );
        setUsers(nonParticipants);
      } catch (e) {
        console.error(e);
      }
    };
    if (modalOpen) {
      fetchFriends();
    }
  }, [modalOpen]);

  const handleAddParticipant = async (username) => {
    try {
      await Api.addParticipantToRoom(username, currentChat.roomId);
      setCurrentChat((currentChat) => ({
        ...currentChat,
        members: [...members, username],
      }));
      setModalOpen(!modalOpen);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Row>
      <Col md="10">
        <Media className="align-items-center">
          <div className="avatar-group">
            {members?.map((m) => (
              <React.Fragment key={m}>
                <a
                  className="avatar rounded-circle"
                  tag={Link}
                  id={m}
                  to={`/profile/${m}`}
                  onClick={(e) => e.preventDefault()}
                  to="#"
                >
                  <img alt="..." src={require("assets/img/placeholder.jpg")} />
                </a>
                <UncontrolledTooltip delay={0} target={m}>
                  {m}
                </UncontrolledTooltip>
              </React.Fragment>
            ))}
          </div>
          <Media body>
            {members?.map((m) => (
              <h6 key={m} className="mb-0 d-block">
                {m}
              </h6>
            ))}
          </Media>
        </Media>
      </Col>

      <Col md="1" xs="3">
        <UncontrolledDropdown>
          <DropdownToggle color="transparent" role="button" size="sm">
            <MoreVert />
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={handleLeaveRoom}>
              <span>Leave</span>
            </DropdownItem>
            <DropdownItem onClick={() => setModalOpen(!modalOpen)}>
              <span>Add</span>
            </DropdownItem>
            <DropdownItem>
              <span>Deactivate Notification</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Col>

      {modalOpen && (
        <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
          <Card>
            <CardHeader className="modal-header">
              <h5 className="h3 mb-0">Add friend to chat</h5>

              <button
                aria-label="Close"
                className="close"
                onClick={() => setModalOpen(!modalOpen)}
                type="button"
              >
                <span aria-hidden={true}>×</span>
              </button>
            </CardHeader>
            <CardBody className="modal-body">
              <ListGroup className="list my--3" flush>
                {users.map((f) => (
                  <ListGroupItem className="px-0" key={f.username}>
                    <Row className="align-items-center">
                      <Col className="col-auto">
                        <Link
                          className="avatar rounded-circle"
                          to={`/profile/${f.username}`}
                        >
                          <img
                            alt="..."
                            src={
                              f.profileImage
                                ? PF + f.profileImage
                                : require("assets/img/placeholder.jpg")
                            }
                          />
                        </Link>
                      </Col>
                      <div className="col ml--2">
                        <h4 className="mb-0">
                          {f.firstName} {f.lastName}
                        </h4>
                      </div>
                      <Col className="col-auto">
                        <Button
                          color="primary"
                          size="sm"
                          type="button"
                          onClick={() => handleAddParticipant(f.username)}
                          className="btn-round"
                        >
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
        </Modal>
      )}
    </Row>
  );
};
export default ChatHeader;
