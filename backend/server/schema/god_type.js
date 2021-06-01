const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } = graphql;
const AbodeType = require("./abode_type");
const EmblemType = require("./emblem_type");
const Abode = mongoose.model("abode");
const God = mongoose.model("god");

const GodType = new GraphQLObjectType({
  name: "GodType",
  // wrapped in a function to create a thunk
  fields: () => ({ // (1)
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    type: { type: GraphQLString },
    description: { type: GraphQLString },
    // remember the GraphQLList will return us an array of domains
    domains: { type: new GraphQLList(GraphQLString) },
    abode: {
      type: AbodeType,
      resolve(parentValue) {
        return Abode.findById(parentValue.abode)
          .then(abode => abode)
          .catch(err => null);
      }
    },
    emblems: {
      type: new GraphQLList(EmblemType),
      resolve(parentValue) {
        return God.findById(parentValue.id)
          .populate("emblems")
          .then(god => god.emblems);
      }
    },
    parents: {
      type: new GraphQLList(GodType),
      resolve(parentValue) {
        return God.findRelatives(parentValue.id, "parents");
      }
    },
    children: {
      type: new GraphQLList(GodType),
      resolve(parentValue) {
        return God.findRelatives(parentValue.id, "children");
      }
    },
    siblings: {
      type: new GraphQLList(GodType),
      resolve(parentValue) {
        return God.findRelatives(parentValue.id, "siblings");
      }
    }
  })
});

module.exports = GodType;

/*

(1) Take note of the fact that we wrap our fields values w/ an ES6 arrow
function to create a thunk so that we will later be able to resolve circular
dependencies.

*/
