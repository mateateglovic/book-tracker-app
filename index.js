import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
import flatpickr from "flatpickr";

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const database = process.env.DB_NAME;
const password = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

const db = new pg.Client({
  user: user,
  host: host,
  database: database,
  password: password,
  port: parseInt(dbPort),
});

db.connect();

let books = [];

async function getBooks() {
  try {
    const result = await db.query("SELECT * FROM books");
    books = result.rows;
  } catch (err) {
    console.log(err);
  }
}

async function getBook(id) {
  try {
    const result = await db.query("SELECT * FROM books WHERE id = $1", [id]);
    return result.rows;
  } catch (err) {
    console.log(err);
  }
}

app.get("/", async (req, res) => {
  const sort = req.query.sort || "rating-desc";
  await getBooks();
  if (sort === "rating-desc") {
    books.sort((a, b) => b.rating - a.rating);
  } else if (sort === "rating-asc") {
    books.sort((a, b) => a.rating - b.rating);
  } else if (sort === "date-desc") {
    books.sort((a, b) => new Date(b.read_date) - new Date(a.read_date));
  } else if (sort === "date-asc") {
    books.sort((a, b) => new Date(a.read_date) - new Date(b.read_date));
  }
  res.render("index.ejs", { booksList: books, sort: sort });
});

app.get("/add", (req, res) => {
  res.render("add_edit.ejs");
});

app.get("/:id/edit", async (req, res) => {
  const book = await getBook(req.params.id);
  res.render("add_edit.ejs", { selectedBook: book[0] });
});

app.get("/:id/details", async (req, res) => {
  const book = await getBook(req.params.id);
  res.render("details.ejs", { selectedBook: book[0] });
});

app.post("/add", async (req, res) => {
  const title = req.body.title;
  const author = req.body.author;
  const date = req.body.date;
  const notes = req.body.notes;
  const rating = req.body.rating;
  const isbn = req.body.isbn;

  try {
    await db.query(
      "INSERT INTO books (name, author, read_date, notes, rating, isbn) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, date, notes, rating, isbn]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/:id/edit", async (req, res) => {
  const bookId = req.params.id;
  const title = req.body.title;
  const author = req.body.author;
  const date = req.body.date;
  const notes = req.body.notes;
  const rating = req.body.rating;
  const isbn = req.body.isbn;
  try {
    await db.query(
      "UPDATE books SET name = $1, author = $2, read_date = $3, notes = $4, rating = $5, isbn = $6 WHERE id = $7",
      [title, author, date, notes, rating, isbn, bookId]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.get("/:id/delete", async (req, res) => {
  const bookId = req.params.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookId]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.locals.formatMonthYear = function (dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

app.locals.formatDateISO = function (dateString) {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
