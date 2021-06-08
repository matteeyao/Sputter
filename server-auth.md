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

The last mutation you'll write for now is `updateProductCategory`. Add the following static method to your Product model:

```js
// server/models/Product.js
ProductSchema.statics.updateProductCategory = (productId, categoryId) => {
  const Product = mongoose.model("products");
  const Category = mongoose.model("categories");

  return Product.findById(productId).then(product => {
    // if the product already had a category
    if (product.category) {
      // find the old category and remove this product from it's products
      Category.findById(product.category).then(oldcategory => {
        oldcategory.products.pull(product);
        return oldcategory.save();
      });
    }
    // find the Category and push this product in, as well as set this product's category
    return Category.findById(categoryId).then(newCategory => {
      product.category = newCategory;
      newCategory.products.push(product);

      return Promise.all([product.save(), newCategory.save()]).then(
        ([product, newCategory]) => product
      );
    });
  });
};
```

Utilize this method in your mutation to update the category for a project: `updateProductCategory`.

Don't worry about writing any mutations for users just yet ―― we will do this when we setup user authentication.

### Products belonging to categories

We'll add one last thing to our `CategoryType` before we move on. Add a static method to the `Category` mongoose model which returns all of the products belonging to that category. Now head back into `category_type.js` and add a field for `products` which resolves using the static method you just wrote (remember to return a new `GraphQLList` for an array).

## Phase C: User Authentication

We are going to follow a now-familiar pattern to add user authentication to our project using some of our favorite tools:

* `jsonwebtoken` ―― to generate the tokens

* `bcryptjs` ―― to salt and hash passwords

* `validator` ―― for database validations

```
npm install jsonwebtoken bcryptjs validator
```

### Secret key

We need to generate a secret key with which to sign our user's web tokens for authentication. You can write a random string on your own or we recommend using a [website](https://www.uuidgenerator.net/) that generates a string for you. Add the secret key to your `config/keys.js` object under the key `secretOrKey`.

### Validation

Users who register for our application are required to provide a name, email, and password. Users attempting to log in are only required to provide an email and a password. Before we attempt to create or look up a user based on the information they provided, we should perform some server-level validations to ensure the input itself is valid. For example, we want to make sure the user has provided us with a valid email address before we attempt to look up a user by the address. We will accomplish this using the `validator` library.

Within your `server` directory, create a new folder called `validation`. Our validations will be stored here. Unfortunately, `validator` does not provide us with a function to to ensure that our input is a string ―― and it will throw an error if we attempt to pass in the wrong data type. So we'll start by writing a function that can be used to check any input before it is passed to `validator`. Create a new file in `validation` called `valid-text.js` and add the following function:

```js
const validText = str => {
  return typeof str === "string" && str.trim().length > 0;
};

module.exports = validText;
```

Now we can begin to write validations for `register` and `login`. Create the corresponding files for these validations ―― `register.js` and `login.js` ―― within the `validation` folder. Let's start writing the `login` validation:

```js
// server/validation/login.js

const Validator = require("validator");
const validText = require("./valid-text");

module.exports = function validateLoginInput(data) {};
```

Remember that `login` is passed an email and a password. First, we want to ensure that the function is passed a valid string with a length greater than 0. If the input does not meet those criteria, we simply replace it with an empty string:

```js
module.exports = function validateLoginInput(data) {
  data.email = validText(data.email) ? data.email : "";
  data.password = validText(data.password) ? data.password : "";
};
```

Validator provides us with a number of built-in functions we can use to validate our input. These include `isEmail`, `isEmpty`, `isLength`, and `equals`. Let's use a couple of these methods to validate the login input:

```js
module.exports = function validateLoginInput(data) {
  data.email = validText(data.email) ? data.email : "";
  data.password = validText(data.password) ? data.password : "";

  if (!Validator.isEmail(data.email)) {
    return { message: "Email is invalid", isValid: false };
  }

  if (Validator.isEmpty(data.email)) {
    return { message: "Email field is required", isValid: false };
  }

  if (Validator.isEmpty(data.password)) {
    return { message: "Password field is required", isValid: false };
  }

  return {
    message: "",
    isValid: true
  };
};
```

We return an object which specifies whether the given input is valid. If it is not, we include a message to render client side errors. If it is valid, we do not need to return a message.

Following this pattern, write a validator for `register.js`. You may want to use some of the other methods available from `validator` such as `isLength` to ensure your password is of a certain length. If you are curious to find more validations you can find a full list of functions [here](https://www.npmjs.com/package/validator).

### Extending the user type

Let's add a couple of fields to our user type. First, add `loggedIn`. The type of this field is a `GraphQLBoolean`. Later on, when we incorporate user authentication in the frontend, `loggedIn` will be stored along with the user object in the Apollo store. We will then be able to check the value of `loggedIn` to determine whether or not to show a user `Auth` and `Protected` routes.

Second, we'll add a `token` field of type `GraphQLString`, which we can use to return the user's signed auth token to the frontend.

```js
const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: {
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    token: { type: GraphQLString },
    loggedIn: { type: GraphQLBoolean }
  }
});
```

## Register service

Now we can begin by writing some authentication functions. We need to create four of these ―― one to register a new user, another to log in an existing user, one to logout a user, and finally one to verify an existing user's credentials. We will start with the register function, since it will be difficult to write the other three until we have added some users to our database.

Ultimately, we will end up calling these service functions within the resolvers for our auth mutations. Since GraphQL resolvers are well equipped to handle promises, we will write these services as async functions.

Create a new folder in your `server` directory called `services`. Within `services`, create a new file called `auth.js`. We're going to need `bcrypt` and `jsonwebtoken`. We also need our secret signature key, as well as the User model from mongoose. We begin to define our async `register` function, which will take the arguments from the mutation passed in as a data object:

```js
// server/services/auth.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const keys = require("../config/keys");

// here we'll be taking in the `data` from our mutation
const register = async data => {
  try {
  } catch (err) {
    throw err;
  }
};

module.exports = { register };
```

Before we do anything else, we should validate the arguments in the data object using the `register` validator we created in the last step. Import your `validateRegisterInput` function and pass in the `data` object. If validator lets us know that the input is invalid, we will simply throw an error right away using the message it returns:

```js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const keys = require("../config/keys");

// Validator function
const validateRegisterInput = require("../validation/register");

const register = async data => {
  try {
    /* Run it through our validator which returns if the data isValid
    and if not, returns a nice message for the client side */
    const { message, isValid } = validateRegisterInput(data);

    /* If the data we received isn't valid, throw up the error message from 
    validator */
    if (!isValid) {
      throw new Error(message);
    }
  } catch (err) {
    throw err;
  }
};

module.exports = { register };
```

If the user has passed in valid input, we proceed to check if a user with this email address exists in the database already. If they do, we should throw an error message specifying that the user already exists.

```js
const register = async data => {
  try {
    const { message, isValid } = validateRegisterInput(data);

    if (!isValid) {
      throw new Error(message);
    }
    // Deconstruct our data
    const { name, email, password } = data;

    /* We want to wait until our model can tell us whether a user exists with 
    that email */
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("This user already exists");
    }
  } catch (err) {
    throw err;
  }
};
```

If the user has not passed in an existing address, we can create a new user and add them to the database. First, we must hash their password using `bcrypt`. Then we create a new user object using the arguments passed in, along with the hashed password from bcrypt. Finally, we can save the user.

```js
// hash our password
const hashedPassword = await bcrypt.hash(password, 10);

// create a new user with all our arguments
const user = new User(
  {
    name,
    email,
    password: hashedPassword
  },
  err => {
    if (err) throw err;
  }
);

// save our user
user.save();
```

When we register a new user, we want to return a `JSON` web token to the frontend (we will also return the user object w/o the password). We can do this by using `jsonwebtoken` to sign the user's `id` with the secret key we generated earlier. We also want to make sure we set the `loggedIn` field to true. Here is the complete method:

```js
const register = async data => {
  try {
    const { message, isValid } = validateRegisterInput(data);

    if (!isValid) {
      throw new Error(message);
    }

    const { name, email, password } = data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("This user already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User(
      {
        name,
        email,
        password: hashedPassword
      },
      err => {
        if (err) throw err;
      }
    );

    user.save();
    // we'll create a token for the user
    const token = jwt.sign({ id: user._id }, keys.secretOrKey);

    // then return our created token, set loggedIn to be true, null their password, and send the rest of the user
    return { token, loggedIn: true, ...user._doc, password: null };
  } catch (err) {
    throw err;
  }
};

module.exports = { register };
```

### Register Mutation

Now that we have completed the steps to register a user, we can add a `register` mutation which calls the `AuthService.register` async function we just wrote. The mutation accepts a name, email, and password, and returns the result of the async function:

```js
// schema/mutations.js

// Don't forget to import AuthService
register: {
    type: UserType,
    args: {
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    resolve(_, args) {
        return AuthService.register(args);
    }
}
```

Test your new mutation in `GraphiQL`. You should be able to return the user's signed token along with the other user data (except the password of course).

## Logout service

Now that you are able to register a user let's work on being able to log a user out. We'll start by adding another function to `services/auth.js`. This function will basically do the following:

1. Take in an `id` from our mutation and find the user with that `id`

2. Create an empty `token`

3. Send the empty `token`, set `loggedIn` to false and return all the other information a user had

Then we just need to add our logout our mutation to use the `logout` service we just wrote.

```js
logout: {
  type: UserType,
  args: {
    // all we need to log the user our is an id
    _id: { type: GraphQLID }
  },
  resolve(_, args) {
    return AuthService.logout(args);
  }
},
```

Now try to register a user ―― and then log that user out! Make sure everything is working before moving on to `login`.

## Login service

Now, let's create a service to log a user into our app. Back in `server/services/auth.js`, create a new async function for login which takes a data argument which it will later be receiving from the `login` mutation. Validate the input and throw an error if necessary.

```js
const login = async data => {
  try {
    // use our other validator we wrote to validate this data
    const { message, isValid } = validateLoginInput(data);

    if (!isValid) {
      throw new Error(message);
    }
  } catch (err) {
    throw err;
  }
};
```

Next, we retrieve the user with their email address. If the user does not exist in the database, we throw a descriptive error. If we do find an existing user, we compare the password passed into the function with the hashed password we just retrieved from the database (using `bcrypt.compareSync`).

If the password is a match, we create an authentication token using the user's id and our secret key. Then we return the token along with the user data. We also specify that the user is logged in with a boolean, and blank our the password.

### Login mutation

Now we can create the login mutation, which will just accept an email and password:

```js
// schema/mutations.js

login: {
    type: UserType,
    args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    resolve(_, args) {
        return AuthService.login(args);
    }
},
```

Test your login mutation with the user you registered in the last step(make sure the user is logged out before trying to log them in!).

### Verifying user credentials

There is one more step to complete before we are finished with user authentication. When allowing an authenticated user to access protected routes on the frontend, we must pass the user's authentication with each request and check its validity. To do this, we will create one final async function and mutation to **verify a user's token**.

The async function is simple. We use `jsonwebtoken` to decode the user's token with our secret password we had saved in `keys.js`. If the token is valid, the decoded object will contain the user's `_id`. Then all we have to do is check our database to see if the user exists. If they do, we specify that the user is logged in. If not, we return `loggedIn` as false:

```js
const verifyUser = async data => {
  try {
    // we take in the token from our mutation
    const { token } = data;
    // we decode the token using our secret password to get the
    // user's id
    const decoded = jwt.verify(token, keys.secretOrKey);
    const { id } = decoded;

    // then we try to use the User with the id we just decoded
    // making sure we await the response
    const loggedIn = await User.findById(id).then(user => {
      return user ? true : false;
    });

    return { loggedIn };
  } catch (err) {
    return { loggedIn: false };
  }
};
```

Our last step is to add a `verifyUser` mutation. It will receive a single argument ―― the `token` which will be a GraphQLString:

```js
verifyUser: {
    type: UserType,
    args: {
        token: { type: GraphQLString }
    },
    resolve(_, args) {
        return AuthService.verifyUser(args);
    }
}
```

Using `GraphiQL`, log in a user and copy their token. Then use that token with your `verifyUser` mutation.

We've successfully set up backend User Authentication using GraphQL.

## Lambda function

In the projects we've created so far, all of the information we needed has been stored in a single database. This hasn't yet allowed us to showcase one of the most useful features of GraphQL ―― the ability to treat it as a layer between multiple sources of data. So for today’s bonus project we will be building something a little different. Now, we will be creating and deploying a lambda function on AWS which will resolve the pricing data on our products.




























