const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

// Helper functions
const { generateRandomString, urlsForUser, writeMessage, resetMessage } = require('./helpers/helpers');
const { validateUser, validatePassword, validateUserExists, validateIfNewUser} = require('./helpers/validations');

// Initializations
const app = express();
const PORT = 8080;
const urlDatabase = {};
const users = {};

// Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['lallavemasseguradelmundo'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
// My Middleware to Reset messages so next renders don't show false information
app.use((req, res, next) => {
  resetMessage(app);
  next();
});

// Settings
app.set("view engine", "ejs");

// Server StartUp
app.listen(PORT, () => {
  console.log(`TinyApp running on port: ${PORT}!`);
});

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
  const user = users[req.session.user_id];
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL, user
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
  const user = users[req.session.user_id];
  if (user) {
    // Add unique visitors id to the array to count length when displayed
    let uniqueVisits = [...new Set([...urlDatabase[req.params.shortURL].uniqueVisits, user])];
    urlDatabase[req.params.shortURL].uniqueVisits = uniqueVisits;
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