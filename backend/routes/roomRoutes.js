const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureCorrectUserOrAdmin } = require("../middleware/auth");
const db = require("../db");
const { BadRequestError } = require("../ExpressError");


// new convo
// so new room is created, and adds participants
// returns => conversation : {
// 	id,
// 	name,
// 	members : [ username,  username ]
// }
router.post("/:username", ensureLoggedIn, async (req, res, next) => {
	try {
		const { username } = req.params;
		const {receiverUsername } = req.body;
		const roomResults = await db.query(
			`INSERT INTO rooms 
				(name, created_by) 
				VALUES ($1, $2) 
			RETURNING *`, [receiverUsername, username]
		);
		const room = roomResults.rows[0];
		const participantsResults = await db.query(
			`INSERT INTO participants 
			(username, room_id) 
			VALUES ($1, $2), ($3, $4)
			  RETURNING username`,
			[username, room.id, receiverUsername, room.id]
		);

		const finalResults = {
			roomId : room.id,
			name : room.name,
			members : participantsResults.rows.map(r => r.username)
		}
		return res.json({ conversation : finalResults  })
	}
	catch (e) {
		return next(e);
	}
})

// add participant into an existing room
router.post("/:username/:roomId", ensureLoggedIn, async (req, res, next) => {
	try {
		const { username, roomId } = req.params;
		const results = await db.query(
			`INSERT INTO participants (username, room_id) VALUES ($1, $2) RETURNING *`, [username, roomId]
		);
		if(!results.rows.length) throw new BadRequestError();
		return res.json({ success : true })
	} catch(e) {
		return next(e);
	}
})

// leeave room different from deleting the room.
router.delete("/:username/:roomId", ensureCorrectUserOrAdmin, async (req, res, next) => {
	try {
		const { username, roomId } = req.params;
		const results = await db.query(`DELETE FROM participants WHERE username = $1 AND room_id = $2 RETURNING *`, [username, roomId]);
		if(!results.rows.length) throw new BadRequestError();
		return res.json({ left : roomId })
	} catch(e) {
		return next(e);
	}
})

// get conversations of a user
// GET room/:username
router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
	try {
		const { username } = req.params;
		const results = await db.query(
			`SELECT DISTINCT room_id AS "roomId" FROM participants
			 JOIN rooms ON rooms.id = participants.room_id
			 WHERE username = $1`, [username]
		);
		for (const row of results.rows) {
			const { roomId } = row;
			const res = await db.query(
				`SELECT username FROM participants WHERE room_id = $1`, [roomId]
			);
			row.members = res.rows.map(obj => obj.username)
		}
		return res.json({ conversations: results.rows })
	}
	catch (e) {
		return next(e);
	}
})

// get conversation which includes two usernames
router.get("/find/:username/:secondUsername", ensureCorrectUserOrAdmin, async (req, res, next) => {
	try {
		const { username, secondUsername } = req.params;
		const results = await db.query(
			`SELECT DISTINCT room_id AS "roomId"  
			   FROM participants
			 JOIN rooms ON rooms.id = participants.room_id
			 WHERE username = $1`, [username]
		);
		for (const row of results.rows) {
			const { roomId } = row;
			const res = await db.query(
				`SELECT id, username FROM participants WHERE room_id = $1`, [roomId]
			);
			row.members = res.rows.map(obj => obj.username)
		}
		let found = {};
		for(const row of results.rows) {
			const { members } = row;
			if(members.length === 2 && members.includes(secondUsername)) {
				found = { ...row }
			}
		}

		return res.json({ conversation : found })
	
	}
	catch (e) {
		return next(e);
	}
})

// delete room based on roomId.
router.delete("/:roomId", async (req, res, next) => {
	try {
		const results = await db.query(
			`DELETE FROM rooms WHERE id = $1`, [req.params.roomId]
		);
		return res.json({ deleted: req.params.roomId });
	}
	catch (e) {
		return next(e);
	}
})


module.exports = router;