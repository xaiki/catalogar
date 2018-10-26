const { ApolloServer, gql } = require('apollo-server');
const { db, o2gql } = require('./connectors/apollo/sqlite')
const Chat = require('./connectors/schemas/chat')

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    ${o2gql(Chat)}

    type PageInfo {
        endCursor: Int
        hasNextPage: Boolean
    }

    type SearchResult {
        chats: [Chat]
        pageInfo: PageInfo
    }

    type Query {
        chats: [Chat]
        search(term: String!, skip: Int, limit: Int): SearchResult
        searchAll(term: String): [Chat]
    }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve chats from the "chats" array above.
const BUCKET_SIZE = 20
const chats = new Chat(db)
const resolvers = {
    Query: {
        search: (root, {term, skip = 0, limit = BUCKET_SIZE}) => {
            const results = chats.search(term, limit + 1, skip)
            const hasNextPage = results.length > limit
            return {
                chats: results.slice(0, limit),
                pageInfo: {
                    endCursor: skip + limit,
                    hasNextPage
                }
            }
        },
        searchAll: (root, {term}) => chats.search(term)
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
