# Online Store App (Frontend)

For today's project, we are going to continue to build the Online Store we started yesterday. Our focus for today will be completing our authentication cycle by adding frontend authentication. Once we have finished user authentication (`register`, `login` and `logout`) our users will be able to view and create products in our store.

## Phase D: React Setup

We are going to speed up the React set for this project by using `create-react-app`. The last time we built the frontend for the Greek Gods project, we installed React at the project root. This time, we will decouple the frontend from the backend so that they could be hosted separately.

1. Run `npm install -g create-react-app` to install `create-react-app` globally.

    * Update `npm` if prompted to do so.

    * If you currently have `webpack` in the `package.json` for your project remove it, delete both your `package.json.lock` and your `node_modules` and run `npm install` again.

2. In the root directory of the project, run `create-react-app client`

    * When the script is finished running, you'll see a new `client` folder in your root directory which contains a simple, standalone react application.

    * If you look in the `client` directory, you will notice that it has its own `node_modules` folder. Make sure to `.gitignore` this folder.

3. React will be running on its own development server, `localhost:3000`. While we could write separate commands to run each server, wouldn't it be nice to run both at the same time? We will use an npm package called `concurrently` in order to run both servers at once.

    * Navigate to the root directory of your project

    * Run `npm install concurrently`

4. Add four new scripts to your `package.json` in the root of your project:

    * `"client-install": "npm install --prefix client"` (This will allow users who download your project from GitHub to easily install dependencies from both folders)

    * `"client": "npm start --prefix client"`

    * `"server": "nodemon index.js"`

    * `"dev": "concurrently \"npm run server\" \"npm run client\""` (replace your old dev script with this one)

Now, if we run `npm run dev` in the terminal, both of our servers will start running. You can view the frontend on `localhost:3000`. If you run into a compatibility error, make sure that the version of webpack in your root `package.json` matches with the version installed with `create-react-app`. Update the version number in the root `package.json`, delete the `node_modules` folder and `package-lock.json`, and run `npm install` again.

## Phase E: Apollo setup

Before we do anything else, we need to configure the Apollo cache, instantiate the Apollo client, and provide the client to the entirety of our React application using the Apollo Provider. Start by installing the following npm packages (make sure you do this within the `client` folder, which is where we will be working from today unless specified otherwise):

* `apollo-client` ― the Apollo client, which allows us to easily build components that fetch data using GraphQL

* `apollo-cache-inmemory` ― a cache implementation for Apollo

* `apollo-link-http` ― allows us to get GraphQL results over a network using HTTP fetch

* `react-apollo` ― the React integration for the Apollo Client

* `apollo-link-error` ― will provide us w/ more descriptive errors from our server

* `apollo-link` ― to connect our http and error handling libraries

```
npm install apollo-client apollo-cache-inmemory apollo-link-http react-apollo apollo-link-error apollo-link
```

Head over to `index.js` in the `src` folder, which contains the root of your React application. We need to import the Apollo Client, the cache, the link module, as well as Apollo's Provider:

```js
// src/index.js

import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloProvider } from "react-apollo";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
```

Setting up the cache is incredibly simple. We simply need to instantiate a new `InMemoryCache` mapping all of our objects to their `_id`s:

```js
// src/index.js

const cache = new InMemoryCache({
  dataIdFromObject: object => object._id || null
});
```

Next, since our backend and frontend are now being hosted on different servers we need to use the `apollo-link-http` library to help us carry data between our two servers. We can use the `createHttpLink` function to make requests over HTTP to our `graphql` endpoint to get information from our backend. The `createHttpLink` function takes an options object.

We will also configure `onError` from the `apollo-link-error` library to log any errors we receive from our backend.

So we will specify the endpoint of our server, and set up our error handling:

```js
// src/index.js

const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql"
});

// make sure we log any additional errors we receive
const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message));
});
```

Next we can instantiate our client, which also takes an options object. We will specify `link` to tell the cache how to fetch data using our `createHttpLink` and our error handling using `ApolloLink`, as well as pass in the `cache` we just created:

```js
// src/index.js

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache
});
```

The options object for `ApolloClient` can also take an `onError` option so that we can specify how to handle errors. For our purposes, it is enough to simply `console.log` any error we encounter:

```js
// src/index.js

const client = new ApolloClient({
  link: httpLink,
  cache,
  onError: ({ networkError, graphQLErrors }) => {
    console.log("graphQLErrors", graphQLErrors);
    console.log("networkError", networkError);
  }
});
```

W/ our cache configured, we are now ready to provide it to our application. In the past, you have probably used React's context `Provider` to provide your `Redux` store to the component tree. Similarly, `ApolloProvider` can be configured to provide the Apollo Client, and therefore the cache, to each of its children. Incredibly, this is essentially the only configuration we need to do in order to replace the Redux cycle in our application. The `Apollo cache` is remarkably easy to use - for the most part, as long as we are returning the appropriate data from our mutations, the `cache` will update automatically and refresh the information displayed on the page.

Let's create a `Root` component and wrap our entire application in the `ApolloProvider`:

```js
// src/index.js

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
```

You can leave the `serviceWorker.unregister()` line at the bottom of `index.js`. If you'd like to read more about what it does, follow the `bit.ly` link that was generated w/ `create-react-app`.

## Test query

To make sure we have configured everything correctly so far, let's create a `Query` component to try and return some information from the backend. Since `<App>` is wrapped in the ApolloProvider, we can write it there. We'll need the `graphql-tag` library to write this query, so make sure to install it before moving on.

Head over to `src/App.js` and remove everything in the render method's return statement. Let's replace it instead w/ a Query component from `react-apollo`:

```js
// src/App.js

import React, { Component } from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";

const FETCH_PRODUCTS = gql`
  {
    products {
      _id
      name
    }
  }
`;

const App = () => {
  return (
    <Query query={FETCH_PRODUCTS}>
      {({ loading, error, data }) => {
        if (loading) return "Loading...";
        if (error) return `Error! ${error.message}`;

        return (
          <ul>
            {data.products.map(product => (
              <li key={product._id}>{product.name}</li>
            ))}
          </ul>
        );
      }}
    </Query>
  );
};

export default App;
```

If you open `localhost:3000` in your browser you will see that an error has been logged from the Query component: `Network error: Failed to fetch`. Open the Chrome developer tools and take a look at the error message. What is going on here?

We have encountered the legendary, and not so rare, `CORS` error. Without getting into too much detail, we are not allowed to simply make a request between two local servers. We will need to relax our CORS restrictions in order to allow our requests to pass through uninterrupted during development. Fortunately, there is an `npm package` which will allow us to solve this problem easily.

Navigate to your root directory and run `npm install cors`. We'll use this library as middleware for Express to enable `CORS`.

In `server/server.js`, require `cors`. Then, before you add the `express-graphql` middleware, add the `cors` middleware to your application:

```js
// server/server.js
const cors = require("cors");
//...
app.use(cors());

app.use(
  "/graphql",
  expressGraphQL({
    schema,
    graphiql: true
  })
);
// ...
```

Now restart your server and try refreshing `localhost:3000`, you should see your products rendered after the initial loading message.

Let's take a minute and refactor before moving on. We want to render our routes in `App.js` so let's move our test query into a separate component. Within `src`, create a new `components` folder. Move the `App.js` file within this folder. Before moving on make sure to install React Router: `npm install react-router-dom`.

Create a `src/graphql` folder then create a file for `mutations` and a file for `queries`. Remove the `FETCH_PRODUCTS` query from `App.js` and move it into your `queries` file. Within the `components` directory create a `products` directory.

Within `products` create a `ProductIndex.js` and move the code `App.js` is currently rendering into a new component called `ProductIndex`. Make sure your import your `FETCH_PRODUCTS` query into `ProductIndex.js`.

Finally create a `<Route>` in `App.js` so that when a user is on the path of `/` the `ProductIndex` is rendered:

```js
// src/components/App.js

const App = () => {
  return (
    <div>
      <h1>Online Store</h1>
      <Route exact path="/" component={ProductIndex} />
    </div>
  );
};
```

Awesome! Make sure your products list is rendering on `http://localhost:3000/#/` before moving on.

## Phase F: Frontend user authentication

Let's now work on creating a component which allows users to login into our online store.

Add a `Login.js` file within `components` and create a new React component.

We will create a `Mutation` Component with input fields for an email and a password, along with a button to submit the form. Once the form has submitted and returns successfully we’ll create a separate function to save the user’s returned authentication token to `localStorage` before redirecting the user to our product index page.

Let's start by adding our frontend mutation to `src/graphql/mutations.js`:

```js
const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      loggedIn
    }
  }
`;
```

With the mutation finished, we can start to create our `Login` component. We'll start by setting up the state for an email and password. As well as creating a function we can use to update our state:

```js
import React, { Component } from "react";
import { Mutation } from "react-apollo";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  update(field) {
    return e => this.setState({ [field]: e.target.value });
  }
}
```

Then we'll begin to work on our `render` method. Starting w/ our `Mutation` component. We'll use the `LOGIN_USER` mutation we just wrote:

```js
render() {
    return (
      <Mutation
        mutation={LOGIN_USER}
        onCompleted={data => {
          const { token } = data.login;
          localStorage.setItem("auth-token", token);
          this.props.history.push("/");
        }}
      >
        {() => {}}
      </Mutation>
    );
}
```

In the above snippet we utilized the `onCompleted` prop, which accepts a callback to be called upon successful mutation completion. When our mutation goes through it will return the `token` and `loggedIn` like we previously specified in our frontend mutation. We can then set the returned token into `localStorage` effectively making our own cookie.

Let's now finish the `Mutation` component by adding the rest of our login form inside:

```js
render() {
    return (
      <Mutation
        mutation={LOGIN_USER}
        onCompleted={data => {
          const { token } = data.login;
          localStorage.setItem("auth-token", token);
          this.props.history.push("/");
        }}
      >
        {loginUser => (
          <div>
            <form
              onSubmit={e => {
                e.preventDefault();
                loginUser({
                  variables: {
                    email: this.state.email,
                    password: this.state.password
                  }
                });
              }}
            >
              <input
                value={this.state.email}
                onChange={this.update("email")}
                placeholder="Email"
              />
              <input
                value={this.state.password}
                onChange={this.update("password")}
                type="password"
                placeholder="Password"
              />
              <button type="submit">Log In</button>
            </form>
          </div>
        )}
      </Mutation>
    );
}
```

Back in `App.js` import `Switch` from `react-router-dom`. Now you can add your `Login` component to your routes:

```js
// src/components/App.js

const App = () => {
  return (
    <div>
      <h1>Online Store</h1>
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route path="/" component={ProductIndex} />
      </Switch>
    </div>
  );
};
```

Test our your login component in Chrome by logging in an existing user (one that you created in in `GraphiQL`). If you navigate to the 'Application' tab in Chrome developer tools, you will see the user's auth-token stored in Local Storage.

### Adding Local State

Next we'll setup Authentication and Protected routes to redirect users dependent on whether or not they are logged in. We are not using Redux in our application, but we would still like to have a local state we could use to check whether or not the user is logged in. Fortunately, Apollo allows us to write to the cache directly so we can implement a `loggedIn` boolean in our cache.

In `client/index.js`, after you define the Apollo client with your instantiated cache, add the following bit of code to add an `isLoggedIn` variable in the cache which will be dependent on whether a session token exists in `localStorage`:

```js
// client/index.js

// we'll check localStorage to see if a token exists
cache.writeData({
  data: {
    isLoggedIn: Boolean(localStorage.getItem("auth-token"))
  }
});
```

Wait a minute though - what if a user created a value in their `localStorage` named "auth-token"? Then we'd be labelling them as `isLoggedIn` w/o doing any check to see if that is actually true. Let's buff up the security on our cache by making sure that the token we fetched from `localStorage` actually belongs to a logged in User. We can make use of the `verifyUser` mutation from yesterday to do so.

First we'll need to write a new mutation in `src/graphql/mutations` that will accept a token and verify if that user is logged in or not by returning the value for `loggedIn`:

```js
VERIFY_USER: gql`
  mutation VerifyUser($token: String!) {
    verifyUser(token: $token) {
      loggedIn
    }
  }
`;
```

Then we'll import that new mutation into `src/index.js`. Since we have access to the client directly we can use the `mutate` on the client to run our mutation and pass in the token as our variable:

```js
// src/index.js

// if we have a token we want to verify the user is actually logged in
const token = localStorage.getItem("auth-token");

// to avoid components async problems where
// a component would try to read the cache's value of isLoggedIn
// before our mutation goes through we can set it up here
cache.writeData({
  data: {
    isLoggedIn: Boolean(token)
  }
});

// then if we do have a token we'll go through with our mutation
if (token) {
  client
    // use the VERIFY_USER mutation directly use the returned data to know if the returned
    // user is loggedIn
    .mutate({ mutation: VERIFY_USER, variables: { token } })
    .then(({ data }) => {
      cache.writeData({
        data: {
          isLoggedIn: data.verifyUser.loggedIn
        }
      });
    });
}
```




