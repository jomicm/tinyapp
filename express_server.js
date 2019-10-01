const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
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
  },
  "genrandom": {
    id: "genrandom",
    email: "a@a.mx",
    password: "a"
  }
};

// app.get('/', (req, res) => {
//   res.send('Hello');
// });

app.listen(PORT, () => {
  console.log(`Example app running on port: ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.get("/", (req, res) => {
  res.redirect('/urls');
});

// GET AND RENDER MAIN URLS TABLE
app.get('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const userURLS = urlsForUser(urlDatabase, req.cookies["user_id"]);
  console.log('userURLS', userURLS);
  let templateVars = { urls: userURLS, user };
  res.render('urls_index', templateVars);
});

// GET AND RENDER NEW URL TEMPLATE
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    res.redirect('/login');
    return;
  }
  let templateVars = { user };
  res.render("urls_new", templateVars);
});

// GET SPECIFIC URL
app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
  res.render('urls_show', templateVars);
});

// REDIRECT ANY TINY URL
app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// POST a new URL
app.post('/urls', (req, res) => {
  const randomShort = generateRandomString(6);
  urlDatabase[randomShort] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  console.log('urlDatabase', urlDatabase);
  res.redirect('/urls/' + randomShort);
});

// DELETE a URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user || urlDatabase[req.params.shortURL].userID !== user.id) {
    res.status(401).send('Unauthorized');
    return;
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// PUT a URL
app.post('/urls/:id', (req, res) => {
  const user = users[req.cookies["user_id"]];
  //const valid = isFieldValueByKey(users, 'email', req.body.email);
  if (!user || urlDatabase[req.params.id].userID !== user.id) {
    res.status(401).send('Unauthorized');
    return;
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// POST LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// GET AND RENDER REGISTER
app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user };
  res.render("urls_register", templateVars);
});

// POST a REGISTRY
app.post('/register', (req, res) => {
  let error = '';
  error = !req.body.email || !req.body.password ? 'Empty fields not allowed' : error;
  error = valid ? 'Email already exists' : error;
  if (error) {
    res.status(400).send(error);
    return;
  }
  const id = generateRandomString(6);
  users[id] = { id, email: req.body.email, password: req.body.password };
  res.cookie('user_id', id);
  res.redirect('/urls');
});

// GET AND RENDER LOGIN
app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = { user };
  res.render("urls_login", templateVars);
});

// POST LOGIN
app.post('/login', (req, res) => {
  let error = '';
  error = !req.body.email || !req.body.password ? 'Empty fields not allowed. ' : error;
  const valid = isFieldValueByKey(users, 'email', req.body.email);
  error = !valid && !error ? 'User does not exist. ' : error;
  if (error) {
    res.status(400).send(error);
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

// HELPER FUNCTIONS (MAYBE THEY SHOULD BE ELSEWHERE)
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

const urlsForUser = (object, userID) => {
  let urls = [];
  Object.keys(object).map(k => {
    if (object[k].userID === userID) urls.push({ shortURL: k, longURL: object[k].longURL });
  });
  return urls;
};