const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("./user");

/** User Array */
const users = [
  { id: 1, name: "User 1" },
  { id: 2, name: "User 2" },
  { id: 3, name: "User 3" },
  { id: 4, name: "User 4" },
  { id: 5, name: "User 5" },
  { id: 6, name: "User 6" },
  { id: 7, name: "User 7" },
  { id: 8, name: "User 8" },
  { id: 9, name: "User 9" },
  { id: 10, name: "User 10" },
  { id: 11, name: "User 11" },
  { id: 12, name: "User 12" },
  { id: 13, name: "User 13" }
];
/** Posts Array */
const posts = [
  { id: 1, name: "Post 1" },
  { id: 2, name: "Post 2" },
  { id: 3, name: "Post 3" },
  { id: 4, name: "Post 4" },
  { id: 5, name: "Post 5" },
  { id: 6, name: "Post 6" },
  { id: 7, name: "Post 7" },
  { id: 8, name: "Post 8" },
  { id: 9, name: "Post 9" },
  { id: 10, name: "Post 10" },
  { id: 11, name: "Post 11" },
  { id: 12, name: "Post 12" },
  { id: 13, name: "Post 13" }
];

mongoose.connect(
  "mongodb://localhost/pagination",
  { useNewUrlParser: true, useUnifiedTopology: true },
  err =>
    err ? console.log("Mongo Error", err) : console.info("Mongodb Connected")
);

const db = mongoose.connection;
db.once("open", async () => {
  if ((await UserModel.countDocuments().exec()) > 0) return;
  UserModel.create(users)
    .then(() => console.log("Users Added"))
    .catch(err => console.error("Mongo Error", err));
});
// For Arrays
// app.get("/users", paginatedResults(users), (req, res) => {
//   res.json(res.paginatedresults);
// });
// app.get("/posts", paginatedResults(posts), (req, res) => {
//     res.json(res.paginatedresults);
//   });
app.get("/users", paginatedResults(UserModel), (req, res) => {
  res.json(res.paginatedresults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    // For Array
    // if (endIndex < model.length) {
    if (endIndex < (await model.countDocuments())) {
      results.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit
      };
    }
    // For array
    // results.data = model.slice(startIndex, endIndex);
    try {
      results.data = await model
        .find()
        .limit(limit)
        .skip(startIndex);
      res.paginatedresults = results;
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

app.listen(3000, () => console.info("Server is running on port number 3000"));
