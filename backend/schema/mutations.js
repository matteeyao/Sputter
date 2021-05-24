const graphql = require("graphql");
const { GraphQLObjectType, GraphQLList, GraphQLNonNull, GraphQLID } = graphql;
const mongoose = require("mongoose");

const CatType = require("./cat_type");
const Cat = mongoose.model("cat");

const Mutations = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        newCat: {   
            type: CatType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                breed: { type: new GraphQLNonNull(GraphQLString) }

            },
            resolve(_, {name, breed}) {
                return new Cat({name, breed}).save();
            }
        }
    }
});

module.exports = Mutations;

/*----------------------------------------------------------------------------*/

/*
mutation {
    newCat(name: "Jet", breed: "Bombay") {
        id,
        name,
        breed
    }
}

JSON response:
{
    "data": {
        "newCat": {
            "id": "5c...8f",
            "name": "Jet",
            "breed": "Bombay"
        }
    }
}
*/