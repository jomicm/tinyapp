const express = require('express');
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
  //res.send('Your new string is: ' + shortURL);
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