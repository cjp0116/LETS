import React, { useState, useEffect, useContext, useRef } from "react";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  Form,
} from "reactstrap";
import Message, { TypingMessage } from "MyComponents/messenger/Message";
import UserContext from "UserContext";
import Api from "api/api";
import Conversation from "MyComponents/messenger/Conversation";
import ChatHeader from "MyComponents/messenger/ChatHeader";
import OnlineFriends from "MyComponents/messenger/MessengerFriends";
import "./design/messengerDesign.css";


function Messenger() {
  const [messageFocus, setMessageFocus] = useState("");
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(null);
  const [searchFriendText, setSearchFriendText] = useState("");
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hideSearchResults, setHideSearchResults] = useState(false);

  const [currentOnlineRoomId, setCurrentOnlineRoomId] = useState(null);
  const { currentUser, friendsUsernames, socket, currentUserProfileImage } = useContext(UserContext);

  const scrollRef = useRef();

  useEffect(() => {
    socket.on("getMessage", (data) => {
      setArrivalMessage({
        sentBy: data.senderUsername,
        text: data.text,
        roomId: data.roomId,
      });
    });
    socket.on("getTyping", (bool) => setTyping(bool));
    socket.on("done-typing", (bool) => setTyping(bool));
    socket.on("user-joined", (obj) => {
      setCurrentOnlineRoomId(obj.roomId);
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sentBy) &&
      setMessages((messages) => [...messages, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await Api.getConversations(currentUser.username);
        console.log(res);
        setConversations(res);
      } catch (e) {
        console.error(e);
      }
    };
    getConversations();
    socket && socket.emit("addUser", currentUser.username);
    socket &&
      socket.on("getUsers", (users) => {
        setOnlineUsers(users); // [{ username, socketId }, { username, socketId }]
      });
  }, [currentUser.username]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        if (currentChat) {
          const res = await Api.getMessages(currentChat?.roomId);
          setMessages(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    getMessages();
    currentChat?.roomId &&
      currentOnlineRoomId &&
      currentChat.roomId !== currentOnlineRoomId &&
      socket.emit("leaveRoom", {
        roomId: currentOnlineRoomId,
        username: currentUser.username,
      });

    currentChat?.roomId &&
      currentChat?.roomId !== currentOnlineRoomId &&
      socket.emit("joinRoom", {
        roomId: currentChat.roomId,
        username: currentUser.username,
      });
  }, [currentChat]);

  useEffect(() => {
    message.length === 0 && socket.emit("done-typing", currentOnlineRoomId);
  }, [message]);

  useEffect(() => {
    scrollRef.current &&
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e) => {
    setMessage(e.target.value);
    socket.emit("typing", {
      senderUsername: currentUser.username,
      roomId: currentChat?.roomId,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.length) return;
    const roomMembersExceptMyself = currentChat?.members.filter(m => m !== currentUser.username);
    const messageBody = {
      text: message,
      roomId: currentChat?.roomId,
    };
    socket.emit("sendMessage", {
      senderUsername: currentUser.username,
      roomId: currentChat?.roomId,
      text: message,
    });

    try {
      const message = await Api.sendMessage(messageBody, currentUser.username);
      for (const user of roomMembersExceptMyself) {

        const newNotification = await Api.postNotifications(currentUser.username, {
          sentTo: user,
          notificationType: "message",
          identifier: currentChat.roomId,
          senderProfileImage: currentUserProfileImage
        });
        handleNotification(newNotification, user)


      }
      // setMessages((messages) => [...messages, message]);
    } catch (e) {
      console.error(e);
    }
    setMessage("");
  };

  const handleNotification = (returnedAPIResponse, user) => {
    if (user === currentUser.username) return;
    socket.emit("sendNotification", {
      senderName: currentUser.username,
      receiverName: user,
      returnedAPIResponse
    })
  }

  const handleLeaveRoom = async (roomId) => {
    try {
      await Api.leaveRoom(currentUser.username, roomId);
      setConversations(conversations.filter(convo => convo.roomId !== roomId))
      setCurrentChat(null)
    } catch (e) { }
  }


  let filteredFriendsList = friendsUsernames
    .filter((friend) => {
      if (searchFriendText === "") {
        return null;
      } else if (
        friend.toLowerCase().includes(searchFriendText.toLowerCase())
      ) {
        return friend;
      }
    })
    .map((name) => {
      return <ListGroupItem key={name}>{name}</ListGroupItem>;
    });
  console.debug(
    "MessengerConversations=",
    conversations,
    "MessengerCurrentChat=",
    currentChat,
    "MessengerMessages=",
    messages,
    "MessengerMessage=",
    message,
  );
  return (
    <>
      <Row className="messenger-container">
        <Col lg="3">
          <Card className="messenger-search">
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="fas fa-search" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                placeholder="Search contact"
                type="text"
                value={searchFriendText}
                onFocus={() => setHideSearchResults(false)}
                onBlur={() => setHideSearchResults(true)}
                onChange={(e) => {
                  setLoading(true);
                  setSearchFriendText(e.target.value);
                }}
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i
                    onClick={() => {
                      console.log("x clicked");
                      setSearchFriendText("");
                    }}
                    className="ni ni-fat-remove"
                  />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Card>
          <div
            className={`${hideSearchResults
              ? "hide-list-group-container"
              : "list-group-container"
              }`}
          >
            <ListGroup className="friend-search-result">
              {filteredFriendsList.length === 0 &&
                searchFriendText.length > 0 ? (
                <ListGroupItem>No Match</ListGroupItem>
              ) : (
                filteredFriendsList
              )}
            </ListGroup>
          </div>

          <ListGroup>
            {conversations?.map((c) => (
              <div
                key={c.roomId}
                onClick={() => { setCurrentChat(c) }}
              >
                <Conversation conversation={c} />
              </div>
            ))}
          </ListGroup>
        </Col>

        <Col lg="6">
          <Card>
            <CardHeader>
              {currentChat && (
                <ChatHeader members={currentChat?.members} handleLeaveRoom={() => handleLeaveRoom(currentChat?.roomId)} />
              )}
            </CardHeader>
            <CardBody className="chat-box">
              {currentChat ? (
                messages?.map((m) => (
                  <div ref={scrollRef} key={m.id}>
                    <Message
                      message={m}
                      mine={m.sentBy === currentUser.username}
                    />
                  </div>
                ))
              ) : (
                <span>Open a conversation to start a chat</span>
              )}
              {typing ? <TypingMessage /> : null}
            </CardBody>
            <CardFooter>
              {currentChat ? (
                <Form onSubmit={handleSubmit} role="form">
                  <FormGroup className={messageFocus}>
                    <InputGroup className="mb-4">
                      <Input
                        placeholder="Your message"
                        type="text"
                        onChange={handleChange}
                        value={message}
                        onFocus={() => setMessageFocus("focused")}
                        onBlur={() => setMessageFocus("")}
                      />
                      <InputGroupAddon addonType="append">
                        <InputGroupText>
                          <i className="ni ni-send"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                </Form>
              ) : null}
            </CardFooter>
          </Card>
        </Col>
        <Col lg="3">
          <OnlineFriends
            onlineUsers={onlineUsers}
            setCurrentChat={setCurrentChat}
          />
        </Col>
      </Row>
    </>
  );
}

export default Messenger;