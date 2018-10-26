import React from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import saveAs from 'file-saver'
import Chat from '../schemas/chat'

const ALL_FIELDS = Chat.FIELDS.join('\n            ')

const SEARCH_ALL_CHATS = gql`
    query Chats($term: String!) {
        searchAll(term: $term) {
            ${ALL_FIELDS}
        }
    }
`

const ChatDownload = ({ term, onFinish, data: { loading, error, searchAll, loadMore } }) => {
    if (loading) return 'Downloading...'
    if (error) return `Error! ${error.message}`

    const data = [Object.keys(searchAll[0]).join('\t') + '\n']
    for (const doc of searchAll) data.push(Object.values(doc).map(v => v ? v.replace(/\n/g, '\\n') : '').join('\t') + '\n')
    const blob = new Blob(data, {type: "text/plain;charset=utf-8"});

    saveAs(blob, `${term}.tsv`)
    setTimeout(onFinish)
    return `done`
}

const withQuery = graphql(SEARCH_ALL_CHATS, {
    options: ({ term }) => ({ variables: { term } })
})

export default withQuery(ChatDownload)
