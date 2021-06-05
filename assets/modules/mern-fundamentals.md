# MERN Fundamentals

## MongoDB

*MongoDB is a document-based NoSQL database that is scalable and flexible.*

### Document-based

MongoDB stores data using a document data structure. **Documents** are JSON-like objects with key-value pairs. Documents with similar data are stored within **collections**. To compare it to a relational database, a document is similar to a row while a collection is similar to a table.

Let's take a look at an example of a `user` document.

```
    {
        _id: ObjectId("5d8d5b50a5b9d4a3c402f571"),
        username: "i_love_walking",
        email: "walker@walkingisgreat.com",
        password_digest: "Ke&63h1z$mK9jd37n",
        age: 28,
        address: {
            city: "Generic City Name",
            street: "Somewhere Lane",
            zipcode: 1
        },
        posts: [
            ObjectId("4a1h3m42a5b9d4i9dc405l721"),
            ObjectId("b9x2m45a5b7h7e3ml403a091"),
            ObjectId("1k3b5f87x5s6c7i2mp814g524")
        ]
    }
```

You may have noticed the several different datatypes being stored in the document above. This is one of the benefits of using this document data-structure. We are able to store not only arrays, but sub-documents as well. The sub-document in this example is the value of the address key.

### Embedding

Storing sub-documents within a document is know as embedding. Embedding related information provides better read performance, as well as the ability to retrieve related data with a single database query. Additionally, embedded data models make it possible to update related data in a single operation.

You should use an embedded data model when you are trying to model the following:

* One-to-One relationships

* Small One-to-Many relationships

An **important** thing to keep in mind is that MongoDB documents have a size limit of 16 megabytes. This essentially means that there is a limit to how much you can embed within a document. A good rule of thumb is if you are expecting to embed 50 or more sub-documents within a document then you should break those sub-documents out into their own collection. You can then utilize **referencing** to model their relationships.

### Referencing

You may have also noticed in the example user document, there are several ObjectIds stored within the posts array. These ObjectIds hold a reference to a document in a separate collection. This pattern is known as **referencing**.

**Referencing** will seem very familiar after working with a relational database. However, the benefits of embedding are lost when we use referencing. Despite this, here are a few situations where we might need to use referencing:

* Many-to-Many relationships

* Modeling large hierarchical data sets

* Large One-to-Many relationships

The advantages of using documents are:

* Documents (i.e. objects) correspond to native data types in many programming languages.

* Embedded documents and arrays reduce need for expensive joins.

* Dynamic schema supports fluent polymorphism

### NoSQL

NoSQL databases are non-relational databases, and one of the best ways to understand them is to compare them to relational databases. We will break down a few of the differences in this section.

First, the most basic way that SQL and NoSQL databases differ is in how they store data. SQL databases store data in tables where each row may represent an object. NoSQL databases can store data in several different ways other than tables. These include:

* Documents

* Graphs

* Key-value pairs

* Wide-column stores

MongoDB, as mentioned in the previous section, stores data using a document data structure.

Second, SQL databases require a strict, predefined schema before you are able to start adding data to it. NoSQL databases have a dynamic schema, meaning you don't need to have the schema completely defined before adding data to the database.

Third, SQL databases follow ACID properties while NoSQL databases tend to follow the Brewer's CAP theorem. These acronyms are summarized below, however we would recommend reading up on them further.

**ACID:**

* *Atomicity*

    + All components of a transaction are treated as a single action.

* *Consistency*

    + All transactions must follow the defined rules of the database, such as constraints.

* *Isolation*

    + Concurrently executed transactions result in the same database state as if they were sequentially executed.

* *Durability*

    + Once a transaction is committed, it will persist and cannot be undone by something like a system failure.

**CAP theorem:**

* *Consistency*

    + All duplicates of the same data will be the same value across a distributed system.

* *Availability*

    + All nodes within a system can process operations and respond to queries.

* *Partition tolerance*

    + The system continues to operate despite any unplanned network connectivity loss between nodes.

It is important to note that according to the CAP theorem, in the case of a network partition, one must choose between consistency and availability. Specifically, MongoDB chooses to keep consistency over availability by not accepting writes to a system until it believes it can safely do so.

Finally, SQL databases are centralized databases, while NoSQL databases are distributed databases. A centralized database is one that is stored in a single location. A distributed database is a collection of multiple, logically interrelated databases.

### Scalable

As we mentioned above, NoSQL databases are distributed databases. This makes them able to be scaled horizontally by just adding more machines to your pool of resources.

In contrast, centralized databases are vertically scalable. You would have to add more power (CPU, RAM) to the single machine that the database is being held on.

Relatively speaking, it is much cheaper and accessible to add additional machines to a pool than it is to upgrade one machine.

### Flexible

MongoDB's flexibility comes primarily from its utilization dynamic schemas as well as the document data structure.

A dynamic schema allows you to start with a basic schema that can be updated easily. This has been important to more modern apps and companies, because it aids their teams in building a base app quickly and adapting it as needed.

Recall that the document data structure is JSON-like. It is able to store a variety of different data types, but more importantly, it can be directly interfaced within our backend code. You no longer need to use an ORM (e.g. Active Record) to map data from a database to an object that you can easily interface with. This speeds up the development process as you have one less thing to worry about.

<br />

---

<br />

## Mongoose

Mongoose is an object data modeling (ODM) library for MongoDB and Node.js. It provides an API to model the data in our database. You can think of it as a NoSQL equivalent of an ORM. To relate it to a technology that you have used before, Mongoose serves the same purpose for MongoDB that Active Record serves for Rails.

### Why Mongoose?

Now, you may have noticed that in the MongoDB reading, we mentioned that a benefit of MongoDB is that we don't need to use an ORM. So why are we asking you to use one?

The main reason is to make it an easier transition from a relational database to a non-relational database. Using Mongoose makes it similar to the workflow you used during your Full Stack Project. You can define a schema to work with your collections. More importantly, Mongoose gives you some nice methods to define validations on your schema as well! Just remember that it is not necessary to use Mongoose to do these things, it just makes it a little easier to do so.

### Mongoose's Model.Populate()

The properties that we want to `.populate()` on are properties that have a type of *`mongoose.Schema.Types.ObjectId`*. This tells Mongoose "Hey, I'm gonna be referencing other documents from other collections". The next part of the property is the ref. The ref tells Mongoose "Those docs are going to be in the ____ collection."

So in our User schema, we reference the Post collection, because we want the user to be tied to things they post, and we want to be able to easily access those posts w/o having to create more queries.

#### Correctly Creating Users and Posts

After linking other collections in your schema using the appropriate *type* and *ref*, your *actual stored data* for that property will be *another document's _id*. It will be stored as a string. This also works for an array of `_id`s.

So while your schema says this:

```js
const UserSchema = new mongoose.Schema({
    username: String,
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }]
  })
```

Your actual stored property should read something like this:

```js
{
  _id: 59ab1c92ea84486fb4ba9f28,
  username: JD,
  posts: [
    "59ab1b43ea84486fb4ba9ef0",
    "59ab1b43ea84486fb4ba9ef1"
  ]
}
```

Keep in mind that this is your *stored document*. We have not called `.populate()` on it yet. Once it is called, it will go to the appropriate collection, search for two `_id`s, and return your user, but now w/ an array of her actual posts.

#### Implementing .Populate()

Here's the function:

```js
function getUserWithPosts(username){
  return User.findOne({ username: username })
    .populate('posts').exec((err, posts) => {
      console.log("Populated User " + posts);
    })
}
```

`.populate()` needs a query to attach itself to, so we are using `User.findOne()` to find a user who matches the username we provide in the argument. This returns our user document. This is when `.populate()` takes over. You'll notice I am providing 'posts' to our `.populate()`. By providing the 'posts' argument, we've told `.populate()` what property in our user document we want it to work with. Calling `.exec()` just executes something once `.populate()` has done it's thing. The log prints this:

```js
{ 
  _id: 59ab1c92ea84486fb4ba9f28,
  username: 'JD',
  posts:
    [ 
      { 
        _id: 59ab1b43ea84486fb4ba9ef0,
        content: "Is it dark out?"
      },{
        _id: 59ab1b43ea84486fb4ba9ef1,
        content: "Hey anyone got a cup of sugar?"
      }
    ]
  }
```

And like magic, we have created a unified object using 2 schemas, 2 models, and 2 collections.

<br />

---

<br />

## Express

Express is a web application framework for Node. It provides us with tools for the following things:

1. Write handlers to respond to different HTTP verb requests at different URL paths.

    + Similar to defining routes and controller methods in our Fullstack Projects, you will use Express to turn your backend into an API that your frontend will use to retrieve information.

2. Integrate w/ "view" rendering engines to generate responses by inserting data to templates.

    + Express can also function similar to Rails by serving up 'views' as a response to a request. However, your frontend will be handled primarily by React and Redux so you will not be using this functionality.

3. Set common web application settings like tje port to use for connecting, and the location of the templates that are used for rendering the response.

    + This is probably not something that you have done when using Rails.

4. Add additional request processing "middleware" at any point within the request handling pipeline.

    + Express middleware is similar to Rails controller callbacks, such as `before_action` or `after_action`. They allow you to apply some code or logic to HTTP requests or responses at any point during the request pipeline of your app.

While *Express* itself is fairly minimalist, developers have created compatible middleware packages to address almost any web development problem. There are libraries to work w/ cookies, sessions, user logins, URL parameters, `POST` data, security headers, and *many* more.

Routes, middleware, error handling, and template code make up the main parts of an Express app.

<br />

---

<br />

## React

### Axios

You have already been introduced to React and Redux so we will not be reiterating what it is here. However, you will be using a new technology, Axios, in the frontend of your app.

Axios is a promise based HTTP client that can be used in both the browser and a Node environment. This essentially means that you can use the Axios library to make XMLHttpRequests from the browser or HTTP requests from your Node environment.

You will mainly be utilizing Axios to make your frontend AJAX calls instead of jQuery's `$.ajax` method. We recommend you look through the [Axios documentation](https://github.com/axios/axios). You'll need to reference it during the upcoming project!

<br />

---

<br />

## Node

### What is Node.js?

Node.js is a JavaScript runtime environment. In other words, it is an environment where you can run application code. JavaScript was originally designed only to be used in browsers. Node allows us to utilize JavaScript code outside of the browser in order to build network applications. 

You have already used Node to help manage your React app's dependencies as well as run webpack to bundle your JavaScript. Now you will be taking it one step further and using it as a runtime for your server to have a truly full-stack JavaScript app!

The main benefit of using Node, is that we can take advantage of JavaScript's asynchronicity.

Normally, your server would not be able to process two requests at the same time. In other words, the server cannot process an additional request until the first is completed. This problem is called *blocking*. There are ways that blocking can be handled, such as multi-threading, however Node.js does not use multi-threading to solve the blocking problem. 

Node.js makes it easy for you to allow multiple events to occur concurrently by utilizing JavaScript's asynchronicity. Each event would be handled by JavaScript's event loop just as asynchronous functions would in a browser.

### Why Node.js

A common task for a web server can be to open a file on the sever and return the content to the client.

Here is how PHP or ASP handles a file request:

    1. Sends the task to the computer's file system.

    2. Waits while the file system opens and reads the file.

    3. Returns the content to the client.

    4. Ready to handle the next request.

Here is how Node.js handles a file request:

    1. Sends the task to the computer's file system.

    2. Ready to handle the next request.

    3. When the file system has opened and read the file, the server returns the content to the client.

Node.js eliminates the waiting and simply continues w/ the next request.

Node.js runs single-threaded, non-blocking, asynchronously programming, which is very memory efficient.

### What Can Node.js Do?

* Node.js can generate dynamic page content

* Node.js can create, open, read, write, delete, and close files on the server

* Node.js can collect form data

* Node.js can add, delete, modify data in your database

### What is a Node.js File?

* Node.js files contain tasks that will be executed on certain events

* A typical event is someone trying to access a port on the server

* Node.js files must be initiated on the server before having any effect

* Node.js files have extension ".js"