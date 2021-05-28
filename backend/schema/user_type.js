const graphql = require("graphql"); // (1)
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLString } = graphql; // (2)
const mongoose = require("mongoose");
const User = mongoose.model("user");

const UserType = new GraphQLObjectType({ // (3)
    name: "UserType",
    // Create a closure to create a new scope
    fields: () => ({
        id: { type: GraphQLID }, // Mongoose automatically generates an ID field for our models
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        posts: {
            // here we are requiring the Post type
            type: new GraphQLList(require("./post_type")),
            resolve(parentValue) {
                return (
                User.findById(parentValue.id)
                    // populate is a mongoose method
                    .populate("posts")
                    .then(user => user.posts)
                );
            }
        }
    })
});

module.exports = UserType;

/*

(1) The `graphql/type` module is responsible for defining GraphQL types and schema.
You an import either from the `graphql/type` module, or from the root `graphql`
module. For this project, we'll import from the root `graphql` module.

We will use the `graphql` module to define our first GraphQL type - the one for
`User`. Recall that a GraphQL type is like a template for the kind of object you
can fetch from your database, and what fields it has. Defining a type is almost
like defining a model in an MVC application, but w/ a few additional considerations.

(2) Since we haven't yet defined the `Post` type, we cannot yet include it in the
schema for `User`. However, we can define the remaining fields. In order to do so,
we'll need a couple more modules from `graphql`. These modules will tell GraphQL
what type of data will be resolved from the type.

(3) A GraphQL object type takes in Name and Fields. The Fields represent what
GraphQL can return.

Fields refer to everything this Type will be able to return to you. Which means
all of the data associated w/ this type in the database. For our User that is id,
email, name, and posts.

So far we have defined the schema for the `User` type - we aren't interacting w/
our backend yet. Now let's configure a type for our root queries so that we can
actually return a user from our backend.

(4) Now that we have a *nested query* to go from a post to getting information about
the author of a post, let's query for a user's posts. We aren't fetching information
bidirectionally.
*/