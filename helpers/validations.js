const bcrypt = require('bcrypt');
const {isFieldValueByKey, getIdByValue, writeMessage} = require('./helpers');

// Uses function (validateParams) to determine if a user is authorized or not
const validateUser = (res, params, users, validMail, app) => {
  const paramValidations = validateUserParams(params, users, validMail);
  if (!paramValidations.valid) {
    writeMessage(app, 'danger', paramValidations.errorMessage);
    res.redirect(validMail ? '/register' : '/login');
    return false;
  }
  return true;
};

// Validate if register/login templates have wrong input information
const validateUserParams = (params, users, validMail) => {
  if (!params.email || !params.password) {
    return ({valid: false, errorMessage: 'Empty fields not allowed'});
  }
  const valid = isFieldValueByKey(users, 'email', params.email);
  if (valid === validMail) {
    return ({valid: false, errorMessage: validMail ? 'Email already exists' : 'User does not exist' });
  } else {
    return ({valid: true, errorMessage: null});
  }
};

// Validates a password of a given user using bcrypt
const validatePassword = (res, users, key, params, app) => {
  const userId = getIdByValue(users, key, params.email);
  const userPassword = users[userId].password;
  const validPassword = bcrypt.compareSync(params.password, userPassword);
  if (!validPassword) {
    writeMessage(app, 'danger', 'Invalid Password');
    res.redirect('/login');
    return null;
  }
  return userId;
};

// Validate if a given user exists
const validateUserExists = (req, res, users, urlDatabase) => {
  const user = users[req.session.user_id];
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/notfound');
    return false;
  }
  if (!user || urlDatabase[req.params.shortURL].userID !== user.id) {
    res.status(401).send('Unauthorized');
    return false;
  }
  return true;
};

// Validate if a user is new to our site
const validateIfNewUser = (res, user, app) => {
  if (!user) {
    writeMessage(app, 'info', "First you have to login or signup if you don't have an account!");
    res.redirect('/login');
    return true;
  }
  return false;
};

module.exports = {
  validateUser,
  validatePassword,
  validateUserExists,
  validateIfNewUser
};