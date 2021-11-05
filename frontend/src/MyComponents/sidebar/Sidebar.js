import React, { useContext } from "react";
import "./sidebar.css";
import UserContext from "UserContext";
import { Link } from "react-router-dom";
import OnlineFriends from "MyComponents/messenger/MessengerFriends";

const Sidebar = ({ currentPage = "profile", setCurrentTab, currentTab }) => {
  const { currentUser, currentUserProfileImage } = useContext(UserContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  let listItems;
  if (currentPage === "profile") {
    listItems = (
      <>
        <li
          className={`sidebarListItem ${
            currentTab === "Goals" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Goals")}
        >
          <i className="ni ni-check-bold mr-2" />
          <span className="sidebarListItemText">Goals</span>
        </li>
        <li
          className={`sidebarListItem ${
            currentTab === "Posts" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Posts")}
        >
          <i className="ni ni-collection mr-2" />
          <span className="sidebarListItemText">Posts</span>
        </li>
        <li
          className={`sidebarListItem ${
            currentTab === "Events" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Events")}
        >
          <i className="fas fa-chart-line mr-2" />
          <span className="sidebarListItemText">Events</span>
        </li>
        <li
          className={`sidebarListItem ${currentTab === "Feed" ? "active" : ""}`}
          onClick={() => setCurrentTab("Feed")}
        >
          <i className="fas fa-th-list mr-2" />
          <span className="sidebarListItemText">Feed</span>
        </li>
      </>
    );
  } else if (currentPage === "friends") {
    listItems = (
      <>
        <li
          className={`sidebarListItem ${
            currentTab === "Friends" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Friends")}
        >
          <i className="fas fa-user-friends mr-2" />
          <span className="sidebarListItemText">Friends</span>
        </li>
        <li
          className={`sidebarListItem ${
            currentTab === "Friend Requests" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Friend Requests")}
        >
          <i className="ni ni-check-bold mr-2" />
          <span className="sidebarListItemText">Friend Requests</span>
        </li>
        <li
          className={`sidebarListItem ${
            currentTab === "Still Waiting On" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("Still Waiting On")}
        >
          <i className="far fa-clock mr-2" />
          <span className="sidebarListItemText">Still Waiting On</span>
        </li>
      </>
    );
  }
  return (
    <div className="sidebar">
      <div className="sidebarWrapper" roles="tablist">
        <ul className="sidebarList">
          <li className="sidebarFriend">
            <Link to={`/profile/${currentUser.username}`}>
              <img
                className="sidebarFriendImg"
                src={
                  currentUserProfileImage
                    ? PF + currentUserProfileImage
                    : require("assets/img/placeholder.jpg")
                }
                alt=""
              />
              <span className="sidebarFriendName">{currentUser.username}</span>
            </Link>
          </li>
          {listItems}
        </ul>
        <button className="sidebarButton">Show More</button>
        <OnlineFriends />
      </div>
    </div>
  );
};

export default Sidebar;
