import React from 'react'
import keydown from 'react-keydown'
import gql from 'graphql-tag';
import { graphql, Mutation } from 'react-apollo';
import { extractVotes } from '../votes'

const VOTE = gql`
  mutation Vote($rowid: Int!, $vote: String!) {
    vote(rowid: $rowid, vote: $vote) {
      id
      votes
    }
  }
`

const GET_UNVOTED = gql`
  query GetUnvoted($type: String!) {
    getType(type: $type, voted: false) {
      chats {
        rowid,
        filename,
        votes
      }
      pageInfo {
        endCursor
      }
    }
  }
`

const voteOpts = [
  'Fake news',
  'Difamaçao',
  'Apoio',
  'Neutro',
  'Não politico',
  'Manipulada',
]

const voteKeys = voteOpts.map((k, i) => (i + 1).toString())

class Vote extends React.PureComponent {
  state = {
    idx: 0,
    fetching: false
  }
  @keydown(voteKeys)
  onKeyPress({key}) {
    const {rowid, votes} = this.current
    const {idx} = this.state
    const vote = voteOpts[key]
    const vo = extractVotes(votes)
    vo[vote] = (vo[vote] || 0) + 1

    this.mutation({ variables: { rowid: Number(rowid), vote: JSON.stringify(vo) }})

    this.setState({
      idx: idx + 1,
    })
  }
  render () {
    const {data: { loading, error, getType, fetchMore}} = this.props
    const {idx, fetching} = this.state
    const setMutation = mutation => this.mutation = mutation

    if (loading) return `Loading...`
    if (error) return `Error ${error.message}`

    const { chats } = getType
    if (!fetching &&  idx > chats.length - 10) {
      this.setState({fetching: true})
      fetchMore({
        variables: {
          skip: chats.length
        },
        updateQuery: (prev: { getType : chats }, { fetchMoreResult }) => {
          this.setState({fetching: false})
          if (!fetchMoreResult) return prev;
          const newChats = fetchMoreResult.getType.chats
          return {
            getType: {
              ...prev.getType,
              chats: [...chats, ...newChats]
            }
          }
        }
      })
    }

    this.chats = chats
    this.current = chats[idx]
    const img = `/wppmon/${chats[idx].filename}`

    return (
      <Mutation mutation={VOTE}>
      {(vote, { loading, error, data }) => {
        setMutation(vote)
        return  (
          <div>
              { loading && `loading...`}
              { error && `Error: ${error.message}`}
              { fetching && `fetching...`}
              <h1 style={{ textAlign: 'center' }}>{idx} votes</h1>
              <ul style={{display: 'flex'}}>
                  {voteOpts.map((v, k) => <li key={voteOpts[k]} style={{
                    display: 'block',
                    padding: 10
                  }}>
                      <b>{`${k+1}`}</b> - {`${voteOpts[k]}`}
                  </li>)}
              </ul>
              <img src={`/images/${img}`} style={{margin: 'auto 0'}}/>
          </div>
        )
      }}
      </Mutation>
    )
  }
}

const withQuery = graphql(GET_UNVOTED, {
  options: ({ type = 'image'}) => ({ variables: { type }})
})

export default withQuery(Vote)
