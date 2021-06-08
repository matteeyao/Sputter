# Online store app —— server

For today's project, we'll be setting up the server for a full stack application with user authentication built using Node, Express, MongoDB, and GraphQL. We are creating an online store where users can browse products and add them to their cart. There will be three models in our application consisting of:

| PRODUCTS    	| CATEGORY 	| USER      	|
|-------------	|----------	|-----------	|
| Name        	| Name     	| Name      	|
| Description 	| Products 	| Email     	|
| Price       	|          	| Password  	|
| Weight      	|          	| Timestamp 	|
| User        	|          	|           	|
| Category    	|          	|           	|

## Phase A: Project initialization

Let's start by laying the groundwork for our Node application.

* Create a new directory for this project called `online-store`

* From within the project directory, run `npm init`
 
* Follow the prompts to fill out information about your project. Choose the default entry point of `index.js`

* Let's install some packages we know we'll need. Run `npm install express express-graphql mongoose body-parser --save`

### Express setup

Create a file in your root directory called `index.js` and add the following code:

```js
// index.js
const express = require("express");

const app = express();

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```

Once you've saved the file, run `node index.js` to ensure that your success message is logged in the console.

### Connecting to MongoDB

Before we start creating our backend, let's set up our database. Follow these steps to setup your database:

* Go to the website and create an account

* Click Build a cluster

* Select Amazon Web Services as your cloud provider

* Choose N Virginia `US-East-1` as your region

* Leave everything else as defaults

* Wait for the cluster to be created (7-10 min)

* Click the `Connect` button on the newly created cluster

* Click `Add a different IP address` and enter `0.0.0.0/0` to allow connections from any IP

* Next create a new user

* Give them whatever username you like I.E. `dev` *Click the `Autogenerate Secure Password` button and save the password for later* DO NOT COMMIT THE PASSWORD

* Click chose a connection method

* Click `Connect Your Application`

* Copy and paste the connection string

* replace the `<username>` with the username we just created

* replace the `<password>` with the auto-generated password

* now that we have this connection string we want to save it somewhere it won’t be committed

Now, we must use Mongoose to connect to the database we have just created.

* Create a new directory called `config`

* Add a file to your new directory called `keys.js`

* Export an object from this file which contains your MongoDB Atlas connection string, configured w/ the username and password you have just created:

```js
module.exports = {
  MONGO_URI: "'mongodb+srv://<DBUser>:<password>@cluster.mongodb.net/DBNAME(online store)?retryWrites=true&w=majority'"
};
```

* Run `git init` from the root directory

* Create a `.gitignore` file and ignore both `/config` and `node_modules`

* Now is a good time to create a new repository on GitHub and connect your project so that you can begin making commits

Let's finish the now-familiar steps to get a basic server up and running.

* Create a new folder called `server`

* Create a file within your new directory called `server.js`

* Configure your server file to connect to Atlas:

```js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = require("../keys/secret.js").MONGO_URI;

const app = express();

if (!db) {
  throw new Error("You must provide a string to connect to MongoDB Atlas");
}

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

// remember we use bodyParser to parse requests into json
app.use(bodyParser.json());

module.exports = app;
```

Back in `index.js`, let's make sure to use the server configuration file we just created in place of the existing app constant:

```js
const app = require("./server/server");
```

Running `node index.js`, you should see the success message from MongoDB logged to the console.

### Creating the Models

Create a new `models` folder within your `server` directory to write models for `Product`, `Category`, and `User`. Let's write the `Product` model together:

```js
// server/models/Product.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "categories"
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: false
  }
});

module.exports = mongoose.model("products", ProductSchema);
```

Later on, we’ll be using a serverless computing service called `AWS Lambda` to generate random price data for our products. We'll be getting more into that later. For now all we need to know is that we don't need to include a `price` field just yet.

Write the `Category` and `User` models on your own. A category simply contains a name and an array of products. A user has a name, an email address, a date, and a password. The `date` will be a timestamp of when the user created an account by using `Date.now`.

Let's also put a minimum and maximum length constraint on the password:

```js
// server/models/User.js

const UserSchema = new Schema({
  //...
  password: {
    type: String,
    required: true,
    min: 8,
    max: 32
  }
});
```

Create an index file for your models which you can use to import them all into another file in one go:

```js
// server/models/index.js

require("./User");
require("./Category");
require("./Product");
```

## Phase B: Configuring GraphQL

## Installation

Now that we've set up the basics of Express and Mongo let's add GraphQL to our project. First, run `npm install graphql express-graphql` to install the dependencies you'll need.

### Category schema

So we know that in order to add GraphQL to your project we'll need to create a GraphQL schema. In order to create a GraphQL schema we'll need our Root Queries, and in order to write our Root Queries we will create a `GraphQLObjectType` for each resource from our database.

Let's first by writing the category type:

* Within the `server` directory, create a new folder called `schema`

* Within `schema`, create a new directory called `types`

* Within `types`, create a new file called `category_type.js`

* Like always, require `graphql`

* Recalling the Mongoose schema for our categories, import the types needed from graphql ―― `GraphQLObjectType`, `GraphQLString`, and `GraphQLID`

Now we can write the `Category` schema (we'll worry about the `products` field later):

```js
const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLID } = graphql;

const CategoryType = new GraphQLObjectType({
  name: "CategoryType",
  // remember we wrap the fields in a thunk to avoid circular dependency issues
  fields: () => ({
    _id: { type: GraphQLID },
    name: { type: GraphQLString }
  });
});

module.exports = CategoryType;
```

### Product type schema

Recall that products have an `_id`, `name`, `category`, `description`, and `weight`. Again, don't worry about the `cost` field for now ―― we will add that later.

### User schema

Users have an `_id`, `name`, and `email` ―― we don't need to be able to query for a user's password.

### Root queries

Now that we've finished all of our schema `types` we can write a `RootQuery` so you will be able to query each type of data. Recalling the schema for a root query, let's configure root queries for singular and multiple `users`, `categories`, or `products`. We've provided the `user` and `users` query for you ―― use those as a guideline for creating `categories` and `products`:

```js
// server/schema/types/root_query_type.js
const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull } = graphql;

const UserType = require("./user_type");

const User = mongoose.model("users");

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return User.find({});
      }
    },
    user: {
      type: UserType,
      args: { _id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(_, args) {
        return User.findById(args._id);
      }
    }
  })
});

module.exports = RootQueryType;
```

Create a new file within `schema` called `schema.js`. This is where we will put the finishing touches on configuring the schema to be passed to `express-graphql`:

```js
//schema/schema.js
const graphql = require("graphql");
const { GraphQLSchema } = graphql;

// import that lovely Root Query you just finished up and create your new schema!
const query = require("./types/root_query_type");

module.exports = new GraphQLSchema({
  query
});
```

### Server configuration

One last step before we have `GraphQL` up and running ―― we need to configure our server w/ the `expressGraphQL` middleware. Remember, the `expressGraphQL` middleware requires a `GraphQLSchema` instance so we'll pass in the schema just created.

Back in `server.js`, add the following code below the mongoose connection method and above the export line:

```js
// Make sure to require your models index at the top of the file
// Don't forget to import your schema from ./schema/schema
const expressGraphQL = require("express-graphql");

// ...
// use the expressGraphQL middleware to connect our GraphQLSchema to Express
app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
```

Before we get any further let's make our lives easier and setup Nodemon to watch our server. Run `npm install nodemon` and add a `dev` script to your `package.json`:

```js
// ...
"scripts": {
    "dev": "nodemon index.js"
},
// ...
```

Now, once you started your server, you can open `localhost:5000/graphql` and see your `GraphiQL` interface waiting. Let's write some mutations and seed some data so we can test all the queries we've written so far.

## Mutations setup

Within the `schema` directory, create a new file called `mutations.js`. Add the following code to this file:

```js
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt } = graphql;
const mongoose = require("mongoose");

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {}
});

module.exports = mutation;
```

Before moving on, import your mutation file into `schema.js`. We want to make sure our `GraphQLSchema` has both our queries and mutations. So we'll add the imported mutations into the schema object:

```js
module.exports = new GraphQLSchema({
  query,
  mutation
});
```

### Write mutations

In order to seed data for our application and be able to later make requests to change data in the frontend you’ll need to write a few mutations. Let's get to it! Complete these on your own:

* `newCategory`

* `deleteCategory`

* `newProduct`

* `deleteProduct`

Test these out in `GraphiQL` to make sure they work. So we have some data to play with seed 3 new categories and 3 new products. Now would be a good time to write a couple of nested queries to make sure your data is all interacting as it should.

