'use strict';

const booksTotal = document.querySelector('#books-total');
const accountsTotal = document.querySelector('#accounts-total');
const booksBorrowed = document.querySelector('#books-borrowed');
const mostCommonGenresContainer = document.querySelector(
  '#most-common-genres-container'
);
const mostPopularBooksContainer = document.querySelector(
  '#most-popular-books-container'
);
const mostPopularAuthorsContainer = document.querySelector(
  '#most-popular-authors-container'
);

fetchBooks();
fetchAccounts();
fetchAuthors();

async function fetchBooks() {
  try {
    const res = await fetch('../data/books.json');
    const data = await res.json();
    booksTotal ? (booksTotal.textContent = `${data.booksData.length}`) : '';

    countBooksBorrowed(data.booksData);
    listMostCommonGenres(data.booksData);
    listMostPopularBooks(data.booksData);
  } catch (err) {
    console.error(err);
  }
}

async function fetchAccounts() {
  try {
    const res = await fetch('../data/accounts.json');
    const data = await res.json();
    accountsTotal
      ? (accountsTotal.textContent = `${data.accountsData.length}`)
      : '';
  } catch (err) {
    console.error(err);
  }
}

async function fetchAuthors() {
  try {
    const res = await fetch('../data/authors.json');
    const data = await res.json();

    return data.authorsData;
  } catch (err) {
    console.error(err);
  }
}

async function countBooksBorrowed(books) {
  try {
    const borrowedBooks = await books.filter(
      (book) => book.borrows[0].returned === false
    );
    return borrowedBooks
      ? (booksBorrowed.textContent = borrowedBooks.length)
      : '';
  } catch (err) {
    console.error(err);
  }
}

async function listMostCommonGenres(books) {
  try {
    const genresCount = {};
    await books.forEach(({ genre }) => {
      if (genresCount.hasOwnProperty(genre)) {
        genresCount[genre] += 1;
      } else {
        genresCount[genre] = 1;
      }
    });

    const genresArr = Object.keys(genresCount);
    let topFive = [];
    genresArr.forEach((genre) => {
      let count = genresCount[genre];
      let currentObj = { genre, count };
      topFive.push(currentObj);
    });

    topFive = topFive.sort((a, b) => b.count - a.count).slice(0, 5);

    return topFive.forEach(({ genre, count }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `${genre} <span class="text-info fw-bold">(${count})</span>`;
      mostCommonGenresContainer.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function listMostPopularBooks(books) {
  try {
    let topFive = [];
    let topFiveTitles = [];
    await books.forEach(({ title, borrows }) => {
      const currentObj = { title, borrows: borrows.length };
      topFive.push(currentObj);
    });

    topFive = topFive.sort((a, b) => b.borrows - a.borrows).slice(0, 5);
    topFiveTitles = topFive.map((book) => book.title);

    let topFiveBooksObj = [];
    books.filter((book) => {
      if (topFiveTitles.includes(book.title)) topFiveBooksObj.push(book);
    });
    listMostPopularAuthors(topFiveBooksObj);

    return topFive.forEach(({ title, borrows }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `${title} <span class="text-info fw-bold">(${borrows} borrows)</span>`;
      mostPopularBooksContainer.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function listMostPopularAuthors(topFiveBooks) {
  try {
    const authors = await fetchAuthors();
    let topFiveAuthors = [];
    topFiveBooks.map((book) => {
      const author = authors.find((author) => author.id === book.authorId);
      const currentObj = {
        firstName: author.name.first,
        lastName: author.name.last,
        borrows: book.borrows.length,
      };
      topFiveAuthors.push(currentObj);
    });
    console.log(topFiveAuthors);

    topFiveAuthors = topFiveAuthors.sort((a, b) => b.borrows - a.borrows);

    return topFiveAuthors.forEach(({ firstName, lastName, borrows }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `${firstName} ${lastName} <span class="text-info fw-bold">(${borrows} borrows)</span>`;
      mostPopularAuthorsContainer.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}
