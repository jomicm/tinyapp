# TinyApp Project (Lighthouse Labs)

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product
- Login of new user
!["Login a user"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/login.png)
- List of tiny URLs of a logged user
!["List of URLs"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/urls-list-extended.png)
- Add new URL
!["Add new URL"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/new-url.png)
- You can edit at any time your URLs (You'll also see a table of visits)
!["Edit a URL"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/edit-url-table.png)
- Welcome new users, just be sure to use an email which does not exist
!["Register new users"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/register-error.png)
- Once a user is registered, start by adding new links!
!["Add new URLs"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/urls-empty.png)
- Not found template if you get lost
!["Add new URLs"](https://raw.githubusercontent.com/jomicm/tinyapp/master/docs/not-found.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- method-override
- morgan

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Extended Functionality

- Added date and time when the URL was created.
- Count all visits including anonymous ones.
- Count unique visits of all visitors.
- Added a table of visits when you edit a link.
- `method-override` included to use `PUT` and `DELETE` in Express.
- Bootstrap alerts included to handle messages (success, info, danger) to the user.
- Added redirection to all Not Found routes

## Authors

* **Miguel Cruz** - *Initial work* -