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
  Button, Modal, Card,
  CardBody,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

import { MoreVert } from "@material-ui/icons";
import { Link } from "react-router-dom";
import Api from "api/api";
import UserContext from "UserContext";

const ChatHeader = ({ members, handleLeaveRoom }) => {
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
        const usersArray = await allPromise;
        setUsers(usersArray);
      } catch (e) {
        console.error(e);
      }
    };
    modalOpen && fetchFriends();
  }, [modalOpen]);

  return (
    <Row>
      <Col md="10">
        <Media className="align-items-center">
          <div className="avatar-group">
            {members?.map((m) => (
              <>
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
              </>
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
            <DropdownItem>
              <span onClick={() => setModalOpen(!modalOpen)}>Add</span>
            </DropdownItem>
            <DropdownItem>
              <span>Deactivate Notification</span>
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </Col>

      {modalOpen && (<Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLongTitle">
            Add friend to chat
          </h5>
          <button
            aria-label="Close"
            className="close"
            onClick={() => setModalOpen(!modalOpen)}
            type="button"
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <Card>
            <CardBody>
              <ListGroup className="list my--3" flush>
                {users.map((f) => (
                  <ListGroupItem
                    className="px-0"
                    key={f.username}
                  >
                    <Row className="align-items-center">
                      <Col className="col-auto">
                        <Link
                          className="avatar rounded-circle"
                          to={`/profile/${f.username}`}
                        >
                          <img
                            alt="..."
                            src={
                              f.profileImage ?
                                PF + f.profileImage :
                                require("assets/img/placeholder.jpg")
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
                        <Button color="primary" size="sm" type="button" className="btn-round">
                          Add
                        </Button>
                      </Col>
                    </Row>
                  </ListGroupItem>
                ))}
              </ListGroup>
            </CardBody>
          </Card>
        </div>
      </Modal>)}
    </Row>
  );
};
export default ChatHeader;
