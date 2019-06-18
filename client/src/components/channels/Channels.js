import React, { Component } from 'react';
import './Channels.scss';
import {
  Button,
  Item,
} from 'semantic-ui-react';
import ChannelModalRemove from './ChannelModalRemove';
import ChannelModalEdit from './ChannelModalEdit';

class Channels extends Component {

  constructor() {
    super();

    this.state = {
      channels: [],
      showModalRemove: false,
      showModalEdit: false,
      removingChannel: {},
      edittingChannel: {}
    }
  }

  getToken = async () => {
    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: "hero12@email.com"})
    });
  };

  getChannels = async () => {
    fetch('/api/channels', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( channels => this.setState({channels}, () => {
        console.log('fetched');
      }))
      .catch( err => {
        console.log(err);
      });
  };

  removeModalCallback = (showModalRemove, id) => {
    this.setState({ showModalRemove });
    if(id) {
      this.setState({ channels: this.state.channels.filter( i => i.id !== id )
      });
    };
  };

  editModalCallback = showModalEdit => {
    this.setState({ showModalEdit });
  };

  componentDidMount() {
    this.getToken();
    this.getChannels();
  }

  render() {

    const { channels, showModalRemove, showModalEdit, removingChannel, edittingChannel } = this.state;

    return (
      <div id="channels">
        <h1>Channels</h1>
        <hr />
        <Item.Group relaxed>

          {channels.map( item =>
            <Item key={item.id}>

              <Item.Content verticalAlign='middle'>
                <Item.Header>{item.name}</Item.Header>
                <Item.Description>{item.id}</Item.Description>
                <Item.Extra>
                  <Button
                    color="red"
                    floated='right'
                    icon='trash alternate outline'
                    labelPosition='right'
                    content="Remove"
                    onClick={() => this.setState({ showModalRemove: true, removingChannel: item })}
                  />
                  <Button
                    color="yellow"
                    floated='right'
                    icon='edit outline'
                    labelPosition='right'
                    content="Edit"
                    onClick={() => this.setState({ showModalEdit: true, edittingChannel: item })}
                  />
                </Item.Extra>
              </Item.Content>

            </Item>
          )}
        </Item.Group>
        <ChannelModalRemove
          showModalRemove={showModalRemove}
          channel={removingChannel}
          callbackFromParent={this.removeModalCallback}
        />
        <ChannelModalEdit
          showModalEdit={showModalEdit}
          channel={edittingChannel}
          callbackFromParent={this.editModalCallback}
        />
      </div>
    );
  }
}

export default Channels;