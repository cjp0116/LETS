import React, {useState, useContext} from "react";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { Media } from "reactstrap";
import Api from "api/api";
import UserContext from "UserContext";
import "./commentDesign.css";

const Comment = ({ comment }) => {
  const [numLikes, setNumLikes] = useState(comment.likes?.length);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);
  const {currentUser} = useContext(UserContext);
  const PF = process.env.REACT_APP_PUBLIC_FOLDER;

  const likeHandler = async (e) => {
    e.preventDefault();
    const res = await Api.toggleCommentLikes(comment.id, currentUser.username);
    setNumLikes(isLiked ? numLikes - 1 : numLikes + 1);
    setLikes(isLiked ? [...likes, { ...res.liked }] : likes.filter(l => l.username !== currentUser.username))
    setIsLiked(!isLiked);
  }
  return (
    <React.Fragment key={comment.id}>
      <Media className="container">
        <Media className="media-comment">
          <Link to={`/profile/${comment.postedBy}`}>
            <div className="comment-user-image-container">
              <img
                alt="..."
                className="media-comment-avatar rounded-circle"
                src={
                  comment.commentorProfileImage
                    ? PF + comment.commentorProfileImage
                    : require("assets/img/placeholder.jpg")
                }
              />
            </div>
          </Link>
          <Media>
            <div className="media-comment-text">
              <h6 className="h5 mt-0">{comment.postedBy}</h6>
              <p className="text-sm lh-160">{comment.content}</p>
              <span className="text-muted text-sm 1h-160">{format(comment.createdAt)}</span>
              <div className="icon-actions">
                <a
                  className={`like ${isLiked && "active"}`}
                  href="#pablo"
                  onClick={likeHandler}
                >
                  <i className="ni ni-like-2"></i>
                  <span className="text-muted">{numLikes} likes</span>
                </a>
              </div>
            </div>
          </Media>
        </Media>
      </Media>
    </React.Fragment>
  );
};

export default Comment;
