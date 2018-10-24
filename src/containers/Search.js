import React from 'react'
import { graphql, Query } from 'react-apollo'
import gql from 'graphql-tag'

import './chat.css'
import './search.css'

const Chat = ({ src, group, body, caption, timestamp}) => {
  return (
    <div className="msg">
        <div className="bubble">
            <div className="txt">
                <span className="name">+{src}<span> ~ {group}</span></span>
                <span className="timestamp">{timestamp}</span>
                <p className="message">{caption ? caption : body}</p>
            </div>
            <div className="bubble-arrow"></div>
        </div>
    </div>
  )
}

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

const ChatSearch = ({ term, data: { error, loading, search = [] }}) => {
  if (loading) {
    return <p>Loading...</p>
  } else if (error) {
    return <p>Error!</p>
  }
  return (
    <div style={{paddingTop: '2em'}}>
        <p>Loaded successfully: {term}</p>
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

class Search extends React.PureComponent {
  state = {
    term: null
  }
  onChange(e) {
    const { value } = e.target
    
    this.setState(state => ({
      term: value
    }))
  }
  render() {
    const { term } = this.state
    return (
      <div>
          <h1>Full Text search</h1>
          <div className="wrap-search">
              <div className="search">
                  <i className="fa fa-search fa" aria-hidden="true"></i>
                  <input type="text" className="input-search" placeholder="Fake News uber alles" onChange={this.onChange.bind(this)}/>
                  {term && <ChatSearchConnected term={term} />}
              </div>
          </div>
      </div>
    )
  }
}

export default Search
