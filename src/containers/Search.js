import React from 'react'
import { graphql, Query } from 'react-apollo'
import gql from 'graphql-tag'

import './chat.css'
import './search.css'

const Chat = ({id, document: {body, name}}) => {
  const [timestamp, number] = id.split('Z')
  return (
    <div className="msg">
        <div className="bubble">
            <div className="txt">
                <span className="name">+{number}<span> ~ {name}</span></span>
                <span className="timestamp">{timestamp}</span>
                <p className="message">{body}</p>
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
      id,
      document {
        body
        date
      }
    }
  }
`

const ChatSearchResults = ({ term }) => (
  <Query query={SEARCH_CHATS} variables={{ term }}>
      {({ data: { loading, error, search } }) => {
         if (loading) {
           return <p>Loading...</p>
         } else if (error) {
           return <p>Error!</p>
         }
         return (
           <div>
               <p>Loaded successfully: {term}</p>
               {search && search.filter(s => s.document).map(s => <Chat key={s.id} {...s}/>)}
           </div>
         )
      }}
  </Query>
)

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
                  {term && <ChatSearchResults term={term} />}
              </div>
          </div>
      </div>
    )
  }
}

export default Search
