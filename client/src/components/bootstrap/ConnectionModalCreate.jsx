import React, { Component } from 'react';
import './Bootstrap.scss';
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
      things: [],
      channels: [],
      firmwares: [],
      thingsDropdown: [],
      config: {
        mac: '',
        id: '',
        channels: [],
        name: '',
        firmware: '',
        cycle: ''
      }
    }
  }

  createConnection = async name => {
    fetch('/api/bootstrap/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.config)
    });
    this.close();
  };

  close = () => {
    this.setState({ showModalCreate: false });
    this.props.callbackFromParent(this.state.showModalCreate);
  };

  getFirmwares = async () => {
    fetch('/api/firmwares')
      .then( res => res.json())
      .then( firmwares => {
        const firm = firmwares.map( item => {
          return { text: item, value: item}
        });
        this.setState({ firmwares: firm });
      })
      .catch( err => console.log(err) );
  };

  getChannels = async () => {
    fetch('/api/channels')
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
    fetch('/api/things')
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
    const { thingsDropdown, channels, firmwares } = this.state;

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
              <input placeholder='cycle' onChange={e => this.handleChangeCycle(e)} />
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
              onClick={this.createConnection}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ConnectionModalCreate;