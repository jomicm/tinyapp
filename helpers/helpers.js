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
  let keyId = undefined;
  Object.keys(object).map(k => {
    if (object[k][key] === value) keyId = k;
  });
  return keyId;
};

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

const writeMessage = (app, type, msg) => {
  app.locals.message = { type, msg };
};

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