import 'reflect-metadata';
import {
  buildSchemaSync,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Query,
  Resolver,
  Root
} from 'type-graphql';

type Recipe {
  id: ID!
  title: String!
  description: String
  creationDate: Date!
  ingredients: [String!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post]
}

export = UserType;
