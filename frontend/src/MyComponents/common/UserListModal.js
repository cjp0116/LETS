import React, { useEffect, useState, useContext } from "react";
import UserContext from "UserContext";
// reactstrap components
import {
  Button, Modal, Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  Col,
  Row
}
from "reactstrap";
import Api from "api/api";
import { Link } from "react-router-dom";

function UserListModal({ buttonText, modalTitle, userListType = "friends", modalOpen, setModalOpen }) {
  const PF = process.env.REACT_APP_PUBLIC_URL;
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
    if (userListType === "friends") fetchFriends();
  }, [userListType]);
  return (
    <>
      <span
        onClick={() => setModalOpen(!modalOpen)}
      >
        {buttonText}
      </span>
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLongTitle">
            {modalTitle}
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
      </Modal>
    </>
  );
}

export default UserListModal;
