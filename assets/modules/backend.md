# Greek Gods Browser

For today's project, we'll be setting up the server for a full stack application built with Node, Express, MongoDB, and GraphQL. We are developing an application for Greek gods. Once the project is finished, we will be able to browse through a list of gods and view their abodes, emblems, and relationships. There will be three models in our application consisting of:

| **Gods**                              	| **Emblems** 	| **Abodes**  	|
|---------------------------------------	|-------------	|-------------	|
| Name                                  	| Name        	| Name        	|
| Type (god or goddess)                 	| Gods        	| Coordinates 	|
| Description                           	|             	| Gods        	|
| Domains (god of fire, goddess of war) 	|             	|             	|
| Abode (e.g. Mount Olympus)            	|             	|             	|
| Emblems (e.g. Lyre, Python, Raven)    	|             	|             	|
| Parents                               	|             	|             	|
| Children                              	|             	|             	|
| Siblings                              	|             	|             	|

## Connecting to MongoDB Atlas

There will be a lot going on in our server file since we are not only connecting to Atlas, but will also be adding middleware down the road to connect to GraphQL and configure Webpack. Because of this, we're going to configure our Express server in a standalone file. Additionally, for the sake of organization, it will be helpful to store all of our server files in their own directory.

Running `node server.js`, you should see the success message from MongoDB logged to the console.

## Populating the Database

In order to migrate the gods data to your database, you will first need to install the [MongoDB command line tools](https://docs.mongodb.com/v3.6/installation/). → `brew install mongodb-database-tools`

* Download the [data](https://assets.aaonline.io/graphql/projects/greek_gods/day_one/seed_data.zip), unzip, and then `cd` into that directory.

* Then, from the cluster page, go to the `Command Line Tools` tab and copy the first command under `Binary Import and Export Tools`.

* Change the password to your database user's password, then, on the end of the command, ad `--db <yourdbname>` followed by the name of one of the `bson` file (to only seed one), or `.` for all files.

    * Ensure that the `--db` flag is followed by the name of the database you are using for today's project. The name of your database can also be found in your `MONGO_URI`. For example, I used the following command to seed emblems (don't copy this exactly, use your own cluster info + password + db name):

    ```
    mongorestore --uri mongodb+srv://dev:<PASSWORD>@cluster.3susk.mongodb.net --db <yourdbname> .
    ```

    * Once you've executed the command, the greek gods data will be uploaded to your database.

## Configuring GraphQL

### Installation

Now that our database is populated, we are finally ready to add GraphQL to our project! We need to start by installing two npm packages:

* `graphql` allows us to build a type schema and serve queries against it.

* `express-graphql` configures our Express server to use GraphQL and provides us with the GraphiQL interface

### Root Queries

Recall that we need to configure root queries as "entry points" into our GraphQL application. Before we can configure Express w/ GraphQL, we need to create at least one root query before we can create a `GraphQLSchema` for our application.

### Configuring the Server

Now, we can configure our server with `express-graphql` using the schema file we have just created. The `expressGraphQL` middleware takes an object with options as an argument - the `schema` is the only required option. We'll pass `expressGraphQL` the schema we just defined as well as setting the option to use GraphiQL. Back in `server.js`, add the following code below the mongoose connection method and above the export line:

```js
// Don't forget to import your schema from ./schema/schema
const expressGraphQL = require("express-graphql");
const schema = require("./schema/schema");

// ...
// ...

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
```

Try restarting your server. You will notice that an error has been logged to the console: `MissingSchemaError: Schema hasn't been registered for model "god"`.

What is going on here? In short, your root query type is trying to access the god model before it has been seen by your application. Since it has not yet seen the model, Mongoose does not understand what you are querying for - the model has not yet been registered with Mongoose. We can fix this problem for good by making sure all of our models are imported into `server.js` by adding the line `const models = require('./models');` above the line where we import our schema.

Now, once you've stopped and restarted your server, you can open `localhost:5000/graphql` and test your root queries for god and gods. Although we cannot yet return complete information on our gods, we can list everything we've specified so far in our `GodType`.

### Nodemon

It's becoming tedious to restart the server each time we make a change, so let's add nodemon to our application to watch for changes. After installing the npm package, add the following script to your `package.json`:


```
"scripts": {
    "dev": "nodemon index.js"
},
```

Now we can simply run `npm run dev` once and Nodemon will watch for changes we make to our server.

Go to `http://localhost:5000/graphql` to test out your queries.

## Writing Mutations

Let's create a mutation to add a relative to a god. So far, we've been able to use built-in Mongoose methods to write each of our mutations (`findOneAndUpdate`, `remove`). However, most of the time there is simply no built-in method which can handle our needs. In these cases, we will have to write our own static methods on the corresponding model, just as we did to find relatives for the God type.

Let's write the first one together. The mutation itself is very straightforward.

```js
// ...
addGodRelative: {
    type: GodType,
    args: {
        godId: { type: GraphQLID },
        relativeId: { type: GraphQLID },
        relationship: { type: GraphQLString }
    },
    resolve(parentValue, { godId, relativeId, relationship }) {
        return God.addRelative(godId, relativeId, relationship);
    }
},
// ...
```

However, some complexity arises when we write the static method on the God model. Let's tackle it piece by piece. First, we define our `addRelative` method:

```js
GodSchema.statics.addRelative = (godId, relativeId, relationship) => {
  const God = mongoose.model("god");
};
```

However, we run into some difficulty right away. Although we can retrieve a single resource using `God.find`, we cannot call that method twice in order to retrieve two gods - Mongoose will throw an error. We could possibly call `mongoose.model('god')` a second time and assign it to another variable, but this would get messy quickly - how do we handle all of these promises and their results?

Fortunately, Mongoose allows us to query for multiple properties at once. We just have to modify the value of our query to take in an object with the key `$in`:

```js
God.find({
  _id: { $in: [godId, relativeId] }
});
```

As you might expect, the result of this query is returned in an array. You might also expect the results to match the order of the arguments which are passed in; however, this is not the case. Mongoose simply queries the database and adds results to the array as they are found. This means that our gods can be returned in any order, so we will need to find a way to determine which is which:

```js
God.find({
    '_id': { $in: [
        godId,
        relativeId
    ]}})
    .then(gods => {
        const god = godId === gods[0].id ? gods[0] : gods[1];
        const relative = relativeId === gods[0].id ? gods[0] : gods[1];
```

Now that we know which is which, we can build out the relationships depending on the value of the relationship string passed into the static method:

```js
GodSchema.statics.addRelative = (godId, relativeId, relationship) => {
  const God = mongoose.model("god");

  return God.find({
    _id: { $in: [godId, relativeId] }
  }).then(gods => {
    const god = godId === gods[0].id ? gods[0] : gods[1];
    const relative = relativeId === gods[0].id ? gods[0] : gods[1];

    switch (relationship) {
      case "parent":
        god.parents.push(relative);
        relative.children.push(god);
        break;
      case "child":
        god.children.push(relative);
        relative.parents.push(god);
        break;
      case "sibling":
        god.siblings.push(relative);
        relative.siblings.push(god);
        break;
    }

    return Promise.all([god.save(), relative.save()]).then(
      ([god, relative]) => god
    );
  });
};
```

`Promise.all` returns an array with all of our results, but we only care about returning the god we added a relative to.

Make sure to test your new mutation in GraphiQL before you move on.

As you can see, writing mutations in GraphQL can become a difficult exercise. It requires a good understanding of the server we are working with, and we have to explicitly define the information returned from our resolve functions. However, this hard work will pay off later when we build the frontend of our application.

## Mutations Continued

You will be writing the remaining mutations for this project. You will be able to use built in Mongoose methods to resolve some of them. For others, you will need to write a static method on the corresponding model to keep your code clean. There is rarely a one-size-fits-all solution when it comes to writing GraphQL mutations. Instead, you should utilize your knowledge of Mongoose and JavaScript to approach each mutation individually.

Write the following mutations and make sure to test each one to make sure everything works correctly!

* `removeGodRelative`

* `addGodEmblem`

* `removeGodEmblem`

* `updateGodAbode`

* `addGodDomain`

* `removeGodDomain`

* `newAbode`

* `deleteAbode`

* `updateAbode`

* `newEmblem`

* `deleteEmblem`

* `updateEmblem`
