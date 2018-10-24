const { ApolloServer, gql } = require('apollo-server');
const prepareSearch = require('./search')

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    # This "Chat" type can be used in other type declarations.
    type Chat {
        id: String
        body: String
        date: String
    }

    type ChatMatch {
        id: String
        score: Int
        document: Chat
    }

    type Query {
        chats: [Chat]
        search(term: String): [ChatMatch]
    }
`;

prepareSearch(process.argv.pop()).then(index => {
    // Resolvers define the technique for fetching the types in the
    // schema.  We'll retrieve chats from the "chats" array above.
    const resolvers = {
        Query: {
            search: (root, {term}) => new Promise(accept => {
                console.error('looking for', term)
                const data = []
                index.search(term.toString().replace( /\r?\n|\r/g, '' ))
                     .on('data', d => { console.log('got data', d); data.push(d)
                     })
                     .on('end', () => {
                         console.log ('done search', data, term)
                         accept(data)
                     })
            }),
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
})
