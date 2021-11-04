const db = require("./db");
const bcrypt = require("bcryptjs");
const { BCRYPT_WORK_FACTOR } = require("./config");

async function seedData() {
	try {
		const adminHashedPW = await bcrypt.hash("admin", BCRYPT_WORK_FACTOR);
		const charlesHashedPW = await bcrypt.hash("charles", BCRYPT_WORK_FACTOR);
		const jaeHashedPW = await bcrypt.hash("cjp0116", BCRYPT_WORK_FACTOR);
        const testHashedPW = await bcrypt.hash('testPW', BCRYPT_WORK_FACTOR);
		const sarahHashedPW = await bcrypt.hash("sarah", BCRYPT_WORK_FACTOR);
        const charlieHashedPW  = await bcrypt.hash("charlie", BCRYPT_WORK_FACTOR)

    	const dueDate = new Date(2021, 10, 17, 3, 24, 0);
  		const dueDate2 = new Date(2022, 10, 17, 3, 24, 0);
  		const dueDate3 = new Date(2022, 11, 17, 3, 24, 0);

		await db.query(
   			`INSERT INTO users 
   			(username,    email, password, first_name, last_name, is_admin)
   			VALUES 
   			('admin',   'admin@test.com',     $1, 'admin FirstName', 'admin LastName', true),
   			('charles', 'charles@test.com',   $2, 'Charles',         'Park',          false),
   			('jae',     'jae@test.com',       $3, 'Jae',             'Cho',           false),
            ('test',    'test@test.com',      $4, 'firstName', 'lastName', false),
            ('sarah',   'sarah@test.com',     $5, 'sarah', 'kim', false),
            ('charlie', 'charlie@test.com',   $6, 'charlie', 'Doe', false)
   			 RETURNING username`,
   		[
            adminHashedPW, 
            charlesHashedPW, 
            jaeHashedPW, 
            testHashedPW, 
            sarahHashedPW, 
            charlieHashedPW
        ]
  		);

		await db.query(
    		`INSERT INTO users_measurements
    		(  
    		  created_by, 
    		  height_in_inches, 
    		  weight_in_pounds, 
    		  arms_in_inches, 
    		  legs_in_inches, 
    		  waist_in_inches
    		)
    		VALUES
    		('charles', 68.0, 150.0, 15.0, 27.0, 30.0),
    		('jae', 69.0, 151.0, 16.0, 28.0, 31.0);

    		INSERT INTO rooms
    		(name, created_by) VALUES
				('something', 'admin'),
				('gains', 'jae');

				INSERT INTO participants 
				(username, room_id)
				VALUES
				('admin', 1),
				('jae', 1),
				('charles', 1),
				('test', 1),

				('charles', 2),
				('jae', 2);

				INSERT INTO messages 
				(sent_by,   text, room_id) VALUES
				('charles', 'wsup', 2),
				('jae', 'this shit sucks', 2),
				('admin', 'I am admin', 1),
				('jae', 'I know I made you', 1),
				('charles', 'This calendar is stupid', 1);

				INSERT INTO users_friends 
    		(user_from, user_to, confirmed)
     		 VALUES
        ('admin', 'charles', 1),
        ('jae', 'charles', 1),
        ('jae', 'admin', 1),
				('test', 'jae', 1);


     		INSERT INTO calendar_event
		      (posted_by, title, start, "end", radios)
		        VALUES  
		      ('charles', 'Charles title', '2021/10/31', '2021/11/1', 'bg-info'),
		      ('jae', 	 'Jae title',     '2021/10/31', '2021/11/1', 'bg-danger');

		    INSERT INTO posts 
			  (posted_by, content) 
			    VALUES
			   ('charles', 'testContent1'),
			   ('charles', 'testContent2'),
			   ('jae', 'testContent3'),
			   ('jae', 'testContent4');

			INSERT INTO posts_comments
		    	(post_id, posted_by, content) 
		    	VALUES
		    (1, 'jae', 'this post sucks'),
		    (1, 'charles', 'yours suck too'),
		    (3, 'charles', 'testing comment');
    		`
  		);
	}
	catch(e) {
		console.log("Something went wrong!");
		console.log(e);
		process.exit(1);
	}
}

seedData().then(() => {
	console.log("successfully seeded db");
	process.exit();
}).catch(e => {
    console.error(e.stack)
})
