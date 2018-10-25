import React from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import saveAs from 'file-saver'

import Chat from '../components/Chat'
import './chatsearch.css'

// /////////////////////////////////////////////////////////
// GraphQL components
// From https://www.apollographql.com/docs/react/basics/queries.html
// Display component

const SEARCH_CHATS = gql`
    query Chats($term: String!) {
        search(term: $term) {
            src,
            group,
            caption,
            timestamp,
            body,
        }
    }
`

const sendFile = (term, docs) => {
    const data = [Object.keys(docs[0]).join('\t') + '\n']
    for (const doc of docs) data.push(Object.values(doc).map(v => v ? v.replace(/\n/g, '\\n') : '').join('\t') + '\n')
    const blob = new Blob(data, {type: "text/plain;charset=utf-8"});

    saveAs(blob, `${term}.tsv`)
}

const ChatSearch = ({ term, data: { error, loading, search = [] }}) => {
    if (loading) {
        return <p>Loading...</p>
    } else if (error) {
        return <p>Error!</p>
    }
    return (
        <div className='chat-search'>
            <div className='chat-result'>
                <p>Loaded successfully: {term}</p>
                <button onClick={() => sendFile(term, search)}>GET TSV</button>
            </div>
            <ul>
                {search.map(s => <li key={s.timestamp + s.src}><Chat  {...s}/></li>)}
            </ul>
        </div>
    )
}

const ChatSearchConnected = graphql(SEARCH_CHATS, {
    options: ({term}) => ({
        variables: {
            term
        }
    })
})(ChatSearch)

export default ChatSearchConnected
