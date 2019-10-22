import React, { Component } from 'react';
import {
  Route, Link, BrowserRouter as Router, Switch,
} from 'react-router-dom';
import { Menu } from 'semantic-ui-react';
import './App.scss';
import 'semantic-ui-css/semantic.min.css';
import Main from './components/Main';
import TopBar from './components/TopBar';
import Connections from './components/connections/Connections';
import Channels from './components/channels/Channels';
import Notfound from './components/NotFound';

class App extends Component {
  constructor() {
    super();

    this.state = {
      home: true,
      channels: false,
      connections: false,
    };
  }

  handleHome = () => {
    this.setState({
      home: true,
      channels: false,
      connections: false,
    });
  };

  handleChannels = () => {
    this.setState({
      home: false,
      channels: true,
      connections: false,
    });
  };

  handleConnections = () => {
    this.setState({
      home: false,
      channels: false,
      connections: true,
    });
  };

  render() {
    const { home, channels, connections } = this.state;

    return (
      <div className="App">
        <TopBar />
        <Router>
          <div id="sidebar_wrapper">
            <Menu id="sidebar_menu" secondary vertical>
              <ul>
                <li className={home ? 'active_item' : ''}>
                  <Link onClick={this.handleHome} to="/">Home</Link>
                </li>
                <li className={channels ? 'active_item' : ''}>
                  <Link onClick={this.handleChannels} to="/channels">Channels</Link>
                </li>
                <li className={connections ? 'active_item' : ''}>
                  <Link onClick={this.handleConnections} to="/connections">Connections</Link>
                </li>
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
