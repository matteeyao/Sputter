const graphql = require("graphql");
const { GraphQLSchema } = graphql;

const RootType = require("./root_query_type");
const Mutations = require("./mutations");

module.exports = new GraphQLSchema({ query: RootType, mutation: Mutations });