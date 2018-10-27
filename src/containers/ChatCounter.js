import React from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'

const GET_COUNT = gql`
    query Count($term: String) {
        count(term: $term)
    }
`
const ChatCounter = ({term,  data: { loading, error, count }}) => (
    <div>
        <span>Total Matches: {count} ({term})</span>
        {error && `${error.message}`}
        {loading && `loading...`}
    </div>
)

const withQuery = graphql(GET_COUNT, {
    options: ({ term = null }) => ({ variables: { term }})
})

export default withQuery(ChatCounter)
