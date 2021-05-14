const express = require("express");
const app = express();
const mongoose = require('mongoose');
const db = require('./config/keys').mongoURI;
const bodyParser = require('body-parser');

const users = require("./routes/api/users");
const tweets = require("./routes/api/tweets");

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("Hello World")); /* (1) */

app.use(bodyParser.urlencoded({ extended: false })); /* (2) */
app.use(bodyParser.json());

app.use("/api/users", users);
app.use("/api/tweets", tweets);

const port = process.env.PORT || 5000; /* (3) */

app.listen(port, () => console.log(`Server is running on port ${port}`)); /* (4) */

/*----------------------------------------------------------------------------*/

/*
(1) This creates a new Express server. Now let's setup a basic route so that we
can render some information on our page.

(2) Setup some middleware for body parser.

(3) Before we can run the server, we need to tell our app which port to run on. 
Keeping in mind that we will later be deploying our app to Heroku, which 
requires us to run our server on process.env.PORT, add the following line to 
app.js.

Locally our server will now run on localhost:5000.

(4) Finally, let's tell Express to start a socket and listen for connections on 
the path. Do so by adding the following line to your file.

This will also log a success message to the console when our server is 
running successfully. 
*/