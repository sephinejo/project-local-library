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
const booksConainer = document.querySelector('#books-container');
const bookData = document.querySelector('#book-data');
const bookDataContainer = document.querySelector('#book-data-container');
const accountsContainer = document.querySelector('#accounts-container');
const accountData = document.querySelector('#account-data');
const accountDataContainer = document.querySelector('#account-data-container');

fetchBooks();
fetchAccounts();
fetchAuthors();
listMostCommonGenres();
listMostPopularBooks();

// const books = fetchBooks();

// countBooksBorrowed(books);
// listMostCommonGenres(books);
// listMostPopularBooks(books);

async function fetchBooks() {
  try {
    const res = await fetch('../data/books.json');
    const data = await res.json();

    let books = [...data.booksData];

    booksTotal ? (booksTotal.textContent = `${books.length}`) : '';

    // countBooksBorrowed(books);
    // listMostCommonGenres(books);
    // listMostPopularBooks(books);

    return books;
  } catch (err) {
    console.error(err);
  }
}

async function fetchAccounts() {
  try {
    const res = await fetch('../data/accounts.json');
    const data = await res.json();

    let accounts = [...data.accountsData];

    accountsTotal
      ? (accountsTotal.textContent = `${data.accountsData.length}`)
      : '';

    return accounts;
  } catch (err) {
    console.error(err);
  }
}

async function fetchAuthors() {
  try {
    const res = await fetch('../data/authors.json');
    const data = await res.json();

    let authors = [...data.authorsData];

    return authors;
  } catch (err) {
    console.error(err);
  }
}

async function countBooksBorrowed(books) {
  try {
    const borrowedBooks = await books.filter(
      (book) => book.borrows[0].returned === false
    );
    booksBorrowed ? (booksBorrowed.textContent = borrowedBooks.length) : '';
  } catch (err) {
    console.error(err);
  }
}

async function listMostCommonGenres() {
  try {
    const books = await fetchBooks();
    const genresCount = {};
    books.forEach(({ genre }) => {
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
      mostCommonGenresContainer?.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

async function listMostPopularBooks() {
  try {
    const books = await fetchBooks();
    let topFive = [];
    let topFiveTitles = [];
    books.forEach(({ title, borrows }) => {
      const currentObj = { title, borrows: borrows.length };
      topFive.push(currentObj);
    });

    topFive = topFive.sort((a, b) => b.borrows - a.borrows).slice(0, 5);
    topFiveTitles = topFive.map((book) => book.title);

    let topFiveBooks = [];
    books.filter((book) => {
      if (topFiveTitles.includes(book.title)) topFiveBooks.push(book);
    });
    listMostPopularAuthors(topFiveBooks);

    return topFive.forEach(({ title, borrows }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `${title} <span class="text-info fw-bold">(${borrows} borrows)</span>`;
      mostPopularBooksContainer?.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}
async function listMostPopularAuthors(topFiveBooks) {
  try {
    let authors = await fetchAuthors();
    let topFiveAuthors = [];

    for (let i = 0; i < authors.length; i++) {
      for (let j = 0; j < topFiveBooks.length; j++) {
        if (authors[i].id === topFiveBooks[j].authorId) {
          const currentObj = {
            firstName: authors[i].name.first,
            lastName: authors[i].name.last,
            borrows: topFiveBooks[j].borrows.length,
          };
          topFiveAuthors.push(currentObj);
        }
      }
    }

    topFiveAuthors = topFiveAuthors.sort((a, b) => b.borrows - a.borrows);

    return topFiveAuthors.forEach(({ firstName, lastName, borrows }) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `${firstName} ${lastName} <span class="text-info fw-bold">(${borrows} borrows)</span>`;
      mostPopularAuthorsContainer?.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// Stats by Book Page
displayAllBooks();

async function displayAllBooks() {
  try {
    const books = await fetchBooks();
    books.forEach((book) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<button id='book-${
        book.id
      }' class='text-decoration-none text-success d-inline border-0 bg-transparent book-btn'>${
        book.title
      }</button>
      <span
        class='${
          book.borrows[0].returned
            ? 'bg-info-subtle text-black'
            : 'bg-black text-white'
        } fw-bold p-1 ms-1 rounded'
        style='font-size: 12px'
      >
        ${book.borrows[0].returned ? 'Returned' : 'LoanedOut'}
      </span>`;
      booksConainer?.appendChild(li);
    });

    const bookBtns = document.querySelectorAll('.book-btn');
    bookBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        bookData.classList.contains('d-none')
          ? bookData.classList.remove('d-none')
          : '';
        displayBookData(e.target.textContent.trim());
      });
    });
  } catch (err) {
    console.error(err);
  }
}

async function displayBookData(title) {
  try {
    const books = await fetchBooks();
    const authors = await fetchAuthors();
    const accounts = await fetchAccounts();

    const book = books.find((book) => book.title === title);
    const author = authors.find((author) => author.id === book.authorId);

    bookDataContainer.innerHTML = '';

    const bookArticle = document.createElement('article');
    bookArticle.classList = 'row card p-0';
    bookArticle.innerHTML = `<h3 class="card-header py-3">
        ${book.title}
        </h3>
        <p class="p-3 pb-0 m-0">
        Written by ${author.name.first} ${author.name.last}</span>
        </p>
        <p class="p-3 m-0">
        Genre: <span id="book-genre" class="text-info">${book.genre}</span>
        </p>`;

    bookDataContainer.appendChild(bookArticle);

    const borrowersArticle = document.createElement('article');
    borrowersArticle.classList = 'row card p-0';
    borrowersArticle.innerHTML = `<h3 class="card-header py-3">Recent Borrowers</h3>`;
    for (let i = 0; i < book.borrows.length; i++) {
      for (let j = 0; j < accounts.length; j++) {
        if (book.borrows[i].id === accounts[j].id) {
          borrowersArticle.innerHTML += `
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <span id="book-borrower">${accounts[j].name.first} ${
            accounts[j].name.last
          }</span>
              <span
                class="${
                  book.borrows[i].returned
                    ? 'bg-info-subtle text-black'
                    : 'bg-black text-white'
                } fw-bold p-1 ms-1 rounded"
                style="font-size: 12px"
                >${book.borrows[i].returned ? 'Returned' : 'Loaned Out'}</span
              >
            </li>
          </ul>`;

          bookDataContainer.appendChild(borrowersArticle);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Stats by Account Page
displayAllAccounts();

async function displayAllAccounts() {
  try {
    const accounts = await fetchAccounts();

    accounts.forEach((account) => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.innerHTML = `<button id='account-${account.id}' class='text-decoration-none text-success d-inline border-0 bg-transparent account-btn'>${account.name.last}, ${account.name.first}</button>
      `;
      accountsContainer?.appendChild(li);
    });

    const accountBtns = document.querySelectorAll('.account-btn');

    accountBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        accountData.classList.contains('d-none')
          ? accountData.classList.remove('d-none')
          : '';
        displayAccountData(e.target.id.split('-')[1]);
      });
    });
  } catch (err) {
    console.error(err);
  }
}

async function displayAccountData(accountId) {
  try {
    const books = await fetchBooks();
    const authors = await fetchAuthors();
    const accounts = await fetchAccounts();

    const account = await accounts?.find((account) => account.id === accountId);
    const book = await books?.find((book) => book.borrows[0].id === accountId);
    const author = await authors?.find((author) => book.authorId === author.id);

    let borrowedTimes = 0;
    for (let i = 0; i < books.length; i++) {
      for (let j = 0; j < books[i].borrows.length; j++) {
        books[i].borrows[j].id === accountId && borrowedTimes++;
      }
    }

    accountDataContainer.innerHTML = '';

    const accountArticle = document.createElement('article');
    accountArticle.classList = 'row card p-0';
    accountArticle.innerHTML = `<h3 class="card-header py-3">
        ${account.name.first} ${account.name.last}
        </h3>
        <p class="p-3 pb-0 m-0 fw-bold">
          Age: <span class="fw-normal">${account.age}</span>
        </p>
        <p class="p-3 pb-0 m-0 fw-bold">
          Company: <span class="fw-normal">${account.company}</span>
        </p>
        <p class="p-3 pb-0 m-0 fw-bold">
          Email: <span class="fw-normal">${account.email}</span>
        </p>
        <p class="p-3 pb-0 m-0 fw-bold">
          Account Created:
          <span class="fw-normal">${account.registered}</span>
        </p>
        <p class="p-3 m-0">
          Borrowed from the library
          <span class="text-success fw-bold">${borrowedTimes}</span> times.
        </p>`;

    accountDataContainer?.appendChild(accountArticle);

    const booksInPossessionArticle = document.createElement('article');
    booksInPossessionArticle.classList = 'row card p-0';
    booksInPossessionArticle.innerHTML = `<h3 class="card-header py-3">Books in Possession</h3>
    <p class="p-3 m-0 fw-bold">
      ${book.title}
      <span class="fw-normal">by ${author.name.first} ${author.name.last}</span>
    </p>`;

    accountDataContainer?.appendChild(booksInPossessionArticle);
  } catch (err) {
    console.error(err);
  }
}
