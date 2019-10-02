// Imports
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const morgan = require('morgan');
const router = require('./routes/root');

// Initializations
const app = express();
const PORT = 8080;

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['lallavemasseguradelmundo'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
// Settings
app.set("view engine", "ejs");
// Server StartUp
app.listen(PORT, () => {
  console.log(`TinyApp is running on port: ${PORT}!`);
});
// Set all routers to a especific router
app.use('/', router);