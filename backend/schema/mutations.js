const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLNonNull } = graphql;
const mongoose = require("mongoose");
const UserType = require("./user_type");
const PostType = require("./post_type");

const User = mongoose.model("user");
const Post = mongoose.model("post");

const Mutations = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        // this will be the name of the mutation
        newUser: {
            // creating a User type
            type: UserType,
            args: {
                // since we need these arguments to make a new user we'll make them GraphQLNonNull
                name: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                password2: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parentValue, { name, email, password, password2 }) {
                return new User({ name, email, password, password2 }).save();
            }
        },
        // newPost: {
        //     type: PostType,
        //     args: {
        //         title: { type: new GraphQLNonNull(GraphQLString) },
        //         body: { type: new GraphQLNonNull(GraphQLString) },
        //         author: { type: new GraphQLNonNull(GraphQLString) },
        //     },
        //     resolve() {

        //     }
        // }
    }
});

module.exports = Mutations;

/*----------------------------------------------------------------------------*/

/*

Mutation Query:

mutation {
    newUser(
      name:"Phil Mickelson", 
      email: "phil@pga.com", 
      password: "password", 
      password2: "password"
    ) {
        id,
        name,
        email
    }
}

JSON response:

{
  "data": {
    "newUser": {
      "id": "60b1440a8d60947b1287eefb",
      "name": "Phil Mickelson",
      "email": "phil@pga.com"
    }
  }
}

*/