"use strict";

const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const { NotFoundError } = require("./ExpressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("./middleware/auth");

const multer = require("multer");

// ROUTES IMPORTS
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const friendsRoutes = require("./routes/userFriendsRoutes");
const postCommentRoutes = require("./routes/postsCommentRoutes");
const postRoutes = require("./routes/postRoutes");
const goalRoutes = require("./routes/goalRoutes");
const calendarRoutes = require("./routes/calendarEventRoutes");

// ROUTES for chat + rooms
const roomRoutes = require("./routes/roomRoutes");
const knexDb = require("./knexDB");
const db = require("./db");

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(authenticateJWT);

app.use(express.static("public"))
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/friends", friendsRoutes);
app.use("/comments", postCommentRoutes);
app.use("/posts", postRoutes);
app.use("/goals", goalRoutes);
app.use("/calendar-events", calendarRoutes);

app.use("/room", roomRoutes);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name); // public/images/req.body.name
  },
});

const upload = multer({ storage: storage });
app.post(
  "/api/images",
  ensureLoggedIn,
  upload.single("file"),
  async (req, res, next) => {
    try {
      console.log(req.file);
      const { filename, mimetype, size } = req.file;
      const { username } = res.locals.user;
      const filepath = req.file.path;

      const fileResult = await knexDb
        .insert({
          filename,
          filepath,
          mimetype,
          size,
          username,
        })
        .into("image_files");

      return res.json({ success: true, filename });
    } catch (e) {
      return next(e);
    }
  }
);

app.get("/api/images/:filename", ensureLoggedIn, (req, res) => {
  const { filename } = req.params;
  knexDb.select("*")
    .from("image_files")
    .where({ filename })
    .then((images) => {
      if (images[0]) {
        const dirname = path.resolve();
        const fullfilepath = path.join(dirname, images[0].filepath);
        return res.type(images[0].mimetype).sendFile(fullfilepath);
      }
      return Promise.reject(new NotFoundError());
    })
    .catch((e) => {
      throw new NotFoundError(e.stack);
    });
});

app.delete(
  "/api/images/:filename/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { filename, username } = req.params;
      const usernameAndPostId = await knexDb("image_files")
        .where({ username, filename })
        .del()
        .returning(["post_id", "username"]);

      const userRes = await db.query(`SELECT username FROM users WHERE profile_image = $1`, [filename]);
      const postRes = await db.query(`SELECT id FROM posts WHERE image = $1`, [filename]);
      if(userRes.rows.length) {
        const username = userRes.rows[0].username
        await db.query(`UPDATE users SET profile_image = NULL WHERE username = $1`, [username])
      }
      if(postRes.rows.length) {
        const postId = postRes.rows[0].id;
        await db.query(`UPDATE posts SET image = NULL WHERE id = $1`, [postId])
      }
			
      await fs.promises.unlink(path.join(__dirname, "public/images/"+filename))
      return res.json({ deleted : filename })
    } 
		catch (e) {
      return next(e);
    }
  }
);

/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack);
  }
  const status = err.status || 500;
  const message = err.message;
  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;