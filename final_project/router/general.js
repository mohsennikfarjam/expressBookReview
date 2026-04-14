const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Task 10: Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const get_books = new Promise((resolve, reject) => {
      resolve(books);
    });
    const bookList = await get_books;
    res.send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).send("Error fetching book list");
  }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const get_book = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
    const book = await get_book;
    res.send(JSON.stringify(book, null, 4));
  } catch (err) {
    res.status(404).send(err);
  }
});
  
// Task 12: Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const get_books_by_author = new Promise((resolve, reject) => {
      let results = [];
      for (let id in books) {
        if (books[id].author === author) {
          results.push(books[id]);
        }
      }
      resolve(results);
    });
    const results = await get_books_by_author;
    res.send(JSON.stringify(results, null, 4));
  } catch (error) {
    res.status(500).send("Error fetching books by author");
  }
});

// Task 13: Get all books based on title using async-await
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const get_books_by_title = new Promise((resolve, reject) => {
      let results = [];
      for (let id in books) {
        if (books[id].title === title) {
          results.push(books[id]);
        }
      }
      resolve(results);
    });
    const results = await get_books_by_title;
    res.send(JSON.stringify(results, null, 4));
  } catch (error) {
    res.status(500).send("Error fetching books by title");
  }
});

// ==== Axios Implementations for Tasks 10-13 ====

const axios = require('axios');

// Task 10: Get all books using Axios
const getAllBooksWithAxios = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// Task 11: Get book details by ISBN using Axios Promises
const getBookByISBNWithAxios = (isbn) => {
  return axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => response.data)
    .catch(error => console.error(error));
};

// Task 12: Get book details by Author using Axios async/await
const getBookByAuthorWithAxios = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

// Task 13: Get book details by Title using Axios async/await
const getBookByTitleWithAxios = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

// Add/Modify a book review
public_users.put('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  let review = req.query.review || req.body.review;
  if (req.session.authorization) {
      let username = req.session.authorization['username'];
      let book = books[isbn];
      if (book) {
          book.reviews[username] = review;
          return res.status(200).json({message: `Review for ISBN ${isbn} added/updated`});
      } else {
          return res.status(404).json({message: "Book not found"});
      }
  } else {
      return res.status(403).json({message: "User not logged in"});
  }
});

// Delete a book review
public_users.delete('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (req.session.authorization) {
      let username = req.session.authorization['username'];
      let book = books[isbn];
      if (book) {
          if (book.reviews[username]) {
              delete book.reviews[username];
              return res.status(200).json({message: `Review for ISBN ${isbn} deleted`});
          } else {
              return res.status(404).json({message: "No review found for this user"});
          }
      } else {
          return res.status(404).json({message: "Book not found"});
      }
  } else {
      return res.status(403).json({message: "User not logged in"});
  }
});


module.exports.general = public_users;
