const express = require("express");
const mysql = require("mysql");

//create connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "hyfpassword",
  database: "nodemysql",
});

//connect
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Mysql connected");
});

const app = express();

//create db
app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE nodemysql";
  db.query(sql, (err, result) => {
    if (err) {
      console.log(result);
      throw err;
    }
    res.send("database created...");
  });
});

//create table
app.get("/createpoststable", (req, res) => {
  let sql =
    "CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Post table created");
  });
});

//insert post
app.get("/addpost1", (req, res) => {
  let post = { title: "postOne", body: "this is post 1" };
  let sql = "INSERT INTO posts SET ?";
  let query = db.query(sql, post, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("post 1 added...");
  });
});

//insert post 2
app.get("/addpost2", (req, res) => {
  let post = { title: "postTwo", body: "this is post 2" };
  let sql = "INSERT INTO posts SET ?";
  let query = db.query(sql, post, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("post 2 added...");
  });
});

//Select posts
app.get("/getposts", (req, res) => {
  let sql = "SELECT * FROM posts";
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    console.log(results);
    res.send("posts fetched...");
  });
});

//Select single post
app.get("/getpost/:id", (req, res) => {
  let sql = `SELECT * FROM posts WHERE id=${req.params.id}`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("post fetched...");
  });
});

//Update post
app.get("/updatepost/:id", (req, res) => {
  let newTitle = "Updated title";
  let sql = `UPDATE posts SET title='${newTitle}' WHERE id=${req.params.id}`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("post updated");
  });
});

//Delete post
app.get("/deletepost/:id", (req, res) => {
  let sql = `DELETE FROM posts WHERE id=${req.params.id}`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("post deleted");
  });
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
