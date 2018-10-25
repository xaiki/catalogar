import React from 'react'

import ChatSearch from './ChatSearch'
import './search.css'

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
                  {term && <ChatSearch term={term} />}
              </div>
          </div>
      </div>
    )
  }
}

export default Search
