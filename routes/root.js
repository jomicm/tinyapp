// Imports
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();

// Helper functions
const { generateRandomString, urlsForUser, writeMessage, resetMessage } = require('../helpers/helpers');
const { validateUser, validatePassword, validateUserExists, validateIfNewUser} = require('../helpers/validations');

// Global Variables
const urlDatabase = {};
const users = {};

// Middlewares > My middlware to reset messages continuosly
app.use((req, res, next) => {
  resetMessage(app);
  next();
});

//#region allRoutes
// GET > Redirects to main link table
app.get("/", (req, res) => {
  res.redirect('/urls');
});
// GET > Renders the main link table to a valid user
app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const userURLS = urlsForUser(urlDatabase, req.session.user_id);
  let templateVars = { urls: userURLS, user };
  // If the user is not logged in, redirect to login
  if (validateIfNewUser(res, user, app)) return;
  // If user has no records, show a message to encourage him to add records
  if (!userURLS.length) {
    writeMessage(app, 'info', "It looks like you don't have URLS yet. First add some cool URLs!");
  }
  res.render('urls_index', templateVars);
});
// GET > Renders template to create a new URL
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  // If the user is not logged in, redirect to login
  if (validateIfNewUser(res, user, app)) return;
  let templateVars = { user };
  res.render("urls_new", templateVars);
});
// GET > Renders the information template using a shortURL
app.get('/urls/:shortURL', (req, res) => {
  if (!validateUserExists(req, res, users, urlDatabase))  return;
  const user = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user,
    uniqueVisits: urlDatabase[req.params.shortURL].uniqueVisits,
  };
  res.render('urls_show', templateVars);
});
// GET > Redirects to longURL from shortURL
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.status(404).send('The shortURL does not exist.');
    return;
  }
  // Get any visit
  urlDatabase[req.params.shortURL].visits = Number(urlDatabase[req.params.shortURL].visits) + 1;
  // Get unique visits based on cookies for every user
  let uniqueVisitorCookie = req.session.uniqueVisitor;
  
  if (!uniqueVisitorCookie) {
    // Add unique visitors id to the array to count length when displayed
    const uniqueVisitorID = generateRandomString(6);
    req.session.uniqueVisitor = uniqueVisitorID;
    urlDatabase[req.params.shortURL].uniqueVisits.push({ id: uniqueVisitorID, timestamp: new Date() });
  } else {
    const found = urlDatabase[req.params.shortURL].uniqueVisits.filter(visitors => visitors.id === uniqueVisitorCookie);
    found.timestamp = new Date();
  }
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});
// POST > Adds a new URL
app.post('/urls', (req, res) => {
  const randomShort = generateRandomString(6);
  urlDatabase[randomShort] = { longURL: req.body.longURL, userID: req.session.user_id, date: new Date(), visits: 0, uniqueVisits: [] };
  res.redirect('/urls/' + randomShort);
});
// DELETE > Deletes a URL from a valid user
app.delete('/urls/:shortURL/delete', (req, res) => {
  // If validation fails then return otherwise continue
  if (!validateUserExists(req, res, users, urlDatabase)) return true;
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});
// PUT > Updates an existing URL for a valid user
app.put('/urls/:shortURL', (req, res) => {
  // If validation fails then return otherwise continue
  if (!validateUserExists(req, res, users, urlDatabase)) return true;
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});
// POST > Logs out the user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});
// GET > Renders registration template
app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = { user };
  res.render("urls_register", templateVars);
});
// POST > Creates a new user
app.post('/register', (req, res) => {
  // If validation fails then return otherwise continue
  if (!validateUser(res, req.body, users, true, app)) return;
  const id = generateRandomString(6);
  users[id] = { id, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  // eslint-disable-next-line camelcase
  req.session.user_id = id;
  res.redirect('/urls');
});
// GET > Renders login template
app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});
// POST > Logs in a user if valid information was received
app.post('/login', (req, res) => {
  // If validation fails then return otherwise continue
  if (!validateUser(res, req.body, users, false, app)) return;
  const userId = validatePassword(res, users, 'email', req.body, app);
  // If validation of password fails then return otherwise continue
  if (!userId) return;
  // eslint-disable-next-line camelcase
  req.session.user_id = userId;
  res.redirect('/urls');
});
// GET > Routes all non existing routes to send NOT FOUND template
app.get('/*', (req, res) => {
  res.status(404);
  res.render('urls_notfound');
});
//#endregion allRoutes
module.exports = app;
