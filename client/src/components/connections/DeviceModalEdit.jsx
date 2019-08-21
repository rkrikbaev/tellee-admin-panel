import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Modal,
  Form,
  Dropdown,
  Checkbox,
} from 'semantic-ui-react';

class DeviceModalEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModalEditDevice: false,
      isEnabled: true,
      deviceTypes: [],
      apps: [],
      config: {},
      selectedDeviceType: [],
      selectedApp: [],
      oldConnections: [],
      isConnectionNameDisabled: false,
      handleSendToApp: undefined,
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
        this.setState({ selectedApp, selectedDeviceType, config, handleSendToApp });
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
        this.setState({currentThing: currentThing[0]});
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
      this.setState({ apps, oldConnections });
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

  componentWillReceiveProps(nextProps) {
    if(nextProps.connection !== this.props.connection){
      this.getConfigById(nextProps.connection.external_id);
      this.getThings().then( () => {
        this.forceUpdate();
      });
    };
    this.getConnections();
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps === this.props || nextState !== this.state;
  };

  componentDidMount() {
    this.getDeviceTypes();
    this.getConnections();
  };

  close = () => {
    this.setState({ showModalEditDevice: false });
    this.props.callbackFromParent(this.state.showModalEditDevice);
  };

  editDevice = async () => {
    const { config, oldConnections, handleSendToApp } = this.state;
    const { name, cycle, device_type, app, sendToApp, mac } = this.state.config.content;
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

    if(handleSendToApp) {
      let channel = await this.getChannel(app);
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        channel: channel.id,
        sendToApp: handleSendToApp,
        name,
        cycle,
        device_type,
        app,
      };
    } else {
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        channel: process.env.REACT_APP_CHANNEL_ID,
        sendToApp: handleSendToApp,
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
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${process.env.REACT_APP_CHANNEL_ID}/things/${config.mainflux_id}`, {
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
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${process.env.REACT_APP_CHANNEL_ID}/things/${config.mainflux_id}`, {
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
              `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${process.env.REACT_APP_CHANNEL_ID}/things/${config.mainflux_id}`, {
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
            `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${process.env.REACT_APP_CHANNEL_ID}/things/${config.mainflux_id}`, {
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
      this.setState({ isConnectionNameDisabled: true });
    } else {
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
    };
  };

  handleChangeCycle = e => {
    const currentValue = e.target.value;
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
  };

  handleChangeDeviceType = (e, { value }) => {
    const currentValue = value;
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
  };

  handleChangeSendToApp = (e, { checked }) => {
    this.setState({ handleSendToApp : checked });
    this.getConnections();
  };

  handleChangeApp = (e, { value }) => {
    const currentValue = value;
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
    } = this.state;

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