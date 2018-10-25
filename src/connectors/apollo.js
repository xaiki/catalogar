import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import fetch from 'node-fetch'

const APOLLO_URL = process.env.APOLLO_URL || 'http://localhost:5000'

const client = new ApolloClient({
    link: new HttpLink({
        fetch,
        uri: APOLLO_URL
    }),
    cache: new InMemoryCache(),
})

export default client
