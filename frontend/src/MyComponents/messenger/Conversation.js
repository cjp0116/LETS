import React, { useEffect, useContext, useState } from "react";
import { ListGroupItem, Media, Col } from "reactstrap";
import UserContext from "UserContext";
import Api from "api/api";
import { format } from "timeago.js";

// conversation : { roomId, members : [ username, username ] }
const Conversation = ({ conversation }) => {
  const { currentUser, socket } = useContext(UserContext);
  const [unreadMessage, setUnreadMessage] = useState([]);
  const friendsUsername = conversation?.members?.filter((m) => m !== currentUser.username);
  useEffect(() => {
    socket.on("getNotification", ({ room_id, created_at, sent_by, is_seen, id }) => {
      conversation?.roomId === room_id &&
        setUnreadMessage(prev => [...prev, { room_id, created_at, sent_by, is_seen, id }])
    })
  }, [])

  useEffect(() => {
    const getUnreadMessages = async () => {
      try {
        const results = await Api.getUserNotifications(currentUser.username);
        const unreadMessages = results.filter(notification => notification.room_id === conversation?.roomId)
        setUnreadMessage(unreadMessages)
      } catch (e) {
        console.error(e);
      }
    };
    getUnreadMessages();
  }, [currentUser, conversation?.roomId]);

  const clearUnread = async () => {
    try {
      await Promise.all(unreadMessage.map(m => Api.markAsRead(currentUser.username, m.id)))
      setUnreadMessage([])
    } catch(e) {}
  }
  
  return (
    <>
      <ListGroupItem onClick={() => clearUnread()}>
        <Media>
          <img
            alt="..."
            className="avatar shadow"
            src={require("assets/img/placeholder.jpg")}
          />
          <Media body className="ml-2">
            <div className="justify-content-between align-items-center">
              {friendsUsername.map(uName => <h6 key={uName} className="mb-0">{uName}</h6>)}
              <div>
                {unreadMessage.length > 0 && 
                  <small className="text-muted">{format(unreadMessage[unreadMessage.length - 1].created_at)}</small>
                }
              </div>
            </div>
            <Col
              className="text-muted text-small p-0 text-truncate d-block"
              tag="span"
              xs="10"
            >
              {unreadMessage.length > 0 && unreadMessage.length}
            </Col>
          </Media>
        </Media>
      </ListGroupItem>
    </>
  );
};

export default Conversation;
