import React, { Component } from 'react';
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import './App.scss';
import 'semantic-ui-css/semantic.min.css';
import Main from './components/Main';
import TopBar from './components/TopBar';
import Connections from './components/connections/Connections'
import Channels from './components/channels/Channels'
import Notfound from './components/NotFound'

class App extends Component {

  state = {
    // activeItem: 'main',
  };

  // handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    // const { activeItem } = this.state;

    return (
      <div className="App">
        <TopBar />
        <Router>
          <div id="sidebar_wrapper">
            <Menu id="sidebar_menu" secondary vertical>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/channels">Channels</Link></li>
                <li><Link to="/connections">Connections</Link></li>
              </ul>
            </Menu>
            <Switch>
              <Route exact path="/" component={Main} />
              <Route path="/channels" component={Channels} />
              <Route path="/connections" component={Connections} />
              <Route component={Notfound} />
            </Switch>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;
