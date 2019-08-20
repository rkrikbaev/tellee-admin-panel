import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Modal,
  Form,
} from 'semantic-ui-react';

class AppModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalCreateApp: false,
      isThingMacEnabled: false,
      isConnectionNameEnabled: false,
      oldThings: [],
      oldConnections: [],
      newThing: {
        name: '',
        metadata: {
          type: 'app',
          mac: '',
        },
      },
      channel:  {
        name: '',
        metadata: {},
      },
      connectionName: '',
    };
    this.regexpName = /^\w+$/;
    this.regexpMac = /^[0-9a-z]{1,2}([.:-])(?:[0-9a-z]{1,2}\1){4}[0-9a-z]{2}$/gmi;
  };

  getThings = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json() )
      .then( oldThings => {
        this.setState({oldThings});
      })
      .catch( err => console.log(err) );
  };

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials : 'include',
    })
    .then( res =>  res.json() )
    .then( oldConnections => {
      this.setState({oldConnections});
      })
      .catch( err => console.log(err) );
  };

  createThing = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify(this.state.newThing),
    });
  };

  createChannel = async () => {
    const { channel } = this.state;
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({channel})
    });
  };

  createAppConnection = async () => {
    const { newThing, connectionName } = this.state;
    try {
      let arr = [];
      await this.createChannel();
      arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
        mode: 'cors',
        credentials: 'include'
      })
      .then( res => res.json())
      .then( oldChannels => {
        return oldChannels;
      })
      .catch( err => console.log(err));
      var channel = arr.filter( item => {
        return item.name === `zsse/${newThing.name}`;
      });
      await this.createThing();
      arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
        mode: 'cors',
        credentials : 'include',
        })
        .then( res =>  res.json() )
        .then( oldThings => {
          return oldThings;
        })
        .catch( err => console.log(err) );

      var thing = arr.filter( item => {
        return item.name === `zsse/${newThing.name}`;
      });
    } catch(err) {
      console.log(err);
    }

    const obj = {
      mac: newThing.metadata.mac,
      id: thing[0].id,
      channels: `${channel[0].id}`,
      name: connectionName,
    };

    try {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/create/app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials : 'include',
        body: JSON.stringify(obj),
      });

      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel[0].id}/things/${thing[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials : 'include',
        });
      await this.getConnections();

      // Close and send data to parent
      const { showModalCreateApp, oldConnections } = this.state;
      this.setState({ showModalCreateApp: false });
      this.props.callbackFromParent(showModalCreateApp, oldConnections)
    } catch(err) {
      console.log(err);
    }
  };

  close = async () => {
    const { showModalCreateApp, oldConnections } = this.state;
    this.setState({ showModalCreateApp: false });
    this.props.callbackFromParent(showModalCreateApp, oldConnections)
  };

  componentDidMount() {
    this.getThings();
    this.getConnections();
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === str;
    });
    if(arr.length !== 0 || !this.regexpName.test(str)) {
      this.setState({ isConnectionNameEnabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        channel: {
          ...prevState.channel,
          name: str,
        },
        connectionName: str,
        isConnectionNameEnabled: false,
      }));
    };
  };

  handleChangeThingMac = e => {
    let str = e.target.value;
    let arr = this.state.oldThings.filter( item => {
      return item.metadata.mac === str;
    });
    if(arr.length !== 0 || !this.regexpMac.test(str)) {
      this.setState({ isThingMacEnabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          metadata: {
            ...prevState.newThing.metadata,
            mac: str,
          },
        },
        isThingMacEnabled: false,
      }));
    }
  };

  render() {
    const { showModalCreateApp } = this.props;
    const { isThingMacEnabled, isConnectionNameEnabled } = this.state;

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalCreateApp}
        onClose={this.close}
      >
        <Modal.Header> CREATE APP </Modal.Header>

        <Modal.Content>
          <Form>
            <Form.Field>
              <label> Name </label>
              <input
                placeholder='name'
                onChange={e => this.handleChangeConnectionName(e)}
                className={isConnectionNameEnabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Mac </label>
              <input
                placeholder='mac'
                onChange={e => this.handleChangeThingMac(e)}
                className={isThingMacEnabled ? 'show_error' : ''}
              />
            </Form.Field>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button color='black' onClick={this.close}>
            Cancel
          </Button>
          <Button
            positive
            icon='plus'
            labelPosition='right'
            content="Create"
            disabled={isThingMacEnabled || isConnectionNameEnabled}
            onClick={this.createAppConnection}
          />
        </Modal.Actions>

      </Modal>
    )
  }

}

export default AppModalCreate;