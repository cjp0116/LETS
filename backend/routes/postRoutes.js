const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const { ensureCorrectUserOrAdmin, ensureLoggedIn } = require("../middleware/auth");
const UserFriend = require("../models/userFriend");

// GET /posts
// returns => { posts : [] }
// authorization required : logged in.
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const posts = await Post.getAll();
    return res.json({ posts })
  } catch(e) {
    return next(e);
  }
});

// GET /posts/:postId
// authorization required : logged in.
router.get("/:postId", ensureLoggedIn, async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.getById(postId);
    return res.json({ post });
  } catch(e) {
    return next(e);
  }
});

router.get("/user/:username", ensureLoggedIn, async (req, res, next) => {
  try {
    const { username } = req.params;
    const posts = await Post.getByUsername(username);
    return res.json({ posts });
  } catch(e) {
    return next(e);
  }
});

router.get("/user/:username/timeline", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserPosts = await Post.getByUsername(username);
    const currentUserFriends = await UserFriend.getAllFrom(username);
    const friendUsernames = currentUserFriends.map(u => u.user_from === username ? u.user_to : u.user_from);
    const friendPosts = await Promise.all(friendUsernames.map(username => Post.getByUsername(username)));

    let finalResults = [...currentUserPosts];
    for(const ele of friendPosts) {
      if(Array.isArray(ele) && ele.length > 0) {
        finalResults = [...finalResults, ...ele]
      }
    }
    return res.json(finalResults);
  } catch(e) {
    return next(e);
  }
});

// POST /posts/:username
// Accepts { content }
// returns => { id, postedBy, content, createdAt, image }
router.post("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const newPost = await Post.create(req.params.username, req.body);
    return res.json({ post : newPost });
  } catch(e) {
    return next(e);
  }
});

// PATCH /posts/:username/:postId
// returns => { post : { ...updatedValues } };
// authorization required : admin or same-as-:username
router.patch("/:username/:postId", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const { username, postId } = req.params;
    const post = await Post.update(username, postId, req.body);
    return res.json({ post });
  } catch(e) {
    return next(e);
  }
});

// DELETE /posts/:username/:postId
// returns => { deleted : postId }
// authorization required : admin or same-as-:username
router.delete("/:username/:postId", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const { username, postId} = req.params;
    await Post.delete(username, postId);
    return res.json({ deleted : postId });
  } catch(e) {
    return next(e);
  }
});

// like and dislike post
router.put("/:username/:postId/like", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try {
    const { username, postId } = req.params;
    const like = await Post.likeDislikePost(username, postId);
    return res.json({ like })
  } catch(e) {
    return next(e);
  }
})


module.exports = router;