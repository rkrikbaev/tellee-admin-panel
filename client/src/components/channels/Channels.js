import React, { Component } from 'react';
import './Channels.scss';
import {
  Item,
  Button,
  Icon,
} from 'semantic-ui-react';
import ChannelModalCreate from './ChannelModalCreate';
import ChannelModalRemove from './ChannelModalRemove';
import ChannelModalEdit from './ChannelModalEdit';

class Channels extends Component {

  constructor() {
    super();

    this.state = {
      channels: [],
      edittingChannel: {},
      removingChannel: {},
      showModalRemove: false,
      showModalEdit: false,
      showModalCreate: false,
    };
  }

  getToken = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({email: `${process.env.REACT_APP_MAINFLUX_USER}`})
    });
  };

  getChannels = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json())
      .then( channels => this.setState({channels}) )
      .catch( err => console.log(err) );
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

  createChannelModalCallback = (showModalCreate) => {
    this.setState({ showModalCreate });
    this.getChannels();
  };

  async componentDidMount() {
    await this.getToken();
    this.getChannels();
  }

  render() {

    const {
      channels,
      showModalEdit,
      showModalCreate,
      showModalRemove,
      removingChannel,
      edittingChannel,
    } = this.state;

    return (
      <div id="channels" className="main_wrapper">
        <div className="channel_top">
          <h1>Channels</h1>
          <Button
            icon
            labelPosition='left'
            onClick={() => this.setState({ showModalCreate: true })}
          >
            <Icon name='podcast' />
            Create Channel
          </Button>
        </div>
        <hr />
        <Item.Group relaxed>
          {
            channels.length === 0
            ? <p>
                Unfortunately we did not find your channels.
                <span role="img" aria-label="Sad">🙁</span>
              </p>
            : channels.map( item =>
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
            )
          }
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
        <ChannelModalCreate
          showModalCreate={showModalCreate}
          callbackFromParent={this.createChannelModalCallback}
        />
      </div>
    );
  }
}

export default Channels;