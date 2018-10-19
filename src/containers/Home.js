import React from 'react'
import { withSiteData } from 'react-static'
import keydown from 'react-keydown'
//

class Main extends React.PureComponent {
  state = {
    idx: 0
  }
  @keydown('1', '2', '3', '4')
  onKeyPress({key}) {
    console.error('keypress', key)
  }
  render () {
    return (
      <div>
          <h1 style={{ textAlign: 'center' }}>Welcome to</h1>
          {JSON.stringify(this.state)}
      </div>
    )
  }
}
export default withSiteData(Main)
