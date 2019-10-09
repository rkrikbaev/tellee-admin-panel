import React, { Component } from 'react';
import '../connections/Connections.scss';
import {
  Button,
  Form,
  Modal,
  Dropdown,
  Checkbox,
} from 'semantic-ui-react';

class DeviceModalCreate extends Component {
  _isMounted = false;

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
        sendToDB: false,
      },
      newDevice: {
        id: '',
        title: '',
        subtitle: '',
        severity: '',
        alertext: '',
        alertvalue: '',
        assettext: '',
        assetvalue: '',
        messagetext: '',
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
      if(this._isMounted) this.setState({ apps });
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
        if(this._isMounted) this.setState({ deviceTypes: formattedTypes });
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
        if(this._isMounted) this.setState({ oldThings });
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
      sendToDB,
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
    if (sendToApp) {
      channel = await this.getChannel(app);
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: channel.id,
        name: connectionName,
        cycle,
        sendToApp,
        sendToDB,
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
        sendToDB,
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
      if (sendToDB) {
        const {
          title,
          subtitle,
          severity,
          alerttext,
          alertvalue,
          assettext,
          assetvalue,
          messagetext,
        } = this.state.newDevice;
        let newDevice = {
          id: createdThing[0].id,
          title,
          subtitle,
          severity,
          alerttext,
          alertvalue,
          assettext,
          assetvalue,
          messagetext,
        }

        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/device/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify(newDevice),
        });
      }
      await this.getConnections();

      // Close and send data to parent
      const { showModalCreateDevice, oldConnections } = this.state;
      if(this._isMounted) this.setState({ showModalCreateDevice: false });
      this.props.callbackFromParent(showModalCreateDevice, oldConnections);
      if(this._isMounted) {
        this.setState( prevState => ({
          config: {
            ...prevState.config,
            sendToApp: false,
          },
        }));
      }
    } catch(err) {
      console.log(err);
    }
  };
  // -- End of creating device --

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if( nextProps !== this.props ) {
      this.getConnections();
      this.getThings();
    };
  };

  componentDidMount() {
    this._isMounted = true;
    this.getThings();
    this.getConnections();
    this.getDeviceTypes();
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
    if(this._isMounted) this.setState({ showModalError: false, errorText: '' });
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === `zsse/${str}`;
    });
    if(arr.length !== 0 || !this.regexpName.test(str)) {
      if(this._isMounted) this.setState({ isConnectionNameDisabled: true });
    } else {
      if(this._isMounted) {
        this.setState( prevState => ({
          newThing: {
            ...prevState.newThing,
            name: str,
          },
          connectionName: str,
          isConnectionNameDisabled: false,
        }));
      }
    };
  };

  handleChangeThingMac = e => {
    let str = e.target.value;
    let arr = this.state.oldThings.filter( item => {
      return item.metadata.mac === str;
    });
    if(arr.length !== 0 || !this.regexpMac.test(str)) {
      if(this._isMounted) this.setState({ isThingMacDisabled: true });
    } else {
      if(this._isMounted) {
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
    }
  };

  handleChangeCycle = e => {
    let str = e.target.value;
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          cycle: str,
        },
        isEnabled: prevState.config.cycle.length <= 4 && /^\d+$/.test(prevState.config.cycle)
      }));
    }
  };


  handleChangeSendToApp = (e, { checked }) => {
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          sendToApp: checked,
        },
      }));
    }
    this.getConnections();
  };

  handleChangeSendToDB = (e, { checked }) => {
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          sendToDB: checked,
        },
      }));
    }
  };

  handleChangeDeviceType = (e, { value }) => {
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          device_type: value,
        },
      }));
    }
  };

  handleChangeApp = (e, { value }) => {
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          app: value,
        },
      }));
    }
  };

  handleChangeNewDevice = e => {
    if(this._isMounted) {
      var newDevice = {...this.state.newDevice}
      newDevice[Object.keys(e)[0]] = e[Object.keys(e)[0]];
      this.setState({newDevice});
    }
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
              <label>Name</label>
              <input
                placeholder='name'
                onChange={e => this.handleChangeConnectionName(e)}
                className={isConnectionNameDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label>Mac</label>
              <input
                placeholder='mac'
                onChange={e => this.handleChangeThingMac(e)}
                className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label>Device type</label>
              <Dropdown
                placeholder='type'
                fluid
                selection
                options={deviceTypes}
                onChange={this.handleChangeDeviceType}
              />
            </Form.Field>
            <Form.Field>
              <label>Cycle</label>
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
              <Checkbox
                label={config.sendToDB ? 'This device have additional info' : 'Click checkbox for additional info'}
                onChange={this.handleChangeSendToDB}
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
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Title</label>
              <input
                placeholder='Device title'
                onChange={e => this.handleChangeNewDevice({title: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Subtitle</label>
              <input
                placeholder='Device subtitle'
                onChange={e => this.handleChangeNewDevice({subtitle: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Severity</label>
              <input
                placeholder='Device severity'
                onChange={e => this.handleChangeNewDevice({severity: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Alert text</label>
              <input
                placeholder='Alert text'
                onChange={e => this.handleChangeNewDevice({alerttext: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Alert value</label>
              <input
                placeholder='Alert value'
                onChange={e => this.handleChangeNewDevice({alertvalue: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Asset text</label>
              <input
                placeholder='Asset text'
                onChange={e => this.handleChangeNewDevice({assettext: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Asset value</label>
              <input
                placeholder='Asset value'
                onChange={e => this.handleChangeNewDevice({assetvalue: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label>Message text</label>
              <input
                placeholder='Message text'
                onChange={e => this.handleChangeNewDevice({messagetext: e.target.value})}
                // className={isThingMacDisabled ? 'show_error' : ''}
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
