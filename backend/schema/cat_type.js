const graphql = require("graphql");
const { GraphQLObjectType, GraphQLID, GraphQLString } = graphql;
const mongoose = require("mongoose");

const CatType = new GraphQLObjectType({ /* (1) */
    name: "Cat",
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        breed: { type: GraphQLString }
    }
})

module.exports = CatType;

/*----------------------------------------------------------------------------*/

/*
(1) A GraphQL object type takes in Name and Fields. The Fields represent what
GraphQL can return.
*/