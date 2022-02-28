# Building type safe backend apps w/ Typegoose and TypeGraphQL

In this module, we will be trying to solve the most common problem encountered while trying to model MongoDB backend schema w/ TypeScript and Mongoose. We will also try to address and solve the difficulties of maintaining GraphQL types.

Almost every serious JavaScript developer uses TypeScript. However, many aged libraries do not support it natively, which becomes an increasing issue as the project grows. Then, if you add up GraphQL, which is a great modern API development solution, it becomes too much of a boilerplate.

## Prerequisites

This article assumes that you have working knowledge of TypeScript, MongoDB, and GraphQL. We'll be using Mongoose for specifying models, which is the go-to Object Document Mapper (ODM) solution for MongoDB.

Let's consider a basic example of a Mongoose model written in TypeScript. This might look something like the one mentioned below, a user model w/ basic model properties (email, first name, last name, and password):

```ts
import { Document, Model, Schema } from "mongoose";
import { db } from "../util/database";

export interface IUserProps {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface IUserDocument extends IUserProps, Document {
}

export interface IUserModel extends Model<IUserDocument> {
    dateCreated: Date;
    lastUpdated: Date;
    hashPassword(password: string): string;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            unique: true,
        },
        firstName: {
            type: String,
        },
        password: {
            type: String,
        },
    },
    { timestamps: true }
);

const hashPassword = (_password: string) => {
    // logic to hash passwords
}

UserSchema.method("hashPassword", hashPassword);

export const User: IUserModel = db.model<IUserDocument, IUserModel>(
    "User",
    UserSchema
);
```

As you can see, it would be cumbersome to add and maintain interfaces manually w/ Mongoose. We would need at least 2-3 interfaces to occupy the typing needs to get model properties and methods working w/ proper typing.

Moving forward to adding our queries and mutations, we need to create resolvers for the model above, assuming we have a service that deals w/ models. Here's what our resolver looks like:

```ts
import { ObjectId } from 'bson';
import { IResolvers } from 'graphql-tools';
import { IUserProps } from './user.model';
import { UserService } from './user.service';

const userService = new UserService();
export const userResolvers: IResolvers = {
    Query: {
        User: (_root: unknown, args: { id: ObjectId }) => userService.get(args.id),
        // ...
    },
    Mutation: {
        createUser: async (_root: unknown, args: IUserProps) => await userService.create(args),
        // ...
    }
};
```

Not bad, we got our model and service and the resolver. But wait, we need to add GraphQL `types` as well. Here we are intentionally not including inputs to keep it short. Let's do that:

```ts
type Query {
    User(id: String): User
}

type Mutation {
    createUser(
        email: String,
        firstName: String,
        lastName: String,
        password: String,
    ): User
}

type User {
    id: String!
    email: String!
    firstName: String!
    lastName: String!
    password: String!
}
```

Now, we have to club the schemas and resolvers together, then pass them onto the GraphQL Express server—`Apollo Server` in this case:

```ts
import * as path from 'path';
import * as fs from 'fs';
import { ApolloServer } from 'apollo-server';
import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './src/resolvers';

const userSchema = path.join(__dirname, 'src/user/user.schema.graphql');
const schemaDef = fs.readFileSync(userSchema, 'utf8');

const schema = makeExecutableSchema({ typeDefs: schemaDef });

const server = new ApolloServer({ schema, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
```

W/ this setup, we got four files per model: model, resolver, services, and GraphQL schema file.

That's too many things to keep in sync in real life. Imagine you need to add a new property to the above model after reaching production. You'll end up doing at least following:

1. Add a migration to sync the DB

2. Update the interfaces

3. Update the model schema

4. Update the GraphQL schema

## Possible Solution

As we know, after this setup, we're mostly dealing w/ the entity models and struggling to keep its types and relations in sync.

If the model itself can handle it somehow, we can definitely save some effort, which means we can sort things out if these entity model classes can represent both the database schema and its types.

## Adding TypeGoose

Mongoose schema declarations w/ TypeScript can get tricky—or there might be a better way. Let's add `TypeGoose`, so you no longer have to maintain interfaces (arguably). Here's what the same user model looks like:

```ts
import { DocumentType, getModelForClass, prop as Property } from '@typegoose/typegoose';
import { getSchemaOptions } from 'src/util/typegoose';
import { Field as GqlField, ObjectType as GqlType } from 'type-graphql';

export class User {
    readonly _id: string;

    @Property({ required: true })
    firstName: string;

    @Property({ required: false })
    lastName: string;

    @Property({ required: true })
    password: string;

    @Property({ required: true, unique: true })
    email: string;

    hashPassword(this: DocumentType<User>, _password: string) {
        // logic to hash passwords
    }
}
```

What we just did is use the same TypeScript user class to define the schema as well as its GraphQL type—pretty neat.

Because we have added TypeGraphQL, our resolvers no longer need extra interfaces. We can add input classes for parameter types. Consider common input types such as `CreateInput`, `UpdateInput`, and `FilterInput`.

```ts
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';
import { User } from './user.model';
import { UserService } from './user.service';

@Resolver(_of => User)

export class UserResolver {
    private __userService: UserService;

    constructor() {
        this.__userService = new UserService();
    }

    @Mutation(_returns => User)
    async createUser(@Arg('data', type => UserCreateInput) data: UserCreateInput, @Ctx() ctx: any) {
        return this.__userService.create(data);
    }
}
```

You can learn more about the syntax and input definition in the [official docs](https://typegraphql.com/docs/getting-started.html).

That's it. We are ready w/ our setup, and we can now simply build a schema and pass it to the server entry point just like that. No need to import schema files and merge resolvers. Simply pass array of resolvers to `buildSchema`:

```ts
import { ApolloServer } from 'apollo-server';

import { resolvers } from './src/resolvers';
import { buildSchema } from 'type-graphql';

const schema = buildSchema({
    resolvers,
});

const server = new ApolloServer({ schema, resolvers });

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
```

Once implement, this is how our custom demo project architecture might look:

![Fig:- Application Architecture](https://global-uploads.webflow.com/5d2dd7e1b4a76d8b803ac1aa/5f9274069a8ba729498604ee_e07kfXknZ2xbLOHLMag0Wq8BRaargrLlnLQ9QSa9RgSH1Jk8cN_gtiUsgF1dPyW9BUZ-CLuzHxEqYa2DL9rtm6nKT3QdX9r58G7WlAt5TOqXdJ-hGK1LppFmT0DFovP70kERH6bS.png)

## Limitations and alternatives

Though these packages save some work for us, one may decide not to go for them since they use experimental features such as experimental decorators. However, the acceptance of these experimental features is growing.

### TypeGoose:

Though TypeGoose offers a great extension to Mongoose, they've recently introduced some breaking changes. Upgrading from recent versions might be a risk. One alternative to TypeGoose for decorator-based schema definitions is TypeORM. Though, it currently has basic experimental support for MongoDB.

### TypeGraphQL

TypeGraphQL is a well-maintained library. There are other options, like `Nest.js` and `graphql-schema-decorators`, which supports decorators for GraphQL schema.

However, as `Nest.js`'s GraphQL support is more framework-oriented, it might be more than needed. The other one is not supported any longer. You can even integrate TypeGraphQL w/ `Nest.js` w/ some caveats.

## Conclusion

Unsurprisingly, both of these libraries use experimental decorators API with `Reflect Metadata`. Reflect Metadata adds additional metadata support to the class and its members. The concept might look innovative but it’s nothing new. Languages like C# and Java support attributes or annotations that add metadata to types. With these added, it becomes handy to create and maintain well-typed applications.

One thing to note here would be—though the article introduces the benefits of using TypeGraphQL and TypeGoose together—it does not mean you can’t use them separately. Depending upon your requirements, you may use either of the tools or a combination of them.

This article covers a very basic setup for introduction of the mentioned technologies. You might want to learn more about advanced real-life needs with these tools and techniques from some of the articles mentioned below.

You can find the referenced code at this [repo](https://github.com/velotio-tech/typegoose-typegraphql-boilerplate).
