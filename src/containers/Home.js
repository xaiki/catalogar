import React from 'react'
import { withSiteData } from 'react-static'
import keydown from 'react-keydown'
import gun, { gunGet } from '../gun'
//


const voteOpts = [
  'Fake news',
  'Difamaçao',
  'Apoio',
  'Neutro',
  'Não politico',
  'Manipulada',
]

const voteKeys = voteOpts.map((k, i) => (i + 1).toString())

class Main extends React.PureComponent {
  state = {
    idx: 0,
    img: this.props.images[0]
  }
  @keydown(voteKeys)
  onKeyPress({key}) {
    const {img, idx} = this.state
    gun.get(img).once((data) => {
      data = data || {}
      gun.put({
        [img]: {
          ...data,
          [voteOpts[key]]: (data[voteOpts[key]] || 0) + 1
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
          <h1 style={{ textAlign: 'center' }}>votes</h1>
          <ul style={{display: 'flex'}}>
              {voteOpts.map((v, k) => <li key={voteOpts[k]} style={{
                display: 'block',
                padding: 10
              }}>
                  <b>{`${k+1}`}</b> - {`${voteOpts[k]}`}
              </li>)}
          </ul>
          <img src={`/images/${img}`}/>

      </div>
    )
  }
}
export default withSiteData(Main)
