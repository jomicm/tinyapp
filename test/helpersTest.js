const { assert } = require('chai');
const { getIdByValue } = require('../helpers/helpers.js/index.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIdByValue(testUsers, 'email', 'user2@example.com');
    const expectedOutput = "user2RandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = getIdByValue(testUsers, 'email', 'thisisnotanemail');
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.strictEqual(user, expectedOutput);
  });
});