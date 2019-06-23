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
      currentThing: undefined,
    };
  };

  getConfigById = async id => {
    fetch(`/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( config => {
        config.content = JSON.parse(config.content);
        this.setState({config});
      })
      .catch( err => console.log(err) );
  };

  getThings = async () => {
    await fetch('/api/things')
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
    await fetch('/api/bootstrap')
    .then( res =>  res.json() )
    .then( oldConnections => {
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
    fetch('/api/other/firmwares')
      .then( res => res.json())
      .then( firmwares => {
        const firm = firmwares.map( item => {
          return { text: item, value: item}
        });
        this.setState({ firmwares: firm });
      })
      .catch( err => console.log(err) );
  };

  getModels = async () => {
    fetch('/api/other/models')
      .then( res => res.json())
      .then( models => {
        const mod = models.map( item => {
          return { text: item, value: item}
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
    this.setState({ showModalEditApp: false });
    this.props.callbackFromParent(this.state.showModalEditApp);
  };

  handleChangeName = e => {
    const obj = this.state.config;
    obj.content.name = e.target.value;
    this.setState({ config: obj });
  };

  handleChangeMac = e => {
    const obj = this.state.config;
    obj.content.mac = e.target.value;
    this.setState({ config: obj });
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    this.setState({ connectionName: str });
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

  render() {
    const { showModalEditDevice, connection } = this.props;
    const {
      config,
      firmwares,
      isEnabled,
      models,
      apps,
      currentThing,
    } = this.state;

    console.log(config);
    console.log(connection);

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
              <label>Name</label>
              <input
                placeholder='name'
                value={currentThing !== undefined ? currentThing.name : ''}
                onChange={e => this.handleChangeName(e)}
              />
            </Form.Field>
            <Form.Field>
              <label>Mac</label>
              <input
                placeholder='mac'
                value={connection.external_id}
                onChange={e => this.handleChangeMac(e)}
              />
            </Form.Field>
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