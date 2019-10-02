// Helper functions

// Creates a random alphanumeric string to be used as key
const generateRandomString = stringLength => {
  const baseChar = [[65, 90], [97, 122], [48, 57]];
  const result = [];
  for (let i = 0; i < stringLength; i++) {
    const randomChars = baseChar.map(x => String.fromCharCode(x[0] + getRandomTo(x[1] - x[0])));
    result.push(randomChars[getRandomTo(2)]);
  }
  return result.join('');
};
// Generates a random number from 0 to a given top limit
const getRandomTo = number => Math.floor(Math.random() * (number + 1));

// Finds out if the given pair key-value strings are present in a given object
const isFieldValueByKey = (object, key, value) => {
  let res = false;
  Object.keys(object).map(k => {
    if (object[k][key] === value) res = true;
  });
  return res;
};

// Retrieves an ID(key) from a pair key-value data
const getIdByValue = (object, key, value) => {
  let keyId = undefined;
  Object.keys(object).map(k => {
    if (object[k][key] === value) keyId = k;
  });
  return keyId;
};

// Gets all the URLs for a given user
const urlsForUser = (object, userID) => {
  let urls = [];
  Object.keys(object).map(k => {
    if (object[k].userID === userID) {
      urls.push({ shortURL: k,
        longURL: object[k].longURL,
        date: object[k].date,
        visits: object[k].visits,
        uniqueVisits: object[k].uniqueVisits,
      });
    }
  });
  return urls;
};

// Writes a message to a global variable in the app(Express) object so it could be printed from the templates
const writeMessage = (app, type, msg) => {
  app.locals.message = { type, msg };
};

// Resets the messages so templates don't display wrong messages
const resetMessage = (app) => {
  setTimeout(() => app.locals.message = null, 200);
};

module.exports = {
  generateRandomString,
  isFieldValueByKey,
  getIdByValue,
  urlsForUser,
  writeMessage,
  resetMessage
};