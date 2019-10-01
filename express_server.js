const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "pp"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app running on port: ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase, user };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post('/urls', (req, res) => {
  const randomShort = generateRandomString(6);
  urlDatabase[randomShort] = req.body.longURL;
  res.redirect('/urls/' + randomShort);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  console.log('PUT> ', req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

// app.post('/login', (req, res) => {
//   console.log('LOGIN> ', req.body.username);
//   //res.cookie('username', req.body.username);
//   res.cookie('user_id', req.body.username);
//   res.redirect('/urls');
// });

app.post('/logout', (req, res) => {
  //const coo = req.cookies["user_id"];
  //console.log('LOGOUT> COOKIE> ', coo);
  //res.clearCookie('username');
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user };
  res.render("urls_register", templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Empty fields not allowed');
    return;
  }
  const valid = isFieldValueByKey(users, 'email', req.body.email);
  console.log('EMail validation for', req.body.email, valid);
  if (valid) {
    res.status(400).send('Email already exists');
    return;
  }
  const id = generateRandomString(6);
  users[id] = { id, email: req.body.email, password: req.body.password };
  // console.log('users', users);
  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send('Empty fields not allowed');
    return;
  }
  const valid = isFieldValueByKey(users, 'email', req.body.email);
  if (!valid) {
    res.status(403).send('User does not exist');
    return;
  }
  const userId = getIdByValue(users, 'email', req.body.email);
  const userPassword = users[userId]['password'];
  const validPassword = userPassword === req.body.password;
  if (!validPassword) {
    res.status(403).send('Invalid Password');
    return;
  }
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

const generateRandomString = stringLength => {
  const baseChar = [[65, 90], [97, 122], [48, 57]];
  const result = [];
  for (let i = 0; i < stringLength; i++) {
    const randomChars = baseChar.map(x => String.fromCharCode(x[0] + getRandomTo(x[1] - x[0])));
    result.push(randomChars[getRandomTo(2)]);
  }
  return result.join('');
};
const getRandomTo = number => Math.floor(Math.random() * (number + 1));

const isFieldValueByKey = (object, key, value) => {
  let res = false;
  Object.keys(object).map(k => {
    if (object[k][key] === value) res = true;
  });
  return res;
};

const getIdByValue = (object, key, value) => {
  let keyId = '';
  Object.keys(object).map(k => {
    if (object[k][key] === value) keyId = k;
  });
  return keyId;
};