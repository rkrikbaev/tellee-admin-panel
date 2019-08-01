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
      isThingNameEnabled: false,
      isConnectionNameEnabled: false,
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
        deviceType: undefined,
        app: undefined,
      },
    };

    this.oldThings = [];
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
    // fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/other/types`)
    // .then( res => res.json())
    // .then( types => {
    //   const formattedTypes = types.map( item => {
    //     return { text: item.split(".")[0], value: item.split(".")[0]}
    //   });
    //   this.setState({ types: formattedTypes });
    // })
    // .catch( err => console.log(err) );
    const arr = ['pump0', 'pump1', 'pump2', 'pump3'];
    this.setState({ deviceTypes:
      arr.map( item => {
        return { text: item, value: item };
      })
    });
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
      deviceType,
      app
    } = config;

    try {
      await this.createThing();
      await this.getThings();

      var createdThing = this.oldThings.filter( item => {
        return item.name === newThing.name;
      });

    } catch(err) {
      console.log(err);
    }

    let obj = {};
    if(sendToApp) {
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: `${process.env.REACT_APP_CHANNEL_ID}`,
        name: connectionName,
        cycle,
        sendToApp,
        deviceType,
        app
      };
    } else {
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channels: `${process.env.REACT_APP_CHANNEL_ID}`,
        name: connectionName,
        cycle,
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
            content.things_list.push({
              thing_id: createdThing[0].id,
              thing_key: createdThing[0].key,
              deviceType: `${obj.deviceType}:${createdThing[0].id}`
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
      };
      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${process.env.REACT_APP_CHANNEL_ID}/things/${createdThing[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials : 'include',
        });
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
  }

  handleChangeThingName = e => {
    let str = e.target.value;
    let arr = this.state.oldThings.filter( item => {
      return item.name === str;
    });
    if(arr.length !== 0) {
      this.setState({ isThingNameEnabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        isThingNameEnabled: false,
      }));
    };
  };

  handleChangeThingMac = e => {
    let str = e.target.value;
    this.setState( prevState => ({
      newThing: {
        ...prevState.newThing,
        metadata: {
          ...prevState.newThing.metadata,
          mac: str,
        },
      },
    }));
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === `zsse/${str}`;
    });
    if(arr.length !== 0) {
      this.setState({ isConnectionNameEnabled: true });
    } else {
      this.setState({
        connectionName: str,
        isConnectionNameEnabled: false,
      });
    };
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
        deviceType: value,
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
      isThingNameEnabled,
      isConnectionNameEnabled,
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
              <label> Thing Name </label>
              <input
                placeholder='thing name'
                onChange={e => this.handleChangeThingName(e)}
                className={isThingNameEnabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Thing Mac </label>
              <input
                placeholder='thing mac'
                onChange={e => this.handleChangeThingMac(e)}
              />
            </Form.Field>
            <Form.Field>
              <label> Connection Name </label>
              <input
                placeholder='connection name'
                onChange={e => this.handleChangeConnectionName(e)}
                className={isConnectionNameEnabled ? 'show_error' : ''}
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
                label={config.sendToApp ? 'This config will be sent to App' : 'Click checkbox for send this config to App'}
                onChange={this.handleChangeSendToApp}
              />
            </Form.Field>
            <Form.Field className={config.sendToApp ? '' : 'hide'}>
              <label> Device type </label>
              <Dropdown
                placeholder='type'
                fluid
                selection
                options={deviceTypes}
                onChange={this.handleChangeDeviceType}
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
            disabled={isThingNameEnabled || isConnectionNameEnabled || !isEnabled}
            onClick={this.createDeviceConnection}
          />
        </Modal.Actions>

      </Modal>
    );
  }

}

export default DeviceModalCreate;
