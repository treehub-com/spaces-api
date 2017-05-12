const {makeExecutableSchema} = require('graphql-tools');

const resolvers = {
  Query: {
    spaces: require('./query/spaces.js'),
  },
  Mutation: {
    create: require('./mutation/create.js'),
  },
};

const typeDefs = [
  // Root
  `schema {
    query: Query
    mutation: Mutation
  }`,
  // Root Queries
  `type Query {
    spaces: [String!]!
  }`,
  // Mutations
  `type Mutation {
    create(id: String!): Boolean!
  }`,
];

module.exports = makeExecutableSchema({typeDefs, resolvers});
