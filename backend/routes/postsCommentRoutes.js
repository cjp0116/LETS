const express = require("express");
const router = express.Router();
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const PostComment = require("../models/postComment");
const SubComment = require("../models/subComment");
const jsonshema = require("jsonschema");
const newCommentSchema = require("../schemas/postsCommentNew.json");
const db = require("../db");
const { BadRequestError } = require("../ExpressError");

// GET /comments
// Returns all comments
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const comments = await PostComment.getAllComments();
    return res.json({ comments });
  } catch (e) {
    return next(e);
  }
});

// GET /comments/:postId/
router.get("/:postId", ensureLoggedIn, async (req, res, next) => {
  try {
    const comments = await PostComment.getCommentsByPostId(req.params.postId);
    return res.json({ comments });
  } catch (e) {
    return next(e);
  }
});

// POST /comments/:postId/:username
// Adds comment to a post.
router.post(
  "/:postId/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const validator = jsonshema.validate(req.body, newCommentSchema);
      if (!validator.valid) {
        const errors = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errors);
      }
      const { postId, username } = req.params;
      const comment = await PostComment.createComment(
        username,
        postId,
        req.body.content
      );
      return res.json({ comment });
    } catch (e) {
      return next(e);
    }
  }
);

// PUT /comments/:commentId/:username/like
// Like a comment
router.put(
  "/:commentId/:username/like",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { commentId, username } = req.params;
      const checkIfLiked = await db.query(
        `SELECT * FROM likes WHERE username = $1 AND comment_id = $2`,
        [username, commentId]
      );
      if (checkIfLiked.rows.length) {
        //unlike it
        const results = await db.query(
          `DELETE FROM likes WHERE id = $1 RETURNING *`,
          [checkIfLiked.rows[0].id]
        );
        return res.json({
          unliked: results.rows[0],
        });
      } else {
        // like it
        const results = await db.query(
          `INSERT INTO likes (username, comment_id) VALUES ($1, $2) RETURNING *`,
          [username, commentId]
        );
        return res.json({ liked: results.rows[0] });
      }
    } catch (e) {
      return next(e);
    }
  }
);

// DELETE /comments/:postId/:username/:commentId
// Returns => { deleted : commentId }
router.delete(
  "/:postId/:username/:commentId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { postId, username, commentId } = req.params;
      await PostComment.deleteComment(postId, username, commentId);
      return res.json({ deleted: commentId });
    } catch (e) {
      return next(e);
    }
  }
);

// GET /comments/:postId/:username/:commentId/subcomments
// Get all nested comments
router.get(
  "/:postId/:username/:commentId/subcomments",
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const subComments = await SubComment.getAll();
      return res.json({ subComments });
    } catch (e) {
      return next(e);
    }
  }
);

// GET /comments/:postId/:username/:commentId/subcomments/:subcommentId
// GET single subcomment for the provided :subcommentId
router.get(
  "/:postId/:username/:commentId/subcomments/:subcommentId",
  ensureLoggedIn,
  async (req, res, next) => {
    try {
      const subComment = await SubComment.getOne(req.params.subcommentId);
      return res.json({ subComment });
    } catch (e) {
      return next(e);
    }
  }
);

// POST /comments/:postId/:username/:commentId/subcomments
// post a subcomment for the given :postId :username :commentId
router.post(
  "/:postId/:username/:commentId/subcomments",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { postId, username, commentId } = req.params;
      const { content } = req.body;
      const subComment = await SubComment.create(
        postId,
        username,
        commentId,
        content
      );
      return res.json({ subComment });
    } catch (e) {
      return next(e);
    }
  }
);

// DELETE /comments/:postId/:username/:commentId/subcomments/:subcommentId
// DELETE a subcomment by id
router.delete(
  "/:postId/:username/:commentId/subcomments/:subcommentId",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const id = req.params.subcommentId;
      await SubComment.deleteById(id);
      return res.json({ deleted: id });
    } catch (e) {
      return next(e);
    }
  }
);

module.exports = router;
