import React, { useState, useEffect, useContext } from "react";
import UserContext from "UserContext";
import Api from "api/api";
import Share from "MyComponents/share/Share";
import "./feed.css";
import Post from "MyComponents/Post/Post";

const Feed = ({ username }) => {
	const [posts, setPosts] = useState([]);
	const { currentUser } = useContext(UserContext);
	useEffect(() => {
		const getPostsFullDetails = async () => {
			try {
				const posts = username === currentUser.username
					? await Api.getPostTimeline(currentUser.username)
					: await Api.getPostsDetailsByUsername(username)
				setPosts(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
			} catch (e) {
				console.error(e);
			}
		};
		getPostsFullDetails();
	}, [username, currentUser.username]);

	const deletePost = async (postId) => {
		try {
			await Api.deletePost(currentUser.username, postId);
			setPosts((posts) => posts.filter((p) => p.id !== postId));
		} catch (e) {
			console.error(e);
		}
	};
	console.log(posts)
	return (
		<div className="feed">
			<div className="feedWrapper">
				{!username || username === currentUser.username && <Share />}
				{posts.map(post => {
					return (
						<div key={post.id}>
							<Post post={post} deletePost={() => deletePost(post.id)} />
						</div>
					)
				})}
			</div>
		</div>
	)
};

export default Feed;