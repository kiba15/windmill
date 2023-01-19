// ПОДКЛЮЧЕНИЕ К POSTGRESQL
import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

const poolnewdb = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
console.log(process.env.DB_DATABASE);
//(async () => {
// create database if not exists
const dbQuery = await poolnewdb.query(
  `SELECT FROM pg_database WHERE datname = $1`,
  [process.env.DB_DATABASE]
);
if (dbQuery.rows.length === 0) {
  // database does not exist, make it:
  await poolnewdb.query(`CREATE DATABASE ${process.env.DB_DATABASE}`);
  console.log(`Database ${process.env.DB_DATABASE} created!`);
}
//})()

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// create table "status"
pool.query(
  `CREATE TABLE IF NOT EXISTS "status" (
	    "date" TIMESTAMP,
	    "status" VARCHAR(10) NOT NULL,
	    "comment" VARCHAR(100),
	    PRIMARY KEY ("date")
     )`,
  (err, res) => {
    if (err) {
      console.log(err.stack);
      throw err;
    } else {
      console.log("success create table 'status'");
    }
  }
);
// create table "useractions"
pool.query(
  `CREATE TABLE IF NOT EXISTS "useractions" (
	    "date" TIMESTAMP,
	    "userid" VARCHAR(20) NOT NULL,
	    "username" VARCHAR(20) NOT NULL,         
	    "action" VARCHAR(200),
	    PRIMARY KEY ("date")
     )`,
  (err, res) => {
    if (err) {
      console.log(err.stack);
      throw err;
    } else {
      console.log("success create table 'useractions'");
    }
  }
);

// FUNCTION EXECUTE
const execute = async (query) => {
  try {
    await pool.connect(); // gets connection
    const rows = await pool.query(query); // sends queries
    return rows;
  } catch (error) {
    console.error(error.stack);
    return false;
  } finally {
    pool.end(); // closes connection
  }
};

// FUNCTION LASTSTATUS
const lastStatus = async () => {
  const query = `select * from status
  order by date desc limit 1;`;
  const client = await pool.connect();
  try {
    const res = await client.query(query);
    return res.rowCount ? res.rows[0] : undefined;
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.release();
  }
};

// FUNCTION ADDSTATUS
const addStatus = async (statusObject) => {
  //
  const query = `INSERT INTO status (date, status, comment)
  VALUES(current_timestamp(2), '${statusObject.status}', '${statusObject.comment}');`;
  //console.log(query)

  pool.connect().then((client) => {
    return client
      .query(query) // your query string here
      .then((res) => {
        client.release();
        return true;
      })
      .catch((err) => {
        client.release();
        console.log(err.stack);
        return false;
      });
  });
};

// FUNCTION ADDUSERACTION
const addUserAction = async (actionObject) => {
  //
  const query = `INSERT INTO useractions (date, userid, username, action)
  VALUES(current_timestamp(2), '${actionObject.userId}', '${actionObject.userName}', '${actionObject.action}');`;
  //console.log(query)

  pool.connect().then((client) => {
    return client
      .query(query) // your query string here
      .then((res) => {
        client.release();
        return true;
      })
      .catch((err) => {
        client.release();
        console.log(err.stack);
        return false;
      });
  });
};

export { poolnewdb, pool, execute, addStatus, addUserAction, lastStatus };
