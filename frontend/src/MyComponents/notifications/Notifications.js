import React from "react";
import {
  Row,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
  ListGroup,
  ListGroupItem,
  Col,
  Badge
} from "reactstrap";

import { format } from "timeago.js";
// {
//   comment_id: null;
//   created_at: "2021-10-27T05:21:03.140Z";
//   id: 147;
//   is_seen: false;
//   notification_type: "like";
//   post_id: 4;
//   seen_date: null;
//   sent_by: "charles";
//   sent_to: "jae";
//   sender_profile_image
// }
const Notifications = ({ notifications, handleReadAll, handleReadOne, showAlert }) => {

  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const displayNotifications = ({ notification_type, id, created_at, sent_by, sender_profile_image, post_id, comment_id, message_id, }) => {
    let action;
    let identifier;
    let options;
    let icon;
    let type;
    if (notification_type === "message") {
      action = `${sent_by} sent you a message`;
      identifier = message_id;
      icon = "ni ni-chat-round"
      type = "success"
    }
    else if (notification_type === "comment") {
      action = `${sent_by} commented on your post`;
      identifier = comment_id;
      icon = "ni ni-chat-round"
      type = "info"
    }
    else if (notification_type === "like") {
      action = `${sent_by} liked your post`;
      identifier = post_id;
      icon = "ni ni-like-2"
      type="primary"
    }
    else if(notification_type === "friend_request") {
      action = `${sent_by} sent you a friend request`;
      identifier = sent_by;
      icon = "ni ni-circle-08";
      type = "info"
    }
    options = {
      place: "tr",
      message: (
        <div>
          <span className="alert-title mr-2" data-notify="title">
            Notification
          </span>
          <span data-notify="message">{action}</span>
        </div>
      ),
      type,
      icon,
      autoDismiss : 2
    }
    showAlert(options);
    return (
        <ListGroupItem
          key={id}
          className="list-group-item-action"
          onClick={() => handleReadOne(id)}
        >
          <Row className="align-items-center">
            <Col className="col-auto">
              <img
                alt="..."
                className="avatar rounded-circle"
                src={
                  sender_profile_image
                    ? PF + sender_profile_image
                    : require("assets/img/placeholder.jpg")
                }
              />
            </Col>
            <div className="col ml--2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0 text-sm">{sent_by}</h4>
                </div>
                <div className="text-right text-muted">
                  <small>{format(created_at)}</small>
                </div>
              </div>
              <p className="text-sm mb-0">{action}</p>
            </div>
          </Row>
        </ListGroupItem>
    );
  };

  return (
    <UncontrolledDropdown nav>
     
      <DropdownToggle className="nav-link" color="transparent" role="button" size="sm">
        <i className="ni ni-bell-55" style={{ color: "white" }} />
        <span style={{ color: "white" }}>Notifications</span>
        <Badge size="sm">{notifications.length}</Badge>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-xl py-0 overflow-hidden" right>
        <div className="px-3 py-3">
          <h6 className="text-sm text-muted m-0">
            You have{" "}
            <strong className="text-info">{notifications.length}</strong>{" "}
            notifications.
          </h6>
        </div>
        <ListGroup flush>
          {notifications.map(n => displayNotifications(n))}
        </ListGroup>

        <DropdownItem
          className="text-center text-info font-weight-bold py-3"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleReadAll()
          }}
        >
          Clear all
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default Notifications;
