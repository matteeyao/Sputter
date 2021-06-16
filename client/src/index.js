import React from "react";
import ReactDOM from "react-dom";
// import "./public/index.css";
import App from "./components/App";
import { HashRouter } from "react-router-dom";

import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { ApolloProvider } from "react-apollo";
import { ApolloLink } from "apollo-link";
import { onError } from "apollo-link-error";

import Mutations from "./graphql/mutations";
const { VERIFY_USER } = Mutations;

const cache = new InMemoryCache({
  dataIdFromObject: object => object._id || null
});

const errorLink = onError(({ graphQLErrors }) => {
  if (graphQLErrors) graphQLErrors.map(({ message }) => console.log(message));
});

const httpLink = createHttpLink({
  uri: "http://localhost:5000/graphql",
  headers: {
    authorization: localStorage.getItem("auth-token")
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, httpLink]),
  cache,
  onError: ({ networkError, graphQLErrors }) => {
    console.log("graphQLErrors", graphQLErrors);
    console.log("networkError", networkError);
  }
});

/* To avoid components` async problems where a component would try to read the
cache's value of `isLoggedIn` before our mutation goes through we can set it up
here */
cache.writeData({
  data: {
    isLoggedIn: false,
    cart: []
  }
});

/* If we have a token we want to verify the user is actually logged in */
const token = localStorage.getItem("auth-token");

/* Then if we do have a token we'll go through w/ our mutation */
if (token) {
  client
    /* Use the `VERIFY_USER` mutation directly use the returned data to know if
    the returned user is `loggedIn` */
    .mutate({ mutation: VERIFY_USER, variables: { token } })
    .then(({ data }) => {
      cache.writeData({
        data: {
          isLoggedIn: data.verifyUser.loggedIn,
          cart: []
        }
      });
    });
}

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <HashRouter>
        <App />
      </HashRouter>
    </ApolloProvider>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
