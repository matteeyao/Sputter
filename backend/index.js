/* Configure Express */
const express = require("express"); // (1)

const app = require("./server/server");

const passport = require('passport'); // (6)

const users = require("./routes/api/users");
const posts = require("./routes/api/posts");

// app.get("/", (req, res) => res.send("Hello World")); // (2)

app.use(passport.initialize());
require('./config/passport')(passport);

app.use("/api/users", users);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000; // (4)

app.listen(port, () => console.log(`Server is running on port ${port}`)); // (5)

/*----------------------------------------------------------------------------*/

/*

(1) Express itself is a module, as are the middleware and database libraries that
we use in our Express applications.

(2) This creates a new Express server. Now let's setup a basic route so that we
can render some information on our page.

(4) Before we can run the server, we need to tell our app which port to run on. 
Keeping in mind that we will later be deploying our app to Heroku, which 
requires us to run our server on process.env.PORT, add the following line to 
app.js.

Locally our server will now run on localhost:5000.

(5) Finally, let's tell Express to start a socket and listen for connections on 
the path. Do so by adding the following line to your file.

This will also log a success message to the console when our server is 
running successfully.

(6) Most of the logic for our login functionality is complete. However, we will
need to use Passport to authenticate our token and construct private routes.
Recall that we set up our `register` and `login` routes to return `jwt` web
token in the response, and we will be saving that using our application on the
frontend. Eventually, we will want to send the web token back in the header of
every API request to our backend. Passport is able to authenticate that token
using different "strategies". For this project, we will be using `JwtStrategy`
to authenticate our web token.

*/
