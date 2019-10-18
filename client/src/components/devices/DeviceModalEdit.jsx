import React, { Component } from 'react';
import '../connections/Connections.scss';
import {
  Button,
  Modal,
  Form,
  Dropdown,
  Checkbox,
} from 'semantic-ui-react';

const alertMessagesText = {
  "title": "Turbine",
  "subtitle": "LM2500",
  "assettext": "MTU",
  "assetvalue": "operation",
}

class DeviceModalEdit extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      showModalEditDevice: false,
      isEnabled: true,
      deviceTypes: [],
      apps: [],
      config: {},
      selectedDeviceType: '',
      selectedApp: '',
      oldConnections: [],
      isConnectionNameDisabled: false,
      handleSendToApp: undefined,
      handleSendToDB: undefined,
      editDevice: {
        id: '',
        title: alertMessagesText.title,
        subtitle: alertMessagesText.subtitle,
        latitude: '',
        longitude: '',
        assettext: alertMessagesText.assettext,
        assetvalue: alertMessagesText.assetvalue,
        severity: '',
        alerttext: '',
        alertvalue: '',
        messagetext: '',
      },
    };
  };

  getConfigById = async id => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json())
      .then( config => {
        config.content = JSON.parse(config.content);
        let selectedApp = config.content.app;
        let selectedDeviceType = config.content.device_type;
        let handleSendToApp = config.content.sendToApp;
        let handleSendToDB = config.content.sendToDB;
        if(this._isMounted) {
          this.setState({
            selectedApp,
            selectedDeviceType,
            config,
            handleSendToApp,
            handleSendToDB,
          });
        }
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
        const currentThing = oldThings.filter( item => {
          return item.id === this.props.connection.mainflux_id;
        });
        if(this._isMounted) this.setState({currentThing: currentThing[0]});
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
      const connections = oldConnections.filter( item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'app';
      });
      const apps = connections.map( item => {
        return { value: item.external_id, text: item.name.split(".")[0] }
      })
      if(this._isMounted) this.setState({ apps, oldConnections });
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
  };

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
  };

  getDeviceInfoFromDB = async device_id => {
    const device = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/device/${device_id}`, {
      mode: 'cors',
      credentials: 'include'
    })
    .then(res => res.json())
    .catch(e => console.log(e));
    const {
      id,
      title,
      subtitle,
      severity,
      alerttext,
      alertvalue,
      assettext,
      assetvalue,
      messagetext,
      longitude,
      latitude,
    } = device;
    this.setState( prevState => ({
      editDevice: {
        ...prevState.editDevice,
        id,
        title,
        subtitle,
        severity,
        alerttext,
        alertvalue,
        assettext,
        assetvalue,
        messagetext,
        longitude,
        latitude,
      }
    }));
  };

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps === this.props && nextState === this.state);
  };

  componentDidMount() {
    this._isMounted = true;
    const { external_id, name, content } = this.props.connection
    this.getConfigById(external_id);
      this.getThings().then( () => {
        if(this._isMounted) this.forceUpdate();
      });
    this.getDeviceTypes();
    this.getConnections();
    if (content.sendToDB) {
      this.getDeviceInfoFromDB(name.split('/')[1]);
    }
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  close = () => {
    if(this._isMounted) this.setState({ showModalEditDevice: false });
    this.props.callbackFromParent(this.state.showModalEditDevice);
  };

  editDevice = async () => {
    const { config, oldConnections, handleSendToApp, handleSendToDB } = this.state;
    const { name, cycle, device_type, app, sendToApp, sendToDB, mac } = this.state.config.content;
    let obj = {};

    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/${config.mainflux_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include'
    })
      .then( response => response.json())
      .then( async thing => {
        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/edit/${config.mainflux_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify({ name, metadata: thing.metadata }),
        });
      });

    let channel = {};
    if(handleSendToApp) {
      channel = await this.getChannel(app);
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        channel: channel.id,
        sendToApp: handleSendToApp,
        sendToDB: handleSendToDB,
        name,
        cycle,
        device_type,
        app,
      };
    } else {
      channel = await this.getGlobalChannel(process.env.REACT_APP_CHANNEL_NAME);
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        channel: channel.id,
        sendToApp: handleSendToApp,
        sendToDB: handleSendToDB,
        name,
        device_type,
        cycle,
      };
    };

    // -- Update Device
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({ obj })
    });
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/channels/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({ obj })
    });

    if( sendToDB === true && handleSendToDB === false ) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/device/remove/${this.state.editDevice.id.split('/')[1]}`, {
        method: 'DELETE',
        mode: 'cors',
        credentials: 'include',
      })
      .catch( err => console.log(err));
    } else if ( sendToDB === false && handleSendToDB === true ) {
      const {
        title,
        subtitle,
        severity,
        alerttext,
        alertvalue,
        assettext,
        assetvalue,
        messagetext,
        longitude,
        latitude,
      } = this.state.editDevice;
      let newDevice = {
        id: this.state.config.content.name.split('/')[1],
        title,
        subtitle,
        severity,
        alerttext,
        alertvalue,
        assettext,
        assetvalue,
        messagetext,
        longitude,
        latitude,
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
    } else if( sendToDB === true && handleSendToDB === true ) {
      const {
        id,
        title,
        subtitle,
        severity,
        alerttext,
        alertvalue,
        assettext,
        assetvalue,
        messagetext,
        longitude,
        latitude,
      } = this.state.editDevice;
      let editDevice = {
        id: this.state.config.content.name.split('/')[1],
        title,
        subtitle,
        severity,
        alerttext,
        alertvalue,
        assettext,
        assetvalue,
        messagetext,
        longitude,
        latitude,
      }

      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/device/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(editDevice),
      });
    }

    // -- IF DEVICE CONNECTED TO APP BUT IT SHOULD BE DISCONNECTED -- //
    if( sendToApp === true && handleSendToApp === false ) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`,{
        mode: 'cors',
        credentials : 'include',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;

          content.devices = content.devices.filter( item => {
            return item.device_id !== config.mainflux_id;
          });

          fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials : 'include',
            body: JSON.stringify({ response }),
          });
        });
      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${config.mainflux_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials : 'include',
        });
      this.close();
      return;
    }
    // -- IF DEVICE DOESN'T CONNECTED TO APP BUT IT SHOULD BE CONNECTED -- //
    else if( sendToApp === false && handleSendToApp === true ) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`, {
        mode: 'cors',
        credentials : 'include',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          let { content } = response;
          content.devices.push({
            device_name: `zsse/${obj.name}`,
            device_id: config.mainflux_id,
            device_key: config.mainflux_key,
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
        });
      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${config.mainflux_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials : 'include',
        });
      await this.getConnections();
    };

    if(sendToApp) {
      // -- Get current Device config
      const currentDevice = oldConnections.filter( item => {
        return item.mainflux_id === config.mainflux_id;
      });

      if( currentDevice[0].content.app !== obj.app) {
        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${currentDevice[0].content.app}`, {
          mode: 'cors',
          credentials : 'include',
        })
          .then( response => response.json())
          .then( response => {
            response.content = JSON.parse(response.content);
            const { content } = response;
            content.devices = content.devices.filter( item => {
              return item.device_id !== currentDevice[0].mainflux_id;
            });

            fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors',
              credentials : 'include',
              body: JSON.stringify({ response })
            });
            fetch(
              `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${config.mainflux_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials : 'include',
              });
          });
      }

      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`, {
        mode: 'cors',
        credentials : 'include',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;
          const editThing = content.devices.filter( item => {
            return item.device_id === config.mainflux_id;
          });
          if( editThing.length === 0 ) {
            content.devices.push({
              device_name: name,
              device_id: config.mainflux_id,
              device_key: config.mainflux_key,
              device_type,
            })
          } else {
            const editThingIndex = content.devices.indexOf(editThing[0]);
            content.devices[editThingIndex] = {
              device_name: name,
              device_id: config.mainflux_id,
              device_key: config.mainflux_key,
              device_type,
            };
          }

          fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials : 'include',
            body: JSON.stringify({ response })
          });
          fetch(
            `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${config.mainflux_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              mode: 'cors',
              credentials : 'include',
            });
        });
    };

    this.close();
  };

  handleChangeConnectionName = e => {
    const currentValue = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === `zsse/${currentValue}`;
    });
    if(arr.length !== 0) {
      if(this._isMounted) this.setState({ isConnectionNameDisabled: true });
    } else {
      if(this._isMounted) {
        this.setState( prevState => ({
          config: {
            ...prevState.config,
            content: {
              ...prevState.config.content,
              name: currentValue,
            },
          },
          isConnectionNameDisabled: false,
        }));
      }
    };
  };

  handleChangeCycle = e => {
    const currentValue = e.target.value;
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          content: {
            ...prevState.config.content,
            cycle: currentValue,
          }
        },
        isEnabled: prevState.config.content.cycle.length <= 4 && /^\d+$/.test(prevState.config.content.cycle)
      }));
    }
  };

  handleChangeDeviceType = (e, { value }) => {
    const currentValue = value;
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          content: {
            ...prevState.config.content,
            device_type: currentValue,
          },
        },
        selectedDeviceType: value,
      }));
    }
  };

  handleChangeSendToApp = (e, { checked }) => {
    if(this._isMounted) this.setState({ handleSendToApp : checked });
    this.getConnections();
  };

  handleChangeSendToDB = (e, { checked }) => {
    if(this._isMounted) this.setState({ handleSendToDB : checked });
  };

  handleChangeApp = (e, { value }) => {
    const currentValue = value;
    if(this._isMounted) {
      this.setState( prevState => ({
        config: {
          ...prevState.config,
          content: {
            ...prevState.config.content,
            app: currentValue,
          },
        },
        selectedApp: value,
      }));
    }
  };

  handleChangeEditDevice = e => {
    if(this._isMounted) {
      var editDevice = {...this.state.editDevice}
      editDevice[Object.keys(e)[0]] = e[Object.keys(e)[0]];
      this.setState({editDevice});
    }
  };

  render() {
    const { showModalEditDevice } = this.props;
    const {
      config,
      isEnabled,
      deviceTypes,
      apps,
      selectedDeviceType,
      selectedApp,
      isConnectionNameDisabled,
      handleSendToApp,
      handleSendToDB,
      editDevice,
    } = this.state;
    const {
      title,
      subtitle,
      // severity,
      // alerttext,
      // alertvalue,
      assettext,
      assetvalue,
      // messagetext,
      longitude,
      latitude,
    } = editDevice;

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalEditDevice}
        onClose={this.close}
      >
        <Modal.Header>EDIT DEVICE</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Thing ID</label>
              <input
                placeholder='mainflux_id'
                value={config.content !== undefined ? config.mainflux_id : ''}
                readOnly
              />
            </Form.Field>

            <Form.Field>
              <label>Thing Key</label>
              <input
                placeholder='mainflux_key'
                value={config.content !== undefined ? config.mainflux_key : ''}
                readOnly
              />
            </Form.Field>
            <Form.Field>
              <label> Name </label>
              <input
                placeholder='name'
                onChange={e => this.handleChangeConnectionName(e)}
                value={config.content !== undefined ? config.content.name : ''}
                className={isConnectionNameDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Cycle </label>
              <input
                placeholder='cycle'
                value={config.content !== undefined ? config.content.cycle : ''}
                className={
                  !isEnabled ? 'showError' : 'showSuccess'
                  }
                onChange={e => this.handleChangeCycle(e)}
              />
            </Form.Field>
            <Form.Field>
              <label> Device Type </label>
              <Dropdown
                placeholder='device type'
                fluid
                selection
                options={deviceTypes}
                value={selectedDeviceType}
                onChange={this.handleChangeDeviceType}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label={handleSendToApp ? "This device's config sent to App" : "Click checkbox for send this device's config to App"}
                onChange={this.handleChangeSendToApp}
                checked={handleSendToApp}
              />
              <Checkbox
                label={handleSendToDB ? 'This device have additional info' : 'Click checkbox for additional info'}
                onChange={this.handleChangeSendToDB}
                checked={handleSendToDB}
              />
            </Form.Field>
            <Form.Field className={handleSendToApp ? '' : 'hide'}>
              <label>Apps</label>
              <Dropdown
                placeholder='apps'
                fluid
                selection
                options={apps}
                onChange={this.handleChangeApp}
                value={selectedApp}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Title</label>
              <input
                placeholder='Device title'
                onChange={e => this.handleChangeEditDevice({title: e.target.value})}
                value={title !== undefined ? title : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Subtitle</label>
              <input
                placeholder='Device subtitle'
                onChange={e => this.handleChangeEditDevice({subtitle: e.target.value})}
                value={subtitle !== undefined ? subtitle : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Latitude</label>
              <input
                placeholder='Device latitude'
                onChange={e => this.handleChangeEditDevice({latitude: e.target.value})}
                value={latitude !== undefined ? latitude : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Longitude</label>
              <input
                placeholder='Device longitude'
                onChange={e => this.handleChangeEditDevice({longitude: e.target.value})}
                value={longitude !== undefined ? longitude : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Asset text</label>
              <input
                placeholder='Asset text'
                onChange={e => this.handleChangeEditDevice({assettext: e.target.value})}
                value={assettext !== undefined ? assettext : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Asset value</label>
              <input
                placeholder='Asset value'
                onChange={e => this.handleChangeEditDevice({assetvalue: e.target.value})}
                value={assetvalue !== undefined ? assetvalue : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            {/* <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Severity</label>
              <input
                placeholder='Device severity'
                onChange={e => this.handleChangeEditDevice({severity: e.target.value})}
                value={severity !== undefined ? severity : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Alert text</label>
              <input
                placeholder='Alert text'
                onChange={e => this.handleChangeEditDevice({alerttext: e.target.value})}
                value={alerttext !== undefined ? alerttext : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Alert value</label>
              <input
                placeholder='Alert value'
                onChange={e => this.handleChangeEditDevice({alertvalue: e.target.value})}
                value={alertvalue !== undefined ? alertvalue : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field className={handleSendToDB ? '' : 'hide'}>
              <label>Message text</label>
              <input
                placeholder='Message text'
                onChange={e => this.handleChangeEditDevice({messagetext: e.target.value})}
                value={messagetext !== undefined ? messagetext : ''}
                // className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field> */}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={this.close}>
            No
          </Button>
          <Button
            positive
            icon='edit outline'
            labelPosition='right'
            content="Yes"
            onClick={this.editDevice}
            disabled={isConnectionNameDisabled || !isEnabled}
          />
        </Modal.Actions>
      </Modal>
    );
  }
};

export default DeviceModalEdit;