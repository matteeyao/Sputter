# GraphQL

## Prerequisite Knowledge

* Specification, not implementation

* Language agnostic

* Large amount of competition

</br>

---

</br>

# Resolving Circular Queries

When defining GraphQL types, it's common to run into situations when two types reference each other. This is a problem b/c one type will be undeclared or undefined when the other is evaluated.

## Circular References in GraphQL Type Definitions

```js
// Bad, `Item` is not defined (JavaScript actually means *undeclared* here)
const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id   : { type: GraphQLString },
    email: { type: GraphQLString },
    items: {
      type: new GraphQLList(Item),
      resolve: () => { /* resolve function to get user's items */ }
    },
  }
})

const Item = new GraphQLObjectType({
  name: "Item",
  fields: {
    id:        { type: GraphQLString },
    name:      { type: GraphQLString },
    user: {
      type: User,
      resolve: () => { /* resolve function to get user of item */ }
    }
  }
})
```

```js
// doesn't work either - `Item` is undefined, but `type` expects a GraphQL type
let Item // declared, but has value of undefined
const User = new GraphQLObjectType({
  name: 'User',
  fields: {
    id   : { type: GraphQLString },
    email: { type: GraphQLString },
    items: {
      type: new GraphQLList(Item),
      resolve: () => { /* resolve function to get user's items */ }
    },
  }
})

Item = ...
```

To fix this, the reference JavaScript implementation allows us to **indicate the fields using a function that returns an object, instead of a plain object**. This function is lazily evaluated during runtime, so we will not run into problems w/ the interpreter.

```js
// Works!
const User = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id   : { type: GraphQLString },
    email: { type: GraphQLString },
    items: {
      type: new GraphQLList(Item),
      resolve: () => { /* resolve function to get user's items */ }
    },
  })
})

const Item = new GraphQLObjectType({
  name: "Item",
  fields: () => ({
    id:        { type: GraphQLString },
    name:      { type: GraphQLString },
    user: {
      type: User,
      resolve: () => { /* resolve function to get user of item */ }
    },
  })
})
```

</br>

---

</br>

# Promises 

Promises are a tool for simplifying callbacks to asynchronous functions. Since the introduction of ES6, they have been included natively in Javascript.

## The Problem

Sometimes we need to chain several asynchronous functions. For example, maybe we want to get our user's geolocation, then hit an API to `GET` the user's nearest surf spot, then hit a third API to get the surf conditions for that spot.

```js
function getForecastForLocation(){
  locationRequest({
    success: spotRequest({
      success: forecastRequest({
        success: handleSuccess,
        error: handleError
      }),
      error: handleError
    }),
    error: handleError
  });
}
```

We would have to define the success callback of one function to invoke the next, and each would have to handle its own errors. Nesting callbacks like this can only lead us to callback hell.

## The Solution

W/ promises, we can write:

```js
function getForecastForLocation(){
  locationRequest()
    .then(spotRequest)
    .then(forecastRequest)
    .then(handleSuccess)
    .catch(handleError)
}
```

Let's learn how to do this.

## Functionality and Vocabulary

First let's define a couple terms:

* *action*: the primary function of a promise (i.e., fetch data from an API)

Promises can exist in one of three states:

* *pending*: The promise has been neither fulfilled nor rejected.

* *fulfilled*: The promise's action has succeeded.

* *rejected*: The promise's action has failed.

A promise is considered **settled** when it has either been fulfilled or rejected.

A few notes about functionality before moving on:

* A promise can only succeed or fail once - callbacks will not be invoked multiple times.

* A promise cannot change its state from fulfilled to rejected or vice-versa.

* If a promise has already been settled and a callback is added that matches the promise's state, that callback will be invoked immediately.

## Creating a Promise

We can create a new promise using the promise constructor function:

```js
const p = new Promise(executor);
```

The constructor function accepts a single `executor` argument, which is a function that takes two optional parameters: `resolve` and `reject`. Let's see an example:

```js
const p = new Promise((resolve, reject) => {
  if (/* success condition */){
    resolve(/* any args */);
  } else {
    reject(/* any args */);
  }
});
```

## `resolve` and `reject`

`resolve` and `reject` are responsible for telling the promise what arguments to pass on once the promise has been settled.

```js
const request = new Promise(resolve => {  
  setTimeout((msg) => resolve(msg), 1000);
});

const receiveResponse = msg => console.log(msg);

request.then(receiveResponse);
```

`receiveResponse` is the resolve callback, and will be invoked once `setTimeout` successfully goes off after one second. It receives an argument which will get passed to the resolve callback, which in this case prints it out.

## `then`

Promise objects have two important pre-defined methods: `then` and `catch`. Both `then` and `catch` return **a new promise object**, making them chainable.

`then` accepts two parameters:

* `onFulfilled`: the function to invoke if the promise is *fulfilled*

* `onRejected`: the function to invoke if the promise is *rejected*

Essentially, `onFulfilled` is the resolve function and `onRejected` is the `reject` function.

```js
p.then(onFulfilled) // onFulfilled *might* run
p.then(onFulfilled, onRejected) // either onFulfilled or onRejected *will* run
```

## `catch`

`catch` only accepts an `onRejected` parameter. `catch` acts exactly like calling `then(null, onRejected)` on a promise.

Consider this:

```js
p.then(onFulfilled, onRejected).catch(error)
```

If `p` is rejected, `onRejected` will run. `error` will run if either `onFulfilled` or `onRejected` are rejected.

Note: `onRejected` logging an error message would not trigger `error`, but it would if it explicitly threw an error. In other words:

```js
const onRejected = err => console.log(err); // fulfilled; would not trigger error

const onRejected = err => throw err; // rejected; would trigger error
```

## Using Promises

While promises can be a little tricky to understand, they are extremely easy to use. The jQUery `ajax` method allows use of success callbacks and also returns a `jqXHR` object, which can be used like a promise. We can avoid passing a callback to `ajax` by calling `then` on the the return value and passing the callback to `then`.

```js
// Passing a callback

const fetchSuccess = cat => console.log(cat);
const fetchError = err => console.log(err);

const fetchCat = (catId, success, error) => (
  $.ajax({
    url: `/cats/${catId}`,
    success,
    error
  })
);

fetchCat(1, fetchSuccess, fetchError);
```

```js
// Using a promise.

const fetchSuccess = cat => console.log(cat);
const fetchError = err => console.log(err);

const fetchCat = catId => $.ajax({ url: `/cats/${catId}` });
// Note the implicit return!

fetchCat(1).then(fetchSuccess).fail(fetchError);
```

Note how we use `fail` instead of `catch`. That's b/c the `jqXHR` object has a slightly different set of methods than a standard promise. `then` behaves like we'd expect, but we use `fail` to handle errors. We also have access to `done`, which only takes a success callback, and `always`, which runs its callback upon the promise being settled, no matter what.

Promises really excel at error handling and separating concerns. In the second example, the `fetchCat` function no longer needs to be involved w/ or know about the expected outcome.

</br>

---

</br>

# GraphQL Introspection

## Tooling and Ecosystem

GraphQL's Type System allows us to quickly define the surface area of our APIs. It allows developers to clearly define the capabilities of an API, but also to validate incoming queries against a schema.

An amazing thing w/ GraphQL is that these capabilities are not only known to the server. GraphQL allows clients to ask a server for information about its schema. GraphQL calls this **introspection**.

## Introspection

The designers of the schema already know what the schema looks like but how can clients discover what is accessible through a GraphQL API? We can ask GraphQL for this information by querying the `__schema` meta-field, which is always available on the root type of a Query per the spec.

```js
query {
  __schema {
    types {
      name
    }
  }
}
```

Take this schema definition for example:

```js
type Query {
  author(id: ID!): Author
}

type Author {
  posts: [Post!]!
}

type Post {
  title: String!
}
```

If we were to send the introspection query mentioned above, we would get the following result:

```json
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "Author"
        },
        {
          "name": "Post"
        },
        {
          "name": "ID"
        },
        {
          "name": "String"
        },
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__EnumValue"
        },
        {
          "name": "__Directive"
        },
        {
          "name": "__DirectiveLocation"
        }
      ]
    }
  }
}
```

As you can see, we queried for all types on the schema. We get both the object types we defined and scalar types. We can even introspect the introspection types!

There's much more than name available on introspection types. Here's another example:

```js
{
  __type(name: "Author") {
    name
    description
  }
}
```

In this example, we query a single type using the `__type` meta-field and we ask for its name and description. Here's the result for this query:

```json
{
  "data": {
    "__type": {
      "name": "Author",
      "description": "The author of a post.",
    }
  }
}
```

As you can see, introspection is an extremely powerful feature of GraphQL, and we've only scratched the surface. The specification goes into much more detail about what fields and types are available in the introspection schema.

</br>

---

</br>

# GraphQL

GraphQL queries have a very simple structure and are easy to understand. Take this one:

```js
{
  subscribers(publication: "apollo-stack"){
    name
    email
  }
}
```

Here's what the response would look like:

```js
{
  subscribers: [
    { name: "Jane Doe", email: "jane@doe.com" },
    { name: "John Doe", email: "john@doe.com" },
    ...
  ]
}
```

Notice how the shape of the response is almost the same as that of the query.

## Schema and Resolve Functions

Every GraphQL server has two core parts that determine how it works: a **schema** and **resolve functions**.

**The schema**: The schema is a model of the data that can be fetched through the GraphQL server. It defines what queries clients are allowed to make, what types of data can be fetched from the server, and what the relationships between these types are.

In GraphQL schema notation, it looks like this:

```js
type Author {
  id: Int
  name: String
  posts: [Post]
} type Post {
  id: Int
  title: String
  text: String
  author: Author
} type Query {
  getAuthor(id: Int): Author
  getPostsByTitle(titleContains: String): [Post]
} schema {
  query: Query
}
```

The schema states that the application has three types - *Author*, *Post*, and *Query*. The third type - *Query* - is just there to mark the entry point into the schema. Every query has to start w/ one of its fields: *`getAuthor`* or *`getPostsByTitle`*. You can think of them sort of like REST endpoints, except more powerful.

*`Author`* and *`Post`* reference each other. You can get *`Author`* to *`Post`* through the *`Author`*'s `posts` field, and you can get from *`Post`* to *`Author`* through the *`Posts`*' `author` field.

The schema tells the server what queries clients are allowed to make, and how different types are related, but there is one critical piece of information that it doesn't contain: where the data for each type comes from.

That's what resolve functions are for.

## Resolve Functions

Resolve functions are like little routers. They specify how the types and fields in the schema are connected to various backends, answering the questions "How do I get the data for *`Authors`*?" and "Which backend do I need to call w/ what arguments to get the data for *`Posts`*?".

GraphQL resolve functions can contain arbitrary code, which means a GraphQL server can talk to any kind of backend, even other GraphQL servers. For example, the *Author* type could be stored in a SQL database, while *`Posts`* are stored in MongoDB, or even handled by a microservice.

Perhaps the greatest feature of GraphQL is that it hides all of the backend complexity from clients. No matter how many backends your app uses, all the client will see is a single GraphQL endpoint w/ a simple, self-documenting API for your application.

Here's an example of two resolve functions:

```js
getAuthor(_, args) {
  return sql.raw('SELECT * FROM authors WHERE id = %s', args.id);
} posts(author) {
  return request(`https://api.blog.io/by_author/${author.id}`);
}
```

Of course, you wouldn't write the query or url directly in a resolve function, you'd put it in a separate module. But you get the picture.

## Query execution - step by step

At the end of this section, you'll understand how a GraphQL server uses the schema and resolve functions together to execute the query and produce the desired result.

Here's a query that works w/ the schema introduced earlier. It fetches an author's name, all the posts for that uathor, and the name of the author of each post.

```js
{
  getAuthor(id: 5){
    name
    posts {
      title
      author {
        name # this will be the same as the name above
      }
    }
  }
}
```

Note, notice that this query fetches the name of the same author twice.

Here are the three high-level steps the server takes to respond to the query:

1. Parse

2. Validate

3. Execute

### Step 1: Parsing the query

First, the server parses the string and turns it into an AST - an abstract syntax tree. If there are any syntax errors, the server will stop execution and return the syntax error to the client.

### Step 2: Validation

The validation stage makes sure that the query is valid given the schema before execution starts. It checks things like:

* is *`getAuthor`* a field of the *Query* type?

* does *`getAuthor`* accept an argument named *`id`*?

* Are *`name`* and *`posts`* fields on the type returned by *`getAuthor`*?

### Step 3: Execution

If validation is passed, the GraphQL server will execute the query.

Every GraphQL query has the shape of a tree - i.e. it is never circular. Execution begins at the root of the query. First, the executor calls the resolve function of the fields at the top level - in this case just *`getAuthor`* - w/ the provided parameters. It waits until all these resolve functions have returned a value, and then proceeds in a cascading fashion down the tree. If a resolve function returns a promise, the executor will wait until that promise is resolved.

**The execution flow in diagram flow:**

![](backend/assets/images/execution-flow.png)

Execution starts at the top. Resolve functions at the same level are executed concurrently.

**The execution flow in table form:**

```
3.1: run Query.getAuthor
3.2: run Author.name and Author.posts (for Author returned in 3.1)
3.3: run Post.title and Post.author (for each Post returned in 3.2)
3.4: run Author.name (for each Author returned in 3.3)
```

**The execution flow in text form (w/ all the details):**

Just for convenience, here's the query again:

```js
{
  getAuthor(id: 5){
    name
    posts {
      title
      author {
        name # this will be the same as the name above
      }
    }
  }
}
```

In this query, there is only one root field - *`getAuthor`* - and there is one parameter - *`id`* - w/ value 5. The *`getAuthor`* resolve function will run and return a promise.

```js
getAuthor(_, { id }){
  return DB.Authors.findOne(id);
}

// let's assume this returns a promise that then resolves to the
// following object from the database: 
{ id: 5, name: "John Doe" }
```

The promise is resolved when the database call returns. As soon as that happens, the GraphQL server will take the return value of this resolve function - an object in this case - and pass it to the resolve functions of the *`name`* and *`posts`* fields on *`Author`*, b/c those are the fields that were requested in the query. The *`name`* and *`posts`* resolve functions run in parallel:

```js
name(author) {
  return author.name;
} posts(author) {
  return DB.Posts.getByAuthorId(author.id);
}
```

The *`name`* resolve function is pretty straightforward: it simply returns the name property of the author object that was just passed down from the *`getAuthor`* resolve function.

The *`posts`* resolve function makes a call to the database and returns a list of post objects:

```js
// list returned by DB.Posts.getByAuthorId(5)
[{
  id: 1,
  title: "Hello World",
  text: "I am here",
  author_id: 5
},{
  id: 2,
  title: "Why am I still up at midnight writing this post?",
  text: "GraphQL's query language is incredibly easy to ...",
  author_id: 5
}]
```

Note, GraphQL-JS awaits for all promises in a list to be resolved/rejected before it calls the next level of resolve functions.

B/c the query asks for the *`title`* and *`author`* fields of each Post, GraphQL then runs **four** resolve functions in parallel: the *`title`* and *`author`* for each post.

The *`title`* resolve function is trivial again, and the *`author`* resolve function is the same as the one for *`getAuthor`*, except that it uses the *`author_id`* field on post, whereas the *`getAuthor`* function used the *`id`* argument:

```js
author(post){
  return DB.Authors.findOne(post.author_id);
}
```

Finally, the GraphQL executor calls the *`name`* resolve function of *`Author`* again, this time w/ the author objects returned by the author resolve function of *`Posts`*. It runs twice - once for each Post.

And we're done! All that's left to do is pass the results up to the root of the query and return the result:

```js
{
  data: {
    getAuthor: {
      name: "John Doe",
      posts: [
        {
          title: "Hello World",
          author: {
            name: "John Doe"
          }
        },{
          title: "Why am I still up at midnight writing this post?",
          author: {
            name: "John Doe"
          }
        }
      ]
    }
  }
}
```

</br>

---

</br>

# Setting up GraphQL

## User queries

```js
{
  users {
    id,
    name,
    email
  }
}
```

```js
{
  user(id: "60b12b4644578762dbea244c") {
    name
  }
}
```

## User query results

```json
{
  "data": {
    "users": [
      {
        "id": "60b12b4644578762dbea244c",
        "name": "Tom Hanks",
        "email": "tomhanks@savingprivateryan.com"
      },
      {
        "id": "60b12ba944578762dbea244d",
        "name": "Matt Yao",
        "email": "mattyao@sputter.com"
      },
      {
        "id": "60b12bc944578762dbea244e",
        "name": "John Doe",
        "email": "jdoe@anonymous.com"
      }
    ]
  }
}
```

```json
{
  "data": {
    "user": {
      "name": "Tom Hanks"
    }
  }
}
```

## Post queries

```js
{
  posts {
    title,
    author {
      name
    }
  }
}
```

```js
{
  post(id: "60b134fa3d87056d0ae83408") {
    title,
    body,
    author {
      name,
      email
    }
  }
}
```

## Post query results

```json
{
  "data": {
    "posts": [
      {
        "title": "Hi, I'm Tom Hanks",
        "author": {
          "name": "Tom Hanks"
        }
      },
      {
        "title": "Hi, I'm Tom Hanks",
        "author": {
          "name": "Tom Hanks"
        }
      },
      {
        "title": "Hi, I'm Tom Hanks",
        "author": {
          "name": "Tom Hanks"
        }
      }
    ]
  }
}
```

```json
{
  "data": {
    "post": {
      "title": "Hi, I'm Tom Hanks",
      "body": "I played Captain Miller in Saving Private Ryan.",
      "author": {
        "name": "Tom Hanks",
        "email": "tomhanks@savingprivateryan.com"
      }
    }
  }
}
```

</br>

---

</br>

# Resolvers - How Apollo Server processes GraphQL operations

Apollo Server needs to know how to populate data for every field in your schema so that it can respond to requests for that data. To accomplish this, it uses resolvers.

**A resolver is a function that's responsible for populating the data for a single field in your schema.** It can populate that data in any way you define, such as by fetching data from back-end database or a third-party API.

If you *don't* define a resolver for a particular field, Apollo Server automatically defines a default resolver for it.

## Defining a resolver

### Base syntax

Let's say our server defines the following schema:

```js
type Query {
  numberSix: Int! // Should always return the number 6 when queried
  numberSeven: Int! // Should always return 7
}
```

We want to define resolvers for the `numberSix` and `numberSeven` fields of the root `Query` type so that they always return `6` and `7` when they're queried.

Those resolver definitions look like this:

```js
const resolvers = {
  Query: {
    numberSix() {
      return 6;
    },
    numberSeven() {
      return 7;
    }
  }
};
```

As this example shows:

* You define all of your server's resolvers in a single JavaScript object (named `resolvers` above). This object is called the **`resolver map`**.

* The resolver map has top-level fields that correspond to your schema's types (such as `Query` above).

* Each resolver function belongs to whichever type its corresponding field belongs to.

### Handling arguments

Now let's say our server defines the following (slightly longer) schema:

```js
type User {
  id: ID!
  name: String
}

type Query {
  user(id: ID!): User
}
```

We want to be able to query the `user` field to fetch a user by its `id`.

To achieve this, our server needs access to user data. For this contrived example, assume our server defines the following hardcoded array:

```js
const users = [
  {
    id: '1',
    name: 'Elizabeth Bennet'
  },
  {
    id: '2',
    name: 'Fitzwilliam Darcy'
  }
];
```

Now we can define a resolver for the `user` field, like so:

```js
const resolvers = {
  Query: {
    user(parent, args, context, info) {
      return users.find(user => user.id === args.id);
    }
  }
}
```

As this example shows:

* A resolver can optionally accept four positional arguments: `(parent, args, context, info)`.

* The `args` argument is an object that contains all GraphQL arguments that were provided for the field by the GraphQL operation.

Notice that this example *doesn't* define the resolvers for `User` fields (`id` and `name`). That's b/c the default resolver that Apollo Server creates for each of these fields does the right thing: it obtains the value directly from the object returned by the `user` resolver.

### Passing resolvers to Apollo Server

After you define all of your resolvers, you pass them to the constructor of `ApolloServer` (as the `resolvers` property), along w/ your schema's definition (as the `typeDefs` property).

The following example defines a hardcoded data set, a schema, and a resolver map. It then initializes an `ApolloServer` instance, passing the schema and resolvers to it.

```js
const { ApolloServer, gql } = require('apollo-server');

// Hardcoded data store
const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

// Schema definition
const typeDefs = gql`
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

// Resolver map
const resolvers = {
  Query: {
    books() {
      return books;
    }
  },
};

// Pass schema definition and resolvers to the
// ApolloServer constructor
const server = new ApolloServer({ typeDefs, resolvers });

// Launch the server
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

Note that you can define your resolvers across as many different files and objects as you want, as long as you merge all of them into a single resolver map that's passed to the `ApolloServer` constructor.

### Resolver chains

Whenever a query asks for a field that contains an object type, the query *also* asks for *at least one field* of that object (if it didn't, there would be no reason to include the object in the query). A query always "bottoms out" on fields that contain either a scalar or a list of scalars.

Therefore, whenever Apollo Server *resolves* a field that contains an object type, it always then resolves one or more fields of that object. Those subfields might in turn *also* contain object types. Depending on your schema, this object-field pattern can continue to an arbitrary depth, creating what's called a **resolver chain**.

#### Example

Let's say our server defines the following schema:

```js
// A library has a branch and books
type Library {
  branch: String!
  books: [Book!]
}

// A book has a title and author
type Book {
  title: String!
  author: Author!
}

// An author has a name
type Author {
  name: String!
}

type Query {
  libraries: [Library]
}
```

Here's a valid query against that schema:

```js
query GetBooksByLibrary {
  libraries {
    books {
      author {
        name
      }
    }
  }
}
```

The resulting resolver chain for this query matches the hierarchical structure of the query itself:

```js
//                                        Book.title()
//                                    ↗
// Query.libraries → Library.books()
//                                    ↘
//                                        Book.author() → Author.name()
```

When a chain "diverges" like this, each subchain executes in parallel.

### Resolver arguments

Resolver functions are passed four arguments: `parent`, `args`, `context`, and `info` (in that order).

| Argument  	| Description                                                                                                                                                                                                                                                                             	|
|-----------	|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| `parent`  	| The return value of the resolver for this field's parent (i.e., the previous resolver in the  resolver chain).  For resolvers of top-level fields w/ no parent (such as fields of `Query`), this value is obtained from the `rootValue` function passed to Apollo Server's constructor. 	|
| `args`    	| An object that contains all GraphQL arguments provided for this field.  For example, when executing `query{ user(id: "4") }`, the `args` object passed to the `user` resolver is `{ "id": "4" }`                                                                                        	|
| `context` 	| An object shared across all resolvers that are executing for a particular operation. Use this to share per-operation state, including authentication information, dataloader instances, and anything else to track across resolvers.                                                    	|
| `info`    	| Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.                                                                                                                                                    	|

### The `context` argument

The `context` argument is useful for passing things that any resolver might need, like authentication scope, database connections, and custom fetch functions. If you're using dataloaders to batch requests across resolvers, you can attach them to the `context` as well.

**Resolvers should never destructively modify the `context` argument**. This ensures consistency across all resolvers and prevents unexpected errors.

To provide a `context` to your resolvers, add a `context` initialization function to the `ApolloServer` constructor. This function is called w/ every request, so you can set the context based on the request's details (such as HTTP headers).

```js
// Constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    authScope: getScope(req.headers.authorization)
  })
}));

// Example resolver
(parent, args, context, info) => {
  if(context.authScope !== ADMIN) throw new AuthenticationError('not admin');
  // Proceed
}
```

Context initialization can be asynchronous, allowing database connections and other operations to complete:

```js
context: async () => ({
  db: await client.connect(),
})

// Resolver
(parent, args, context, info) => {
  return context.db.query('SELECT * FROM table_name');
}
```

### Return values

A resolver function's return value is treated differently by Apollo Server depending on its type:

| TYPE                 	| DESCRIPTION                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   	|
|----------------------	|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| Scalar / object      	| A resolver can return a single value or an object. This return value  is passed down to any nested resolvers via the `parent` argument.                                                                                                                                                                                                                                                                                                                                                       	|
| `Array`              	| Return an array if and only if your schema indicates that the resolver's associated field contains a list.  After you return an array, Apollo Server executes nested resolvers for each item in the array.                                                                                                                                                                                                                                                                                    	|
| `null` / `undefined` 	| Indicates that the value for the field could not be found.  If your schema indicates that this resolver's field is nullable, then the operation result has a `null` value at the field's position.  If this resolver's field is *not* nullable, Apollo Server sets the field's parent to `null`. If necessary, this process continues up the resolver chain until it reaches a field that *is* nullable. This ensures that a response never includes a `null` value for a non-nullable field. 	|
| `Promise`            	| Resolvers often perform asynchronous actions, such as fetching from a database or back-end API. To support this, a resolver can return a promise that resolves to any other  supported return type.                                                                                                                                                                                                                                                                                           	|

</br>

---

</br>

# Data sources - Manage connections to databases and REST APIs

**Data sources** are classes that Apollo Server cn use to encapsulate fetching data from a particular source, such as a database or a REST API. These classes help handle caching, deduplication, and errors while resolving operations.

Your server can use any number of different data sources. You don't *have* to use data sources to fetch data, but they're strongly recommended.

![](backend/assets/images/data-source.svg)

