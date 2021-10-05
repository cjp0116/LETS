import React, { useEffect, useContext, useState } from "react";
import { ListGroupItem, Media, Col } from "reactstrap";
import UserContext from "UserContext";
import Api from "api/api";

// conversation : { name, members : [ username, username ] }
const Conversation = ({ conversation }) => {
  const { currentUser } = useContext(UserContext);
  const [users, setUsers] = useState(null);
  const friendsUsername = conversation?.members?.filter((m) => m !== currentUser.username);
  
  console.debug("Conversations Component users=", users);

  useEffect(() => {
    const getUsers = async () => {
      try {
        const usersArray = [];
        for(const uName of friendsUsername) {
          const res = await Api.getCurrentUser(uName);
          usersArray.push(res)
        };
        setUsers(users);
      } catch (e) {
        console.error(e);
      }
    };

    getUsers();
  }, [currentUser, conversation]);

  return (
    <>
      <ListGroupItem>
        <Media>
          <img
            alt="..."
            className="avatar shadow"
            src={require("assets/img/faces/team-5.jpg")}
          ></img>
          <Media body className="ml-2">
            <div className="justify-content-between align-items-center">
              {friendsUsername.map(uName => <h6 className="mb-0">{uName}</h6> )}
              
              <div>
                <small className="text-muted">1 day ago</small>
              </div>
            </div>
            <Col
              className="text-muted text-small p-0 text-truncate d-block"
              tag="span"
              xs="10"
            >
            {/* Be sure to check it out if your dev pro... */}
            </Col>
          </Media>
        </Media>
      </ListGroupItem>
    </>
  );
};

export default Conversation;
