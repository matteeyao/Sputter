# Build GraphQL APIs with ExpressJS and Typescript

In this module, you will learn how to build a GraphQL API using Express.js and how to connect your API to a database system like MongoDB w/ Mongoose as its wrapper. Finally we will look into converting the codebase to TypeScript

## GraphQL

### GraphQL queries

GraphQL queries are used to perform “read” operations on the server. You will typically do those operations with a `GET` request.

![GraphQL queries](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/sample-gql-query.png)

### GraphQL mutations

GraphQL mutations are typically used to perform “write” operations on the server, which we will typically do using a `POST`, `PUT`, `DELETE` in a REST architecture.

![GraphQL mutations](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/sample-gql-mutation.png)

### GraphQL subscriptions

If you’re familiar with WebSockets, then you’d like GraphQL subscriptions. GraphQL subscriptions are used to create real-time events and connections.

### GraphQL schema

A schema is used to define the kind of data that the GraphQL API expects and the kind of data it gives back to the client.

It can also serve as documentation to people using our API. So, we may not even have to write documentation for our API again.

This also helps with data validation as GraphQL parses the requests and returns an error if the client’s data does not match what the server is expecting.

![Sample GraphQL schema](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/sample-gql-schema.png)

## Building the GraphQL API

Now that we know what GraphQL is all about let’s discuss how we can use this specification to build a simple API.

### Getting started - installing dependencies and setting up the project

Firstly, we will create a book API to create, update, delete, get all, and get a single book.

We will have to create our project and set it up.

Next, add the `start` script to your `package.json` file:

```json
"start": "node server.js"
```

Finally, we need to install our dependencies:

```zsh
npm i express express-graphql dotenv graphql
```

We need **express** to run the server and manage routes, **express-graphql** to create the schema and the handler for the route.

**GraphQL** is what we use to build our schema and **dotenv** to access environment variables.

## Creating boilerplate code

Let's start coding

Add the following app setup to your `server.js` file:

```js
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { schema, resolver } = require('./api/schema');
const envs = require('./envs');

const app = express();
app.use(express.json());

app.use(
    envs.graphqlPath,
    graphqlHTTP((request, response, graphQLParams) => ({
        schema,
        rootValue: resolver,
        graphiql: true,
        context: {
            request,
            response,
        },
    }))
);

app.listen(envs.port, () => {
    console.log(`Server is running at http://localhost:${envs.port} ${envs.graphqlPath}`);
});
```

The first four lines are where we import all the dependencies for this file

* We start by importing `express`, then import `graphqlHTTP` object from `express-graphql`, which is concerned with making the handler a GraphQL handler.

* It takes in a callback function with three parameters, `request`, `response`, and `graphQLParams`, and returns an object with the `schema` of the API.

* The `root` is what the API returns based on the query or the mutation, `graphiql`, which tells GraphQL to make our API have a web client where we can test it on the browser and finally, the `context` object.

Creating an `envs.js` file that encapsulates all the environment variables that we would be using in the app is recommended.

For now, we have added `PORT` and `GRAPHQL_PATH`.

The `envs.js` file will look like this:

```js
const { config } = require( 'dotenv');

config();

module.exports = {
    port: process.env.PORT || 3000,
    graphqlPath: process.env.GRAPHQL_PATH || '/graphql',
}
```

We have created a route for the GraphQL code where `graphqlHTTP` creates a handler for the route. However, if we run the app now, we’d get errors as we haven’t defined `schema` and `root`.

## API Schema

Create a folder called `schema` under the root folder, with the following files `schema.js`, `mutation.js`, `query.js`, and `index.js`.

`types.js` is where we will write the app schema both for response and inputs. In `mutation.js`, we write the resolver for mutations and `index.js` imports these files and exports `schema` from `types.js`.

In your `schema.js`, add the following:

```js
const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type Query {
        books(limit: Int): [Book]
        book(id: ID!): Book
    }
    type Mutation {
        addBook(title: String!, author: String!, description: String!): BookResponse
        updateBook(id: ID!, title: String, author: String, description: String): BookResponse
        deleteBook(id: ID!): BookResponse
    }
    type Book {
        id: ID!
        title: String!
        author: String!
        description: String!
    }
    type Books {
        books: [Book]
    }
    type BookResponse {
        data: Book
        error: String
        ok: Boolean
    }
`);

module.exports = schema;
```

If you hover on the `buildSchema`, you should see:

```txt
(alias) buildSchema(source: string | Source, options?:
BuildSchemaOptions & ParseOptions,): GraphQLSchema
import buildSchema
A helper function to build a GraphQLSchema directly from a source document.
```

The only required parameter is a string, which is the schema of our application.

But what if we have an extensive application with many mutations, queries, and types? Then, it won’t be a great idea to use this.

In such a case, you can always use apollo graphql, which is out of the scope of this article. Here, the schema contains `Query`, `Mutation`, and some other types like `Book` and `Books`.

The `Query` contains `books` and `book`, denoting all books and a single book. Also, we add an optional parameter for the books query: `limit` (a number), which limits the output. Finally, the `book` query takes in `ID`, which searches for the requested Book.

The `Mutation` contains `addBook`, `updateBook`, and `deleteBook` declarations along with its parameters. They all have the same response type, `Book` since we’re dealing with a single book.

The `Book` defines the structure of a single book, and `[Book]` defines books as an array of `Book`.

> [!NOTE]
> Note that an exclamation mark means the field is required.

All the inputs for mutation are required. Now that we have all our schema set, it’s time to write the resolvers.

## GraphQL query resolver

In your `query.js` file, add the following:

```js
const booksData = require('./data')

const query = {
    books: async ({limit}, context) => {
        return limit ? booksData.slice(0, limit) : booksData;
    },
    book: async ({id}, context) => {
        return booksData.find(book => book.id === id);
    }
};

module.exports = query;
```

In the `query.js` file, we export an object containing two functions, `books` and `book`, that we define inside our `Query` in our schema. Each of these functions has two parameters.

According to the schema, the first is the argument that we destructure. The second parameter is the context object, which contains details of our request.

Remember that in our `graphQLHttp` function, we returned `context` and `response` as our context.

Also, since we’re working with dummy data, we created a `data.js` where we will be store details related to the books. The `data.js` file should look like this:

> [!NOTE]
> We will not be using this file after integrating it with the database.

```js
module.exports = [
    {
        id: "1",
        title: "Building Data-Intensive Applications",
        description: "The big ideas behind reliable, scalable and maintainable systems",
        author: "Martin Kleppmann"
    },
    {
        id: "2",
        title: "Docker In Action",
        description: "Docker in action teaches you everything you need to know in docker",
        author: "Jeff KleNickoloffppmann"
    },
    {
        id: "3",
        title: "The Art of Unit Testing",
        description: "The Art of Unit Testing teaches you everything you need to know in unit testing",
        author: "Roy Osherove"
    },
    {
        id: "4",
        title: "Site Reliability Engineering",
        description: "How Google runs production systems",
        author: "Betsy Beyer"
    }
]
```

## GraphQL mutation resolver

We also need to create our mutation. In your `mutation.js` file, add the following:

```js
let books = require('./data')

const mutation = {
    addBook: async ({ title, author, description }, context) => {
        const book = { id: `${books.length+1}`, title, author, description }
        books.push(book)
        return {
            data: book,
            ok: true,
            error: ''
        };
    },

    updateBook: async ({ id, title, author, description }, context) => {
        const book = books.find(book => book.id === id);
        if (!book) {
            return {
                data: null,
                ok: false,
                error: 'Book not found'
            };
        }

        if (author) book.author = author
        if (title) book.title = title
        if (description) book.description = description
        books = books.map(b => b.id === id ? book : b)
        return {
            data: book,
            ok: true,
            error: ''
        };
    },

    deleteBook: async ({ id }, context) => {
        const book = books.find(book => book.id === id)
        if (!book) {
            return {
                data: null,
                ok: false,
                error: 'Book not found'
            };
        }

        books = books.filter(book => book.id !== id)
        return {
            data: book,
            ok: true,
            error: ''
        };
    }
};

module.exports = mutation
```

The mutation is similar to the query. Instead of performing read operations, we’re also writing operations as required. Instead of just returning the `book` object,’ we specified that we would return three keys: `data`, `ok`, and `error` in the schema.

The last thing that needs to be done before running our application is to add some data to our `schema/index.js`.

Add the following to your `schema/index.js` file.

```js
const schema = require('./schema.js');
const query = require('./query.js');
const mutation = require('./mutation.js');

const resolvers = {
    ...query, ...mutation,
};

module.exports.resolver = resolvers;
module.exports.schema = schema;
```

Here, we create a schema object from the `schema` file and a `resolver` object from the `query` and `mutation` files.

The `rootValue` object in our `graphQLHttp` in the `server.js` file expects a single object containing all resolvers for our schema.

Currently, we have them in two different files, `query` and `mutation`, so we need to spread (combine) them into a single object, as shown above.

Now, we have everything required to run our application.

Run your application with `npm start`

On opening the URL `http://localhost:3000/graphql`, you should see the following:

If you click on `Docs`, you can view the documentation for `Query` and `Mutation`.

Now, let’s test our API by fetching all the books.

![Books query](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/books-query.png)

As you can see, we didn’t include any description of the response data, so it wasn’t part of our response.

Let’s query a single book, and then we’d make two queries simultaneously.

![Single book query](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/single-book-query.png)

...

We get a “Book not found” error if the Book does not exist. As we can also see, we were able to create multiple mutations simultaneously.

But, the only limitation we have is that we can not create a query and mutation together.

Finally, let’s try to delete a book.

![Delete book mutation](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/delete-book-mutation.png)

If we pass invalid data, the request will not be processed since GraphQL validates it before processing a request.

## Integrating database to the API

This section deals with adding MongoDB and Mongoose to our application.

If you don’t have MongoDB locally, you can use a remote [MongoDB](https://www.mongodb.com/cloud/atlas/register) database.

If you want to play around with MongoDB, you can try out MongoDB queries with test data on this [website](https://www.humongous.io/app/playground/mongodb).

Create a folder called `db` under the root folder and create the following files `books.js`, `index.js`, `dbUtils.js`, and `connect.js`.

In your `books.js` file, add the following:

```js
const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
});

module.exports = new model('Books', bookSchema);
```

Here, we created the schema of the book model and exported it.

In your `connect.js` file, add the following:

```js
​​const mongoose = require('mongoose')
const envs = require('../envs')

mongoose.connect(envs.dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

module.exports = mongoose.connection
```

We used the `mongoose.connect` function to connect to the database.

Also, we have to add another value that contains the database connection URL to our `envs.js` file as shown:

```js
const { config } = require('dotenv');

config();

module.exports = {
    port: process.env.PORT || 3000,
    graphqlPath: process.env.GRAPHQL_PATH || '/graphql',
    dbUrl: process.env.DB_URL || 'mongodb://localhost:27017/graphql-starter',
}
```

Finally, we exported the `db` object and two other objects in the `db` folder to `db/index.js`.

```js
const db = require('./connect');
const BookModel = require('./books');
const books = require('./dbUtils');

module.exports = {
    db,
    BookModel,
    books
};
```

To use this connection from the `server.js` file, we import the `db` object using the `db.once` and `db.on` methods.

Add the following, just after the last import in your `server.js` file:

```js
const { db } = require('./db');
db.once('open', () => {
    console.log('Connected to MongoDB');
});

db.on('error', (err) => {
    console.log('Error connecting to MongoDB', err);
    process.exit(1);
});
```

We need to add helper functions that perform all the query operations. Doing this makes the logic of the queries and mutations much neater.

This will be done in the `dbUtils.js` file under the `db` directory. For example, add the following inside this file:

```js
const BookModel = require('./books');

const getAllBooks = async (limit) => {
    return await BookModel.find({}).limit(limit);
}

const getBookById = async (id) => {
    return await BookModel.findById(id);
}

const createBook = async ({ title, description, author }) => {
    return await BookModel.create({ title, description, author });
}

const updateBook = async (id, { title, description, author }) => {
    const set = {};
    if (title) set.title = title;
    if (description) set.description = description;
    if (author) set.author = author;
    return await BookModel.findByIdAndUpdate(id, set);
}

const deleteBook = async (id) => {
    return await BookModel.findByIdAndDelete(id);
}

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook
}
```

This file is straightforward - we have functions to get all books, get a book by id, create a new book, update a book, and delete a book.

All we need to do now is to use these functions.

The `query.js` file should now look like this:

```js
// const booksData = require('./data')
const { books} = require('../db/')

const query = {
    books: async ({limit}, context) => {
        // return limit ? booksData.slice(0, limit) : booksData;
        return await books.getAllBooks(limit)
    },

    book: async ({id}, context) => {
        // return booksData.find(book => book.id === id);
        return await books.getBookById(id)
    }
};

module.exports = query
```

Similarly, update the `mutation.js` file as shown:

```js
// let books = require('./data')
const { books } = require('../db')

const mutation = {
    addBook: async ({ title, author, description }, context) => {
        try {
            const book = await books.createBook({ title, author, description })
            // const book = { id: `${books.length+1}`, title, author, description }
            // books.push(book)
            return {
                data: book,
                ok: true,
                error: ''
            };
        } catch (error) {
            return {
                data: null,
                ok: false,
                error: error.message
            };
        }
    },

    updateBook: async ({ id, title, author, description }, context) => {
        // const book = books.find(book => book.id === id);
        // if (!book) {
        //     return {
        //         data: null,
        //         ok: false,
        //         error: 'Book not found'
        //     };
        // }
        // if (author) book.author = author
        // if (title) book.title = title
        // if (description) book.description = description
        // books = books.map(b => b.id === id ? book : b)
        try {
            const book = await books.updateBook(id, { title, author, description })
            if (!book) {
                return {
                    data: null,
                    ok: false,
                    error: 'Book not found'
                };
           }
            return {
                data: book,
                ok: true,
                error: ''
            };
        } catch (error) {
            return {
                data: null,
                ok: false,
                error: error.message
            };
        }
    },
    deleteBook: async ({ id }, context) => {
        // const book = books.find(book => book.id === id)
        // books = books.filter(book => book.id !== id)
        try {
            const book = await books.deleteBook(id)
            if (!book) {
                return {
                    data: null,
                    ok: false,
                    error: 'Book not found'
                };
            }
            return {
                data: book,
                ok: true,
                error: ''
            };
        }
        catch (error) {
            return {
                data: null,
                ok: false,
                error: error.message
            };
        }
    }
};

module.exports = mutation
```

Now, we can start testing our application.

![All books query](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/all-books-query-mongo.png)

![Multiple addbook mutation MongoDB](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/multiple-addbook-mutation-mongo.png)

If we want to create the same mutation multiple times, we need to use an alias. This is done by giving each mutation a unique name.

We can get all the books and a single book, respectively, using the `books` and `book` query.

![Books and book query](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/books-book-query-mongo.png)

Lastly, let’s test the `updateBook` and `deleteBook` mutations:

![`updateBook` and `deleteBook` mutations](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/update-and-delete-book-mutations-mongo.png)

If we run these mutations one more time, the `deleteBook` mutation will return “Book not found error”.

## Migrating to TypeScript

Now, let’s try to migrate the existing code to TypeScript since TypeScript allows us to specify data types which helps enhance the compilation and execution time.

We start by installing Typescript as a dev dependency.

```zsh
npm i typescript
```

Then, we need to set up Typescript in our project by running `tsc --init` that generates a `tscconfig.json` file.

Inside the file, set the `rootDir` value to `./` and `outDir` value to `./dist`. The `allowJs` line can be commented since we need not recompile JavaScript files.

The `rootDir` option tells Typescript to find your source (Typescript) files. The `outDir` option tells Typescript where to put the compiled files.

In your `package.json` file, add the following to your `scripts` section.

```json
    "build": "tsc",
    "start": "node dist/server.js",
    "build:watch": "tsc --watch",
    "dev": "nodemon dist/server.js"
```

Next, we need to change all our file names from, say, `xxx.js` to `xxx.ts`.

![TypeScript project structure](https://www.section.io/engineering-education/how-to-build-graphql-apis-with-expressjs-and-typescript/ts-project-structure.png)

If we try to compile our TypeScript code, we should have a couple of errors, the remaining part of this article will be concerned with fixing these type errors.

We also need to install type definitions for our project. This helps TypeScript get the data type of functions and objects used in the codebase.

```zsh
npm i @types/express @types/mongoose @types/express-graphql @types/dotenv @types/graphql -D
```

We also need to install `nodemon` to run our application in development mode.

```zsh
npm i nodemon -D
```

We need to convert all our `require` to `import` statements and our `module.exports` to `export default`.

The complete typescript source code can be seen [here](https://github.com/Babatunde13/bookrr)

To fix the errors, we had to add types and interfaces to the codebase, change all `require` to `import` statements, and create interfaces (or types) for the database schema and objects.

To run the app, we build it using ``npm run build`` or `npm run build:watch` if we want to run the code in watch mode.

Then, to start the server, we need to run `npm start` or `npm run dev` to run it in watch mode. Everything should work as expected now.

## Conclusion

This article has walked you through building a simple graphQL API with database support.

The source code is available [here](https://github.com/Babatunde13/bookrr)

Moving forward, now that we have our API up and running, what we might want to do next is to add an authentication middleware or just a way to add middlewares to our request object.

You can check [this](https://graphql.org/graphql-js/authentication-and-express-middleware/) part of GraphQL documentation for that.

You might also want to [dockerize](https://www.bezkoder.com/docker-compose-nodejs-mongodb/) your application and deploy it to [AWS](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/nodejs-getstarted.html) or [Heroku](https://scotch.io/tutorials/how-to-deploy-a-node-js-app-to-heroku).

The way we had structured the `schema` is suitable even for large applications. Let’s take, for instance, an application with queries and mutations for `users`, `books`, `authors`, etc. First, we must destructure all the mutations and queries in the `resolver` object inside the `schema/index.js` file.

Implementing with [Apollo GraphQL](https://www.apollographql.com/docs/apollo-server/) is yet another option we have.
