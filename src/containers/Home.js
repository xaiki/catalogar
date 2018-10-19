import React from 'react'
import { withSiteData } from 'react-static'
import keydown from 'react-keydown'
import gun, { gunGet } from '../gun'
//

class Main extends React.PureComponent {
  state = {
    idx: 0,
    img: this.props.images[0]
  }
  @keydown('1', '2', '3', '4')
  onKeyPress({key}) {
    const {img, idx} = this.state
    gun.get(img).once((data) => {
      data = data || {}
      gun.put({
        [img]: {
          ...data,
          [key]: (data[key] || 0) + 1
        }
      })
    })

    const nextIdx = idx + 1
    const nextImg = this.props.images[nextIdx]
    gun.get(nextImg).once(votes => {
      // remove gunisms
      delete votes[`_`]
      delete votes[`>`]

      this.setState({
        idx: nextIdx,
        img: nextImg,
        votes,
      })
    })
  }
  render () {
    const {idx, img, votes} = this.state

    return (
      <div>
          <p>Gun score {JSON.stringify(votes)}</p>
          <h1 style={{ textAlign: 'center' }}>1: Fake, 2: Propaganda, 3: Campanha, 4: Haddad</h1>
          <img src={`/images/${img}`}/>

      </div>
    )
  }
}
export default withSiteData(Main)
