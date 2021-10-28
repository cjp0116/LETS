const router = require("express").Router();
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const db = require("../db");
const { BadRequestError } = require("../ExpressError");

// Get /notifications/:username
// get all notifications for :username order by most recent
router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
   try {
      const notifications = await db.query(`
      SELECT * FROM notifications WHERE sent_to = $1 AND is_seen = FALSE ORDER BY created_at DESC
      `, [req.params.username]);
      return res.json({ notifications: notifications.rows })
   } catch (e) {
      return next(e);
   }
});

// Post /notifications/:username
// post a notification 
// ('friend_request', 'message', 'comment', 'like');
router.post("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
   try {
      const { username } = req.params;
      const { sentTo, notificationType, identifier, senderProfileImage } = req.body;
      if (sentTo === username) return;
      let type;
      if (notificationType === "message") {
         type = "room_id"
      }
      else if (notificationType === "like") {
         type = "post_id"
      }
      else if (notificationType === "comment") {
         type = "comment_id"
      }
      else if (notificationType === "friend_request") {
         const newNoti = await db.query(
            `INSERT 
               INTO notifications 
               (sent_by, sent_to, sender_profile_image, notification_type)
               VALUES
               ($1, $2, $3, $4) RETURNING *`,
            [username, sentTo, senderProfileImage, notificationType]);
         return res.json({ notification: newNoti.rows[0] })
      }
      const newNoti = await db.query(
         `INSERT 
            INTO notifications 
            (sent_by, sent_to, ${type}, sender_profile_image, notification_type)
            VALUES
            ($1, $2, $3, $4, $5) RETURNING *`,
         [username, sentTo, identifier, senderProfileImage, notificationType]

      );
      if (!newNoti.rows.length) {
         throw new BadRequestError()
      }
      return res.json({ notification: newNoti.rows[0] })
   } catch (e) {
      return next(e);
   }
});

// PUT /:username/:id
// update a notification (can only update the is_seen and seen_date field)
router.put("/:username/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
   try {
      const { username, id } = req.params;
      const { seenDate, isSeen } = req.body;
      const checkOwnership = await db.query(`SELECT sent_to FROM notifications WHERE id = $1`, [id]);
      const checkOwnershipResults = checkOwnership.rows[0];
      if (!checkOwnershipResults || checkOwnershipResults.sent_to !== username) {
         throw new BadRequestError()
      };
      const updatedNotificationResults = await db.query(
         `UPDATE notifications SET seen_date = $1, is_seen = $2 WHERE id = $3`, 
         [seenDate, isSeen, id]
      )
      return res.json({ notification: updatedNotificationResults.rows[0] })
   } catch (e) {
      return next(e);
   }
})

router.delete("/:username/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
   try {
      const { username, id } = req.params;
      const checkOwnership = await db.query(`SELECT sent_to FROM notifications WHERE id = $1`, [id]);
      const checkOwnershipResults = checkOwnership.rows[0];
      if (!checkOwnershipResults || checkOwnershipResults.sent_to !== username) {
         throw new BadRequestError()
      };
      await db.query(
         `DELETE FROM notifications WHERE id = $1`, [id]
      )
      return res.json({ deleted: id })
   } catch (e) {
      return next(e);
   }
})

module.exports = router;