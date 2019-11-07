import React, { Component } from 'react'
import {
  Route, NavLink, BrowserRouter as Router, Switch,
} from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import './App.scss'
import 'semantic-ui-css/semantic.min.css'
import Home from './components/Home'
import TopBar from './components/TopBar'
import Connections from './components/connections/Connections'
import Channels from './components/channels/Channels'
import Graphs from './components/graphs/Graphs'
import Notfound from './components/NotFound'

export default class App extends Component {
  checkActive = (location) => {
    const { url } = location
    if (url === '/') return true
    return false
  }

  render() {
    return (
      <div className="App">
        <TopBar />
        <Router>
          <div id="sidebar_wrapper">
            <Menu id="sidebar_menu" secondary vertical>
              <ul>
                <li>
                  <NavLink
                    to="/"
                    activeClassName="active_item"
                    isActive={this.checkActive}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/channels" activeClassName="active_item">
                    Channels
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/connections" activeClassName="active_item">
                    Connections
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/graphs" activeClassName="active_item">
                    Graphs
                  </NavLink>
                </li>
              </ul>
            </Menu>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/channels" component={Channels} />
              <Route path="/connections" component={Connections} />
              <Route path="/graphs" component={Graphs} />
              <Route component={Notfound} />
            </Switch>
          </div>
        </Router>
      </div>
    )
  }
}
