# Setting up GraphQL

For the homework tonight we will be walking through how to setup a simple application with Users and Posts using Mongo, Express and GraphQL. In part one of this guide we'll be covering setting up Mongo, Node and Express. The majority of this reading will be review - but we recommend referencing this guide to make sure everything is setup up properly before we add GraphQL into the mix.

## Queries

**User**:

```gql
{
	user(userId: "621ee66aa33e12bd1f3532f8") {
    _id
    name
    email
    posts {
      _id
      title
      body
    }
  }
}
```

should return:

```json
{
  "data": {
    "user": {
      "_id": "621ee66aa33e12bd1f3532f8",
      "name": "Jane Doe",
      "email": "jane@test.com",
      "posts": [
        {
          "_id": "621ee67ca33e12bd1f3532fa",
          "title": "Greetings",
          "body": "Aloha"
        },
        {
          "_id": "621ee693a33e12bd1f3532ff",
          "title": "Munchies",
          "body": "Chips, cookies, and more..."
        }
      ]
    }
  }
}
```

## Mutations

**Register**:

```gql
mutation {
  register(
    data: {
      name: "Jane Doe",
      email: "jdoe@test.com",
      password: "password"
    }
  ) {
    _id
    name
    email
  }
}
```

should return:

```json
{
  "data": {
    "register": {
      "_id": "621ee66aa33e12bd1f3532f8",
      "name": "Jane Doe",
      "email": "jdoe@test.com"
    }
  }
}
```

**CreatePost**:

```gql
mutation {
  createPost (
    data: {
      title: "Munchies",
      author: "621ee66aa33e12bd1f3532f8",
      body: "Chips, cookies, and more..."
    }
  ) {
    _id
    title
    author {
      _id
      name
    }
    body
  }
}
```

should return:

```json
{
  "data": {
    "createPost": {
      "_id": "621e8d7518f3219409c63f90",
      "title": "Greetings",
      "author": {
        "_id": "621ee66aa33e12bd1f3532f8",
        "name": "Jane Doe",
      },
      "body": "Yo yo yo"
    }
  }
}
```

## Basic setup

To start, create a folder for your application and open it in your code editor. In the terminal, run `npm init --y` to initialize the project with the default values. Notice that a file named `package.json` has been added to your root directory.

## Installing dependencies

Next `npm install` the following:

1. `apollo-server` - the main framework

2. `mongoose` - to connect and interact w/ MongoDB

3. `body-parser` - to parse data from requests

Take a look at your `package.json`. You will notice that the dependencies have been added to this file.

## Creating the server

Create a file in your root directory called `index.js` if you haven't already. Within `index.js`, write the following:

```ts
import express, { Application } from 'express';
const app: Application = express();
```

This creates a new Express server. Now, let's setup a basic route so that we can render some information on our page. Add the following to your file:

```ts
app.get("/", (req: Request, res: Response) => res.send("Hello World"));
```

Before we can run the server, we need to tell our app which port to run on. Do so by adding the following line to your file:

```ts
app.listen(5000, () => console.log('Server is running on port 5000'));
```

This will also log a success message to the console when our server is running successfully.

Now open your terminal and run `node index.js`. If you have followed the steps correctly you will see your success message: 'Server running on port 5000.' Open up `localhost:5000` in Chrome and you should see the text 'Hello World'!

## Adding a .gitignore

If you have not done so already, now is a good time to create a GitHub repository for your project so that you can start getting credit for your commits. Once you have done so, add a `.gitignore` file to your root directory. You will want to ignore your `node_modules` directory since it is so large:

```txt
node_modules;
```

Don't forget to commit early and often

## Models

Let's create a couple of models to start with. For the purposes of this tutorial, let's assume that we are creating a simple blogging site. To start, we will generate models for `Users` and `Posts`. Check the documentation if you need a reminder about [defining models in Mongoose](https://mongoosejs.com/docs/2.7.x/docs/model-definition.html)

1. Create a new directory called `models`

2. By convention, model files in Mongoose are singular and start with a capital letter. Create a file in `models` called `User.js`.

3. At the top of the file, import Mongoose. We will also need to require the Mongoose Schema:

```ts
import { Schema } from 'mongoose';
```

Now, here is the setup of our simple User schema:

```ts
export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    date: DateConstructor | (() => number);
    posts: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  posts: [{
      type: Schema.Types.ObjectId,
      ref: 'post'
  }]
});
```

Let's not forget to export our model:

```ts
const UserModel: Model<IUser> = model('user', UserSchema);
export default UserModel;
```

Let's create another model for posts:

```ts
import { Schema, model, Model, Document, Date } from 'mongoose';

export interface IPost extends Document {
    _id: string;
    title: string;
    author: Schema.Types.ObjectId;
    body: string;
    date: DateConstructor | (() => number);
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const UserModel: Model<IPost> = model('user', PostSchema);
export default UserModel;
```

## Body parser

Import `body-parser` to `index.js` and add it as a middleware to Express above the `app.listen` line:

```ts
app.use(bodyParser.json());
```

This middleware will parse incoming JSON requests, fail descriptively, and make form data available in `req.body`

## Nodemon

Let's install a new development dependency, `nodemon`. Nodemon will watch our application for changes, and restart the server for us anytime something changes in our files. Do this by running `npm install -D nodemon`

Start your server and try to change the `Hello World` message in `index.js`, save the file, and refresh the page. You'll notice that the message does not change. Let's change that behavior by adding Nodemon to watch for changes.

Open `package.json` and find the following line:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

We don't actually need the "test" script. Delete it and replace it with the following code so that your scripts line looks like this:

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Running `npm run start` will accomplish the same result as before. However, if you instead run `npm run dev`, you'll notice that the server will watch for changes and log a success message. If you try the same thing as before - having your server running while changing the "Hello World" message - you'll see Nodemon will stop and restart the server for you. Once you refresh the web page your changes will be reflected

## MongoDB setup and MongoDB Atlas

Before we start creating our backend, let's setup our database. We will be using MongoDB Atlas, which is a free service (at the basic tier) allowing us to host our database online. Follow these steps to setup your database:

* Go to the website and create an account

* Click Build a cluster

* Select Amazon Web Services as your cloud provider

* Choose N Virginia `US-East-1` as your region

* Leave everything else as defaults

* Wait for the cluster to be created (7-10 min)

* Click the `Connect` button on the newly created cluster

* Click `Add a different IP address` and enter `0.0.0.0/0` to allow connections from any IP

* Next create a new user

* Give them whatever username you like I.E. `dev` *Click the `Autogenerate Secure Password` button and save the password for later* DO NOT  COMMIT THE PASSWORD

* Click chose a connection method

* Click `Connect Your Application`

* Copy and paste the connection string

* replace the `<username>` with the username we just created

* replace the `<password>` with the auto-generated password

* now that we have this connection string we want to save it somewhere it won’t be committed

## Mongoose

Let's connect our database to mongoDB. Copy the string you identified in the last step (it looks something like `mongodb+srv://<DBUser>:<password>@cluster.mongodb.net/<DBname>?retryWrites=true&w=majority`). Head back to Atlas and find it - we will need it for this part of the setup.

* Create a new directory named `config`

* Make a new file within that directory called `keys.js`

* Add the following code to `keys.js`:

```js
export default {
  mongoURI: 'mongodb+srv://dev:AqTtpqFj2y1bdQqH@merncluster.3susk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
};
```

* Make sure to replace `dbuser` and `dbpassword` w/ the username and password you created during the mLab setup

> [!IMPORTANT]
> `.gitignore` the config directory before you make another commit. You don't want to push your private username and password to GitHub, and it will be difficult to roll back later.

* Head back to `index.js`. At the top of the file, `import mongoose from Mongoose;`

* On the line after the one where you instantiated `app`, import your key by typing `const db = require('./config/keys').mongoURI;`

* Now, we can connect to MongoDB using Mongoose:

```js
mongoose
  .connect(db)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));
```

As long as you have followed the above steps successfully and entered the correct username and password, you should see your success message in the console when you start up the server. That's it! Mongoose is up and running.

You may have noticed an error logged to the console which says:

```zsh
DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version. To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect.
```

Don't worry too much about the reasons for this error. You can remove it by adding a second argument to the mongoose `connect` function:

```js
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));
```

## ExpressGraphQL

The Express middleware `express-graphql` allows us to quickly and easily setup a GraphQL HTTP server. Once it is configured, `express-graphql` will allow us to define a GraphQL schema and spin up the GraphiQL interface which we can use to write test queries on our database

## Configuration

First, run `npm install graphql express-graphql` (we need `graphql` installed to make use of the functionality of `express-graphql`)

You can now get rid of your 'Hello World' route. Import `express-graphql` into your `index.js` file using `const expressGraphQL = require('express-graphql')`. Then, we can configure Express to use `express-graphql` for all requests routed to the `/graphql` endpoint:

```js
// all requests coming in to `graphql` will be handled
// by the expressGraphQL function from the 'express-graphql' library
app.use(
  "/graphql",
  expressGraphQL({
    graphiql: true
  })
);
```

If you open up `localhost:5000/graphql` in your browser, you will see an error: `{"errors":[{"message":"GraphQL middleware options must contain a schema."}]}`. We will resolve this error in the next step

## GraphQL schemas

At this stage, we've done the legwork of configuring our server. Now, we can move on to implementing GraphQL in our simple blogging project. We'll start this process by defining a schema for our application.

### User type

The `graphql/type` module is responsible for defining GraphQL types and schema. You can import from either the `graphql/type` module, or from the root `graphql` module. For this project we'll import from the root `graphql` module (See below for an example)

We will use the `graphql` module to define our first GraphQL type - the one for `User`. Recall that a GraphQL type is like a template for the kind of object you can fetch from your database, and what fields it has. Defining a type is almost like defining a model in an MVC application, but w/ a few additional considerations.

Create a new folder named `schema` and within that folder create a file named `user_type.js`. Within it, start by importing `graphql` and the `GraphQLObjectType` module:

```js
import { GraphQLAbstractType } from 'graphql';
```

Now we can begin defining `User`. We start by creating a new `GraphQLObjectType` which takes an object as its argument. We must specify a name for the type:

```js
const UserType = new GraphQLObjectType({
  name: "UserType"
});

module.exports = UserType;
```

Since we haven't yet defined the `Post` type, we cannot yet include it in the schema for `User`. However, we can define the remaining fields. In order to do so, we'll need a couple more modules from `graphql`. These modules will tell GraphQL what type of data will be resolved from the type:

```js
const { GraphQLObjectType, GraphQLiD, GraphQLString } = graphql;
```

Now, we can add a `fields` key to our type object to define the schema:

```js
const UserType = new GraphQLObjectType({
  // capitalize!
  name: "UserType",
  // fields refer to everything this Type will be able to return to you. Which means all of the
  // data associated w/ this type in the database. For our User that is id, email, name, and posts.
  fields: {
    id: { type: GraphQLID }, // Mongoose automatically generates an ID field for our models
    name: { type: GraphQLString },
    email: { type: GraphQLString }
  }
});
```

So far we have defined the schema for the `User` type - we aren't interacting w/ our backend yet. Now let's go configure a type for our root queries so that we actually return a user from our backend.

## Root Queries

A root query is an entry point into the data which exists in the backend. For each root type we specify, we will need to include a resolver function which tells GraphQL how to access the data on the server. This is where we can start to think about GraphQL as a layer between many backend services - different fields for a single type may resolve to many different locations. For now, however, we're going to keep things simple and resolve to our MongoDB server.

Create a new file within `schema` called `root_query_type.js` and import `graphql` and the `GraphQLObjectType` module. Let's also import `GraphQLList`, which will allow us to specify data be returned as an array:

```js
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLList } = graphql;
```

Let's import `mongoose` so we can access our `User` model in our `resolver` functions:

```js
const mongoose = require("mongoose");

const User = mongoose.model("user");
```

Finally, we need to import the `User` type we defined in the last step:

```js
const UserType = require("./user_type");
```

Now we have all the tools we need to define our root queries. Specifying the root query type is similar to defining any other type - we just need to make sure to name it correctly. Let's take a look at how we can define a root query which returns a list of all users in our database.

```js
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    users: {
      // This is the type we defined in the last step,
      // wrapped in a GraphQLList to specify that the data will be returned as an array.
      type: new GraphQLList(UserType),
      // We must specify a resolve function to tell GraphQL how to access the data.
      // Even if there are many fields present on a given user,
      // only the fields we specified on the User type will be returned.
      resolve() {
        // This is just a mongoose method
        return User.find({});
      }
    }
  }
});

module.exports = RootQuery;
```

That was pretty easy! Let's try writing a root query to return a specific user.

We can pass in two arguments to the resolve function:

1. `parentValue`: The previous object. This is not typically used in root queries.

2. `args`: An object holding the arguments passed into the query from the frontend.

We don't need to worry about `parentValue` for now, but we will need to pass in an argument for a user's `id`. Since we know we will need an `id` argument to be passed in we can make use of GraphQL's `GraphQLNonNull` type - which is basically just a marker enforcing that values can't be null or an error will be raised. Import `GraphQLNonNull` from `graphql` at the top of the file.

Now we will make use of `args` in order to write the root query for `user`:

```js
fields: {
    users: {
        type: new GraphQLList(UserType),
        resolve() {
        return User.find({});
        }
    },
    user: {
        // We are now querying for a single User, so we don't need to wrap the type in GraphQLList
        type: UserType,
        // We must define a type for the arguments which will be passed in to the query.
        // GraphQLNonNull specifies that the argument must be included
        args: { id: { type: new GraphQLNonNull(GraphQLID) } },
        // The args argument represents the *actual* arguments passed into the query
        resolve(parentValue, args) {
            return User.findById(args.id)
        }
    }
}
```

If we want to write this a little more cleanly, we can simply destructure the argument we want:

```js
user: {
  type: UserType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve(parentValue, { id }) {
    return User.findById(id);
  }
}
```

Our first two root queries are complete! There are just a few more steps we need to take before we can test our code. Before moving on, make sure you have exported `RootQuery` from `root_query_type.js`.

## Defining the schema

Although we have defined our root query types, we have not yet defined the schema of our application. Our schema will almost always contain **two** things: our root queries and our mutations. We'll need to make use of the `GraphQLSchema` module from `graphql` in order to define a schema that we can include in our `express-graphql` middleware.

Create a new file within `schema` called `schema.js`. Import `graphql`, the `GraphQLSchema` module, and the root query type:

```js
const graphql = require("graphql");
const { graphQLSchema } = graphql;

const RootQueryType = require("./root_query_type");
```

Now we can finally define the schema for our application:

```js
module.exports = new GraphQLSchema({
  // this is the root query object you just created!
  query: RootQueryType
})
```

Let's head back to `index.js` and import our newly defined schema:

```js
const schema = require("./schema/schema");
```

Now we can add the schema to the Express middleware:

```js
app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
```

If you've followed the above steps, you will notice that nodemon has crashed w/ an error: `MissingSchemaError: Schema hasn't been registered for model "user"`. This is b/c we have attempted to access the user model within our root query type before the model has been seen by the app. We can fix this by simply importing the user model into `index.js` *before* the `schema` import line:

```js
const User = require("./models/user");
```

Try opening `http://localhost:5000/graphql` in your browser. Now that we have defined a schema, the interface is visible. We are well on our way to testing out some queries.

## Adding dummy data

To test our work so far, we have to actually add some users to our database. Since we haven't yet written a mutation to add users, let's temporarily add an express route where we can post a new user. Comment out your current `body-parser` middleware and add the following code:

```js
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const router = express.Router();

const createNewUser = router.post("/new", (req, res) =? {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      // Throw a 400 error if the email address already exists
      return res
        .status(400)
        .json({ email: "A user has already registered with this address" });
    } else {
      // otherwise create a new user
      console.log(req.body);
      const newUserObj = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      });

      newUserObj
        .save()
        .then(savedUser => res.json(savedUser))
        .catch(err => console.log(err));
    }
  });
});

app.use("/users", createNewUser);
```

Use Postman to add three dummy users to your backend by posting to `users/new` (you can pass your keys and values for creating a user through the `body` tab using `x-www-form-urlencoded` format). Once you've created your three users remove everything from the previous code block and re-add the `bodyparser` middleware. Before moving on, make sure to test both of your root queries in GraphQL - `users` and `user` should now return the users you just created.

For example:

```js
{
  users {
    id,
    name,
    email
  }
}

{
  user(id: "12345678abcdef") {
    name
  }
}
```

Before you move on, repeat the above strategy to seed three posts to your database:

```ts
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const router = express.Router();

const createNewPost = router.post("/new", (req, res) => {
  // remember to import your Post model from Mongoose!
  const newPost = new Post({
    title: req.body.title,
    body: req.body.body,
    date: req.body.date,
    author: req.body.author
  });

  newPost
    .save()
    .then(savedPost => res.json(savedPost))
    .catch(err => console.log(err));
});

app.use("/posts", createNewPost);
```

Use an `id` from one of your users for a post's author.

## Adding the posts type

Now our application is looking good! We've connected GraphQL to our Mongo backend and can query through Express to return results from the backend.

Our application will become even more interesting once we can query for posts made by users. Meaning we'll need to create a Type for Posts so that GraphQL will be able to properly route our queries. Let's begin by creating a `post_type.js` file within the `schema` directory. Since we have already defined the User type, we an reference a post's author to start writing our first *nested query*! We do this by making use of the `parentValue` argument in our resolve function. The `parentValue` is the **key** to writing nested queries in GraphQL. In this case we'll be getting access to the Post object as our `parent`, which will give us access to a Post's author.

See the example below:

```js
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString } = graphql;
const mongoose = require("mongoose");

// grab the user Model so that we can return a User Object in our author field
const UserType = require("./user_type");
const User = mongoose.model("user");

const PostType = new GraphQLObjectType({
  name: "PostType",
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    body: { type: GraphQLString },
    author: {
      // here we have to tell GraphQL we are explicitly returning another type.
      // The Author field will return a User Type!
      type: UserType,
      // we don't need any arguments because parentValue already has the author information
      resolve(parentValue) {
        return User.findById(parentValue.author)
          .then(user => user)
          .catch(err => null);
      }
    }
  }
});

module.exports = PostType;
```

Now, after importing the Post type and Post model to `root_query_type.js`, you can add a root query to index all posts:

```js
// schema/root_query_type.js - add this under the `fields` key for the RootQueryType

  posts: {
      // we want all our returned posts in an Array so we use the GraphQLList type
      type: new GraphQLList(PostType),
      resolve() {
        return Post.find({});
      }
}
```

With this root query in place, you should be able to user GraphiQL to query for the author of each post:

```gql
{
  posts {
    title,
    author {
      name
    }
  }
}
```

Now add another field to query for a single post:

```js
post: {
  // here we just want to return a single post
  type: PostType,
  // we need an id for this query so we'll use GraphQLNonNull
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve(parentValue, args) {
    return Post.findById(args.id)
  }
}
```

Now try querying for the title of a single post by `id` along w/ that post's author's name and email. Awesome job! We now have a *nested query* to go from a post to getting information about the author of a post.

However, we can't yet do the opposite - we can't query for a user's posts. We aren't fetching information *bidirectionally*. Let's fix that. Head to `user_type.js` and start by trying to import the `Post` type:

```js
// schema/user_type.js
const PostType = require("./post_type");
```

Before moving on, refresh GraphQL. You will see the following error message:

```json
{
  "errors": [
    {
      "message": "The type of PostType.author must be Output Type but got: {}."
    },
    {
      "message": "Expected GraphQL named type but got: {}."
    }
  ]
}
```

This non-helpful error means have created a circular dependency. In the next section, we will learn how to resolve this issue.

## Resolving circular queries

In the last step, when we tried to import the Post type into the User type, we created a circular dependency. This problem arises not from GraphQL, but from Node. A circular dependency is created anytime two different files reference one another, whether directly or indirectly.

Let's breakdown what is in this case:

* Node loads the User type, which requires the Post type

* The Post type requires the User type, which is stored in the cache only as an empty object b/c it isn't done loading yet

* B/c we are using `module.exports`, the Post type keeps a reference to an unused object and never gets the real module

Chaos! Just kidding, things are just loading out of order. In the typical case, we can resolve the issue of a circular dependency by exporting function A before we import function B:

```js
function A() {}

module.exports = A;

const B = require("./b");

A.example = function() {
  console.log("This works just fine!");
};
```

However, we can simplify things even further for ourselves by leveraging our understanding of JavaScript and ES6. First, we wrap all our `fields` values in a fat arrow function to create a thunk:

```js
const UserType = new GraphQLObjectType({
  name: "UserType",
  // create a closure to create a new scope!
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString }
  })
});
```

Now, we can add our posts field. If we import the Post type directly in the type value field, we will resolve the circular dependency:

```js
const mongoose = require("mongoose");
const User = mongoose.model("user");

const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    posts: {
      // here we are requiring the Post type
      type: new GraphQLList(require("./post_type")),
      resolve(parentValue) {
        return (
          User.fingById(parentValue.id)
          /// populate is a mongoose method
            .populate("posts")
            .then(user => user.posts)
        )
      }
    }
  })
})
```

## Mutations

Let's write our first mutation together. It's pretty silly to be adding new users to our application through a RESTful endpoint when we have GraphQL configured. Let's create a mutation that will allow us to add users using GraphiQL.

Within your `schema` folder, create a new file called `mutations.js`. Just as w/ the other types we have defined, mutations are defined w/ the `GraphQLObjectType` module. We'll import the necessary packages and define the schema for mutations:

```js
// schema/mutations.js
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLNonNull } = graphql;
const mongoose = require("mongoose");
const UserType = require("./user_type");

const User = mongoose.model("user");

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {}
});

module.exports = mutation;
```

Writing a mutation is very similar to writing a root query type. We define the arguments to be passed into into the mutation, then write a resolve function to access the required information from the server:

```js
const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // this will be the name of this mutation
    newUser: {
      // creating a User type
      type: UserType,
      args: {
        // since we need these arguments to make a new user we'll make them GraphQLNonNull
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { name, email, password }) {
        return new User({ name, email, password }).save();
      }
    }
  }
});
```

Our resolve functions may become more complex for further mutations, but the basic syntax remains the same.

Now, all we need to do is add our mutation to our application is to add them to our GraphQLSchema:

```js
// schema/schema.js
const graphql = require("graphql");
const { GraphQLSchema } = graphql;

const RootQueryType = require("./root_query_type");
const mutations = require("./mutations");

// add our mutations to the Schema
module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: mutations
});
```

Now try adding a user to your application using your new mutation:

```js
Now try adding a user to your application using your new mutation:

mutation {
  newUser(name:"name", email: "email", password: "password") {
    id,
    name,
    email
  }
}
```

Amazing job! You've successfully integrated GraphQL into your application. Give yourself a huge pat on the back. 🙌 We'll be covering this pattern again in the upcoming days so don't worry if anything in this process didn't make sense the first time.

## Todos

* Implement mongoose `populate()` method for `@FieldResolvers`
