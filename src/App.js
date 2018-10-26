import React from 'react'
import { Router, Link } from 'react-static'
import { hot } from 'react-hot-loader'
import { ApolloProvider } from 'react-apollo'
import client from './connectors/apollo'
//
import Routes from 'react-static-routes'

import './app.css'

const App = () => (
  <ApolloProvider client={client}>
      <Router>
          <div>
              <nav>
                  <Link exact to="/">Home</Link>
                  <Link to="/search">Search</Link>
                  <Link to="/sort">Sort</Link>
                  <Link to="/about">About</Link>
                  <Link to="/blog">Blog</Link>
              </nav>
              <div className="content">
                  <Routes />
              </div>
          </div>
      </Router>
  </ApolloProvider>
)

export default hot(module)(App)
