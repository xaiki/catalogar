const { ApolloServer, gql } = require('apollo-server');
const { db, o2gql } = require('./connectors/apollo/sqlite')
const Chat = require('./schemas/chat')
const debug = require('debug')('catalogar:server')

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    ${o2gql(Chat)}

    type PageInfo {
        endCursor: Int
        hasNextPage: Boolean
    }

    type PaginatedResponse {
        chats: [Chat]
        pageInfo: PageInfo
    }

    type Query {
        count(term: String): Int
        getType(type: String!, voted: Boolean, skip: Int, limit: Int): PaginatedResponse
        getTypeAll(type: String!, voted: Boolean): [Chat]
        search(term: String!, skip: Int, limit: Int): PaginatedResponse
        searchAll(term: String): [Chat]
    }

    type Mutation {
        vote(rowid: Int!, vote: String!): Chat
    }
`;

const paginated = (query, {limit = BUCKET_SIZE, skip = 0, ...args}) => {
    debug('calling', query, 'with args', {...args, limit, skip})
    const results = query({...args, limit, skip})
    const hasNextPage = results.length > limit
    return {
        chats: results.slice(0, limit),
        pageInfo: {
            endCursor: skip + limit,
            hasNextPage
        }
    }
}

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve chats from the "chats" array above.
const BUCKET_SIZE = 20
const chats = new Chat(db)
const resolvers = {
    Query: {
        count: (root, args) => chats.count(args && args.term),
        getType: (root, {type = 'image', ...args}) => paginated(chats.getType, {...args, type}),
        search: (root, args) => paginated(chats.search, {...args}),
        searchAll: (root, {term}) => chats.search({term})},
    Mutation: {
        vote: (root, {rowid, vote}) => {
            debug('calling', rowid, vote)
            chats.vote(rowid, JSON.parse(vote))
        }
    }
}

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
const server = new ApolloServer({ typeDefs, resolvers })

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen({port: 5000}).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`)
})
