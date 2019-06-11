import React, { Component } from 'react';
import { Route, Link, BrowserRouter as Router, Switch } from 'react-router-dom'
import { Menu } from 'semantic-ui-react'
import './App.scss';
import 'semantic-ui-css/semantic.min.css';
import Main from './components/Main';
import TopBar from './components/TopBar';
import Things from './components/things/Things'
import Channels from './components/Channels'
import Connections from './components/Connections'
import Notfound from './components/NotFound'

class App extends Component {

  state = {
    activeItem: 'main',
  };

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem } = this.state

    return (
      <div className="App">
        <TopBar />
        <Router>
          <div style={{display: 'flex'}}>
            <Menu id="sidebar_menu" secondary vertical>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/things">Things</Link></li>
                <li><Link to="/channels">Channels</Link></li>
                <li><Link to="/connections">Connections</Link></li>
              </ul>
            </Menu>
            <Switch>
              <Route exact path="/" component={Main} />
              <Route path="/things" component={Things} />
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

// {/* <Dropdown item text='Bootstrap'>
//   <Dropdown.Menu>
//     <Dropdown.Header>Connection</Dropdown.Header>
//     <Dropdown.Item>Create</Dropdown.Item>
//     <Dropdown.Item>Show</Dropdown.Item>
//     <Dropdown.Item>Remove</Dropdown.Item>
//   </Dropdown.Menu>
// </Dropdown> */}
