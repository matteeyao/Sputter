const graphql = require("graphql");
const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID } = graphql;
const mongoose = require("mongoose");

const CatType = require("./cat_type");
const Cat = mongoose.model("cat");

const RootType = new GraphQLObjectType({
    name: "RootType",
    fields: {
        cats: {
            type: new GraphQLList(CatType),
            resolve() {
                return Cat.find({});
            }
        },
        cat: {
            type: CatType,
            args: { id: { type: GraphQLID } }, // rely on args to signal the types of incoming arguments
            resolve(parent, args) {
                return Cat.findById(args.id);
            }
        }
    } // Where we can write our root queries
})

module.exports = RootType;

/*----------------------------------------------------------------------------*/

/*
Root queries are how GraphQL can access data in our database, entry points into
our data.
*/