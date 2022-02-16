/* Configure Express */
const express = require("express"); // (1)
const app = express();

/* Configure MongoDB, Mongoose, etc. */
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
const bodyParser = require('body-parser');

const passport = require('passport'); // (6)

const users = require("./routes/api/users");
const posts = require("./routes/api/posts");

const User = require("./models/User");

const expressGraphQL = require("express-graphql").graphqlHTTP; // (7)
const schema = require("./schema/schema");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

// app.get("/", (req, res) => res.send("Hello World")); // (2)

app.use(passport.initialize());
require('./config/passport')(passport);

/* Use the bodyParser package to parse incoming requests into json */
app.use(bodyParser.urlencoded({ extended: false })); // (3)
app.use(bodyParser.json());

app.use("/graphql", expressGraphQL({
  schema,
  graphiql: true
}))

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

(3) Setup some middleware for body parser.

This middleware will parse incoming JSON requests, fail descriptively, and make
form data available in `req.body`.

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

(7) Layer of abstraction, or middleware, that we set up between Express and
GraphQL.

Once it is configures, `express-graphql` will allow us to define a GraphQL schema
and spin up the `GraphiQL` interface which we can use to write test queries on
our database. 

Please replace your expressGraphQL w/ graphqlHTTP as it was de-structured

Use: 

`const { graphqlHTTP } = require('express-graphql');`

or

`const expressGraphQL = require('express-graphql').graphqlHTTP;`

This is b/c a method called graphqlHTTP exist in the express-graphql module and
we are destructuring w/ another method name that does not exist in the module. 

*/