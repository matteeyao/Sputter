# Setting up GraphQL

For the homework tonight we will be walking through how to setup a simple application with Users and Posts using Mongo, Express and GraphQL. In part one of this guide we'll be covering setting up Mongo, Node and Express. The majority of this reading will be review - but we recommend referencing this guide to make sure everything is setup up properly before we add GraphQL into the mix.

## Basic setup

To start, create a folder for your application and open it in your code editor. In the terminal, run `npm init --y` to initialize the project with the default values. Notice that a file named `package.json` has been added to your root directory.

## Installing dependencies

Next `npm install` the following:

1. `express` - the main framework

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

```ts
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

```ts
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

```ts
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

```ts
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

The `graphql/type` module is responsible for defining GraphQL types and schema. You can import from either the `graphql/type` module, or from the root `graphql` module. For this project we'll import from the root `graphql` module (See below for an example)

We will use the `graphql` module to define our first GraphQL type - the one for `User`. Recall that a GraphQL type is like a template for the kind of object you can fetch from your database, and what fields it has. Defining a type is almost like defining a model in an MVC application, but w/ a few additional considerations.

Create a new folder named `schema` and within that folder create a file named `user_type.js`. Within it, start by importing `graphql` and the `GraphQLObjectType` module:

```ts
import { GraphQLAbstractType } from 'graphql';
```

Now we can begin defining `User`. We start by creating a new `GraphQLObjectType` which takes an object as its argument. We must specify a name for the type:

```ts
const UserType = new GraphQLObjectType({
  name: "UserType"
});

module.exports = UserType;
```
