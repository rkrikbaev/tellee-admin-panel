import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Form,
  Modal,
  Dropdown
} from 'semantic-ui-react';

class ConnectionModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalCreate: false,
      showModalError: false,
      errorText: '',
      things: [],
      channels: [],
      firmwares: [],
      models: [],
      thingsDropdown: [],
      config: {
        mac: '',
        id: '',
        channels: [],
        name: '',
        firmware: '',
        cycle: '',
        model: '',
      },
      isEnabled: true
    }
  }

  createConnection = async () => {
    const { id, channels } = this.state.config;

    try {
      let response = await fetch('http://localhost:5000/api/bootstrap/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.state.config)
      });

      // If config in Bootstrap doesn't created, below script show's error
      if( response.status !== 201 ) {
        const errorText = `Error occured when creating connection with thing: ${id} to channels`
        this.setState({ showModalError: true, errorText});
        this.close();
      } else {
        // If config in Bootstrap created, below script connect's thing and channel(s) in Mainflux
        for( let i = 0; i < channels.length; i++ ) {

          let response = await fetch(
            `http://localhost:5000/api/connection/create/channels/${channels[i]}/things/${id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              }
            });

          // If connection between thing and channel(s) in Mainflux doesn't created, below script show's error
          if( response.status !== 200 ) {
            const errorText = `Error occured when connecting thing: ${id} to channel: ${channels[i]}`
            this.setState({ showModalError: true, errorText});
            this.close();
            break;
          }

        };
      };
    } catch(err) {
      return err;
    }
    this.close();
  };

  close = () => {
    const { showModalCreate, showModalError, errorText } = this.state;
    this.setState({ showModalCreate: false });
    this.props.callbackFromParent(showModalCreate, showModalError, errorText);
  };

  closeError = () => {
    this.setState({ showModalError: false, errorText: '' });
  }

  getFirmwares = async () => {
    fetch('http://localhost:5000/api/other/firmwares')
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
    fetch('http://localhost:5000/api/other/models')
      .then( res => res.json())
      .then( models => {
        const mod = models.map( item => {
          return { text: item, value: item}
        });
        this.setState({ models: mod });
      })
      .catch( err => console.log(err) );
  };

  getChannels = async () => {
    fetch('http://localhost:5000/api/channels')
      .then( res =>  res.json())
      .then( channels => {
        const arr = channels.map( (item, i) => {
          return {text: item.name, value: item.id}
        });
        this.setState({ channels: arr });
      })
      .catch( err => console.log(err) );
  };

  getThings = async () => {
    fetch('http://localhost:5000/api/things')
      .then( res =>  res.json())
      .then( things => {
        const arr = things.map( (item, i) => {
          return {text: item.name, value: item.id}
        });
        this.setState({ things, thingsDropdown: arr })
      })
      .catch( err => console.log(err) );
  };

  componentDidMount() {
    this.getFirmwares();
    this.getChannels();
    this.getModels();
    this.getThings();
  }

  handleChangeName = e => {
    let str = e.target.value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        name: str,
      },
    }));
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

  handleChangeModel = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        model: value,
      },
    }));
  };

  handleChangeChannel = (e, { value }) => {
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        channels: value,
      },
    }));
  };

  handleChangeThing = (e, { value }) => {
    let arr = this.state.things.filter( item => {
      return item.id === value;
    });
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        id: arr[0].id,
        mac: arr[0].metadata.mac,
      },
    }));
  };

  render() {
    const { showModalCreate } = this.props;
    const {
      models,
      channels,
      firmwares,
      thingsDropdown,
      isEnabled,
    } = this.state;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalCreate} onClose={this.close}>
        <Modal.Header>CREATE CONNECTION</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input placeholder='name' onChange={e => this.handleChangeName(e)} />
            </Form.Field>
            <Form.Field>
              <label>Firmware</label>
              <Dropdown
                placeholder='firmware'
                fluid
                selection
                options={firmwares}
                onChange={this.handleChangeFirmware}
              />
            </Form.Field>
            <Form.Field>
              <label>Model</label>
              <Dropdown
                placeholder='model'
                fluid
                selection
                options={models}
                onChange={this.handleChangeModel}
              />
            </Form.Field>
            <Form.Field>
              <label>Things</label>
              <Dropdown
                placeholder='thing'
                fluid
                selection
                options={thingsDropdown}
                onChange={this.handleChangeThing}
              />
            </Form.Field>
            <Form.Field>
              <label>Channels</label>
              <Dropdown
                placeholder='channels'
                multiple
                fluid
                selection
                options={channels}
                onChange={this.handleChangeChannel}
              />
            </Form.Field>
            <Form.Field>
              <label>Cycle</label>
              <input placeholder='cycle' className={!isEnabled ? 'showError' : 'showSuccess'} onChange={e => this.handleChangeCycle(e)} />
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
              disabled={!isEnabled}
              onClick={this.createConnection}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ConnectionModalCreate;