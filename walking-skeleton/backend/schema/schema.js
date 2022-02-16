const graphql = require("graphql");
const { GraphQLSchema } = graphql;

const RootQueryType = require("./root_query_type");
const Mutations = require("./mutations");

module.exports = new GraphQLSchema({ 
    query: RootQueryType, 
    mutation: Mutations 
});

/*

Although we have defined out root query types, we have not yet defined the schema
of our application. Our schema will almost always contain two things: our root
queries and our mutations. We'll need to make use of the `GraphQLSchema` module
from `graphql` in order to define a schema that we can include in our `express-graphql`
middleware.

*/