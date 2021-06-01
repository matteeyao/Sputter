const graphql = require("graphql");
const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLInt, 
  GraphQLNonNull 
} = graphql;
const mongoose = require("mongoose");
const UserType = require("./user_type");
const PostType = require("./post_type");
const GodType = require("./god_type");
const User = mongoose.model("user");
const Post = mongoose.model("post");
const God = mongoose.model("god");

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
    newPost: {
      type: PostType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        body: { type: new GraphQLNonNull(GraphQLString) },
        author: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parentValue, { title, body, author }) {
        return new Post({ title, body, author }).save();
      }
    },
    newGod: {
      /* We just specify the type we are mutating - in the case of making a new
      God this will be the GodType */
      type: GodType,
      args: {
        // the arguments required for this mutation
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        description: { type: GraphQLString }
      },
      // here we are just destructuring our arguments
      resolve(parentValue, { name, type, description }) {
        return new God({ name, type, description }).save();
      }
    },
    deleteGod: {
      type: GodType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, { id }) {
        return God.remove({ _id: id });
      }
    },
    updateGod: { // (1)
      type: GodType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
        description: { type: GraphQLString }
      },
      resolve(parentValue, { id, name, type, description }) {
        const updateObj = {};
        // we can create our own object here and pass in the variables if they exist
        if (id) updateObj.id = id;
        if (name) updateObj.name = name;
        if (type) updateObj.type = type;
        if (description) updateObj.description = description;

        return God.findOneAndUpdate(
          { _id: id },
          { $set: updateObj },
          { new: true },
          (err, god) => {
            return god;
          }
        );
      }
    },
    addGodRelative: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        relativeId: { type: new GraphQLNonNull(GraphQLID) },
        relationship: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { godId, relativeId, relationship }) {
        return God.addRelative(godId, relativeId, relationship);
      }
    },
    removeGodRelative: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        relativeId: { type: new GraphQLNonNull(GraphQLID) },
        relationship: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { godId, relativeId, relationship }) {
        return God.removeRelative(godId, relativeId, relationship);
      }
    },
    addGodEmblem: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        emblemId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parentValue, { godId, emblemId }) {
        return God.addEmblem(godId, emblemId);
      }
    },
    removeGodEmblem: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        emblemId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parentValue, { godId, emblemId }) {
        return God.removeEmblem(godId, emblemId);
      }
    },
    updateGodAbode: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        abodeId: { type: new GraphQLNonNull(GraphQLID) }
      },
      resolve(parentValue, { godId, abodeId }) {
        return God.updateAbode(godId, abodeId);
      }
    },
    addGodDomain: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        domain: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { godId, domain }) {
        return God.addDomain(godId, domain);
      }
    },
    removeGodDomain: {
      type: GodType,
      args: {
        godId: { type: new GraphQLNonNull(GraphQLID) },
        domain: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parentValue, { godId, domain }) {
        return God.removeDomain(godId, domain);
      }
    },
    newAbode: {
      type: AbodeType,
      args: {
        name: { type: GraphQLString },
        coordinates: { type: GraphQLString }
      },
      resolve(parentValue, { name, coordinates }) {
        return new Abode({ name, coordinates }).save();
      }
    },
    deleteAbode: {
      type: AbodeType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, { id }) {
        return Abode.remove({ _id: id });
      }
    },
    updateAbode: {
      type: AbodeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString }
      },
      resolve(parentValue, { id, name }) {
        return Abode.findOneAndUpdate(
          { _id: id },
          { $set: { name } },
          { new: true },
          (err, abode) => {
            return abode;
          }
        );
      }
    },
    newEmblem: {
      type: EmblemType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parentValue, { name }) {
        return new Emblem({ name }).save();
      }
    },
    deleteEmblem: {
      type: EmblemType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parentValue, { id }) {
        return Emblem.remove({ _id: id });
      }
    },
    updateEmblem: {
      type: EmblemType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString }
      },
      resolve(parentValue, { id, name }) {
        return Emblem.findOneAndUpdate(
          { _id: id },
          { $set: { name } },
          { new: true },
          (err, emblem) => {
            return emblem;
          }
        );
      }
    }
  }
});

module.exports = Mutations;

/*

MUTATION QUERY:
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

JSON RESPONSE:
{
  "data": {
    "newUser": {
      "id": "60b1440a8d60947b1287eefb",
      "name": "Phil Mickelson",
      "email": "phil@pga.com"
    }
  }
}

MUTATION QUERY:
mutation {
  newGod (
    name: "Mattonomous",
    type: "God"
    description: "He is great."
  ) {
    id,
    name,
    type,
    description
  }
}

JSON RESPONSE:
{
  "data": {
    "newGod": {
      "id": "60b65160db798b33dcdc60b1",
      "name": "Mattonomous",
      "type": "God",
      "description": "He is great."
    }
  }
}

(1) We create our own object which we populate w/ only the arguments passed into
the mutation. Instead of passing in each argument to `findOneAndUpdate`, we pass
in our own object containing only the necessary key-value pairs.

*/
