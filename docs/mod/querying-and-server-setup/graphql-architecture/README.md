# GraphQL Architecture

GraphQL is only a *specification*

## Architectural Use Cases

1. GraphQL server *with a connected database*

  + often used for *greenfield projects*

  + uses single web server that implements GraphQL

  + server resolves queries and constructs response w/ data that it fetches from the database

2. GraphQL server to *integrate existing system*

  + compelling use case for companies w/ legacy infrastructures and many different APIs

  + GraphQL can be used to *unify* existing systems and hide complexity of data fetching logic

  + the server doesn't care about what the data sources are (databases, web services, 3rd party APIs,...)

3. *A hybrid approach* with a *connected database* and *integration of existing system*

GraphQL is transport layer agnostic → can be used w/ any available network protocol (TCP, WebSockets). GraphQL works w/ any database or data format.

## *Resolver* Functions

* GraphQL queries/mutations consist of a set of *fields*

* GraphQL server *has one `resolver function` per field*

* the purpose of each resolver is to retrieve the data for its corresponding field

**Query request**:

```ts
query {
    User(id: "er3txa9frju") {
        name
        friends(first: 5) {
            name
            age
        }
    }
}
```

**Resolver**:

```ts
User(id: String!): User

name(user: User!): String!

age(user: User!): Int!

friends(first: Int, user: User!): [User!]!
```

## GraphQL Clients

* GraphQL is great for frontend developers as data fetching complexity can be pushed to the server-side

* client doesn't care where data is coming from

* opportunity for *new abstractions* on the frontend

## From imperative to declarative data fetching

### Imperative Data Fetching

1. Construct and send HTTP request (e.g. with fetch in JavaScript)

2. Receive and parse server response

3. store data locally (in memory or persisted)

4. display information in the UI

### Declarative Data Fetching

1. Describe data requirements

2. Display information in the UI

3. store data locally (in memory or persisted)

4. display information in the UI
