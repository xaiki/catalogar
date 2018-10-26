import React, { Fragment} from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import 'react-virtualized/styles.css'; // only needs to be imported once

import Chat from '../components/Chat'

import './chatsearch.css'

// /////////////////////////////////////////////////////////
// GraphQL components
// From https://www.apollographql.com/docs/react/basics/queries.html
// Display component

const remoteRowCount = 10000

const SEARCH_CHATS = gql`
    query Chats($term: String!, $skip: Int) {
        search(term: $term, skip: $skip) {
            chats {
                src,
                group,
                caption,
                timestamp,
                body,
            }
            pageInfo {
                endCursor
                hasNextPage
            }
        }
    }
`

const ChatSearch = ({ term, data: { loading, error, search, loadMore } }) => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error</p>;
    const {
        chats = [],
        pageInfo: { hasNextPage } = {},
    } = search || {}

    const chatRenderer = ({ key, index, style }) => (
        <div
            key={key}
        >
            {<Chat {...chats[index]}/>}
        </div>
    )

    const getRowHeight = ({index}) => {
        const chat = chats[index] || {}

        return (1 + (' ' + chat.body + chat.caption).length/30)*10
    }

    return (
        <InfiniteLoader
            isRowLoaded={index => !!chats[index]}
            loadMoreRows={loadMore}
            rowCount={remoteRowCount}
        >
            {({ onRowsRendered, registerChild }) => (
                <AutoSizer>
                    {({width, height}) => (
                        <List
                            height={height}
                            width={width}
                            onRowsRendered={onRowsRendered}
                            ref={registerChild}
                            rowCount={remoteRowCount}
                            rowHeight={getRowHeight}
                            rowRenderer={chatRenderer} />
                    )}
                </AutoSizer>
            )}
        </InfiniteLoader>
    );
};

const withQuery = graphql(SEARCH_CHATS, {
    options: ({ term }) => ({ variables: { term } }),
    props: ({ data }) => ({
        data: {
            ...data,
            loadMore: ({startIndex, stopIndex}) => data.fetchMore({
                variables: { skip: startIndex, limit: stopIndex - startIndex},
                updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
                    console.error('update query roling')
                    const previousSearch = previousResult.search || {};
                    const currentSearch = fetchMoreResult.search || {};
                    const previousChats = previousSearch.chats || [];
                    const currentChats = currentSearch.chats || [];
                    return {
                        ...previousResult,
                        search: {
                            ...previousSearch,
                            chats: [...previousChats, ...currentChats],
                            pageInfo: currentSearch.pageInfo,
                        },
                    };
                },
            }),
        },
    }),
});

const ChatSearchConnected = withQuery(ChatSearch)

export default ChatSearchConnected
