import React, { useState, useEffect, useContext } from "react";
import Api from "api/api";
import UserContext from "../UserContext";
import { Row, Col, Container, TabPane, TabContent, Card, CardBody } from "reactstrap";

import FriendCard from "MyComponents/FriendCard";
import Sidebar from "MyComponents/sidebar/Sidebar";

const Friends = props => {
  const [myFriends, setMyFriends] = useState([])
  const [usersAwaitingMyConfirmation, setUsersAwaitingMyConfirmation] = useState([]);
  const [mySentRequests, setMySentRequests] = useState([]);
  const [currentTab, setCurrentTab] = useState("Friends")
  const { currentUser, friendsUsernames, setFriendsUsernames } = useContext(UserContext);

  const handleClick = (tab) => {
    setCurrentTab(tab)
  };

  useEffect(() => {
    const getCurrentFriends = async () => {
      try {
        const myFriendsPromise = Promise.all(friendsUsernames.map(username => Api.getCurrentUser(username)));
        const myFriendsData = await myFriendsPromise;
        setMyFriends(myFriendsData);
      } catch (e) {
        console.error(e);
      }
    }

    const getUsersWaitingForMyConfirmation = async () => {
      try {
        const usersWaiting = await Api.request(`friends/${currentUser.username}/pending`);
        const usersWaitingPromise = Promise.all(usersWaiting?.requests?.map(u => Api.getCurrentUser(u.user_from)));
        const usersWaitingData = await usersWaitingPromise;
        setUsersAwaitingMyConfirmation(usersWaitingData)
      }
      catch (e) {
        console.error(e);
      }
    }

    const getMySentRequests = async () => {
      try {
        const myRequests = await Api.request(`friends/${currentUser.username}/sent`)
        const myRequestsPromise = Promise.all(myRequests?.myRequests.map(u => Api.getCurrentUser(u.username)))
        const myRequestsData = await myRequestsPromise;
        setMySentRequests(myRequestsData);
      }
      catch (e) {
        console.error(e);
      }
    }
    getCurrentFriends();
    getUsersWaitingForMyConfirmation();
    getMySentRequests();
  }, [currentUser.username]);

  const handleConfirm = async (user) => {
    try {
      await Api.confirmFriendRequest(currentUser.username, user.username);
      setUsersAwaitingMyConfirmation(usersAwaitingMyConfirmation.filter(f => f.username !== user.username));
      setMyFriends(f => [...f, user])
      setFriendsUsernames(f => [...f, user.username])
    } catch (e) {
      console.error(e);
    }
  }

  const handleCancelFriendRequest = async (username) => { 
    try {
      await Api.cancelFriendRequest(currentUser.username, username);
      setMySentRequests(mySentRequests.filter(user => user.username !== username));
      setMyFriends(myFriends.filter(user => user.username !== username));
      friendsUsernames.includes(username) && setFriendsUsernames(u => u.filter(u => u !== username))
    } catch (e) {
      console.error(e);
    }
  }

  
  return (
    <>
      <Container fluid>
        <Row className="d-flex justify-content-end mb-3">
          <Col lg="3">
            <Sidebar currentPage="friends" currentTab={currentTab} setCurrentTab={handleClick} />
          </Col>
          <Col lg="9">
            <Card className="shadow">
              <CardBody>
                <TabContent id="myTabContent" activeTab={currentTab}>

                  <TabPane tabId="Friends">
                    <div className="description">
                      <h5>Friends ({myFriends.length})</h5>
                      <Row>
                        {myFriends?.map(user => (
                          <Col lg="3" md="6" key={user.username} >
                            <FriendCard type="currentFriends" user={user} handleCancelFriendRequest={() => handleCancelFriendRequest(user.username)} />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </TabPane>

                  <TabPane tabId="Friend Requests">
                    <div className="description">
                      <h5>Friend Requests ({usersAwaitingMyConfirmation.length})</h5>
                      <Row>
                        {usersAwaitingMyConfirmation.length > 0 &&
                          usersAwaitingMyConfirmation.map(user => (
                            <Col lg="3" md="6" key={user.username}>
                              <FriendCard type="pending" key={user.username} user={user} handleConfirm={() => handleConfirm(user)} />
                            </Col>
                          ))}
                      </Row>
                    </div>
                  </TabPane>

                  <TabPane tabId="Still Waiting On">
                    <div className="description">
                      <h5>Still Waiting On ({mySentRequests.length})</h5>
                      <Row>
                        {mySentRequests.length > 0 && mySentRequests.map(user => (
                          <Col lg="3" md="6" key={user.username} >
                            <FriendCard
                              type="sent"
                              user={user}
                              handleCancelFriendRequest={() => handleCancelFriendRequest(user?.username)}
                            />
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>

          </Col>
        </Row>
      </Container>
    </>
  )
};

export default Friends;