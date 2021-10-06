"use strict";

const express = require("express");
const router = express.Router();
const { ensureCorrectUserOrAdmin, ensureAdmin, ensureLoggedIn} = require("../middleware/auth")
const Message = require("../models/message");
const { BadRequestError } = require("../ExpressError");
const db = require("../db");

// GET
// /messages/:roomId/
router.get("/:roomId", ensureLoggedIn, async (req, res, next) => {
  try {
    const messages = await Message.getByRoomId(req.params.roomId);
    return res.json({ messages });
  }
  catch(e) {
    return next(e);
  }
})

/** POST /[username]/messages/[toUsername] 
 *  Authorization required : admin or same-user-as:username
 *  NotFoundError if the toUsername doesn't exist.
 *  BadRequestError if the input is not valid.
 *  Returns { message : { id, sentBy, sentTo, text, createdAt } }
 */ 
 router.post("/:username/to/:toUsername", ensureCorrectUserOrAdmin, async (req, res, next) => {
  try { 
    const { username, toUsername } = req.params;
    if(!req.body.text || typeof req.body.text !== "string" ||!req.body.text.length) throw new BadRequestError();
    const message = await Message.send(username, toUsername, req.body.text);
    return res.json({ message })
  } 
  catch(e) {
    return next(e);
  }
});

module.exports = router;