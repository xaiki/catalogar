const { ApolloServer, gql } = require('apollo-server');
const { o2gql, Chat } = require('./connectors/apollo/sqlite')

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    ${o2gql(Chat)}

    type Query {
        chats: [Chat]
        search(term: String): [Chat]
    }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve chats from the "chats" array above.
const chats = new Chat()
const resolvers = {
    Query: {
        search: (root, {term}) => chats.search(term),
    },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers });

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen({port: 5000}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
