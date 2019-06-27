import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Modal,
  Form,
  Dropdown,
} from 'semantic-ui-react';

class DeviceModalEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModalEditDevice: false,
      isEnabled: true,
      firmwares: [],
      models: [],
      apps: [],
      config: {},
    };
  };

  getConfigById = async id => {
    fetch(`http://localhost:5000/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( config => {
        config.content = JSON.parse(config.content);
        this.setState({ config });
      })
      .catch( err => console.log(err) );
  };

  getThings = async () => {
    await fetch('http://localhost:5000/api/things')
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
    await fetch('http://localhost:5000/api/bootstrap')
    .then( res =>  res.json() )
    .then( oldConnections => {
      const connections = oldConnections.filter( item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'app';
      });
      const apps = connections.map( item => {
        return { key: item.id, text: item.name.split(".")[0], value: item.external_id}
      })
      this.setState({ apps });
    })
    .catch( err => console.log(err) );
  };

  getFirmwares = async () => {
    fetch('http://localhost:5000/api/other/firmwares')
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
    fetch('http://localhost:5000/api/other/models')
      .then( res => res.json())
      .then( models => {
        const mod = models.map( item => {
          return { text: item.split(".")[0], value: item.split(".")[0]}
        });
        this.setState({ models: mod });
      })
      .catch( err => console.log(err) );
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.connection !== this.props.connection){
      this.getConfigById(nextProps.connection.external_id);
      this.getThings().then( () => {
        this.forceUpdate();
      });
    };
  };

  componentDidMount() {
    this.getFirmwares();
    this.getModels();
    this.getConnections();
  };

  close = () => {
    this.setState({ showModalEditDevice: false });
    this.props.callbackFromParent(this.state.showModalEditDevice);
  };

  editDevice = async () => {
    const { config } = this.state;
    const { name, firmware, cycle, model, app, sendToApp, mac } = this.state.config.content;
    let obj = {};

    if(sendToApp) {
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        sendToApp,
        name,
        firmware,
        cycle,
        model,
        app,
      };
    } else {
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        sendToApp,
        name,
        firmware,
        cycle,
      };
    };
    await fetch(`http://localhost:5000/api/bootstrap/edit/info/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ obj })
    });

    if(sendToApp) {
      await fetch(`http://localhost:5000/api/bootstrap/${app}`)
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;
          const editThing = content.things_list.filter( item => {
            return item.thing_id === config.mainflux_id;
          });
          const editThingIndex = content.things_list.indexOf(editThing[0]);
          content.things_list[editThingIndex] = {
            model_name: model,
            thing_id: config.mainflux_id,
            thing_key: config.mainflux_key,
            thing_ch: config.mainflux_channels[0].id
          };

          const editModel = content.models_list.filter( item => {
            return item.name.split(".")[1] === config.mainflux_id;
          });
          const editModelIndex = content.models_list.indexOf(editModel[0]);
          content.models_list[editModelIndex] = {
            name: `${config.content.model}.${config.mainflux_id}`,
            type: config.content.model,
          };


          fetch(`http://localhost:5000/api/bootstrap/edit/info/${response.mainflux_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ response })
          });
        });
    };
    // await fetch(
    //   `http://localhost:5000/api/connection/create/channels/18cafc24-4a24-4150-9e2d-a0ecdedf58a9/things/${createdThing[0].id}`, {
    //     method: 'PUT',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //   });
    await this.getConnections();

    this.close();
  };

  handleChangeConnectionName = e => {
    const currentValue = e.target.value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          name: currentValue,
        },
      },
    }));
  };

  handleChangeFirmware = (e, { value }) => {
    const currentValue = value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          firmware: currentValue,
        },
      },
    }));
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

  handleChangeModel = (e, { value }) => {
    const currentValue = value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          model: currentValue,
        },
      },
    }));
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
    }));
  };

  render() {
    const { showModalEditDevice } = this.props;
    const {
      config,
      firmwares,
      isEnabled,
      models,
      apps,
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
              <label> Connection Name </label>
              <input
                placeholder='connection name'
                onChange={e => this.handleChangeConnectionName(e)}
                value={config.content !== undefined ? config.content.name : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Firmware </label>
              <Dropdown
                placeholder='firmware'
                fluid
                selection
                options={firmwares}
                defaultValue={config.content !== undefined ? `${config.content.firmware}` : ''}
                onChange={this.handleChangeFirmware}
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
            <Form.Field className={config.content ? config.content.sendToApp ? '' : 'hide' : ''}>
              <label>Model</label>
              <Dropdown
                placeholder='model'
                fluid
                selection
                options={models}
                onChange={this.handleChangeModel}
              />
            </Form.Field>
            <Form.Field className={config.content ? config.content.sendToApp ? '' : 'hide' : ''}>
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
            No
          </Button>
          <Button
            positive
            icon='edit outline'
            labelPosition='right'
            content="Yes"
            onClick={this.editDevice}
            disabled={!isEnabled}
          />
        </Modal.Actions>
      </Modal>
    );
  }
};

export default DeviceModalEdit;