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

This will set the initial state. However, we will need to update this value ourselves once we have logged a user in or out.

Head over to the `Login` component. We'll utilize the `update` Mutation prop in order to update the `isLoggedIn` value in the cache. The `update` prop takes in the Apollo cache as it's first argument, and the data received from the successfully completed mutation as the second argument.

Now we can add an `update` prop, which on mutation success, will write a new boolean to the cache. Your Login component will now look something like this:

```js
class Login extends Component {

//...

  updateCache(client, {data}) {
    console.log(data);
    // here we can write directly to our cache with our returned mutation data
    client.writeData({
      data: { isLoggedIn: data.login.loggedIn }
    });
  }

  render() {
    return (
        <Mutation
            mutation={LOGIN_USER}
            onCompleted={data => {
                const { token } = data.login;
                localStorage.setItem('auth-token', token);
                this.props.history.push('/');
            }}
            update={(client, data) => this.updateCache(client, data)}
        >
        // ...
        </Mutation>
  }
```

### Authentication and protected routes

Now we have the ability to log a user in and we have a variable in our Apollo cache to indicate whether a user is logged in or not. We are now at the point where we can create routes that will redirect based on whether a user is logged in or not.

Within `src`, create a new folder called `util`. Create a new file in `util` called `route_util.js`. Here, we will write a routing component which will read the `isLoggedIn` value from the cache and redirect the user dependent on their status.

First we need to write a query which reads the user's logged in status from our cache. To query the cache directly is very simple: we just need to add the `@client` directive.

When we use `@client` we are telling Apollo to send our query directly to the cache instead of making a request to our server server:

```js
// src/graphql/queries

import gql from "graphql-tag";

export default {
  // it's this simple to query our cache!
  IS_LOGGED_IN: gql`
    query IsUserLoggedIn {
      isLoggedIn @client
    }
  `

  //...
};
```

Now, once we have imported this query to our `route_util`, we can write an AuthRoute component. This component will act as both our 'protected' and 'authentication' route based on the `routeType`:

```js
import React from "react";
import { Route, Redirect } from "react-router-dom";
import { Query } from "react-apollo";
import Queries from "../graphql/queries";
const { IS_LOGGED_IN } = Queries;

// our route switches on routeType
const AuthRoute = ({
  component: Component,
  path,
  exact,
  routeType,
  ...rest
}) => (
  <Query query={IS_LOGGED_IN}>
    {({ data }) => {
      // if the route type is "auth" then this route will only render if the
      // user is not logged in - useful for authentication routes
      // like login or register
      if (routeType === "auth") {
        return (
          <Route
            path={path}
            exact={exact}
            render={props =>
              !data.isLoggedIn ? <Component {...props} /> : <Redirect to="/" />
            }
          />
        );
      } else {
        // otherwise this will be a protected route which will only
        // render the component if the user is logged in
        return (
          <Route
            {...rest}
            render={props =>
              data.isLoggedIn ? (
                <Component {...props} />
              ) : (
                <Redirect to="/login" />
              )
            }
          />
        );
      }
    }}
  </Query>
);

export default AuthRoute;
```

Back in `App.js`, let's use our `AuthRoute` in place of the existing `Route` for the login form:

```js
for the login form:

const App = () => {
  return (
    <div>
      <h1>Online Store</h1>
      <Switch>
        <AuthRoute exact path="/login" component={Login} routeType="auth" />
        <Route exact path="/" component={ProductIndex} />
      </Switch>
    </div>
  );
};
```

Now, if you try to visit the login page as a logged in user, you will be redirected to the home page. Similarly, for the rest of this project you can use the protected routes to redirect unauthenticated users to the home page.

### Navigation

Now that we have a couple routes let's make your site a little easier to get around by adding a `Nav` component. For now, it should provide new visitors with a link to log in, along with a button allowing logged in users to logout.

In the `components` directory create a new file named `Nav.js`. We can start with a simple link to login:

```js
// components/Nav.js

import React, { Component } from "react";
import { Link } from "react-router-dom";

const Nav = props => {
  return <Link to="/login">Login</Link>;
};

export default Nav;
```

Next we want to add some logic. If we are logged in then we want to display the link to log out and vice versa. We could do this in one of two ways: check `localStorage` for our `auth-token` or we could check the cache to see if a user `isLoggedIn`. We'll utilize the `IS_LOGGED_IN` query we just wrote to check our cache to see if this user is logged in.

```js
import { Query } from "react-apollo";
import Queries from "../graphql/queries";
const { IS_LOGGED_IN } = Queries;

const Nav = props => {
  return (
    <Query query={IS_LOGGED_IN}>
      {({ data }) => {
        // if we have some one logged in we show them a logout button
        if (data.isLoggedIn) {
          return <button>Logout</button>;
        } else {
          return (
            <div>
              <Link to="/login">Login</Link>
            </div>
          );
        }
      }}
    </Query>
  );
};
```

Now, in order to logout, we will do two things:

1. Remove the user's `auth-token` out of `localStorage`

2. Set our Apollo Cache's `isLoggedIn` value to false

We can accomplish the first goal easily using the `localStorage.removeItem` function:

```js
<Query query={IS_LOGGED_IN}>
  {({ data }) => {
    if (data.isLoggedIn) {
      return (
        <button
          onClick={e => {
            e.preventDefault();
            localStorage.removeItem("auth-token");
            // write to the cache?
            props.history.push("/");
          }}
        >
          Logout
        </button>
      );
    } else {
      return (
        <div>
          <Link to="/login">Login</Link>
        </div>
      );
    }
  }}
</Query>
```

However, we don't have access to the cache yet so we can't accomplish our second goal. The way to solve this problem is to utilize the `ApolloConsumer`. We can access the client, and therefore cache, directly using `ApolloConsumer`. The Apollo consumer receives your `ApolloClient` instance as its only argument. So if we wrap our component in an `ApolloConsumer` tag, we can then pass in our client instance to the code within that component in order to have access to our cache.

It'll make more sense when you see if below:

```js
// src/components/Nav.js

const Nav = props => {
  return (
    <ApolloConsumer>
      {client => (
        <Query query={IS_LOGGED_IN}>
          {({ data }) => {
            if (data.isLoggedIn) {
              return (
                <button
                  onClick={e => {
                    e.preventDefault();
                    localStorage.removeItem("auth-token");
                    client.writeData({ data: { isLoggedIn: false } });
                    props.history.push("/");
                  }}
                >
                  Logout
                </button>
              );
            } else {
              return (
                <div>
                  <Link to="/login">Login</Link>
                </div>
              );
            }
          }}
        </Query>
      )}
    </ApolloConsumer>
  );
};
```

Nice! Now you can import your new `Nav` component into `App.js` and have it render on every page of your application. Make sure you can log in and log out before moving on!

### Registration form

On your own, create a component which allows users to register for your application. Upon submission, the form should log in the user. As we know logging in the user means two things:

1. Setting the auth token in `localStorage`

2. Configuring our Apollo Cache to toggle `isLoggedIn` to true

Remember, we configured our server to return the user's token upon successful registration. Add a route for the `Register` component to `App.js`, and include a link to register in `Nav.js`.

## Phase G: All about those products

### Product index

Remember the `ProductIndex` component from earlier? Let's flesh it out a bit. Our goal is to allow users to view a product's name and description. Then a user should be able to click on a Product's name to be taken to the Product's Detail Page. You got this one! Change your `FETCH_PRODUCTS` frontend query in `src/graphql/queries` to fetch all the products along with their `_id`, `name`, and `description` and then create a `<Link>` tag to link to each product's detail page.

## Product detail

Now we'll create our `ProductDetail` component following the same process as above. Make sure your frontend query will accept the product's `_id` to fetch the details on this one product. Return the `name`, `description` and `weight` of the product from the query. Once your query is done, make sure to test it in `GraphiQL`, then move on to making your `ProductDetail` component. The component will take in the `variables` from React Router (`props.match.params`) and then you'll just return all the information from the query to your user. Nice! Add a route to view this component and make sure everything is working.

We'll add more functionality to this component in a bit, but let's first give the user the ability to create a new product.

## Create product

With all of this accomplished, have we **really** accomplished user authentication? Our users can login, register and logout. When they do so, a request is made to the backend which returns a session token that we attach to `localStorage` and updates our cache to specify that they are logged in.

However, we aren't really doing anything to **verify** our user yet besides when we refresh the page. Perhaps a savvy user could spoof their token to make it appear as if they are logged in. If they did this, they would have access to the protected routes that we created earlier. Right now, there's nothing stopping them from viewing any of the information we've made available to the frontend.

We aren't making use of our authentication token on the server except when we do a hard refresh of the cache. This has been okay so far because our users can only create an account, log in, or view the products in the store. However, now we'll be working on the `ProductCreate` component. We want to ensure that only a verified logged in user can create new products. There are a couple steps we can take to verify a user:

1. Send the user's token form `localStorage` in the header with every request to the server

2. Add the token to the GraphQL context so that it is available in our resolvers

3. Check the context in our `createProduct` mutation's resolver and only allow valid users to create a product

Let's get started with the first step!

In `src/index.js`, we can easily add our auth token to the `headers` for each request by adding a little configuration to our client. We simply need to add a 'headers' key to the configuration object for `createHttpLink` and specify we are passing an authorization header:

```js
// src/index.js
const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql",
  headers: {
    // pass our token into the header of each request
    authorization: localStorage.getItem("auth-token")
  }
});
```

Now our token will be passed to the server with each request.

In `server/server.js`, we will now need to reconfigure `express-graphql` to add the token to the GraphQL context. Right now, we are implicitly returning a configuration object. Let's refactor our middleware to accept a callback function with the `request` argument and return the configuration object explicitly:

```js
app.use(
  "/graphql",
  // now we are accepting the request in our middleware
  expressGraphQL(req => {
    return {
      schema,
      graphiql: true
    };
  })
);
```

We can pass in a key-value pair to the configuration object which specifies the context that will be passed into each resolver. The key **must** be `context`. The value is an object. We can pull the authorization header we specified a moment ago on the client from the `req` argument:

```js
// server/server.js

app.use(
  "/graphql",
  expressGraphQL(req => {
    return {
      schema,
      // we are receiving the request and can check for our
      // auth token under headers
      context: {
        token: req.headers.authorization
      },
      graphiql: true
    };
  })
);
```

The next step is to modify the resolve function for the `newProduct` mutation in our `server/schema/mutations.js`. Remember, we only want valid users to have the ability to create products. Yesterday we created a `verifyUser` method in our `auth.js` service which returns `true` if it finds a valid user from a signed session token. Now is the time for this function to shine!

First, we will pass in a third argument, `context`, to the resolve function. The `context` is an object shared by all resolvers, and since we added our auth token to the `context` in our `expressGraphQL` Middleware now all resolvers will have access to it.

So we will pull the token from the context and pass it to our `verifyUser` method. After that, it is a simple matter to either create a new product or throw a descriptive error message:

```js
// server/schema/mutations.js

async resolve(_, { name, description, weight }, ctx) {
    const validUser = await AuthService.verifyUser({token: ctx.token});

    // if our service returns true then our product is good to save!
    // anything else and we'll throw an error
    if (validUser.loggedIn) {
        return new Product({ name, description, weight }).save();
    } else {
        throw new Error('Sorry, you need to be logged in to create a product.');
    }
}
```

Now, if you try to create a new product in `GraphiQL`, you will see that your error message is returned - your authorization token was never stored on `localhost:5000`.

Let's create a `CreateProduct` component and test our work from the frontend. Head over to `frontend/src/components/products` and create a new file for `CreateProduct`. Add the `createProduct` mutation to your `mutations` file and import it here. Now we can construct a component to create a new Product:

```js
// src/components/products/CreateProduct.js

import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Mutations from "../../graphql/mutations";
import Queries from "../../graphql/queries";
const { CREATE_PRODUCT } = Mutations;
const { FETCH_PRODUCTS } = Queries;

class CreateProduct extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: "",
      weight: "",
      description: ""
    };
  }

  update(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  // we need to remember to update our cache directly with our new product
  updateCache(cache, { data }) {
    let products;
    try {
      // if we've already fetched the products then we can read the
      // query here
      products = cache.readQuery({ query: FETCH_PRODUCTS });
    } catch (err) {
      return;
    }
    // if we had previously fetched products we'll add our new product to our cache
    if (products) {
      let productArray = products.products;
      let newProduct = data.newProduct;
      cache.writeQuery({
        query: FETCH_PRODUCTS,
        data: { products: productArray.concat(newProduct) }
      });
    }
  }

  handleSubmit(e, newProduct) {
    e.preventDefault();
    newProduct({
      variables: {
        name: this.state.name,
        description: this.state.description,
        weight: parseInt(this.state.weight)
      }
    });
  }

  render() {
    return (
      <Mutation
        mutation={CREATE_PRODUCT}
        // if we error out we can set the message here
        onError={err => this.setState({ message: err.message })}
        // we need to make sure we update our cache once our new product is created
        update={(cache, data) => this.updateCache(cache, data)}
        // when our query is complete we'll display a success message
        onCompleted={data => {
          const { name } = data.newProduct;
          this.setState({
            message: `New product ${name} created successfully`
          });
        }}
      >
        {(newProduct, { data }) => (
          <div>
            <form onSubmit={e => this.handleSubmit(e, newProduct)}>
              <input
                onChange={this.update("name")}
                value={this.state.name}
                placeholder="Name"
              />
              <textarea
                onChange={this.update("description")}
                value={this.state.description}
                placeholder="description"
              />
              <input
                onChange={this.update("weight")}
                value={this.state.weight}
                placeholder="Weight"
                type="number"
              />
              <button type="submit">Create Product</button>
            </form>
            <p>{this.state.message}</p>
          </div>
        )}
      </Mutation>
    );
  }
}

export default CreateProduct;
```

Try creating a new product in the browser. As long as you are logged in, you will see a success message displayed when you create a new product! Amazing job give yourself a huge pat on the back. Now head down to bonus town and let's make our Online Store a little more versatile.

**Note**:If you did not finish the bonus from Part 1 of the Online Store Project then go back and finish that bonus before doing moving on.

## Bonus A: Adding a shopping cart

What good is a store without a shopping cart? Let's add some functionality to allow the user to add items to their cart. Our prices will fluctuate pretty wildly, but that's what you get when your store is just plain wacky. The cart should show a list of items along with their `name`, `price`, and `description`. It should also show the total cost of all items in the cart. We won't worry about handling quantity for now - an item is either in the cart or not. On a product detail page, if the product is not in the cart, we will show a button with the option to add it to the cart. Otherwise, we will show a button which allows us to remove it.

Head over to `client/src/index.js`. Let's add a cart to our local cache, represented as an array where we can push as many items as we'd like:

```js
// client/src/index.js

if (token) {
  client
    /* Use the `VERIFY_USER` mutation directly use the returned data to know if 
    the returned user is loggedIn */
    .mutate({ mutation: VERIFY_USER, variables: { token } })
    .then(({ data }) => {
      cache.writeData({
        data: {
          isLoggedIn: data.verifyUser.loggedIn,
          cart: []
        }
      });
    });
} else {
  /* Otherwise we can just set isLoggedIn to false */
  cache.writeData({
    data: {
      isLoggedIn: false,
      cart: []
    }
  });
}
```

Now we should create a query to fetch the existing items in the cart. Remember that we need to add the `@client` directive to our query so that it fetches from the cache:

```js
// src/graphql/queries.js

export default {
  // ...
  FETCH_CART_ITEMS: gql`
    query FetchCartItems {
      cart @client
    }
  `
};
```

Let's create an `AddToCart` component which we can include on the `ProductDetail`. This component will take two props - the `_id` and `cost` of a product. Our component will need to do several things:

1. We need to check to see if the product is in the cart already.

2. If the product isn't in the cart, it should display a button which, when clicked, does three things:

  * Push the `_id` and `cost` into a new object - we'll need the `cost` to calculate the cart's total, and we'll need the `_id` for subsequent checks.

  * Reads the cart array from the cache

  * Writes to the cache with the object we just created and the rest of the cart items.

3. If the item is already in the cart, display a button which prompts the user to remove that item from the cart. When this button is clicked, it should read the cart data from the cache and remove the item with a corresponding `_id`.

Add the `AddToCart` component to `ProductDetail`, taking care to pass in the correct props. Then test it out by adding and removing an item from your cart.

### Cart

Create a cart component which queries for the items in the cart and maps over them. Render a `CartItem` component for each item. Display the total cost at the bottom of the page. If there are no items in the cart, display a message saying that the cart is empty. Make sure to add a Route to view your cart to `App.js` and to your `Nav.js`.

### CartItem

Create a CartItem component which takes in an product ID and fetches the corresponding product. Display the product info for each item in the cart - `name`, `cost`, `weight`, and `description`.

## Bonus B: Persistent cache

If you refresh the page, you will see that your cart is reset. This is because the cache we have used (`InMemoryCache`) is not persistent. If you want to read about creating a persistent cache, you can do so [here](https://github.com/apollographql/apollo-cache-persist). Now get out there and create a persistent cache for your cart.


## Bonus C: Error handling

Our session forms currently do not handle errors. Implement error handling on the `login` and `register` forms. Look at the `CreateProduct` component if you need some inspiration.

## Bonus D: Cart Quantity

Right now, an item either exists in the cart or does not - we are not handling quantity. Add a `quantity` field to objects in the cart and add functionality which allows users to update the quantity of the items in their cart and save it.

## Bonus E: Product categories

Our store does not make use of product categories at all! Add functionality which allows an authenticated user to add new categories and update the category of a specific product. On the main page, list products under their specific categories.

## Bonus F: Styling

Time for everyone's favorite thing: styling. Let your inner artist go wild and make this wacky store beautiful! 🎨
