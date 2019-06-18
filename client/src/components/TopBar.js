import faker from 'faker';
import React, { Component } from 'react';
import { Header, Segment } from 'semantic-ui-react';
import { Dropdown, Image } from 'semantic-ui-react';
import ThingModalCreate from './things/ThingModalCreate';
import ChannelModalCreate from './channels/ChannelModalCreate';
import ConnectionModalCreate from './bootstrap/ConnectionModalCreate';

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

  constructor() {
    super();

    this.state = {
      showModalCreateThing: false,
      showModalCreateChannel: false,
      showModalCreateConnection: false,
    }
  }

  createThingModalCallback = showModalCreateThing => {
    this.setState({ showModalCreateThing });
  };

  createChannelModalCallback = showModalCreateChannel => {
    this.setState({ showModalCreateChannel });
  };

  createConnectionModalCallback = showModalCreateConnection => {
    this.setState({ showModalCreateConnection });
  };

  render() {

    const {
      showModalCreateThing,
      showModalCreateChannel,
      showModalCreateConnection,
    } = this.state;

    return (
      <div id='TopBar'>
        <Segment clearing id='top_menu'>
          <Header className='topbar_left' floated='left'>
            <img className="top_logo" alt="Zeinetsse" src="/ZeinetSSE.png" />
          </Header>
          <Header className='topbar_right' floated='right'>
          <Dropdown text='Create' className='top_dropdown__action'>
            <Dropdown.Menu>
              <Dropdown.Item
                icon='hdd'
                text='Thing'
                onClick={() => this.setState({ showModalCreateThing: true })}
              />
              <Dropdown.Item
                icon='podcast'
                text='Channel'
                onClick={() => this.setState({ showModalCreateChannel: true })}
              />
              <Dropdown.Item
                icon='chain'
                text='Connection'
                onClick={() => this.setState({ showModalCreateConnection: true })}
              />
            </Dropdown.Menu>
          </Dropdown>
            <Dropdown className='top_dropdown' trigger={trigger} options={options} pointing='top left' icon={null} />
          </Header>
        </Segment>
        <ThingModalCreate
          showModalCreate={showModalCreateThing}
          callbackFromParent={this.createThingModalCallback}
        />
        <ChannelModalCreate
          showModalCreate={showModalCreateChannel}
          callbackFromParent={this.createChannelModalCallback}
        />
        <ConnectionModalCreate
          showModalCreate={showModalCreateConnection}
          callbackFromParent={this.createConnectionModalCallback}
        />
      </div>
    );
  }
}

export default TopBar;
