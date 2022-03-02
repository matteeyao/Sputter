import "reflect-metadata";
// configure express
import express, { Application } from "express";
import { buildSchema } from 'type-graphql'
// configure MongoDB, mongoose and the things required
import { json } from "body-parser";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
// configure GraphQL and schema; remember the capitalization of `GraphQL`!
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageProductionDefault } from "apollo-server-core/dist/plugin/landingPage/default";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import * as path from "path";
import { TypegooseMiddleware } from "./middleware/typegoose-middleware";

const db = require("../config/keys").mongoURI;
import { User } from "./entities/user";
import { UserResolver } from "./resolvers/user-resolver";
import { ObjectIdScalar } from "./types/object-id.scalar";
import { PostResolver } from "./resolvers/post-resolver";

export interface Context {
  user: User;
}

(async() => {
  // build the schema
  const schema = await buildSchema({
    resolvers: [UserResolver, PostResolver],
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    // use document converting middleware
    globalMiddlewares: [TypegooseMiddleware],
    // use ObjectId scalar mapping
    scalarsMap: [{ type: ObjectId, scalar: ObjectIdScalar }],
    validate: false,
  });

  const app: Application = express();

  // using the bodyParser package to parse incoming requests into json
  app.use(json());

  // this is our connection to GraphQL - it takes the schema we configured as an argument 
  // in the object passed to the expressGraphQL function
  const server = new ApolloServer({
    schema,
    plugins: [
        process.env.NODE_ENV === 'production'
            ? ApolloServerPluginLandingPageProductionDefault
            : ApolloServerPluginLandingPageGraphQLPlayground,
    ]
  });

  await server.start();

  // apply middleware to server
  server.applyMiddleware({ app });

  app.listen(5000, () => console.log('🚀 Server is running on port 5000'));

  mongoose
    .connect(db)
    .then(() => console.log("Connected to MongoDB successfully"))
    .catch(err => console.log(err));
})();
