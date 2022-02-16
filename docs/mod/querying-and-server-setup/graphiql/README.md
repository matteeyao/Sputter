# Graphiql

We'll be making use of a tool called Graphiql in today's project as we begin to practice writing queries, fragments, and mutations. Let's take a moment to familiarize ourselves with Graphiql's interface before we get started.

## What is Graphiql?

Graphiql is browser based IDE for writing GraphQL queries. It allows us to write test queries on our actual server, and provides us with a documentation explorer which we can use to quickly view our application's schema.

When we open Graphiql in the browser, we see two panels. We write queries in the left-hand panel. Once we click the 'Play' button at the top of the screen, the query is executed and the result is displayed in the right-hand panel.

When we configure a GraphQL application, we define our data in 'types,' with each type representing a singular resource on the server. Graphiql knows this schema and provides us with error highlighting and prompts. If we try to query for a variable which is not present on the current type, the variable will be underlined in red. Hovering over the variable will also display an error message.

![Graphiql error highlighting](https://assets.aaonline.io/graphql/d1/graphiql_2.png)

If we hover over any valid variable, a modal appears which displays the related types for that variable.

![Graphiql modal](https://assets.aaonline.io/graphql/d1/graphiql_3.png)

If we select the related type, the schema will appear in a new Document Explorer panel. We can click nested types to navigate through the schema of our application. We can also open this explorer with the 'Docs' button and navigate starting at the top level of the schema:

![Graphiql wizard](https://assets.aaonline.io/graphql/d1/graphiql_4.png)

We can use the navigation buttons to prettify our query or view the history of our recent queries. The history will persist even if we have to close and restart our server.
