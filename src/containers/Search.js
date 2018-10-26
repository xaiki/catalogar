import React, { Fragment } from 'react'

import ChatSearch from './ChatSearch'
import ChatDownload from './ChatDownload'
import ChatCounter from './ChatCounter'

import './search.css'

class Search extends React.PureComponent {
  state = {
    term: null,
    download: false
  }
  onChange(e) {
    const { value } = e.target

    this.setState(state => ({
      term: value
    }))
  }
  render() {
    const { term, download } = this.state
    return (
      <div style={{height: '60vh'}}>
          <h1>Full Text search</h1>
          <div className="wrap-search">
              <div className="search">
                  <i className="fa fa-search fa" aria-hidden="true"></i>
                  <input type="text" className="input-search" placeholder="Fake News uber alles" onChange={this.onChange.bind(this)}/>
              </div>
          </div>
          <ChatCounter term={term} />
          {download && <ChatDownload term={term}
                                     onFinish={() => this.setState({ download: false })}
          />}
          {term && <Fragment>
              <div className='chat-result'>
                  <p>Loaded successfully: {term}</p>
                  <button onClick={() => this.setState(state => ({ download: true }))}>
                      GET TSV
                  </button>
              </div>
              <ChatSearch term={term} />
          </Fragment>}

      </div>
    )
  }
}

export default Search
