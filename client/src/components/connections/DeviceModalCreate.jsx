import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Form,
  Modal,
  Dropdown,
  Checkbox,
} from 'semantic-ui-react';

class DeviceModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      deviceTypes: [],
      apps: [],
      oldThings: [],
      oldConnections: [],
      isEnabled: true,
      showModalCreateDevice: false,
      isThingMacDisabled: false,
      isConnectionNameDisabled: false,
      newThing: {
        name: '',
        metadata: {
          type: 'device',
          mac: '',
        },
      },
      config: {
        id: '',
        channel: [],
        name: '',
        cycle: '',
        sendToApp: false,
        device_type: undefined,
        app: undefined,
      },
    };

    this.oldThings = [];
    this.regexpName = /^\w+$/;
    this.regexpMac = /^[0-9a-z]{1,2}([.:-])(?:[0-9a-z]{1,2}\1){4}[0-9a-z]{2}$/gmi;
  };

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials : 'include',
    })
    .then( res =>  res.json() )
    .then( oldConnections => {
      this.setState({oldConnections});
      const connections = oldConnections.filter( item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'app';
      });
      const apps = connections.map( item => {
        return { key: item.external_id, text: item.name, value: item.external_id}
      })
      this.setState({ apps });
    })
    .catch( err => console.log(err) );
  };

  getDeviceTypes = async () => {
    fetch('http://134.209.240.215:8300/devices')
      .then(res => res.json())
      .then(types => {
        const formattedTypes = types.map( (type, i) => {
          return { text: type, value: type}
        });
        this.setState({ deviceTypes: formattedTypes });
      })
      .catch( err => console.log(err) );
  };

  getThings = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json() )
      .then( oldThings => {
        this.oldThings = oldThings;
        this.setState({ oldThings });
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

  getChannel = async appMac => {
    const { oldConnections } = this.state;
    let app = oldConnections.filter( item => {
      return item.external_id === appMac;
    });
    let arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include'
    })
    .then( res => res.json())
    .then( oldChannels => {
      return oldChannels;
    })
    .catch( err => console.log(err));

    var channel = arr.filter( item => {
      return item.name === app[0].name;
    });
    return channel[0];
  }

  getGlobalChannel = async channelName => {
    let arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include'
    })
    .then( res => res.json())
    .then( oldChannels => {
      return oldChannels;
    })
    .catch( err => console.log(err));
    const globalChannel = arr.filter( item => {
      return item.name === `zsse/${channelName}`;
    });
    return globalChannel[0];
  }

  // -- Start of creating device --
  createDeviceConnection = async () => {
    const {
      newThing,
      connectionName,
      config,
    } = this.state;
    const {
      cycle,
      sendToApp,
      device_type,
      app
    } = config;

    try {
      await this.createThing();
      await this.getThings();

      var createdThing = this.oldThings.filter( item => {
        return item.name === `zsse/${newThing.name}`;
      });

    } catch(err) {
      console.log(err);
    }

    let obj = {},
        channel = {};
    if(sendToApp) {
      channel = await this.getChannel(app);
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: channel.id,
        name: connectionName,
        cycle,
        sendToApp,
        device_type,
        app
      };
    } else {
      channel = await this.getGlobalChannel(process.env.REACT_APP_CHANNEL_NAME);
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: channel.id,
        name: connectionName,
        cycle,
        device_type,
        sendToApp,
      };
    };

    try {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/create/device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials : 'include',
        body: JSON.stringify(obj),
      });

      if(sendToApp) {
        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`, {
          mode: 'cors',
          credentials : 'include',
        })
          .then( response => response.json())
          .then( response => {
            response.content = JSON.parse(response.content);
            let { content } = response;
            content.devices.push({
              device_name: `zsse/${connectionName}`,
              device_id: createdThing[0].id,
              device_key: createdThing[0].key,
              device_type: obj.device_type
            })
            fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors',
              credentials : 'include',
              body: JSON.stringify({ response })
            });
            // - Connecting to App's channel - //
            fetch(
              `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${response.mainflux_channels[0].id}/things/${createdThing[0].id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials : 'include',
              });
          });
      } else {
        await fetch(
          `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${createdThing[0].id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials : 'include',
          });
      };
      await this.getConnections();

      // Close and send data to parent
      const { showModalCreateDevice, oldConnections } = this.state;
      this.setState({ showModalCreateDevice: false });
      this.props.callbackFromParent(showModalCreateDevice, oldConnections);
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          sendToApp: false,
        },
      }));
    } catch(err) {
      console.log(err);
    }
  };
  // -- End of creating device --

  componentWillReceiveProps(nextProps) {
    if( nextProps !== this.props ) {
      this.getConnections();
      this.getThings();
    };
  };

  close = async () => {
    const { showModalCreateDevice, oldConnections } = this.state;
    this.setState({ showModalCreateDevice: false });
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        sendToApp: false,
      },
    }));
    this.props.callbackFromParent(showModalCreateDevice, oldConnections)
  };

  closeError = () => {
    this.setState({ showModalError: false, errorText: '' });
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === `zsse/${str}`;
    });
    if(arr.length !== 0 || !this.regexpName.test(str)) {
      this.setState({ isConnectionNameDisabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        connectionName: str,
        isConnectionNameDisabled: false,
      }));
    };
  };

  handleChangeThingMac = e => {
    let str = e.target.value;
    let arr = this.state.oldThings.filter( item => {
      return item.metadata.mac === str;
    });
    if(arr.length !== 0 || !this.regexpMac.test(str)) {
      this.setState({ isThingMacDisabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          metadata: {
            ...prevState.newThing.metadata,
            mac: str,
          },
        },
        isThingMacDisabled: false,
      }));
    }
  };

  handleChangeCycle = e => {
    let str = e.target.value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        cycle: str,
      },
      isEnabled: prevState.config.cycle.length <= 4 && /^\d+$/.test(prevState.config.cycle)
    }));
  };


  handleChangeSendToApp = (e, { checked }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        sendToApp: checked,
      },
    }));
    this.getConnections();
  };

  handleChangeDeviceType = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        device_type: value,
      },
    }));
  };

  handleChangeApp = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        app: value,
      },
    }));
  };

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps === this.props || nextState !== this.state;
  // };

  componentDidMount() {
    this.getThings();
    this.getConnections();
    this.getDeviceTypes();
  };

  render() {
    const { showModalCreateDevice } = this.props;
    const {
      isThingMacDisabled,
      isConnectionNameDisabled,
      isEnabled,
      deviceTypes,
      apps,
      config,
    } = this.state;

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalCreateDevice}
        onClose={this.close}
      >
        <Modal.Header> CREATE DEVICE </Modal.Header>

        <Modal.Content>
          <Form>
            <Form.Field>
              <label> Name </label>
              <input
                placeholder='name'
                onChange={e => this.handleChangeConnectionName(e)}
                className={isConnectionNameDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Mac </label>
              <input
                placeholder='mac'
                onChange={e => this.handleChangeThingMac(e)}
                className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Device type </label>
              <Dropdown
                placeholder='type'
                fluid
                selection
                options={deviceTypes}
                onChange={this.handleChangeDeviceType}
              />
            </Form.Field>
            <Form.Field>
              <label> Cycle </label>
              <input
                placeholder='cycle'
                className={
                  !isEnabled ? 'showError' : 'showSuccess'
                  }
                onChange={e => this.handleChangeCycle(e)}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label={config.sendToApp ? 'This device will be sent to App' : 'Click checkbox for send this config to App'}
                onChange={this.handleChangeSendToApp}
              />
            </Form.Field>
            <Form.Field className={config.sendToApp ? '' : 'hide'}>
              <label>Apps</label>
              <Dropdown
                placeholder='apps'
                fluid
                selection
                options={apps}
                onChange={this.handleChangeApp}
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
            disabled={isThingMacDisabled || isConnectionNameDisabled || !isEnabled}
            onClick={this.createDeviceConnection}
          />
        </Modal.Actions>

      </Modal>
    );
  }

}

export default DeviceModalCreate;
