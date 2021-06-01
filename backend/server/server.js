const express = require("express");
const models = require("./models");
const expressGraphQL = require("express-graphql").graphqlHTTP; // (1)
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = require("../config/keys").MONGO_URI;
const schema = require("./schema/schema");

const app = express();

if (!db) {
  throw new Error("You must provide a string to connect to MongoDB Atlas");
}

mongoose
  // The configuration object we pass into connect()
  // prevents an error being thrown by the latest release of MongoDB's driver
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

// We use body-parser in order to be able to parse
// incoming requests in middleware before they are handled
app.use(bodyParser.urlencoded({ extended: false })); // (2)
app.use(bodyParser.json());

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);

module.exports = app;

/*----------------------------------------------------------------------------*/

/*

(1) Layer of abstraction, or middleware, that we set up between Express and
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

(2) Setup some middleware for body parser.

This middleware will parse incoming JSON requests, fail descriptively, and make
form data available in `req.body`.

*/
