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
    this.setState(({idx}) => ({
      idx: idx + 1
    }))
  }
  render () {
    const {images} = this.props
    const {idx} = this.state
    return (
      <div>
          <h1 style={{ textAlign: 'center' }}>1: Fake, 2: Propaganda, 3: Campanha, 4: Haddad</h1>
          <img src={`/images/${images[idx]}`}/>
          {JSON.stringify(idx)}
      </div>
    )
  }
}
export default withSiteData(Main)
