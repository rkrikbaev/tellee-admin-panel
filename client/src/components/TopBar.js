import faker from 'faker';
import React, { Component } from 'react';
import {
  Header,
  Segment,
  Dropdown,
  Image,
} from 'semantic-ui-react';


const trigger = (
  <span>
    <Image avatar src={faker.internet.avatar()} /> {faker.name.findName()}
  </span>
);

const options = [
  { key: 'user', text: 'Account', icon: 'user' },
  { key: 'settings', text: 'Settings', icon: 'settings' },
  { key: 'sign-out', text: 'Sign Out', icon: 'sign out' },
];

class TopBar extends Component {

  render() {

    return (
      <div id='TopBar'>
        <Segment clearing id='top_menu'>
          <Header className='topbar_left' floated='left'>
            <img className="top_logo" alt="Zeinetsse" src="/ZeinetSSE.png" />
          </Header>
          <Header className='topbar_right' floated='right'>
            <Dropdown
              className='top_dropdown'
              trigger={trigger}
              options={options}
              pointing='top left'
              icon={null}
            />
          </Header>
        </Segment>
      </div>
    );
  }
}

export default TopBar;
