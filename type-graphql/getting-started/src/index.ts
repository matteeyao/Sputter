import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import * as path from "path";
import { buildSchema } from "type-graphql";

import { RecipeResolver } from "./modules/recipe/Resolver";

(async () => {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver],
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
  });

  // Create GraphQL server
  const server = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground({
            settings: {
                "request.credentials": "include",
            },
        }),
    ]
  });

  // Start the server
  const { url } = await server.listen(4000);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
})();
