# Building GraphQL API w/ Nodejs, TypeGraphQL, Typegoose and Troubleshooting common challenges

I recently started out with this project where I am using Apollo GraphQL with TypeGraphQL, typegoose as mongoose wrapper and Express.js to create an API.

## What is GraphQL?

GraphQL has two major components:

* **Schema**: GraphQL server uses a schema to describe the shape of request/graphs. This schema basically defines a hierarchy of types w/ fields that are populated from back-end data stores.

```ts
type User {
    username: String
    email: String
}
```

* **Resolvers**: The server needs to know how to populate data for every field in your schema so that it can respond to requests for that data. To accomplish this, it uses resolvers. Resolvers can be of three types:

* **Queries**

```gql
{
    user {
        username
        email
    }
}
```

* **Mutations**

```gql
mutation {
    createUser(username: "test", email: "test@test.com") {
        username
        email
    }
}
```

* **Subscriptions**:

```gql
subscription {
    users
}
```

GraphQL reduces the network call by enabling us to fetch all the data that we need in a single query from a single endpoint.

## Using Apollo w/ TypeGraphQL

While the most used library for GraphQL is Apollo. Apollo Server comes w/ a lot of features like caching, external data loader and many more.

![Apollo server](https://res.cloudinary.com/practicaldev/image/fetch/s--E3NuEN6x--/c_limit%2Cf_auto%2Cfl_progressive%2Cq_auto%2Cw_880/https://cdn.hashnode.com/res/hashnode/image/upload/v1609084744472/edTpe0nhw.png)

The Apollo Client is a tool which helps you use GraphQL in the frontend. It provides differential features like in-memory caching, state management, etc. It can be integrated w/ multiple JavaScript frameworks like React, React Native, Vue, Angular and for iOS and Android, there are also possibilities to use the Apollo Client.

## TypeGraphQL

TypeGraphQL is a modern framework for creating GraphQL API's. While Apollo is really great and solves many problems that we have, developing a GraphQL API in Node.js w/ TypeScript is sometimes a bit of a pain. This makes it easy to use w/ TypeScript as your first language.

Creating a sample resolver would look like:

```ts
@Resolver()
class UserResolver {
    private userCollection: User[] = [];

    async users() {
        return await this.userCollection;
    }
}
```

## Using TypeGraphQL w/ Typegoose

Typegoose is basically a TypeScript wrapper around mongoose. It is easy to use in TypeScript environment and provides a lot of features.

The first challenge I encountered while integrating Typegoose w/ TypeGraphQL is that I has to define multiple interfaces: one for Typegoose, then one for TypeGraphQL schema, so there was a lot of redundancy happening around. The solution I found was just to use TypeGraphQL decorators on top of Typegoose methods.

```ts
@ObjectType()
export class User {
    @Field()
    readonly _id: string;

    @Field()
    @prop()
    public username: string;

    @Field()
    @IsEmail()
    @prop()
    public email: string;
}
```

So here we define our mongoDB models w/ `prop()` decorator from typegoose and simultaneously define our GraphQL schemas w/ `ObjectType()` and `Field()` decorators from TypeGraphQL. It basically removes all the redundant interfaces we had earlier.

The second challenge I encountered is that during the initial phase I was writing all my core logic directly into resolver methods which eventually created a lot of problems in maintaining the codebase. So the solution was that I started refactoring all my codebase into a different folder structure. I started using TypeScript decorator features for services and used dependency injection to inject all my Database models and Services directly into Resolvers.

```ts
import { Service, Inject } from "typedi";
@Service()
export class UserService {
    constructor(@Inject("userModel") private readonly UserModel) {}
    async getAll() {
        return this.UserModel.find();
    }
}
```

So here we are creating `UserService` which inject `userModel`. Now, once we have our service running we can inject this directly into our Resolvers as:

```ts
@Resolver()
export class UserResolver {
    constructor(
        private readonly userService: UserService,
    ) { }
    @Query(() => [User])
    async users() {
        return this.userService.getAll();
    }
}
```

`dataloader` basically lets will let you combine or batch multiple similar requests and cache database calls. Now the `dataloader` detects that posts having similar id's and batch them together and will reuse the user document which it already has in memory instead of making a new database call.

The [source code for the Nx-Node-Apollo Graphql API](github.com/DevUnderflow/nx-node-apollo-grahql-mongo)
