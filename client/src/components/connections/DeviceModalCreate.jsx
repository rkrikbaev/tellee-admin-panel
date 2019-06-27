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
      firmwares: [],
      apps: [],
      models: [],
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
        channels: [],
        name: '',
        sendToApp: false,
        firmware: '',
        app: undefined,
        model: undefined,
        cycle: '',
      },
    };

    this.oldThings = [];
  };

  getConnections = async () => {
    await fetch('https://zsse.zeinetsse.com:5000/api/bootstrap')
    .then( res =>  res.json() )
    .then( oldConnections => {
      this.setState({oldConnections});
      const connections = oldConnections.filter( item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'app';
      });
      const apps = connections.map( item => {
        return { key: item.id, text: item.name, value: item.external_id}
      })
      this.setState({ apps });
    })
    .catch( err => console.log(err) );
  };

  getFirmwares = async () => {
    fetch('https://zsse.zeinetsse.com:5000/api/other/firmwares')
    .then( res => res.json())
    .then( firmwares => {
      const firm = firmwares.map( item => {
        return { text: item.split(".")[0], value: item.split(".")[0]}
      });
      this.setState({ firmwares: firm });
    })
    .catch( err => console.log(err) );
    };

  getModels = async () => {
    fetch('https://zsse.zeinetsse.com:5000/api/other/models')
    .then( res => res.json())
    .then( models => {
      const mod = models.map( item => {
        return { text: item.split(".")[0], value: item.split(".")[0]}
      });
      this.setState({ models: mod });
    })
    .catch( err => console.log(err) );
  };

  getThings = async () => {
    await fetch('https://zsse.zeinetsse.com:5000/api/things')
      .then( res =>  res.json() )
      .then( oldThings => {
        this.oldThings = oldThings;
        this.setState({oldThings});
      })
      .catch( err => console.log(err) );
  };

  createThing = async () => {
    await fetch('https://zsse.zeinetsse.com:5000/api/things/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
      firmware,
      cycle,
      sendToApp,
      app,
      model
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
        channels: '18cafc24-4a24-4150-9e2d-a0ecdedf58a9',
        name: connectionName,
        firmware,
        cycle,
        sendToApp,
        app,
        model
      };
    } else {
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channels: '18cafc24-4a24-4150-9e2d-a0ecdedf58a9',
        name: connectionName,
        firmware,
        cycle,
        sendToApp,
      };
    };

    try {
      await fetch('https://zsse.zeinetsse.com:5000/api/bootstrap/create/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
      });

      if(sendToApp) {
        await fetch(`https://zsse.zeinetsse.com:5000/api/bootstrap/${app}`)
          .then( response => response.json())
          .then( response => {
            response.content = JSON.parse(response.content);
            let { content } = response;
            content.things_list.push({
              model_name: obj.model,
              thing_id: createdThing[0].id,
              thing_key: createdThing[0].key,
              thing_ch: obj.channels,
            });
            content.models_list.push({
              name: `${obj.model}.${createdThing[0].id}`,
              type: obj.model
            });
            fetch(`https://zsse.zeinetsse.com:5000/api/bootstrap/edit/info/${response.mainflux_id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ response })
            });
          });
      };
      await fetch(
        `https://zsse.zeinetsse.com:5000/api/connection/create/channels/18cafc24-4a24-4150-9e2d-a0ecdedf58a9/things/${createdThing[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
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

  handleChangeFirmware = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        firmware: value,
      },
    }));
  };

  handleChangeSendToApp = (e, { checked }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        sendToApp: checked,
      },
    }));
  };

  handleChangeModel = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        model: value,
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

  componentDidMount() {
    this.getThings();
    this.getConnections();
    this.getFirmwares();
    this.getModels();
  };

  render() {
    const { showModalCreateDevice } = this.props;
    const {
      isThingNameEnabled,
      isConnectionNameEnabled,
      firmwares,
      isEnabled,
      models,
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
              <label> Firmware </label>
              <Dropdown
                placeholder='firmware'
                fluid
                selection
                options={firmwares}
                onChange={this.handleChangeFirmware}
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
              <label>Model</label>
              <Dropdown
                placeholder='model'
                fluid
                selection
                options={models}
                onChange={this.handleChangeModel}
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
