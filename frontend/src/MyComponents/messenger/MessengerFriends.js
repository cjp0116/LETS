import React, { useEffect, useState, useContext } from "react";
import Api from "api/api";
import {
  Card,
  CardHeader,
  CardBody,
  ListGroup,
  ListGroupItem,
  Col,
  Row,
} from "reactstrap";
import UserContext from "UserContext";
import { Link } from "react-router-dom";

const OnlineFriends = ({ setCurrentChat, setConversations, onlineUsers }) => {
  const [friends, setFriends] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const { currentUser, friendsUsernames } = useContext(UserContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const allPromise = Promise.all(
          friendsUsernames.map((uName) => Api.getCurrentUser(uName))
        );
        const usersArray = await allPromise;
        setFriends(usersArray);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFriends();
  }, [friendsUsernames]);

  useEffect(() => {
    if (onlineUsers) {
      setOnlineFriends(
        friendsUsernames.filter((f) =>
          onlineUsers.map((u) => u.username).includes(f)
        )
      );
    }
  }, [onlineUsers, friends, friendsUsernames]);

  const handleClick = async (friendUsername) => {
    if (!friendUsername) return;
    try {
      const foundConversations = await Api.findRoom(
        currentUser.username,
        friendUsername
      );
      if (Object.keys(foundConversations).length === 0) {
        const data = {
          receiverUsername: friendUsername,
        };
        const newRoom = await Api.createRoom(currentUser.username, data);
        console.debug("newRoom=", newRoom);
        setCurrentChat(newRoom);
        return;
      }
      console.log("foundConversations=", foundConversations);
      setCurrentChat(foundConversations);
    } catch (e) {
      console.error(e);
    }
  };

  console.debug("onlineFriends=", onlineFriends, "friends", friends);
  return (
    <Card>
      <CardHeader>
        <h5 className="h3 mb-0">My Friends</h5>
      </CardHeader>

      <CardBody>
        <ListGroup className="list my--3" flush>
          {friends.map((f) => (
            <ListGroupItem
              className="px-0"
              key={f.username}
              onClick={() => handleClick(f?.username)}
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
                        f.profileImage
                          ? PF + f.profileImage
                          : require("assets/img/placeholder.jpg")
                      }
                    />
                  </Link>
                </Col>
                <div className="col ml--2">
                  <h4 className="mb-0">
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      {f.firstName} {f.lastName}
                    </a>
                  </h4>
                  {onlineFriends.includes(f.username) ? (
                    <>
                      <span className="text-success">●</span>
                      <small>Online</small>
                    </>
                  ) : (
                    <>
                      <span className="text-danger">●</span>
                      <small>Offline</small>
                    </>
                  )}
                </div>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default OnlineFriends;
