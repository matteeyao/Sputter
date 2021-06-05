# Greek Gods Frontend

Previously, we set up our server, configured GraphQL, wrote schemas for our data, and generated root queries and mutations. Today, we will be building off of that work to generate a frontend for our Greek Gods application.

Run `npm install` to install the node modules.

## Connect to MongoDB

You'll need to add your own connection string to the `server/config/keys.js` file. Log in to MongoDB Atlas, select the environment you made yesterday, and copy the connection string for that environment over to `keys.js`. Make sure to replace `<username>` and `<password>` with the username and password of a user with access to the database (you can always create a new user if you forgot your old one).

## React Setup

When developing an application for production, it is often useful to completely decouple the server and client so that they can be hosted separately. However for this project we’ll only being working in a development environment. We can therefore install all of our client dependencies in the root directory of our project for convenience.

Let's start by installing a few things we know we're going to need. Run `npm install react react-dom react-router-dom` so that we can begin to build out the index file for our client.

```
npm install react react-dom react-router-dom
```

Create a new directory in the root of the project called `client`. Within it, create two new files - `index.js` and `index.html`. Let's add some bare bones HTML to `index.html` with a root div we can connect our React application to:


```html
<html>
  <head>
    <title>Greek Gods Browser</title>
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>
```

Now we can instantiate our React application within `index.js`. Import `React` and `ReactDOM`, create a root component, and render it to the root div in `index.html`:

```js
// src/index.js
```

## Babel and Webpack

Let's add Babel loader to our project in order to transpose our JavaScript files using `Babel` and `webpack`. Install the following packages as development dependencies (you can do this using the `--save-dev` flag):

* `babel-loader`

* `@babel/core`

* `@babel/node`

* `@babel/preset-env`

* `@babel/preset-react`

```
npm install babel-loader @babel/core @babel/node @babel/preset-env @babel/preset-react
```

Next we'll configure Babel to make use of our React presets. In your root directory, create a file called `.babelrc` and add the following code:

```
{
  "presets": ["@babel/preset-react"]
}
```

We also will need to configure webpack to make use of babel-loader serve up our `index.html` file.

Install the following development dependencies in order to use Webpack in your project:

* `webpack`

* `webpack-dev-middleware`

* `html-webpack-plugin`

```
npm install webpack webpack-dev-middleware html-webpack-plugin
```

Create a file called `webpack.config.js` in the root directory and add the following code:

```js
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./client/index.js",
  output: {
    path: "/",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        use: "babel-loader",
        test: /\.js$/,
        exclude: /node_modules/
      },
      {
        use: ["style-loader", "css-loader"],
        test: /\.css$/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "client/index.html"
    })
  ]
};
```

Now we need to configure our server to make use of webpack. Within `server.js`, right before you export app, add the following code to configure your app to use the middleware for webpack:

```js
const webpackMiddleware = require("webpack-dev-middleware");
const webpack = require("webpack");
const webpackConfig = require("../webpack.config.js");

app.use(webpackMiddleware(webpack(webpackConfig)));
```

Finally, we need to configure our app to ignore the `client` folder when watching our files with nodemon(otherwise our server will restart unnecessarily). Add an ignore flag to the the `dev` script in your `package.json`:

```
"scripts": {
    "dev": "nodemon index.js --ignore client"
},
```

That should be about it! Start your server and open up a new browser window for `localhost:5000`, you should see your "Hello, world!" message. You should also still be able to navigate to `localhost:5000/graphql` to open up the GraphiQL interface.

## Preconfigured Styling

We've created a basic CSS file as a starting point for your styling for this application. You will need to perform a few steps to add it to your project:

* Create a new directory called `public` and put your downloaded `style.css` within it

* Configure express to allow access to this directory from the frontend by adding the following line in in `server/server.js` file: `app.use(express.static('public'));`

* Add the stylesheet to `client/index.html` (`<link rel="stylesheet" type="text/css" href="/style.css">`)

## Configuring Apollo

Now that we have finished the legwork of setting up React, let's configure the Apollo client and provide the cache to our application. Let's start by installing the npm packages we need to use Apollo in our application: `apollo-boost`, `react-apollo`, and `apollo-cache-inmemory`.

```
npm install apollo-boost react-apollo apollo-cache-inmemory
```

We'll start by configuring the cache for the Apollo Store. As we covered in the readings we can configure the Apollo Store to normalize the state shape so that all results returned from the server will have the `id` of the object pointing to the object itself. We'll do this using `dataIdFromObject` on all the data being returned from the backend. Add the following code to `client/index.js`:

```js
import { InMemoryCache } from "apollo-cache-inmemory";

/* Since we know our ids from Mongo will be unique we can use the `object.id` 
here for mapping our state shape within the `InMemoryCache`. Now the cache state 
shape will be {object.id: object} */
const cache = new InMemoryCache({
  dataIdFromObject: object => object.id || null
});
```

Now we can instantiate the Apollo client, passing in a configuration object. We will configure the client to use our `localhost:5000/graphql` endpoint, utilize the cache we have just created, and log errors to the console.

```js
// client/index.js
import ApolloClient from "apollo-boost";

// ...

const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  // using the cache we just created
  cache: cache,
  onError: ({ networkError, graphQLErrors }) => {
    console.log("graphQLErrors", graphQLErrors);
    console.log("networkError", networkError);
  }
});
```

Before we move on, we'll create one last file → `App.js`. Create a `components` directory and within create an `App.js` file:

```js
// client/components/App.js
import React from "react";

const App = () => <div>Routes go here!</div>;

export default App;
```

Back in `index.js`, we can now wrap our entire application with the Apollo Provider. Import the `App` component and the `HashRouter` (from `react-router-dom`) so that we can add routes to our application down the road. Now import `ApolloProvider` from `react-apollo` and add it to the Root component, along with `App` and the `HashRouter`:

```js
// client/index.js
import { ApolloProvider } from "react-apollo";

const Root = () => {
  return (
    // set up the ApolloProvider tag with the Apollo client we set up earlier
    <ApolloProvider client={client}>
      <HashRouter>
        <App />
      </HashRouter>
    </ApolloProvider>
  );
};
```

Later on we will nest our routes within the `App` component. Now that we've wrapped `App` in both the `ApolloProvider` and the `HashRouter` tags we've ensured that all our routes within the `App` component will have access to global history as well as the Apollo cache from the Apollo Provider.

## Creating the first component

With Apollo configured, we can move on to creating our first component. Let's begin by creating a home page which shows a list of all the gods in our database.

Before we can do that, we need to write a query to fetch the gods. Run `npm install graphql-tag` from the root directory to install the `graphql-tag` tag library. Now, navigate to `client` and create a new directory named `graphql`. This directory will be where we store all our frontend GraphQL queries and later our frontend mutations.

Within `graphql`, create a new file called `queries.js` and add the following code:

```js
import gql from "graphql-tag";

/* Use gql with a template literal to construct graphql queries */
export default {
  FETCH_GODS: gql`
    query FetchGods {
      gods {
        id
        name
        description
      }
    }
  `
};
```

Now that we have our query written we can move on to create a `GodsList` component. Within `components`, create a new directory called `gods`, and within that directory create a new file called `GodsList.js`.

Here, you should import React and the `FETCH_GODS` query you just wrote. We will be utilizing Apollo's `Query` component from `react-apollo`, as well as the `Link` component from `react-router-dom` so make sure to import those as well.

The `GodsList` component will be a functional component with a `ul` tag wrapped around our `Query` component. We then will pass the Query component the `FETCH_GODS` query as its query prop so that when the `Query` component mounts the first thing it will do is attempt to run the passed in `FETCH_GODS` query.

```js
// src/components/gods/GodsList.js
import Queries from "../../graphql/queries";
const { FETCH_GODS } = Queries;

const GodsList = () => {
  return (
    <div className="outer">
      <ul>
        <Query query={FETCH_GODS}>{() => {}}</Query>
      </ul>
    </div>
  );
};
```

Then in the `children` props for the `Query` component (the callback function within it), we will handle the loading and error state.

```js
// src/components/gods/GodsList.js
const GodsList = () => {
  return (
    <div className="outer">
      <ul>
        <Query query={FETCH_GODS}>
          {({ loading, error }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error</p>;
          }}
        </Query>
      </ul>
    </div>
  );
};
```

Finally, we map over the return value of our query, `data`, and create a new list item for each god. We will include each God's name and description as well as a `<Link/>` for each god based on their ID (we will create a detail component later). Put all together the component looks like this:

```js
// src/components/gods/GodsList.js
import React from "react";
import { Query } from "react-apollo";
import { Link } from "react-router-dom";

// import our FETCH_GODS query
import Queries from "../../graphql/queries";
// we denote FETCH_GODS with a constant for clarity that
// this is a GraphQL syntax tree object and only for queries
const { FETCH_GODS } = Queries;

const GodsList = () => {
  return (
    <div className="outer">
      <ul>
        <Query query={FETCH_GODS}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error</p>;

            return data.gods.map(({ id, name, description }) => (
              <li key={id}>
                <Link to={`/gods/${id}`}>
                  <h4>{name}</h4>
                </Link>
                <p className="description">Description: {description}</p>
              </li>
            ));
          }}
        </Query>
      </ul>
    </div>
  );
};

export default GodsList;
```

Now, let's return to `App.js` and add this component as the default view for our application. Import `GodsList` from the component directory and add a route for it nested under `App`:

```js
const App = () => {
  return (
    <div>
      <Route exact path="/" component={GodsList} />
    </div>
  );
};
```

Refreshing `localhost:5000`, you should see a list with the name and description of each god in your database.

## First Mutation

We have this nice list showing but now it's time to add some functionality. Let's create a button which allows us to delete gods from the index page. If you want to look over the mutation you wrote for this purpose yesterday take a look inside of `server/schema/mutations.js`. We'll now be creating a frontend mutation that will utilize the `deleteGod` mutation we wrote in the backend.

Within the `graphql` directory, create a new file called `mutations.js`. We'll set up this file in the same way we setup the `queries.js` file - by exporting a large object with all our mutations inside. Here will be the setup for our first mutation:

```js
import gql from "graphql-tag";

export default {
  /* Make sure to use the `mutation` key word when creating our frontend 
  mutations just like we would in GraphiQL */
  DELETE_GOD: gql`
    mutation DeleteGod($id: ID) {
      deleteGod(id: $id) {
        id
      }
    }
  `
};
```

Since the mutation component we are about to write is reasonably lengthy, we'll create a separate component for it. In `components/gods`, create a new file called `DeleteGod.js`. In this component, we make use of the `Mutation` component from the `react-apollo` library. We'll import the `DELETE_GOD` mutation and add it as the mutation prop for the `Mutation` component:

```js
import { Mutation } from "react-apollo";

// Import our DELETE_GOD mutation
import Mutations from "../../graphql/mutations";
const { DELETE_GOD } = Mutations;

const DeleteGod = props => {
  return (
    <Mutation mutation={DELETE_GOD}> {(deleteGod, { data }) => {}}</Mutation>
  );
};
```

The `Mutation` component also receives a `children` prop (a callback within the component). The first argument of the callback function `deleteGod` specifies the name of the function which, when invoked, will run this mutation. When we call this function, we need to pass it an argument containing the variables to be passed into the mutation. Since we know our `DELETE_GOD` mutation requires an `id` we can pass it the `id` this component will receive as a prop from the `GodList` component. The second argument we receive back from this mutation is an object with our mutation results.

Here is what our DeleteGod looks like:

```js
// src/components/DeleteGod.js
import React from "react";
import { Mutation } from "react-apollo";

import Mutations from "../../graphql/mutations";
const { DELETE_GOD } = Mutations;

const linkStyle = {
  cursor: "pointer",
  fontSize: "10px",
  color: "red"
};

const DeleteGod = props => {
  return (
    <Mutation mutation={DELETE_GOD}>
      {(deleteGod, { data }) => (
        <a
          style={linkStyle}
          onClick={e => {
            e.preventDefault();
            deleteGod({ variables: { id: props.id } });
          }}
        >
          <p>Delete</p>
        </a>
      )}
    </Mutation>
  );
};

export default DeleteGod;
```

Now, we simply need to import our newly created component to `GodsList` and add it to the list item for each god:

```js
// src/components/gods/GodsList.js
<li key={id}>
  <Link to={`/gods/${id}`}>
    <h4>{name}</h4>
  </Link>
  <p className="description">Description: {description}</p>
  <DeleteGod id={id} />
</li>
```

Test our your new component and.. wait? What? It didn't work? That's because the Apollo Store hasn't been informed that this God has been deleted. Even though we returned the `id` from the mutation it won't know to delete all reference to that `id` in the Apollo Store. Head back to `DeleteGod.js` and let's fix that.

As we covered in the readings last night we can pass a `prop` to the `Mutation` component to `refetchQueries` whenever our Mutation has been run. The `refetchQueries` functions does just as it's name implies and will refetch the information for the supplied query automatically once our mutation has run:

```js
// src/components/gods/DeleteGod.js
  <Mutation
      mutation={DELETE_GOD}
      refetchQueries={() => {
        return [
          {
            query: FETCH_GODS
          }
        ];
      }}
    >
```

Now try deleting a god once more and you should have your UI successfully update!

## Further Queries

In the following sections of this project we will be creating components for the purpose of creating new gods, emblems, and abodes. Additionally, we will create a component for detailed information on each god.

As you can imagine we will need to create a number of queries in order to accomplish this. Write these queries on your own - make sure you return complete information for each query (including `id`) and test them out in `GraphiQL` as you go.

Recall, if we need the Apollo Store to automatically update the data it has mapped internally to `{object.id}: object` we will need to make sure each query returns an `id` of whatever you are  querying for.

Add the following queries to your `queries.js` file, written using the `graphql-tag`. Below each query is the list of things that query should return.

1. **fetchAbode**: Should accept an `id` of an abode and return the `id`, `name`, and `coordinates` of that abode.

2. **fetchAbodes**: Should return the `id` and `name` of all abodes.

3. **fetchEmblems**: Should return the `id` and `name` of all emblems.

4. **fetchGod**: Should accept a gods' `id` and return:

  * id

  * name

  * type

  * description

  * domains

  * abode

    * id

    * name

  * emblems

    * id

    * name

  * parents

    * id

    * name

  * children

    * id

    * name

  * siblings

    * id

    * name

5. **fetchParents**: Should accept an `id` and return the `id` and `name` of each of the parents of that God.

6. **fetchSiblings**: Should accept an `id` and return the `id` and `name` of each of the siblings of that God.

7. **fetchChildren**: Should accept an `id` and return the `id` and `name` of each of the children of that God.

## Create new god

We now all have our queries ready for fetching let's get started by creating a component which will allow us to create a new god. First, we need to start by writing the necessary mutation:

```js
// client/graphql/mutations.js

export default {
  //...
  NEW_GOD: gql`
    mutation NewGod($name: String, $type: String, $description: String) {
      newGod(name: $name, type: $type, description: $description) {
        id
        name
        description
      }
    }
  `
};
```

Now that we have our query let's write our new component. Create a new directory within the `components` directory named `create`. This is where all of our forms will live. Make a new file within `create` called `GodCreate.js`, import React and the `Mutation` component, as well as your newly created mutation:

```js
import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Mutations from "../../graphql/mutations";
const { NEW_GOD } = Mutations;

class GodCreate extends Component {
  constructor(props) {
    super(props);
  }
}
```

Since this is a form for creating a new God we can set the state of our component to reflect what a God requires to be created `name`, `type`, and `description`. Additionally, we want to display a success message to our user once the god is successfully created, so our state our state will also include a `message` field.

The `Mutation` component we need to write in the render method is a bit tricky - we'll walk through what's happening slowly. First thing we'll return in the `GodCreate` component's `render` function is a `Mutation` component. The `Mutation` component will accept the `NEW_GOD` mutation as it's mutation prop.

```js
// remember to import your queries!

render() {
    return (
      <Mutation
        mutation={NEW_GOD}
      >
        {() => {}}
        </Mutation>
    );
}
```

Now to handle what will be inside the `Mutation` component callback. So we know the first argument in the callback of a `Mutation` component is the function to be invoked for our mutation to run, and the second argument is the returned data. We'll focus more on those in a minute but for now we'll just pass them in:

```js
render() {
    return (
      <Mutation
        mutation={NEW_GOD}
      >
        {(newGod, {data}) => {}}
        </Mutation>
    );
}
```

Now let's build our form! Inside the return value for the inner `Mutation` component callback create a `<form>` tag we'll use to wrap all our inputs. Create an `input` tag for a Gods' name, a `textarea` tag for a god's description, and a `select` tag for the god's type with the two `options` of "God" or "Goddess". Finally create a `submit` button for creating a god.

Create functions that will update the component's state based on when a user changes the value inside of any of the given inputs.

Once that's all set up we will now write a function for `handleSubmit` on our `form` tag. This `handleSubmit` function will accept the submit event and the `newGod` function our `Mutation` callback passed in.

Like it's name implies `handleSubmit` will be in charge of the submit logic for this mutation. Take a look at the function we wrote below:

```js
  handleSubmit(e, newGod) {
    e.preventDefault();
    let name = this.state.name;

    // our newGod function will accept an object with the key of "variables" pointing to an object with all our passed in variables.
    newGod({
      variables: {
        name: name,
        type: this.state.type,
        description: this.state.description
      }
    })
    // after our mutation has run we want to reset our state and show our user the success message
    .then(data => {
      console.log(data);
      this.setState({
        message: `New god "${name}" created successfully`,
        name: "",
        type: "god",
        description: ""
      });
    })
  }
```

Since we are adding new data we will want to make sure to update our `cache` when the mutation to add a new God goes through. We could use `refreshQueries` again but since all we'll be doing is adding a new god to our list of gods, running an entirely new query is wasteful. We'll start by adding the `update` prop to our `Mutation` component. As a reminder: the `update` function will give you access to the cache as the first argument and the data returned from the mutations at the second. We can handle the logic for updating the cache in a separate function elsewhere by passing these arguments off like so:

```js
<Mutation mutation={NEW_GOD} update={(cache, data) => this.updateCache(cache, data)} >
```

Now let's tackle the `updateCache` function. In this function we will want to do two things: read the cache using `cache.readQuery` and then write to the cache adding our new god using `cache.writeQuery`.

We want to make sure our God Index refreshes whenever we add a new god so we'll be updating our `FETCH_GODS` query. The first thing we need to do is read what is currently in the cache for that query:

```js
// we are destructing here to make our code more readable
updateCache(cache, { data: { newGod } }) {
  let { gods } = cache.readQuery({ query: FETCH_GODS });
}
```

Then we need to write over our old query with it's previous results plus our new God:

```js
updateCache(cache, { data: { newGod } }) {
  let { gods } = cache.readQuery({ query: FETCH_GODS });
    // then we write over our results
    cache.writeQuery({
      query: FETCH_GODS,
      data: { gods: gods.concat(newGod) }
    });
}
```

Pretty simple right? But what if our cache is empty? Say a user refreshes on the page to create a new god so we no longer have any data in our Apollo cache. If you attempt to read a cache that does not currently have the data for the query you are looking for Apollo will throw a hard error and your application will crash. Well we can't have that can we? We can utilize JavaScript's `try` and `catch` to get around this limitation:

```js
  updateCache(cache, { data: { newGod } }) {
    let gods;
    try {
      // we'll try to read from our cache but if the query isn't in there no sweat!
      // We only want to update the data if it's in the cache already - totally fine if the data will
      // be fetched fresh later
      gods = cache.readQuery({ query: FETCH_GODS });
    } catch (err) {
      return;
    }

  // then our writeQuery will only run IF the cache already has data in it
    if (gods) {
      let godArray = gods.gods;

      cache.writeQuery({
        query: FETCH_GODS,
        data: { gods: godArray.concat(newGod) }
      });
    }
  }
```

One last step: we'll add a `p` tag outside of our form tag to show the user the success message. Putting together what we've built so far your render function should look something like this:

```js
render() {
  return (
    <Mutation
      mutation={NEW_GOD}
      update={(cache, data) => this.updateCache(cache, data)}
    >
      {(newGod, { data }) => (
        <div>
          <form onSubmit={e => this.handleSubmit(e, newGod)}>
            <input
              onChange={this.update("name")}
              value={this.state.name}
              placeholder="Name"
            />
            <select value={this.state.type} onChange={this.update("type")}>
              <option value="god">God</option>
              <option value="goddess">Goddess</option>
            </select>
            <textarea
              value={this.state.description}
              onChange={this.update("description")}
              placeholder="description"
            />
            <button type="submit">Create God</button>
          </form>
          <p>{this.state.message}</p>
        </div>
      )}
    </Mutation>
  );
}

export default GodCreate;
```

Add a route for your `GodCreate` component in `App` and test it out in the browser. Once you have created a new god, it should be immediately visible on your index page. Try refreshing on your new route for creating a God and ensure everything works perfectly.

### EmblemCreate

Add a component which allows you to create a new emblem. This component will be very similar to the `GodCreate` component, although it will be even simpler since an emblem requires only a single field. Use the update function for this component to update the `FETCH_EMBLEMS` query it it already exists in our cache.

### AbodeCreate

Write a component to create a new abode. You only need to include the `name` and `coordinates` fields - we will later add abodes for gods on their detail pages. Use the `update` function for this component to update the `FETCH_ABODES` query it it already exists in our cache.

### Create Index

Rather than utilizing different routes for the creation of each new type, it would be helpful to have a `Create` component which allows us to create a singular `/new` route and allows us to switch between each form. Write this on your own, or feel free to use the one we wrote:

```js
import React, { Component } from "react";
import GodCreate from "./GodCreate";
import AbodeCreate from "./AbodeCreate";
import EmblemCreate from "./EmblemCreate";

class Create extends Component {
  constructor(props) {
    super(props);

    this.state = {
      createType: "god"
    };

    this.updateSelection = this.updateSelection.bind(this);
  }

  updateSelection(e) {
    e.preventDefault();
    this.setState({ createType: e.target.value });
  }

  render() {
    let form;

    if (this.state.createType === "god") {
      form = <GodCreate />;
    } else if (this.state.createType === "abode") {
      form = <AbodeCreate />;
    } else if (this.state.createType === "emblem") {
      form = <EmblemCreate />;
    }

    return (
      <div className="styled-select slate">
        <select onChange={this.updateSelection}>
          <option value="god">God</option>
          <option value="abode">Abode</option>
          <option value="emblem">Emblem</option>
        </select>
        <h4>Create a new {this.state.createType}</h4>
        {form}
      </div>
    );
  }
}

export default Create;
```

Now we can add a route to this component in `App.js`:

```js
const App = () => {
  return (
    <div>
      <Route exact path="/" component={GodsList} />
      <Route exact path="/new" component={Create} />
    </div>
  );
};
```

### Navigation

At this point, it would be useful to create a small navigation component so that we do not have to enter the URLs manually. Write this component on your own, it will be a component that will be present on every page providing a `<Link>` back to the index page and another `<Link>` to `/new`. Add your navigation component to `App.js` so that it will show on every route.

## God Detail

The most important component of our application is the `GodDetail` component. On this page, we will be able not only to view information about a god, but to update it as well. This is where we will add or update a god's abode. It is also where we will handle the addition of relatives to a god's profile, and update information such as emblems, domains, and name/description.

Here is the basic skeleton for this component, with the render method returning a `Query` component using `FETCH_GOD` to return all the data on a single god. We can retrieve the god's `id` from the URL string:

```js
import React, { Component } from "react";
import { Query } from "react-apollo";
import FETCH_GOD from "../../queries/fetchGod";

const GodDetail = props => {
  render() {
    return (
      // there we are getting the `id` for our query from React Router
      <Query query={FETCH_GOD} variables={{ id: props.match.params.id }}>
        {({ loading, error, data }) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error</p>;

          return <div className="detail" />;
        }}
      </Query>
    );
  }
}

export default GodDetail;
```

Make sure to add a route for this component and add a `Switch` to make our app easier to navigate:

```js
const App = () => {
  return (
    <div>
      <Switch>
        <Route exact path="/gods/:id" component={GodDetail} />
        <Route exact path="/new" component={Create} />
        <Route path="/" component={GodsList} />
      </Switch>
    </div>
  );
};
```

This component will get complicated quickly if we do not deconstruct it into sub-components. Remember, we need to be able to update all a God's information as well as display it. Because of this, it will be easiest if we create a component for each field on a god, passing in the props needed to render that specific component. Let's write the first of these components together.

## NameDetail

Within the components directory, create a new folder called `detail`. Create a new file there called `NameDetail.js`. Here, we will create a component that will utilize the component's state to specify whether or not the user is currently editing the name field. If they are, we will display a form embedded within a `Mutation` component. If they are not, we will simply display the name alongside an icon which they can click on to enter the 'editing' state.

First step, we create a mutation to update the name of a god:

```js
import gql from "graphql-tag";

export default gql`
  mutation updateGod($id: ID, $name: String) {
    updateGod(id: $id, name: $name) {
      id
      name
    }
  }
`;
```

We've provided you this subcomponent as an example for working on the rest of these smaller detail components. Here is how we wrote our `NameDetail` component:

```js
import React from "react";
import { Mutation } from "react-apollo";
// we added the "react-icons" library to have access to a pencil icon for editting
import { IconContext } from "react-icons";
import { FaPencilAlt } from "react-icons/fa";
import UPDATE_GOD_NAME from "../../mutations/updateGodName";

class NameDetail extends React.Component {
  constructor(props) {
    super(props);

    // since we know we'll be receiving the god's name through props
    // we can set it in our state
    this.state = {
      editing: false,
      name: this.props.god.name || ""
    };

    this.handleEdit = this.handleEdit.bind(this);
  }

  // this is the function that will trigger "editing" mode
  handleEdit(e) {
    e.preventDefault();
    this.setState({ editing: true });
  }

  fieldUpdate(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  render() {
    // if we are editing we'll return a Mutation component
    if (this.state.editing) {
      return (
        <Mutation mutation={UPDATE_GOD_NAME}>
          {(updateGodName, data) => (
            <div>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  updateGodName({
                    variables: { id: this.props.god.id, name: this.state.name }
                  }).then(() => this.setState({ editing: false }));
                }}
              >
                <input
                  value={this.state.name}
                  onChange={this.fieldUpdate("name")}
                />
                <button type="submit">Update Name</button>
              </form>
            </div>
          )}
        </Mutation>
      );
    } else {
      return (
        <div>
          <div
            onClick={this.handleEdit}
            style={{ fontSize: "10px", cursor: "pointer", display: "inline" }}
          >
            <IconContext.Provider value={{ className: "custom-icon" }}>
              <FaPencilAlt />
            </IconContext.Provider>
          </div>
          <h2>{this.state.name}</h2>
        </div>
      );
    }
  }
}

export default NameDetail;
```

Now you may have noticed we didn't call either `update` or `refetchQueries` in this Mutation component. That is because our Apollo cache is going to handle updating the `God` everywhere in our application for us. Remember in the beginning of this application when we set up our Apollo Client with a cache:

```js
// client/index.js

import { InMemoryCache } from "apollo-cache-inmemory";
const cache = new InMemoryCache({
  dataIdFromObject: object => object.id || null
});
```

We set all our objects to pointing to their `ids` like so: `{[object.id]: object}`. Now whenever we run a mutation to update data that was previously in our cache as long as we return the `id` with that mutation the cache will automatically update that field in the object for you. Don't just believe us though try it out yourself!

We can now add this component to `GodDetail`:

```js
// client/components/gods/GodDetail.js

return (
  <div className="detail">
    <NameDetail id={data.god.id} name={data.god.name} />
  </div>
);
```

Now test that this works and try to change the name of a god or goddess. If the name updates everywhere in your `ui` without refresh then everything is working as it should!

Now we'll continue to build out components on `GodDetail` which allow you to view and update information on a god. Some of these will be just as simple as the `NameDetail` component we just wrote, while others will require an increasing complexity. Sounds like fun right?

### TypeDetail

Write a component which allows you to change the type of a god to `god` or `goddess`. The user should be able to select these options from a dropdown menu, which immediately updates the type upon selection.

### DescriptionDetail

Editing this component should display a textarea with the existing information on a god, allowing the user to edit it and submit the changes.

### DomainsDetail

Each god or goddess has emblems, but they also have domains. For example, Apollo's symbols are the lyre, laurel and wreath, but his domains are music, poetry, and the arts. Domains do not have their own GraphQL type on the server and are instead stored directly on the god in an array. Write a component to show these domains for each god and mutations to allow users to add new domains, and delete old domains. You may want to split this up into separate `AddDomain` and `DeleteDomain` components.

### AbodeDetail

This component is slightly more complex than those previous. We will not only need a `Mutation` Component but also a `Query` component for fetching abodes. When a user is editing a god's abode you will have to use your `FETCH_ABODES` query to populate a dropdown menu containing all of the abodes on your server. Upon selection, update the abode of the selected god.

### EmblemsDetail

This component is similar to the last in that you will need to populate a list of all existing emblems, but although a god can only have one abode, they can have many emblems. Write a component which allows users to add existing emblems to a god. Once an emblem has been added, it should be added to the detail view for that God and removed from the list of emblems which can be added to a god (so you can't re-add the same Emblem).

### RelativesDetail

Write a single component which can display a god's parents, children, or siblings. Pass the relationship type as a prop to the component. Then in the component you'll have to do the work of listing all the possible Gods as a new relative. Make sure that a God can't be their own relative, and that Gods can't be re-added if they are already that kind of relative (no adding the same parent twice).

## Styling

We started you off with a very basic styling sheet but now it's time to practice your CSS skills and make this application shine! Style all the pages you've made so far. Don't hesitate to change up the [colors](https://coolors.co/app) and [fonts](https://fonts.google.com/)!



















