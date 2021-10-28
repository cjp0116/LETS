import React, { useContext, useState, useEffect } from "react";

// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Form,
  Input,
  Media,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";
import Alert from 'MyComponents/common/Alert'
import Comment from "MyComponents/comment/Comment";
import UserContext from "UserContext";
import Api from "api/api";
import './postDesign.css'
/**
 * post = { id, postedBy, createdAt, content, createdAt }
 */

import { format } from "timeago.js";
import { regExpLiteral } from '@babel/types';

function Post({ post, profileImage, deletePost }) {
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;
  const { currentUser, friendsUsernames, currentUserProfileImage, socket } = useContext(UserContext);

  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [comment, setComment] = useState("");
  const [likes, setLikes] = useState(post?.likes);
  const [isMine, setIsMine] = useState(currentUser.username === post.postedBy);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    setIsLiked(post.likes.map(l => l.username).includes(currentUser.username));
  }, [currentUser.username, post.likes]);

  useEffect(() => {
    setIsMine(currentUser.username === post.postedBy);
  }, [currentUser.username, post.postedBy]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const newComm = { content: comment };
    try {
      const newComment = await Api.createComment(
        post.id,
        currentUser.username,
        newComm
      );
      setComments((prev) => [...prev, newComment]);
      
      if(currentUser.username === post.postedBy) return;
      const newNotification = await Api.postNotifications(currentUser.username, {
        sentTo : post.postedBy,
        notificationType : "comment",
        identifier : newComment.id,
        senderProfileImage : currentUserProfileImage
      })
      handleNotification(newNotification);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(()=>{
      const reg = new RegExp('@\w*', 'i')
      
  }, [comment])

  const likeHandler = async () => {
    await Api.likePost(post.id, currentUser.username);
    setLike(isLiked ? like - 1 : like + 1);
    setLikes(isLiked ? 
      likes.filter(l => l.username !== currentUser.username) : 
        [...likes, { postId: post.id, username: currentUser.username, profileImage: currentUser.profileImage }]);
    setIsLiked(!isLiked);

    if(currentUser.username === post.postedBy) return;
    const newNotification = await Api.postNotifications(currentUser.username, {
      sentTo : post.postedBy,
      notificationType : "like",
      identifier : post.id,
      senderProfileImage : currentUserProfileImage
    })
    handleNotification(newNotification);
  }

  const handleNotification = (returnedAPIResponse) => {
    socket.emit("sendNotification", {
      senderName : currentUser.username,
      receiverName : post.postedBy,
      returnedAPIResponse
    });
  }

  console.log(likes)
  return (
    <>
      <Card className='posts'>
        <CardHeader className="d-flex align-items-center">
          <div className="d-flex align-items-center">
            <a onClick={(e) => e.preventDefault()}>
              {isMine ? <img alt="" className="avatar" src={currentUserProfileImage ? PF + currentUserProfileImage : require("assets/img/placeholder.jpg")} /> : 
              <img
                alt="..."
                className="avatar"
                src={
                  profileImage
                    ? PF + profileImage
                    : require("assets/img/placeholder.jpg")
                }
              />}

            </a>
            <div className="mx-3">
              <a
                className="text-dark font-weight-600 text-sm"
                onClick={(e) => e.preventDefault()}
              >
                {post?.postedBy}
              </a>
              <small className="d-block text-muted">
                {format(post.createdAt)}
              </small>
            </div>
          </div>

          <div className="text-right ml-auto">
            {!isMine && !friendsUsernames.includes(post?.postedBy) && (
              <Button
                className="btn-icon"
                color="primary"
                size="sm"
                type="button"
              >
                <span className="btn-inner--icon icon-big">
                  <i className="ni ni-fat-add">Add Friend</i>
                </span>
              </Button>
            )}
            {isMine && (
              <Alert deletePost={deletePost}>
                <span className="btn-inner-icon icon-big">
                  <i className="fas fa-trash"></i>
                  <span className="btn-inner--text">Delete</span>
                </span>
              </Alert>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <p className="mb-4">{post.content}</p>
          <img
            alt="..."
            className="img-fluid rounded"
            src={
              post.image
                ? PF + post.image
                : require("assets/img/sections/mohamed.jpg")
            }
          />

          <Row className="align-items-center my-3 pb-3 border-bottom">
            <Col sm="6">
              <div className="icon-actions">
                <Button className="like active" size="sm" onClick={likeHandler}>
                  <i className="ni ni-like-2"></i>
                  <span className="text-muted">{like}</span>
                </Button>
                <a onClick={e => {
                  e.preventDefault();
                  setShowComments(bool => !bool);
                }}>
                  <i className="ni ni-chat-round"></i>
                  <span className="text-muted">{comments.length}</span>
                </a>
              </div>
            </Col>

            <Col className="d-none d-sm-block" sm="6">
              <div className="d-flex align-items-center justify-content-sm-end">
                <div className="avatar-group">
                  {likes?.map(l => (
                    <>
                      <a className="avatar avatar-xs rounded-circle"
                        key={l.username}
                        onClick={(e) => e.preventDefault()}
                        id={`usernameToolTip${l.username}`}
                      >
                        <img
                          alt="..."
                          src={
                            l.profileImage ?
                              PF + l.profileImage :
                              require("assets/img/placeholder.jpg")
                          }
                        />
                      </a>
                      <UncontrolledTooltip delay={0} target={`usernameToolTip${l.username}`}>
                        {l.username}
                      </UncontrolledTooltip>
                    </>
                  ))}
                </div>
              </div>
            </Col>
          </Row>

          {/* Comments SECTION */}
          <div className="mb-1">
            {showComments && comments.map((comment) => (
              <Comment comment={comment} key={comment.id} />
            ))}

            <Media className="align-items-center mt-5">
              <img
                alt="..."
                className="avatar avatar-lg rounded-circle mb-4"
                src={
                  currentUser.profileImage
                    ? PF + currentUser.profileImage
                    : require("assets/img/placeholder.jpg")
                }
              />
              <Media body>
                <Form onSubmit={handleCommentSubmit}>
                  <Input
                    placeholder="Write your comment"
                    rows="1"
                    type="textarea"
                    onChange={(e) => setComment(e.target.value)}
                    value={comment}
                  />
                  <Button size="sm">comment</Button>
                </Form>
              </Media>
            </Media>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Post;
