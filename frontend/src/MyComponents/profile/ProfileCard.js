import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserContext from "UserContext";

// reactstrap components
import { Button, Card, Row, Col, Spinner } from "reactstrap";
import ProfileTabs from "MyComponents/ProfileTabs";
import Api from "api/api";
import MessageModal from "MyComponents/common/MessageModal";
import ImageUpload from "MyComponents/common/ImageUpload";
import SendFriendRequestButton from "../SendFriendRequestButton";


function ProfileCard({ username }) {
  const [loadedUser, setLoadedUser] = useState({});
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [errors, setErrors] = useState([])
  const [friendRequest, setFriendRequest] = useState(null);
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    setInfoLoaded(false);
    getLoadedUser()
  }, [username]);

  async function getLoadedUser() {
    try {
      const user = await Api.getCurrentUser(username);
      setLoadedUser(user)
    }
    catch (e) {
      console.error("ProfileCard getLoadedUser Error", e);
      setLoadedUser({});
      setErrors(e)
    }
    setInfoLoaded(true)
  }

  console.debug("ProfileCard", "currentUser=", currentUser, "loadedUser=", loadedUser);
  return (
    <>
      {!infoLoaded ? (
        <Spinner type="grow" className="text-danger">
          <span className=" sr-only">Loading...</span>
        </Spinner>
      ) : null}
      {
        errors.length > 0 ? <h1>Something wen't wrong</h1> : null
      }
      
        <div className="px-4">
          <Row className="justify-content-center">
            <Col className="order-lg-2" lg="1">
              <div className="card-profile-image">

                <ImageUpload avatar addBtnClasses="mt-8" />
              </div>
            </Col>
            <Col
              className="order-lg-3 text-lg-right "
              lg="5"
            >
              {currentUser.username !== loadedUser?.username ?
                (
                  <div className="card-profile-actions py-4 mt-lg-0">
                    <SendFriendRequestButton
                      targetUsername={loadedUser?.username}
                      setFriendRequest={setFriendRequest}
                      setErrors={setErrors}
                    />
                    <MessageModal sendTo={loadedUser?.username} />
                  </div>
                ) :
                (
                  <div className="card-profile-actions py-4 mt-lg-0">
                    <Button
                      className="float-right"
                      color="info"
                      tag={Link}
                      to="/edit-profile"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )
              }

            </Col>

            <Col className="order-lg-1" lg="5">
              <div className="card-profile-stats d-flex justify-content-center">
                <div>
                  <span className="heading">{loadedUser?.posts?.length}</span>
                  <span className="description">Posts</span>
                </div>

                <div>
                  <span className="heading">{loadedUser?.friends?.length}</span>
                  <span className="description">Friends</span>
                </div>

                <div>
                  <span className="heading">{loadedUser?.goals?.length}</span>
                  <span className="description">Goals</span>
                </div>
              </div>
            </Col>
          </Row>

          <div className="text-center mt-5">
            <h3>
              {loadedUser?.firstName} {loadedUser?.lastName}
              <span className="font-weight-light">, {loadedUser?.age || 27}</span>
            </h3>

            <div className="h6 font-weight-300">
              {loadedUser?.email}
            </div>

          </div>

          <div className="mt-5 py-5 border-top text-center">
            <Row className="justify-content-center">
              <Col lg="12">
                <ProfileTabs
                  progress={loadedUser?.progress}
                  posts={loadedUser?.posts}
                  goals={loadedUser?.goals}
                />
              </Col>
            </Row>
          </div>

        </div>
        
    </>
  );
}

export default ProfileCard;
