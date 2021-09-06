"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate, sqlForInsert, userMeasurementsJsToSql } = require("../helpers/sqlForPartialUpdate");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../ExpressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Related functions for user */
class User {
  /**  authenticate user with username, password.
   * Returns { username, first_name, last_name, email, is_admin }
   * Throws UnauthorizedError if user not found or wrong password.
   * */
  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT username, password, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"
      FROM users WHERE username = $1`,
      [username]
    );
    const user = results.rows[0];
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        delete user.password;
        return user;
      }
    }
    throw new UnauthorizedError("Invalid username/password");
  }

  /**
   * Register user with data.
   * Returns { username, firstName, lastName, email, isAdmin }
   * Throws BadRequestError on duplicates.
   */
  static async register({
    username,
    email,
    password,
    firstName,
    lastName,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username FROM users WHERE username=$1`,
      [username]
    );
    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username : ${username}`);
    }
    const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, first_name AS "firstName", last_name AS "lastName", email, is_admin AS "isAdmin"`,
      [username, email, hashedPW, firstName, lastName, isAdmin]
    );
    const user = results.rows[0];
    return user;
  }

  /** Find all users.
   * Returns [{ username, firstName, lastName, email, isAdmin}, ...]
   */
  static async findAll() {
    const results = await db.query(
      `SELECT username, email, first_name AS "firstName", last_name AS "lastName", is_admin AS "isAdmin"
      FROM users
      ORDER BY username`
    );
    return results.rows;
  }

  /**Given a username, return data about the user.
   * Returns { username, email, firstName, lastName, isAdmin }
   * Throws NotFoundError if the user is not found.
   */
  static async get(username) {
    const userResults = await db.query(
      `SELECT 
      username, 
      email, 
      first_name AS "firstName", 
      last_name AS "lastName", 
      is_admin AS "isAdmin"
        FROM users WHERE username = $1`,
      [username]
    );
    const user = userResults.rows[0];
    if (!user) {
      throw new NotFoundError(`No user : ${username}`);
    }
    return user;
  }

  /**
   * Update user data with `data`
   * This is a "partial update" -- it's fine if data doesn't contain all the fields; this only changes the provided ones.
   * Data can include :
   *   { username, email, password, firstName, lastName, isAdmin }
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   */
  static async update(username, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }
    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });
    const usernameVarIdx = "$" + (values.length + 1);
    const querySQL = `UPDATE users
                        SET ${setCols}
                        WHERE username = ${usernameVarIdx}
                        RETURNING username,
                                  email,
                                  first_name AS "firstName",
                                  last_name AS "lastName",
                                  is_admin AS "isAdmin"`;
    const results = await db.query(querySQL, [...values, username]);
    const user = results.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);
    delete user.password;
    return user;
  }

  /**  Delete give user from database; returns undefined. */
  static async remove(username) {
    let result = await db.query(
      `DELETE FROM users
      WHERE username = $1
      RETURNING username`,
      [username]
    );
    const user = result.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);
  }

  /** Post measurements from `data`
   *  It's fine if data doesn't contain all the fields; this only changes the provided ones.
   *  Data can include : {
   *     heightInInches,
   *     weightInPounds,
   *     armsInInches,
   *     legsInInches,
   *     waistInInches,
   *  }
   */
  static async postMeasurements(username, data) {
    const userCheck = await db.query(`SELECT username FROM users WHERE username=$1`, [username]);
    const user = userCheck.rows[0];
    if(!user) {
      throw new NotFoundError(`User: ${username} not found`);
    }
    const { baseQuery, values } = sqlForInsert(data, userMeasurementsJsToSql, 'users_measurements');
    // console.log(baseQuery, values)
    const measurementsResults = await db.query(
      `${baseQuery} RETURNING
       id,
       created_by AS "createdBy",
       height_in_inches AS "heightInInches",
       weight_in_pounds AS "weightInPounds",
       arms_in_inches AS "armsInInches",
       legs_in_inches AS "legsInInches",
       created_at AS "createdAt"
      `, values
    );
    const userMeasurements = measurementsResults.rows[0];
    return userMeasurements;
  };

  static async deleteMeasurements(username, measurementId) {
    const results = await db.query(
      `DELETE FROM user_measurements
        WHERE created_by = $1 AND id = $2
        RETURNING id
      `, [username, measurementId]);
    const deleted = results.rows[0];
    if(!deleted) {
      throw new NotFoundError()
    }
  }

  static async getMeasurements(username) {
    const results = await db.query(
      `SELECT 
        id,
        created_by AS "createdBy",
        height_in_inches AS "heightInInches",
        weight_in_pounds AS "weightInPounds",
        arms_in_inches AS "armsInInches",
        legs_in_inches AS "legsInInches",
        waist_in_inches AS "waistInInches"
        WHERE created_by = $1`, [username]
    );
    const measurements = results.rows;
    if(measurements.length <= 0) {
      throw new NotFoundError(`User ${username} has no measurements`);
    }
    return measurements
  }

  static async getMeasurement(username, measurementId) {
    const results = await db.query(
      `SELECT 
        id,
        created_by AS "createdBy",
        height_in_inches AS "heightInInches",
        weight_in_pounds AS "weightInPounds",
        arms_in_inches AS "armsInInches",
        legs_in_inches AS "legsInInches",
        waist_in_inches AS "waistInInches"
        WHERE created_by = $1
        AND id = $2`, [username, measurementId]
    );
    const measurement = results.rows[0];
    if(!measurement) {
      throw new NotFoundError(`id: ${measurementId} not found`)
    }
    return measurement;
  }
  
  static async updateMeasurement(username, data, measurementId) {
    const { setCols, values } = sqlForPartialUpdate(data, userMeasurementsJsToSql);
    const usernameVarIdx = `$${values.length + 1}`;
    const measurementIdIdx = `$${values.length + 2}`;
    const querySQL = `
      UPDATE users_measurements
            SET ${setCols}
            WHERE created_by = ${usernameVarIdx} AND
            id = ${measurementIdIdx}
            RETURNING 
                id,
                created_by AS "createdBy",
                height_in_inches AS "heightInInches",
                weight_in_pounds AS "weightInPounds",
                arms_in_inches AS "armsInInches",
                legs_in_inches AS "legsInInches",
                waist_in_inches AS "waistInInches"`
    const results = await db.query(querySQL, [...values, username, measurementId]);
    const updatedMeasurement = results.rows[0];
    if(!updatedMeasurement) {
      throw new NotFoundError(`No measurement : ${measurementId}`)
    };
    return updatedMeasurement;
  }

  // Adding a friend (sending a friend request)
  static async sendFriendRequest(userFrom, userTo) {
    const preCheck = await db.query(`SELECT username FROM users WHERE username = $1 OR username = $2`, [userFrom, userTo]);
    if(preCheck.rows.length !== 2) {
      throw new NotFoundError()
    }
    const results = await db.query(
      `INSERT INTO users_friends 
      (user_from, user_to) VALUES
      ($1, $2)
      RETURNING
        user_from AS "userFrom",
        user_to AS "userTo",
        request_time AS "requestTime",
        confirmed`
    ), [userFrom, userTo];
    const userFriendRequest = results.rows[0];
    if(!userFriendRequest) {
      throw new BadRequestError();
    }
    return userFriendRequest;
  }
}  

module.exports = User;
