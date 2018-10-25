import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'

let APOLLO_URL
try {
    APOLLO_URL = process.env.APOLLO_URL || location.origin + '/graphql'
} catch (e) {
    APOLLO_URL = '/graphql'
}

const client = new ApolloClient({
    link: new HttpLink({
        fetch,
        uri: APOLLO_URL
    }),
    cache: new InMemoryCache(),
})

export default client
